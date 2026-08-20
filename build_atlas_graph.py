#!/usr/bin/env python3
"""Validate Atlas data and render the always-visible graph fallback."""

from __future__ import annotations

import json
import math
import re
import shutil
import sys
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "atlas-data.js"
SOURCE_IMAGE = ROOT / "images" / "atlas-graph.png"
PREVIEW_IMAGE = ROOT / "docs" / "images" / "atlas-graph.png"
GRAPH_WIDTH = 1400
GRAPH_HEIGHT = 950

PALETTE = {
    "ink": "#17384f",
    "muted": "#6b808a",
    "gold": "#b37a2c",
    "paper": "#fffefa",
    "canvas": "#edf2f1",
    "grid": "#d8e1e1",
    "edge": "#708690",
    "learn": "#a85f43",
    "protect": "#33757a",
    "train": "#6f6091",
    "decide": "#627d42",
    "all": "#17384f",
}


def load_data() -> dict:
    source = DATA_PATH.read_text(encoding="utf-8").strip()
    prefix = "window.ATLAS_DATA ="
    if not source.startswith(prefix):
        raise ValueError(f"{DATA_PATH.name} does not contain the expected assignment")
    payload = source[len(prefix) :].strip().removesuffix(";")
    payload = re.sub(r"([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)", r'\1"\2"\3', payload)
    return json.loads(payload)


def validate(data: dict) -> None:
    graph = data["graph"]
    nodes = graph["nodes"]
    edges = graph["edges"]
    sources = data.get("sources", {})
    ids = [node["id"] for node in nodes]
    if len(ids) != len(set(ids)):
        raise ValueError("Atlas node identifiers must be unique")
    known = set(ids)
    for edge in edges:
        if edge["source"] not in known or edge["target"] not in known:
            raise ValueError(f"Unknown edge endpoint: {edge}")
        missing_sources = set(edge.get("evidence", [])) - set(sources)
        if missing_sources:
            raise ValueError(f"Unknown edge evidence: {sorted(missing_sources)}")
    for node in nodes:
        missing_sources = set(node.get("sourceIds", [])) - set(sources)
        if missing_sources:
            raise ValueError(f"Unknown sources for {node['id']}: {sorted(missing_sources)}")
    labels = [source["label"] for source in sources.values()]
    if len(labels) != len(set(labels)):
        raise ValueError("Atlas source labels must be unique")
    outgoing = {node_id: [] for node_id in ids}
    for edge in edges:
        outgoing[edge["source"]].append(edge["target"])
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node_id: str) -> None:
        if node_id in visiting:
            raise ValueError(f"Atlas provenance graph contains a cycle at {node_id}")
        if node_id in visited:
            return
        visiting.add(node_id)
        for target in outgoing[node_id]:
            visit(target)
        visiting.remove(node_id)
        visited.add(node_id)

    for node_id in ids:
        visit(node_id)
    for key, thread in data["evolutionThreads"].items():
        missing = set(thread["nodes"]) - known
        if missing or thread["focus"] not in known:
            raise ValueError(f"Invalid thread {key}: {sorted(missing)}")


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


SANS_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
SERIF_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
FONT_YEAR = font(SANS_BOLD, 11)
FONT_TITLE = font(SERIF_BOLD, 14)
FONT_LENS = font(SERIF_BOLD, 16)
FONT_BADGE = font(SANS_BOLD, 10)


def node_radius(node: dict) -> int:
    if node["id"] == "human-judgment":
        return 64
    if node["type"] == "Research lens":
        return 54
    return 76


def edge_points(source: dict, target: dict) -> tuple[float, float, float, float]:
    dx = target["x"] - source["x"]
    dy = target["y"] - source["y"]
    length = math.hypot(dx, dy) or 1
    ux, uy = dx / length, dy / length
    return (
        source["x"] + ux * node_radius(source),
        source["y"] + uy * node_radius(source),
        target["x"] - ux * node_radius(target),
        target["y"] - uy * node_radius(target),
    )


