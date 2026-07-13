"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

const mockTree = {
  name: "Rahim Molla",
  id: "JGRH1234",
  phone: "017****5678",
  level: 1,
  team: 45,
  children: [
    { name: "Karim Hossain", id: "JGKH5678", phone: "019****4321", level: 1, team: 12, children: [
      { name: "Fatima Begum", id: "JGFB9012", phone: "016****7890", level: 2, team: 5, children: [] },
      { name: "Jahid Hasan", id: "JGJH3456", phone: "018****2345", level: 2, team: 3, children: [] },
      { name: "Nasrin Akter", id: "JGNA7890", phone: "015****6789", level: 2, team: 2, children: [] },
    ]},
    { name: "Shamim Reza", id: "JGSR1234", phone: "017****3456", level: 1, team: 8, children: [
      { name: "Rubel Mia", id: "JGRM5678", phone: "019****9012", level: 2, team: 4, children: [] },
    ]},
    { name: "Ayesha Khatun", id: "JGAK9012", phone: "016****4567", level: 1, team: 6, children: [] },
    { name: "Sabbir Ahmed", id: "JBSA3456", phone: "018****7890", level: 1, team: 3, children: [] },
  ],
};

function TreeNode({ node, depth = 0 }: { node: typeof mockTree; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const { lang } = useLanguageStore();

  return (
    <div className="ml-0">
      <div className="flex items-center gap-3 py-2">
        {depth > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs text-text-secondary">
            {expanded ? "−" : "+"}
          </button>
        )}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          depth === 0 ? "bg-primary" : depth === 1 ? "bg-action" : "bg-accent"
        }`}>
          {node.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{node.name}</p>
          <p className="text-xs text-text-secondary">ID: {node.id} | {lang === "bn" ? "টিম" : "Team"}: {node.team}</p>
        </div>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="ml-8 border-l-2 border-gray-100 pl-4">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child as unknown as typeof mockTree} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreePage() {
  const { lang } = useLanguageStore();

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
          <TreeNode node={mockTree} />
        </Card>
      </div>
    </div>
  );
}
