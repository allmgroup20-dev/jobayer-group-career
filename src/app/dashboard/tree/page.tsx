"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSWRFetch } from "@/lib/use-swr-fetch";

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

const MAX_DEPTH = 3;

function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < MAX_DEPTH);
  const [showAllChildren, setShowAllChildren] = useState(false);
  const { lang } = useLanguageStore();
  const isDepthLimited = depth >= MAX_DEPTH && !expanded;
  const visibleChildren = showAllChildren ? node.children : node.children.slice(0, 30);

  return (
    <div>
      <div className="flex items-center gap-3 py-2">
        {(depth > 0 || node.children.length > 0) && (
          <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs text-text-secondary">
            {isDepthLimited ? "🔒" : expanded ? "−" : "+"}
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
          <p className="text-xs text-text-secondary">ID: {node.worker_id} | {lang === "bn" ? "সহযোগী" : "Associates"}: {node.total_team_members}</p>
        </div>
      </div>
      {!isDepthLimited && expanded && visibleChildren.length > 0 && (
        <div className="ml-8 border-l-2 border-gray-100 pl-4">
          {visibleChildren.map((child) => (
            <TreeNodeView key={child.worker_id} node={child} depth={depth + 1} />
          ))}
          {node.children.length > 30 && !showAllChildren && (
            <button onClick={() => setShowAllChildren(true)} className="text-xs text-action hover:underline mt-1">
              {lang === "bn" ? `আরও দেখুন (${node.children.length - 30})` : `Show more (${node.children.length - 30})`}
            </button>
          )}
        </div>
      )}
      {isDepthLimited && (
        <button onClick={() => setExpanded(true)} className="ml-8 text-xs text-action hover:underline mt-1">
          {lang === "bn" ? "সম্প্রসারিত করুন" : "Expand"}
        </button>
      )}
    </div>
  );
}

export default function TreePage() {
  const { lang } = useLanguageStore();
  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
  const { data, loading } = useSWRFetch<{ members?: TreeNode[] }>(
    workerId ? `/api/mlm/tree?workerId=${workerId}` : null,
    { ttlMs: 300_000 }
  );
  const tree = data?.members && data.members.length > 0
    ? buildTree(data.members, workerId!)
    : null;

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {lang === "bn" ? "আমার সহযোগী" : "My Associates"}
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {lang === "bn" ? "আপনার সহযোগীদের সম্পূর্ণ কাঠামো" : "Complete structure of your associates"}
        </p>
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          ) : tree ? (
            <TreeNodeView node={tree} />
          ) : (
            <p className="text-center text-text-secondary py-8">
              {lang === "bn" ? "কোন সহযোগী পাওয়া যায়নি" : "No associates found"}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}