def draw_arrow(draw: ImageDraw.ImageDraw, points: tuple[float, float, float, float], color: str) -> None:
    x1, y1, x2, y2 = points
    draw.line((x1, y1, x2, y2), fill=color, width=2)
    angle = math.atan2(y2 - y1, x2 - x1)
    size = 9
    left = (x2 - size * math.cos(angle - 0.55), y2 - size * math.sin(angle - 0.55))
    right = (x2 - size * math.cos(angle + 0.55), y2 - size * math.sin(angle + 0.55))
    draw.polygon(((x2, y2), left, right), fill=color)


def centered_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, selected_font, fill: str) -> None:
    x, y = xy
    bbox = draw.multiline_textbbox((0, 0), text, font=selected_font, spacing=2, align="center")
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    draw.multiline_text((x - width / 2, y - height / 2), text, font=selected_font, fill=fill, spacing=2, align="center")


def render(data: dict) -> Image.Image:
    graph = data["graph"]
    nodes = graph["nodes"]
    nodes_by_id = {node["id"]: node for node in nodes}
    image = Image.new("RGB", (GRAPH_WIDTH, GRAPH_HEIGHT), PALETTE["canvas"])
    draw = ImageDraw.Draw(image)

    for x in range(0, GRAPH_WIDTH + 1, 52):
        draw.line((x, 0, x, GRAPH_HEIGHT), fill=PALETTE["grid"], width=1)
    for y in range(0, GRAPH_HEIGHT + 1, 52):
        draw.line((0, y, GRAPH_WIDTH, y), fill=PALETTE["grid"], width=1)

    for edge in graph["edges"]:
        draw_arrow(draw, edge_points(nodes_by_id[edge["source"]], nodes_by_id[edge["target"]]), PALETTE["edge"])

    for node in nodes:
        x, y = node["x"], node["y"]
        color = PALETTE[node["lens"]]
        selected = node["id"] == "human-judgment"
        outline = PALETTE["gold"] if selected else color
        width = 4 if selected else 2
        if node["id"] == "human-judgment" or node["type"] == "Research lens":
            radius = 59 if node["id"] == "human-judgment" else 49
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=PALETTE["paper"], outline=outline, width=width)
        else:
            draw.rounded_rectangle((x - 70, y - 38, x + 70, y + 38), radius=11, fill=PALETTE["paper"], outline=outline, width=width)

        year_box = draw.textbbox((0, 0), node["year"], font=FONT_YEAR)
        draw.text((x - (year_box[2] - year_box[0]) / 2, y - 23), node["year"], font=FONT_YEAR, fill=color)
        title = "\n".join(textwrap.wrap(node["title"], width=19)[:2])
        centered_text(draw, (x, y + 10), title, FONT_LENS if node["type"] == "Research lens" else FONT_TITLE, PALETTE["ink"])
        source_count = len(node.get("sourceIds", []))
        if source_count:
            round_node = node["id"] == "human-judgment" or node["type"] == "Research lens"
            badge_x = x + (39 if round_node else 59)
            badge_y = y - (39 if round_node else 29)
            draw.ellipse((badge_x - 12, badge_y - 12, badge_x + 12, badge_y + 12), fill=PALETTE["gold"])
            centered_text(draw, (badge_x, badge_y), str(source_count), FONT_BADGE, PALETTE["paper"])

    return image


def main() -> int:
    data = load_data()
    validate(data)
    image = render(data)
    SOURCE_IMAGE.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW_IMAGE.parent.mkdir(parents=True, exist_ok=True)
    image.save(SOURCE_IMAGE, format="PNG", optimize=True)
    shutil.copy2(SOURCE_IMAGE, PREVIEW_IMAGE)
    print(f"Rendered {len(data['graph']['nodes'])} nodes and {len(data['graph']['edges'])} links to {SOURCE_IMAGE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
