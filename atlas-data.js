window.ATLAS_DATA = {
  lensLabels: {
    all: "Across the research program",
    learn: "Immersive learning",
    protect: "Measurement and trust",
    train: "Secure training",
    decide: "Spatial decision support"
  },
  sources: {
    basu2012ucave: {
      label: "P1", kind: "Conference paper", year: 2012,
      title: "Ubiquitous collaborative activity virtual environments",
      authors: ["Aryabrata Basu", "A. Raij", "K. Johnsen"],
      venue: "Conference on Computer Supported Cooperative Work",
      doi: "10.1145/2145204.2145302", url: "https://doi.org/10.1145/2145204.2145302",
      bibtexKey: "Basu2012UCAVE", bibtexType: "inproceedings"
    },
    johnsen2014mixedpets: {
      label: "P2", kind: "Journal article", year: 2014,
      title: "Mixed Reality Virtual Pets to Reduce Childhood Obesity",
      authors: ["K. Johnsen", "Sun Joo Grace Ahn", "James Moore", "Scott Brown", "T. Robertson", "Amanda Marable", "Aryabrata Basu"],
      venue: "IEEE Transactions on Visualization and Computer Graphics",
      doi: "10.1109/TVCG.2014.33", url: "https://doi.org/10.1109/TVCG.2014.33",
      bibtexKey: "Johnsen2014MixedPets", bibtexType: "article"
    },
    basu2018maze: {
      label: "P3", kind: "Research paper", year: 2018,
      title: "Navigating a maze differently - a user study",
      authors: ["Aryabrata Basu", "K. Johnsen"], venue: "arXiv.org",
      bibtexKey: "Basu2018Maze", bibtexType: "article"
    },
    basu2022stag: {
      label: "P4", kind: "Conference paper", year: 2022,
      title: "STAG: A Tool for realtime Replay and Analysis of Spatial Trajectory and Gaze Information captured in Immersive Environments",
      authors: ["Aryabrata Basu"],
      venue: "2022 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)",
      doi: "10.1109/VRW55335.2022.00016", url: "https://doi.org/10.1109/VRW55335.2022.00016",
      bibtexKey: "Basu2022STAG", bibtexType: "inproceedings"
    },
    basu2023privacy: {
      label: "P5", kind: "Preprint", year: 2023,
      title: "Privacy concerns from variances in spatial navigability in VR",
      authors: ["Aryabrata Basu", "Mohammad Jahed Murad Sunny", "Jayasri Sai Nikitha Guthula"], venue: "arXiv.org",
      doi: "10.48550/arXiv.2302.02525", url: "https://doi.org/10.48550/arXiv.2302.02525", pdf: "https://arxiv.org/pdf/2302.02525",
      bibtexKey: "Basu2023Privacy", bibtexType: "article"
    },
    guthula2024bias: {
      label: "P6", kind: "Conference paper", year: 2024,
      title: "Navigating Gender Biases in XR: Towards Equitable Technological Future",
      authors: ["Jayasri Sai Nikitha Guthula", "Aryabrata Basu"],
      venue: "2024 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)",
      doi: "10.1109/VRW62533.2024.00065", url: "https://doi.org/10.1109/VRW62533.2024.00065",
      bibtexKey: "Guthula2024Bias", bibtexType: "inproceedings"
    },
    sunny2024spatial: {
      label: "P7", kind: "Conference paper", year: 2024,
      title: "Non-linear parameterization of spatial decision making in immersive virtual environment",
      authors: ["Mohammad Jahed Murad Sunny", "Aryabrata Basu"],
      venue: "2024 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)",
      doi: "10.1109/VRW62533.2024.00076", url: "https://doi.org/10.1109/VRW62533.2024.00076",
      bibtexKey: "Sunny2024Spatial", bibtexType: "inproceedings"
    },
    guthula2025privacy: {
      label: "P8", kind: "Conference paper", year: 2025,
      title: "Preserving Privacy in VR Telemetry Data",
      authors: ["Jayasri Sai Nikitha Guthula", "Hadi Rashid", "Jan P. Springer", "Aryabrata Basu"],
      venue: "2025 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)",
      doi: "10.1109/VRW66409.2025.00281", url: "https://doi.org/10.1109/VRW66409.2025.00281",
      bibtexKey: "Guthula2025Privacy", bibtexType: "inproceedings"
    },
    sunny2025gaze: {
      label: "P9", kind: "Conference paper", year: 2025,
      title: "Gaze Insights in XR: Real-Time Eye-Tracking Analytics with Elasticsearch",
      authors: ["Mohammad Jahed Murad Sunny", "Jayasri Sai Nikitha Guthula", "Atit Kharel", "Meherun Nesa Shraboni", "Hadi Rashid", "Praveshika Bhandari", "Jan P. Springer", "Aryabrata Basu"],
      venue: "2025 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)",
      doi: "10.1109/VRW66409.2025.00028", url: "https://doi.org/10.1109/VRW66409.2025.00028",
      bibtexKey: "Sunny2025Gaze", bibtexType: "inproceedings"
    }
  },
  graph: {
    width: 1400,
    height: 950,
    nodes: [
      { id: "human-judgment", x: 700, y: 455, lens: "all", type: "Core question", year: "Program", title: "Human judgment", note: "How can immersive systems become measurable and adaptive while remaining trustworthy, inspectable, and centered on human agency?" },
      { id: "learn", x: 700, y: 190, lens: "learn", type: "Research lens", year: "01", title: "Learn", note: "Longitudinal learning and adaptation in extended reality." },
      { id: "protect", x: 1050, y: 455, lens: "protect", type: "Research lens", year: "02", title: "Protect", note: "Privacy-aware immersive telemetry and responsible behavioral data." },
      { id: "train", x: 700, y: 720, lens: "train", type: "Research lens", year: "03", title: "Train", note: "Immersive cyber-physical readiness and interpretable assessment." },
      { id: "decide", x: 350, y: 455, lens: "decide", type: "Research lens", year: "04", title: "Decide", note: "Medical and scientific spatial intelligence for expert reasoning.", sourceIds: ["sunny2024spatial"] },
      { id: "ucave", x: 440, y: 80, lens: "learn", type: "Publication", year: "2012", title: "Ubiquitous collaborative VR", note: "A portable foundation for shared immersive experience and human-centered evaluation.", sourceIds: ["basu2012ucave"] },
      { id: "mixed-pets", x: 910, y: 90, lens: "learn", type: "Awarded research", year: "2014", title: "Mixed Reality Virtual Pets", note: "Connected immersive interaction to health behavior and earned a Best Paper Award.", sourceIds: ["johnsen2014mixedpets"] },
      { id: "public-scholarship", x: 145, y: 145, lens: "decide", type: "Research practice", year: "2016–2022", title: "Public-facing 3D scholarship", note: "At Emory, real-time 3D simulation connected humanities, science, medicine, and public interpretation." },
      { id: "navigation", x: 450, y: 245, lens: "learn", type: "User study", year: "2018", title: "Navigating a maze differently", note: "Investigated embodied navigation, reflexive motor behavior, and spatial decision-making.", sourceIds: ["basu2018maze", "sunny2024spatial"] },
      { id: "novelty", x: 955, y: 245, lens: "learn", type: "Recognized publication", year: "2025", title: "From Novelty to Knowledge", note: "Separated temporary VR novelty from durable learning outcomes through longitudinal evaluation." },
      { id: "stag", x: 1210, y: 325, lens: "protect", type: "Research system", year: "2022", title: "STAG gaze toolkit", note: "Captured, replayed, and analyzed spatial trajectory and gaze information.", sourceIds: ["basu2022stag", "sunny2025gaze"] },
      { id: "privacy", x: 1270, y: 520, lens: "protect", type: "Privacy research", year: "2023", title: "Privacy in spatial navigability", note: "Examined how behavioral variation in VR can create identifiable and sensitive data.", sourceIds: ["basu2023privacy", "guthula2025privacy"] },
      { id: "inclusive-xr", x: 1110, y: 670, lens: "protect", type: "Student inquiry", year: "2024", title: "Inclusive XR telemetry", note: "Extended privacy, bias, and spatial-behavior questions through mentored student research.", sourceIds: ["guthula2024bias", "guthula2025privacy"] },
      { id: "dart", x: 135, y: 330, lens: "decide", type: "Funded award", year: "2024", title: "DART cardiac mapping", note: "Transforms conventional medical imagery into inspectable 3D representations for surgical preplanning." },
      { id: "cardiology", x: 135, y: 565, lens: "decide", type: "Research direction", year: "2026", title: "Digital cardiology", note: "Combines spatial visualization, AI assistance, and expert inspection for high-stakes clinical reasoning." },
      { id: "digital-twins", x: 310, y: 745, lens: "decide", type: "Proposal portfolio", year: "2026", title: "Human-in-the-loop digital twins", note: "Applies immersive scenario comparison to aviation, infrastructure, sensing, and regional decisions." },
      { id: "consortium", x: 555, y: 875, lens: "train", type: "Funded collaboration", year: "2025", title: "Cybersecurity Consortium", note: "Advances immersive industrial-control-system training and cyber-physical workforce development." },
      { id: "secure-xr", x: 865, y: 865, lens: "train", type: "Research infrastructure", year: "2025", title: "Secure distributed XR", note: "Connects encrypted 3D delivery, telemetry, replay, and evidence-based assessment.", sourceIds: ["basu2022stag", "guthula2025privacy", "sunny2025gaze"] }
    ],
    edges: [
      { source: "human-judgment", target: "learn", relation: "frames" },
      { source: "human-judgment", target: "protect", relation: "frames" },
      { source: "human-judgment", target: "train", relation: "frames" },
      { source: "human-judgment", target: "decide", relation: "frames" },
      { source: "learn", target: "ucave", relation: "grounds", evidence: ["basu2012ucave"] },
      { source: "learn", target: "mixed-pets", relation: "applies", evidence: ["johnsen2014mixedpets"] },
      { source: "learn", target: "navigation", relation: "tests", evidence: ["basu2018maze"] },
      { source: "learn", target: "novelty", relation: "extends" },
      { source: "protect", target: "stag", relation: "enables", evidence: ["basu2022stag", "sunny2025gaze"] },
      { source: "protect", target: "privacy", relation: "reveals", evidence: ["basu2023privacy", "guthula2025privacy"] },
      { source: "protect", target: "inclusive-xr", relation: "guides", evidence: ["guthula2024bias", "guthula2025privacy"] },
      { source: "train", target: "consortium", relation: "scales" },
      { source: "train", target: "secure-xr", relation: "operationalizes" },
      { source: "decide", target: "public-scholarship", relation: "translates" },
      { source: "decide", target: "dart", relation: "applies" },
      { source: "decide", target: "cardiology", relation: "advances" },
      { source: "decide", target: "digital-twins", relation: "generalizes" },
      { source: "ucave", target: "public-scholarship", relation: "informs", cross: true },
      { source: "navigation", target: "privacy", relation: "reveals", evidence: ["basu2018maze", "basu2023privacy"], cross: true },
      { source: "stag", target: "secure-xr", relation: "enables", evidence: ["basu2022stag", "guthula2025privacy", "sunny2025gaze"], cross: true },
      { source: "dart", target: "cardiology", relation: "advances" },
      { source: "digital-twins", target: "secure-xr", relation: "converges", cross: true },
      { source: "novelty", target: "inclusive-xr", relation: "informs", cross: true }
    ]
  },
  evolutionThreads: {
    all: {
      label: "Entire evolution",
      range: "2012–2026",
      focus: "human-judgment",
      summary: "The complete program connects immersive learning, behavioral measurement, privacy, secure training, and expert decision support.",
      nodes: ["human-judgment", "learn", "protect", "train", "decide", "ucave", "mixed-pets", "public-scholarship", "navigation", "novelty", "stag", "privacy", "inclusive-xr", "dart", "cardiology", "digital-twins", "consortium", "secure-xr"]
    },
    foundations: {
      label: "Immersive foundations",
      range: "2012–2018",
      focus: "ucave",
      summary: "Portable collaborative VR grew into health intervention, public scholarship, and studies of embodied navigation.",
      nodes: ["human-judgment", "learn", "decide", "ucave", "mixed-pets", "public-scholarship", "navigation"]
    },
    learning: {
      label: "Learning over time",
      range: "2012–2025",
      focus: "navigation",
      summary: "Early immersive systems led to embodied-navigation studies and longitudinal evidence that separates novelty from durable learning.",
      nodes: ["human-judgment", "learn", "ucave", "mixed-pets", "navigation", "novelty"]
    },
    measurement: {
      label: "Measurement and trust",
      range: "2018–2025",
      focus: "stag",
      summary: "Spatial behavior became measurable evidence, then a privacy problem requiring accountable and inclusive telemetry.",
      nodes: ["human-judgment", "learn", "protect", "navigation", "novelty", "stag", "privacy", "inclusive-xr", "secure-xr"]
    },
    translation: {
      label: "Decision support",
      range: "2016–2026",
      focus: "public-scholarship",
      summary: "Public-facing 3D worlds evolved into cardiac mapping and human-in-the-loop spatial tools for expert decisions.",
      nodes: ["human-judgment", "decide", "public-scholarship", "dart", "cardiology", "digital-twins"]
    },
    security: {
      label: "Secure training",
      range: "2022–2026",
      focus: "secure-xr",
      summary: "Inspectable telemetry, secure distributed XR, and digital twins converge in cyber-physical readiness and workforce training.",
      nodes: ["human-judgment", "protect", "train", "decide", "stag", "secure-xr", "consortium", "digital-twins"]
    }
  }
};
