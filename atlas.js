(() => {
  "use strict";

  const data = window.ATLAS_DATA;
  const canvas = document.getElementById("rae-canvas");
  const map = document.getElementById("rae-map");
  const pane = document.getElementById("rae-map-pane");
  if (!data?.graph || !data?.evolutionThreads || !canvas || !map || !pane) return;

  const graph = data.graph;
  const context = canvas.getContext("2d");
  if (!context) return;

  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const sourcesById = new Map(Object.entries(data.sources || {}).map(([id, source]) => [id, { id, ...source }]));
  const colors = {
    ink: "#17384f", muted: "#6b808a", gold: "#b37a2c", paper: "#fffefa",
    canvas: "#edf2f1", grid: "#d8e1e1", edge: "#708690",
    learn: "#a85f43", protect: "#33757a", train: "#6f6091", decide: "#627d42", all: "#17384f"
  };
  const state = { thread: "all", selectedId: "human-judgment", scale: 1 };
  const element = (id) => document.getElementById(id);
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const edgeKey = (source, target) => `${source}→${target}`;
  const currentThread = () => data.evolutionThreads[state.thread];
  const activeIds = () => new Set(currentThread().nodes);

  function formatCitation(source) {
    const authors = source.authors.join(", ");
    const identifier = source.doi ? ` https://doi.org/${source.doi}` : "";
    return `${authors}. (${source.year}). ${source.title}. ${source.venue}.${identifier}`;
  }

  function formatBibtex(source) {
    const venueField = source.bibtexType === "article" ? "journal" : "booktitle";
    const lines = [
      `@${source.bibtexType || "misc"}{${source.bibtexKey},`,
      `  author = {${source.authors.join(" and ")}},`,
      `  title = {${source.title}},`,
      `  year = {${source.year}},`,
      `  ${venueField} = {${source.venue}}${source.doi || source.url ? "," : ""}`
    ];
    if (source.doi) lines.push(`  doi = {${source.doi}}${source.url ? "," : ""}`);
    if (source.url) lines.push(`  url = {${source.url}}`);
    lines.push("}");
    return lines.join("\n");
  }

  function getProvenancePaths(id, visited = new Set()) {
    if (!nodesById.has(id) || visited.has(id)) return [];
    const seen = new Set(visited).add(id);
    const incoming = graph.edges.filter((edge) => edge.target === id && !seen.has(edge.source));
    if (!incoming.length) return [[id]];
    return incoming.flatMap((edge) => getProvenancePaths(edge.source, seen).map((path) => [...path, id]));
  }

  function provenance(id = state.selectedId) {
    const paths = getProvenancePaths(id);
    const nodeIds = new Set(paths.flat());
    const edgeIds = new Set();
    paths.forEach((path) => {
      for (let index = 1; index < path.length; index += 1) edgeIds.add(edgeKey(path[index - 1], path[index]));
    });
    return { paths, nodeIds, edgeIds, hasTrace: edgeIds.size > 0 };
  }

  function nodeRadius(node) {
    if (node.id === "human-judgment") return 64;
    if (node.type === "Research lens") return 54;
    return 76;
  }

  function edgePoints(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    return {
      x1: source.x + ux * nodeRadius(source), y1: source.y + uy * nodeRadius(source),
      x2: target.x - ux * nodeRadius(target), y2: target.y - uy * nodeRadius(target)
    };
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function wrapLines(ctx, text, maximumWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || ctx.measureText(candidate).width <= maximumWidth) line = candidate;
      else { lines.push(line); line = word; }
    });
    if (line) lines.push(line);
    if (lines.length > 2) lines[1] = `${lines.slice(1).join(" ").slice(0, 18).trim()}…`;
    return lines.slice(0, 2);
  }

  function drawArrow(edge, trace, muted) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) return;
    const { x1, y1, x2, y2 } = edgePoints(source, target);
    const color = trace ? colors.gold : colors.edge;
    context.save();
    context.globalAlpha = muted ? 0.22 : trace ? 1 : 0.72;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = trace ? 3 : 1.7;
    if (edge.cross) context.setLineDash([7, 6]);
    context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
    context.setLineDash([]);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = trace ? 10 : 8;
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - size * Math.cos(angle - 0.55), y2 - size * Math.sin(angle - 0.55));
    context.lineTo(x2 - size * Math.cos(angle + 0.55), y2 - size * Math.sin(angle + 0.55));
    context.closePath(); context.fill(); context.restore();
  }

  function drawNode(node, active, trace, contextOnly, selected) {
    const lensColor = colors[node.lens] || colors.ink;
    context.save();
    context.globalAlpha = !active ? 0.28 : contextOnly ? 0.62 : 1;
    context.fillStyle = selected ? "#f5ede0" : colors.paper;
    context.strokeStyle = selected || trace ? colors.gold : lensColor;
    context.lineWidth = selected ? 4 : 2;
    context.shadowColor = selected ? "rgba(23,56,79,.22)" : "transparent";
    context.shadowBlur = selected ? 12 : 0;
    context.shadowOffsetY = selected ? 5 : 0;
    if (node.id === "human-judgment" || node.type === "Research lens") {
      context.beginPath();
      context.arc(node.x, node.y, node.id === "human-judgment" ? 59 : 49, 0, Math.PI * 2);
    } else roundedRect(context, node.x - 70, node.y - 38, 140, 76, 11);
    context.fill(); context.stroke();
    context.shadowColor = "transparent";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = lensColor;
    context.font = "700 11px Arial, sans-serif";
    context.fillText(node.year, node.x, node.y - 18);
    context.fillStyle = colors.ink;
    context.font = node.type === "Research lens" ? "700 15px Georgia, serif" : "700 13px Georgia, serif";
    const lines = wrapLines(context, node.title, node.type === "Research lens" ? 82 : 120);
    const firstY = node.y + (lines.length === 1 ? 9 : 4);
    lines.forEach((line, index) => context.fillText(line, node.x, firstY + index * 15));
    const sourceCount = node.sourceIds?.length || 0;
    if (sourceCount) {
      const badgeX = node.x + (node.id === "human-judgment" || node.type === "Research lens" ? 39 : 59);
      const badgeY = node.y - (node.id === "human-judgment" || node.type === "Research lens" ? 39 : 29);
      context.beginPath(); context.arc(badgeX, badgeY, 12, 0, Math.PI * 2);
      context.fillStyle = colors.gold; context.fill();
      context.fillStyle = "#fffefa"; context.font = "700 10px Arial, sans-serif";
      context.fillText(String(sourceCount), badgeX, badgeY + 0.5);
    }
    context.restore();
  }

  function drawGraph() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const requiredWidth = Math.round(graph.width * pixelRatio);
    const requiredHeight = Math.round(graph.height * pixelRatio);
    if (canvas.width !== requiredWidth || canvas.height !== requiredHeight) {
      canvas.width = requiredWidth;
      canvas.height = requiredHeight;
    }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, graph.width, graph.height);
    context.fillStyle = colors.canvas;
    context.fillRect(0, 0, graph.width, graph.height);
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    for (let x = 0; x <= graph.width; x += 52) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, graph.height); context.stroke();
    }
    for (let y = 0; y <= graph.height; y += 52) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(graph.width, y); context.stroke();
    }

    const active = activeIds();
    const trace = provenance();
    graph.edges.forEach((edge) => {
      const isTrace = trace.edgeIds.has(edgeKey(edge.source, edge.target));
      const isMuted = !active.has(edge.source) || !active.has(edge.target) || (trace.hasTrace && !isTrace);
      drawArrow(edge, isTrace, isMuted);
    });
    graph.nodes.forEach((node) => drawNode(
      node, active.has(node.id), trace.nodeIds.has(node.id),
      trace.hasTrace && !trace.nodeIds.has(node.id), node.id === state.selectedId
    ));
    canvas.classList.add("is-ready");
  }

  function getConnections(id) {
    return graph.edges.filter((edge) => edge.source === id || edge.target === id);
  }

  function getEdge(source, target) {
    return graph.edges.find((edge) => edge.source === source && edge.target === target);
  }

  function renderLineage(paths) {
    const container = element("rae-lineage-paths");
    const count = element("rae-lineage-count");
    const traceable = paths.filter((path) => path.length > 1);
    if (!traceable.length) {
      count.textContent = "Origin";
      const origin = document.createElement("p");
      origin.className = "rae-lineage__origin";
      origin.textContent = "This is an origin point in the research program.";
      container.replaceChildren(origin);
      return;
    }
    count.textContent = `${traceable.length} ${traceable.length === 1 ? "path" : "paths"}`;
    container.replaceChildren(...traceable.map((path, pathIndex) => {
      const section = document.createElement("section");
      section.className = "rae-lineage__path";
      const label = document.createElement("p");
      label.textContent = traceable.length === 1 ? "Research path" : `Research path ${pathIndex + 1}`;
      const list = document.createElement("ol");
      path.forEach((id, index) => {
        const node = nodesById.get(id);
        const item = document.createElement("li");
        const button = document.createElement("button");
        const meta = document.createElement("span");
        const title = document.createElement("strong");
        button.type = "button";
        button.setAttribute("aria-label", `Open ${node.title}, ${node.year}`);
        if (id === state.selectedId) button.setAttribute("aria-current", "true");
        const edge = index === 0 ? null : getEdge(path[index - 1], id);
        const evidenceLabels = (edge?.evidence || []).map((sourceId) => sourcesById.get(sourceId)?.label).filter(Boolean);
        const evidenceText = evidenceLabels.length ? ` · [${evidenceLabels.join(", ")}]` : "";
        meta.textContent = index === 0 ? node.year : `${edge?.relation || "informs"} · ${node.year}${evidenceText}`;
        title.textContent = node.title;
        button.append(meta, title);
        button.addEventListener("click", () => selectNode(id, true));
        item.append(button); list.append(item);
      });
      section.append(label, list);
      return section;
    }));
  }

  function collectEvidence(node, paths) {
    const claims = new Map();
    const add = (sourceId, claim) => {
      if (!sourcesById.has(sourceId)) return;
      if (!claims.has(sourceId)) claims.set(sourceId, new Set());
      claims.get(sourceId).add(claim);
    };
    (node.sourceIds || []).forEach((sourceId) => add(sourceId, "Supports the selected idea"));
    const relevantEdges = new Map();
    getConnections(node.id).forEach((edge) => relevantEdges.set(edgeKey(edge.source, edge.target), edge));
    paths.forEach((path) => {
      for (let index = 1; index < path.length; index += 1) {
        const edge = getEdge(path[index - 1], path[index]);
        if (edge) relevantEdges.set(edgeKey(edge.source, edge.target), edge);
      }
    });
    relevantEdges.forEach((edge) => {
      const claim = `${nodesById.get(edge.source).title} ${edge.relation} ${nodesById.get(edge.target).title}`;
      (edge.evidence || []).forEach((sourceId) => add(sourceId, claim));
    });
    return [...claims.entries()]
      .map(([sourceId, sourceClaims]) => ({ source: sourcesById.get(sourceId), claims: [...sourceClaims] }))
      .sort((a, b) => Number(a.source.label.slice(1)) - Number(b.source.label.slice(1)));
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement("textarea");
      field.value = text; field.setAttribute("readonly", "");
      field.style.position = "fixed"; field.style.opacity = "0";
      document.body.append(field); field.select(); document.execCommand("copy"); field.remove();
    }
    element("rae-copy-status").textContent = successMessage;
  }

  function renderSources(node, paths) {
    const evidence = collectEvidence(node, paths);
    const list = element("rae-sources-list");
    const empty = element("rae-sources-empty");
    const count = element("rae-sources-count");
    count.textContent = evidence.length ? `${evidence.length} ${evidence.length === 1 ? "source" : "sources"}` : "Interpretive synthesis";
    empty.hidden = evidence.length > 0;
    empty.textContent = "This program-level synthesis is not assigned to a single paper.";
    list.hidden = evidence.length === 0;
    list.replaceChildren(...evidence.map(({ source, claims }) => {
      const item = document.createElement("li");
      const article = document.createElement("article");
      const meta = document.createElement("p");
      const title = document.createElement("h4");
      const claim = document.createElement("p");
      const citation = document.createElement("p");
      const actions = document.createElement("div");
      meta.className = "rae-source__meta";
      title.className = "rae-source__title";
      claim.className = "rae-source__claim";
      citation.className = "rae-source__citation";
      actions.className = "rae-source__actions";
      meta.textContent = `${source.label} · ${source.kind} · ${source.year}`;
      title.textContent = source.title;
      claim.textContent = `Supports: ${claims.join("; ")}.`;
      citation.textContent = formatCitation(source);
      if (source.url) {
        const doi = document.createElement("a");
        doi.href = source.url; doi.target = "_blank"; doi.rel = "noopener noreferrer";
        doi.textContent = "DOI ↗"; actions.append(doi);
      }
      if (source.pdf) {
        const pdf = document.createElement("a");
        pdf.href = source.pdf; pdf.target = "_blank"; pdf.rel = "noopener noreferrer";
        pdf.textContent = "PDF ↗"; actions.append(pdf);
      }
      const copyCitation = document.createElement("button");
      copyCitation.type = "button"; copyCitation.textContent = "Copy citation";
      copyCitation.addEventListener("click", () => copyText(formatCitation(source), `${source.label} citation copied.`));
      const copyBibtex = document.createElement("button");
      copyBibtex.type = "button"; copyBibtex.textContent = "Copy BibTeX";
      copyBibtex.addEventListener("click", () => copyText(formatBibtex(source), `${source.label} BibTeX copied.`));
      actions.append(copyCitation, copyBibtex);
      article.append(meta, title, claim, citation, actions); item.append(article);
      return item;
    }));
  }

  function updateDetail() {
    const node = nodesById.get(state.selectedId);
    const connections = getConnections(node.id);
    element("rae-detail-index").textContent = `${node.year} · ${node.type}`;
    element("rae-detail-title").textContent = node.title;
    element("rae-detail-description").textContent = node.note;
    element("rae-detail-lens").textContent = data.lensLabels[node.lens] || node.lens;
    element("rae-detail-links").textContent = `${connections.length} connected ${connections.length === 1 ? "idea" : "ideas"}`;
    const paths = provenance(node.id).paths;
    renderSources(node, paths);
    renderLineage(paths);
    const traced = paths.filter((path) => path.length > 1);
    element("rae-status").textContent = traced.length
      ? `${node.title}, ${node.year}. ${traced.length} contributing ${traced.length === 1 ? "path" : "paths"} highlighted.`
      : `${node.title}, ${node.year}. Origin point in the research program.`;
  }

  function scrollNodeIntoView(id, behavior = "smooth") {
    const node = nodesById.get(id);
    if (!node) return;
    pane.scrollTo({
      left: Math.max(0, node.x * state.scale - pane.clientWidth / 2),
      top: Math.max(0, node.y * state.scale - pane.clientHeight / 2), behavior
    });
  }

  function selectNode(id, reveal = false) {
    if (!nodesById.has(id)) return;
    state.selectedId = id;
    drawGraph(); updateDetail();
    if (reveal) scrollNodeIntoView(id);
  }

  function renderIndex() {
    const list = element("rae-index-list");
    list.replaceChildren(...currentThread().nodes.map((id) => {
      const node = nodesById.get(id);
      const item = document.createElement("li");
      const button = document.createElement("button");
      const meta = document.createElement("span");
      const title = document.createElement("strong");
      button.type = "button";
      const sourceCount = node.sourceIds?.length || 0;
      meta.textContent = `${node.year} · ${node.type}${sourceCount ? ` · ${sourceCount} ${sourceCount === 1 ? "paper" : "papers"}` : ""}`;
      title.textContent = node.title;
      button.append(meta, title);
      button.addEventListener("click", () => selectNode(id, true));
      item.append(button);
      return item;
    }));
  }

  function applyScale() {
    map.style.width = `${Math.round(graph.width * state.scale)}px`;
    map.style.height = `${Math.round(graph.height * state.scale)}px`;
  }

  function setScale(nextScale) {
    const oldScale = state.scale;
    const graphX = (pane.scrollLeft + pane.clientWidth / 2) / oldScale;
    const graphY = (pane.scrollTop + pane.clientHeight / 2) / oldScale;
    state.scale = clamp(nextScale, 0.42, 1.5);
    applyScale();
    pane.scrollLeft = graphX * state.scale - pane.clientWidth / 2;
    pane.scrollTop = graphY * state.scale - pane.clientHeight / 2;
  }

  function fitGraph() {
    state.scale = clamp(Math.min((pane.clientWidth - 24) / graph.width, (pane.clientHeight - 24) / graph.height), 0.42, 1);
    applyScale(); pane.scrollLeft = 0; pane.scrollTop = 0;
    element("rae-status").textContent = "The complete research graph is fitted in the map panel.";
  }

  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * graph.width / bounds.width,
      y: (event.clientY - bounds.top) * graph.height / bounds.height
    };
  }

  function nodeAt(point) {
    return [...graph.nodes].reverse().find((node) => {
      const dx = point.x - node.x;
      const dy = point.y - node.y;
      if (node.id === "human-judgment" || node.type === "Research lens") return Math.hypot(dx, dy) <= 62;
      return Math.abs(dx) <= 74 && Math.abs(dy) <= 42;
    });
  }

  function selectThread(key) {
    const thread = data.evolutionThreads[key];
    if (!thread) return;
    state.thread = key; state.selectedId = thread.focus;
    document.querySelectorAll("[data-rae-thread]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.raeThread === key));
    });
    element("rae-thread-summary").textContent = thread.summary;
    drawGraph(); updateDetail(); renderIndex();
    requestAnimationFrame(() => scrollNodeIntoView(thread.focus));
  }

  canvas.addEventListener("click", (event) => {
    const node = nodeAt(canvasPoint(event));
    if (node) selectNode(node.id);
  });
  canvas.addEventListener("pointermove", (event) => {
    canvas.style.cursor = nodeAt(canvasPoint(event)) ? "pointer" : "default";
  });
  document.querySelectorAll("[data-rae-thread]").forEach((button) => {
    button.addEventListener("click", () => selectThread(button.dataset.raeThread));
  });
  element("rae-fit")?.addEventListener("click", fitGraph);
  element("rae-zoom-in")?.addEventListener("click", () => setScale(state.scale * 1.18));
  element("rae-zoom-out")?.addEventListener("click", () => setScale(state.scale / 1.18));

  applyScale(); drawGraph(); updateDetail(); renderIndex();
  requestAnimationFrame(() => scrollNodeIntoView(state.selectedId, "auto"));
})();
