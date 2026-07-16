"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface TreeNode {
  worker_id: string;
  name: string;
  phone: string;
  level: number;
  total_team_members: number;
  parent_id: string | null;
  children: TreeNode[];
}

function buildTree(members: TreeNode[], rootId: string): TreeNode | null {
  const map = new Map<string, TreeNode>();
  for (const m of members) {
    map.set(m.worker_id, { ...m, children: [] });
  }
  let root: TreeNode | null = null;
  for (const m of members) {
    const node = map.get(m.worker_id)!;
    if (m.worker_id === rootId) {
      root = node;
    } else if (m.parent_id && map.has(m.parent_id)) {
      map.get(m.parent_id)!.children.push(node);
    }
  }
  return root;
}

function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const { lang } = useLanguageStore();

  return (
    <div>
      <div className="flex items-center gap-3 py-2">
        {depth > 0 && node.children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs text-text-secondary">
            {expanded ? "−" : "+"}
          </button>
        )}
        {depth > 0 && node.children.length === 0 && <div className="w-5" />}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          depth === 0 ? "bg-primary" : depth === 1 ? "bg-action" : "bg-accent"
        }`}>
          {node.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{node.name}</p>
          <p className="text-xs text-text-secondary">ID: {node.worker_id} | {lang === "bn" ? "টিম" : "Team"}: {node.total_team_members}</p>
        </div>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="ml-8 border-l-2 border-gray-100 pl-4">
          {node.children.map((child) => (
            <TreeNodeView key={child.worker_id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreePage() {
  const { lang } = useLanguageStore();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workerId = localStorage.getItem("worker_id");
    if (!workerId) { setLoading(false); return; }
    fetch(`/api/mlm/tree?workerId=${workerId}`)
      .then((r) => r.json() as Promise<{ members?: TreeNode[]; total?: number }>)
      .then((data) => {
        if (data.members && data.members.length > 0) {
          const root = buildTree(data.members, workerId);
          setTree(root);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {lang === "bn" ? "আমার টিম" : "My Team"}
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {lang === "bn" ? "আপনার টিমের সম্পূর্ণ কাঠামো" : "Complete structure of your team"}
        </p>
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" />
            </div>
          ) : tree ? (
            <TreeNodeView node={tree} />
          ) : (
            <p className="text-center text-text-secondary py-8">
              {lang === "bn" ? "কোন টিম মেম্বার পাওয়া যায়নি" : "No team members found"}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}