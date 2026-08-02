import { ensureDB } from "@/lib/db";

export type NodeType = "user" | "skill" | "goal" | "course" | "product" | "interest" | "pain_point" | "topic" | "achievement";

export type EdgeType = "wants" | "has" | "learns" | "purchased" | "interested_in" | "struggles_with" | "requires" | "improved_by" | "leads_to" | "related_to";

const EDGE_DISPLAY: Record<EdgeType, string> = {
  wants: "wants",
  has: "has",
  learns: "learning",
  purchased: "purchased",
  interested_in: "interested in",
  struggles_with: "struggles with",
  requires: "needs",
  improved_by: "improved by",
  leads_to: "leads to",
  related_to: "related to",
};

const EDGE_DISPLAY_BN: Record<EdgeType, string> = {
  wants: "চায়",
  has: "আছে",
  learns: "শিখছে",
  purchased: "কিনেছে",
  interested_in: "আগ্রহী",
  struggles_with: "সমস্যা আছে",
  requires: "দরকার",
  improved_by: "উন্নতি হবে",
  leads_to: "নিয়ে যায়",
  related_to: "সম্পর্কিত",
};

export interface GraphNode {
  node_id: string;
  node_type: NodeType;
  node_value: string;
  node_value_bn?: string;
  metadata?: string;
}

export interface GraphEdge {
  edge_id: number;
  from_node: string;
  to_node: string;
  edge_type: EdgeType;
  weight: number;
}

export async function ensureGraphTables(): Promise<void> {
  try {
    const db = await ensureDB();
    await db.prepare(`CREATE TABLE IF NOT EXISTS knowledge_graph_nodes (
      node_id TEXT PRIMARY KEY,
      node_type TEXT NOT NULL,
      node_value TEXT NOT NULL,
      node_value_bn TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
      edge_id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_node TEXT NOT NULL,
      to_node TEXT NOT NULL,
      edge_type TEXT NOT NULL,
      weight REAL DEFAULT 1.0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(from_node, to_node, edge_type)
    )`).run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_edge_from ON knowledge_graph_edges(from_node)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_edge_to ON knowledge_graph_edges(to_node)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_node_type ON knowledge_graph_nodes(node_type)").run().catch(() => {});
  } catch (e) {
    console.error("[GraphMemory] ensure tables error:", (e as Error)?.message);
  }
}

export async function addNode(
  nodeId: string,
  nodeType: NodeType,
  value: string,
  valueBn?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = await ensureDB();
  try {
    await db.prepare(
      `INSERT OR IGNORE INTO knowledge_graph_nodes (node_id, node_type, node_value, node_value_bn, metadata)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(nodeId, nodeType, value, valueBn || null, metadata ? JSON.stringify(metadata) : null).run();
  } catch {
    try { await ensureGraphTables(); } catch {}
  }
}

export async function addEdge(
  fromNode: string,
  toNode: string,
  edgeType: EdgeType,
  weight: number = 1.0
): Promise<void> {
  const db = await ensureDB();
  try {
    await db.prepare(
      `INSERT OR IGNORE INTO knowledge_graph_edges (from_node, to_node, edge_type, weight)
       VALUES (?, ?, ?, ?)`
    ).bind(fromNode, toNode, edgeType, weight).run();
  } catch {
    try { await ensureGraphTables(); } catch {}
  }
}

export async function upsertEdge(
  fromNode: string,
  toNode: string,
  edgeType: EdgeType,
  weight: number = 1.0
): Promise<void> {
  const db = await ensureDB();
  try {
    await db.prepare(
      `INSERT INTO knowledge_graph_edges (from_node, to_node, edge_type, weight)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(from_node, to_node, edge_type) DO UPDATE SET weight = weight + ?`
    ).bind(fromNode, toNode, edgeType, weight, weight).run();
  } catch {}
}

export async function getNeighbors(
  nodeId: string,
  direction: "outgoing" | "incoming" | "both" = "outgoing",
  maxDepth: number = 1
): Promise<{ edges: GraphEdge[]; nodes: GraphNode[] }> {
  const db = await ensureDB();
  let edges: GraphEdge[] = [];
  let nodeIds = new Set<string>();

  try {
    if (direction === "outgoing" || direction === "both") {
      const out = await db.prepare(
        `SELECT edge_id, from_node, to_node, edge_type, weight
         FROM knowledge_graph_edges WHERE from_node = ?`
      ).bind(nodeId).all() as any;
      for (const e of (out?.results || [])) { edges.push(e); nodeIds.add(e.to_node); }
    }
    if (direction === "incoming" || direction === "both") {
      const inc = await db.prepare(
        `SELECT edge_id, from_node, to_node, edge_type, weight
         FROM knowledge_graph_edges WHERE to_node = ?`
      ).bind(nodeId).all() as any;
      for (const e of (inc?.results || [])) { edges.push(e); nodeIds.add(e.from_node); }
    }

    nodeIds.add(nodeId);
    const nodes: GraphNode[] = [];
    for (const nid of nodeIds) {
      const row = await db.prepare(
        "SELECT node_id, node_type, node_value, node_value_bn, metadata FROM knowledge_graph_nodes WHERE node_id = ?"
      ).bind(nid).first() as any;
      if (row) {
        nodes.push({ node_id: row.node_id, node_type: row.node_type, node_value: row.node_value, node_value_bn: row.node_value_bn, metadata: row.metadata });
      }
    }

    return { edges, nodes };
  } catch {
    return { edges: [], nodes: [] };
  }
}

export async function traverseBFS(
  startNode: string,
  edgeType?: EdgeType,
  maxDepth: number = 3
): Promise<{ path: string[]; nodes: GraphNode[] }> {
  const db = await ensureDB();
  const visited = new Set<string>();
  const queue: { node: string; depth: number; path: string[] }[] = [{ node: startNode, depth: 0, path: [startNode] }];
  visited.add(startNode);
  const allNodes: GraphNode[] = [];

  while (queue.length > 0) {
    const { node, depth, path } = queue.shift()!;
    if (depth >= maxDepth) continue;

    let sql = "SELECT to_node, edge_type FROM knowledge_graph_edges WHERE from_node = ?";
    const params: unknown[] = [node];
    if (edgeType) { sql += " AND edge_type = ?"; params.push(edgeType); }

    try {
      const rows = await db.prepare(sql).bind(...params).all() as any;
      for (const row of (rows?.results || [])) {
        if (!visited.has(row.to_node)) {
          visited.add(row.to_node);
          queue.push({ node: row.to_node, depth: depth + 1, path: [...path, row.to_node] });

          const nodeRow = await db.prepare(
            "SELECT node_id, node_type, node_value, node_value_bn FROM knowledge_graph_nodes WHERE node_id = ?"
          ).bind(row.to_node).first() as any;
          if (nodeRow) allNodes.push(nodeRow);
        }
      }
    } catch {}
  }

  return { path: Array.from(visited), nodes: allNodes };
}

export async function linkUserToNode(
  phone: string,
  nodeId: string,
  edgeType: EdgeType,
  weight: number = 1.0
): Promise<void> {
  const userNodeId = `user:${phone}`;
  await addNode(userNodeId, "user", phone, undefined, { phone });
  await addNode(nodeId, "topic", nodeId, undefined);
  await upsertEdge(userNodeId, nodeId, edgeType, weight);
}

export async function buildGraphContext(
  phone: string,
  language: string,
  maxDepth: number = 2
): Promise<string> {
  const userNodeId = `user:${phone}`;
  const { path, nodes } = await traverseBFS(userNodeId, undefined, maxDepth);

  if (nodes.length === 0) return "";

  const lines: string[] = [];
  lines.push(language === "bn" ? "## নলেজ গ্রাফ" : "## Knowledge Graph");

  // Group by type
  const byType: Record<string, GraphNode[]> = {};
  for (const n of nodes) {
    if (n.node_id === userNodeId) continue;
    if (!byType[n.node_type]) byType[n.node_type] = [];
    byType[n.node_type].push(n);
  }

  for (const [type, typeNodes] of Object.entries(byType)) {
    const label = language === "bn"
      ? ({ skill: "দক্ষতা", goal: "লক্ষ্য", course: "কোর্স", product: "পণ্য", interest: "আগ্রহ", pain_point: "সমস্যা", topic: "বিষয়", achievement: "অর্জন" } as Record<string, string>)
      : ({ skill: "Skills", goal: "Goals", course: "Courses", product: "Products", interest: "Interests", pain_point: "Pain points", topic: "Topics", achievement: "Achievements" } as Record<string, string>);
    const values = typeNodes.map((n) => language === "bn" ? (n.node_value_bn || n.node_value) : n.node_value).join(", ");
    lines.push(`- ${label[type] || type}: ${values}`);
  }

  // Add relationship descriptions
  const { edges } = await getNeighbors(userNodeId, "outgoing");
  const relLines: string[] = [];
  for (const edge of edges) {
    const targetNode = nodes.find((n) => n.node_id === edge.to_node);
    if (targetNode) {
      const val = language === "bn" ? (targetNode.node_value_bn || targetNode.node_value) : targetNode.node_value;
      const rel = language === "bn" ? EDGE_DISPLAY_BN[edge.edge_type] : EDGE_DISPLAY[edge.edge_type];
      relLines.push(`- ${rel}: ${val}`);
    }
  }
  if (relLines.length > 0) {
    lines.push(language === "bn" ? "### সম্পর্ক" : "### Relationships");
    lines.push(...relLines);
  }

  return lines.join("\n") + "\n";
}

// Auto-link detected interests/goals/skills from text
export async function autoLinkFromText(phone: string, text: string): Promise<void> {
  const userNodeId = `user:${phone}`;
  await addNode(userNodeId, "user", phone, undefined, { phone });

  // Interests
  const interestPatterns: [RegExp, string, string][] = [
    [/\b(?:english|ইংরেজি|spoken|ইংলিশ)\b/i, "skill:english", "English"],
    [/\b(?:marketing|মার্কেটিং|digital|ডিজিটাল)\b/i, "skill:marketing", "Marketing"],
    [/\b(?:programming|প্রোগ্রামিং|web|ওয়েব)\b/i, "skill:programming", "Programming"],
    [/\b(?:design|ডিজাইন|graphic|গ্রাফিক)\b/i, "skill:design", "Design"],
    [/\b(?:video|ভিডিও|editing|এডিটিং)\b/i, "skill:video", "Video Editing"],
    [/\b(?:business|ব্যবসা|entrepreneur|উদ্যোক্তা)\b/i, "skill:business", "Business"],
    [/\b(?:freelanc|ফ্রিল্যান্স|fiverr|ফাইভার)\b/i, "skill:freelancing", "Freelancing"],
  ];

  for (const [re, nodeId, label] of interestPatterns) {
    if (re.test(text)) {
      await addNode(nodeId, "skill", label, undefined);
      await upsertEdge(userNodeId, nodeId, "interested_in", 0.5);
    }
  }

  // Goals
  const goalPatterns: [RegExp, string, string][] = [
    [/\b(?:job|চাকরি|চাকুরী)\b/i, "goal:job", "Getting a job"],
    [/\b(?:abroad|বিদেশ|canada|কানাডা|visa|ভিসা)\b/i, "goal:abroad", "Going abroad"],
    [/\b(?:business.*start|ব্যবসা.*শুরু|startup|স্টার্টআপ)\b/i, "goal:business", "Starting a business"],
    [/\b(?:learn|শিখতে|skill|দক্ষতা|training|ট্রেনিং)\b/i, "goal:learning", "Learning new skills"],
    [/\b(?:money|টাকা|income|আয়|earn|উপার্জন)\b/i, "goal:financial", "Financial freedom"],
  ];

  for (const [re, nodeId, label] of goalPatterns) {
    if (re.test(text)) {
      await addNode(nodeId, "goal", label, undefined);
      await upsertEdge(userNodeId, nodeId, "wants", 0.8);
    }
  }

  // Pain points
  const painPatterns: [RegExp, string, string][] = [
    [/\b(?:no.*income|আয়.*নাই|unemployed|বেকার)\b/i, "pain:no_income", "No income"],
    [/\b(?:no.*skill|দক্ষতা.*নাই|can't.*do|পারি.*না)\b/i, "pain:no_skill", "Lack of skills"],
    [/\b(?:no.*time|সময়.*নাই|busy|ব্যস্ত)\b/i, "pain:no_time", "No time"],
    [/\b(?:scam|fraud|ভুয়া|প্রতারনা|cheat|ঠকা)\b/i, "pain:scam_fear", "Fear of scams"],
  ];

  for (const [re, nodeId, label] of painPatterns) {
    if (re.test(text)) {
      await addNode(nodeId, "pain_point", label, undefined);
      await upsertEdge(userNodeId, nodeId, "struggles_with", 0.7);
    }
  }
}
