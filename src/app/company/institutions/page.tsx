"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import ImageUpload from "@/components/ui/ImageUpload";

interface Institution {
  id: number; name: string; name_bn: string | null;
  logo_url: string | null; description_en: string | null; description_bn: string | null;
  website_url: string | null; sort_order: number; is_active: number;
}

export default function CompanyInstitutionsPage() {
  const { lang } = useLanguageStore();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", nameBn: "", logoUrl: "", descriptionEn: "", descriptionBn: "",
    websiteUrl: "", sortOrder: 0, isActive: 1,
  });
  const [saving, setSaving] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/institutions?all=1").then(r => r.json() as Promise<{ institutions: Institution[] }>);
    setInstitutions(res.institutions || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", nameBn: "", logoUrl: "", descriptionEn: "", descriptionBn: "", websiteUrl: "", sortOrder: 0, isActive: 1 });
    setShowForm(true);
  };

  const openEdit = (inst: Institution) => {
    setEditing(inst);
    setForm({
      name: inst.name, nameBn: inst.name_bn || "", logoUrl: inst.logo_url || "",
      descriptionEn: inst.description_en || "", descriptionBn: inst.description_bn || "",
      websiteUrl: inst.website_url || "", sortOrder: inst.sort_order, isActive: inst.is_active,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return alert(lang === "bn" ? "নাম দিন" : "Enter name");
    setSaving(true);
    const body = {
      name: form.name, nameBn: form.nameBn || null, logoUrl: form.logoUrl || null,
      descriptionEn: form.descriptionEn || null, descriptionBn: form.descriptionBn || null,
      websiteUrl: form.websiteUrl || null, sortOrder: form.sortOrder, isActive: form.isActive,
    };
    try {
      const res = editing
        ? await fetch(`/api/institutions/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/institutions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setShowForm(false); load(); }
      else { const d = await res.json() as { error?: string }; alert(d.error || "Failed"); }
    } catch { alert("Failed"); }
    finally { setSaving(false); }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", String(id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    const dragId = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragId) || dragId === targetId) return;
    const sorted = [...institutions].sort((a, b) => a.sort_order - b.sort_order);
    const sourceIdx = sorted.findIndex(t => t.id === dragId);
    const targetIdx = sorted.findIndex(t => t.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;
    const [moved] = sorted.splice(sourceIdx, 1);
    sorted.splice(targetIdx, 0, moved);
    const updates: { id: number; sort_order: number }[] = [];
    sorted.forEach((item, i) => { if (item.sort_order !== i) updates.push({ id: item.id, sort_order: i }); });
    if (updates.length > 0) {
      await Promise.all(updates.map(u => fetch(`/api/institutions/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: u.sort_order }) })));
      load();
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "bn" ? "ডিলিট করবেন?" : "Delete?")) return;
    await fetch(`/api/institutions/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="p-6 text-text-secondary">Loading...</div>;
  const sortedInst = [...institutions].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">🏛️ {lang === "bn" ? "প্রতিষ্ঠান ব্যবস্থাপনা" : "Institution Management"}</h1>
        <button onClick={openNew} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90">+ {lang === "bn" ? "নতুন প্রতিষ্ঠান" : "New Institution"}</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center py-10 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-primary mb-4">{editing ? (lang === "bn" ? "প্রতিষ্ঠান সম্পাদনা" : "Edit Institution") : (lang === "bn" ? "নতুন প্রতিষ্ঠান" : "New Institution")}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-text-secondary">Name *</label><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Name (BN)</label><input value={form.nameBn} onChange={e => setForm(p => ({...p, nameBn: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><ImageUpload value={form.logoUrl} onChange={v => setForm(p => ({...p, logoUrl: v}))} label={lang === "bn" ? "লোগো" : "Logo"} /></div>
              <div><label className="text-xs font-medium text-text-secondary">Website URL</label><input value={form.websiteUrl} onChange={e => setForm(p => ({...p, websiteUrl: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-text-secondary">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(p => ({...p, sortOrder: parseInt(e.target.value) || 0}))} className="input-field w-full text-sm" /></div>
                <div><label className="text-xs font-medium text-text-secondary">Status</label>
                  <select value={form.isActive} onChange={e => setForm(p => ({...p, isActive: parseInt(e.target.value)}))} className="input-field w-full text-sm">
                    <option value={1}>{lang === "bn" ? "সক্রিয়" : "Active"}</option>
                    <option value={0}>{lang === "bn" ? "নিষ্ক্রিয়" : "Inactive"}</option>
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium text-text-secondary">Description (EN)</label><textarea value={form.descriptionEn} onChange={e => setForm(p => ({...p, descriptionEn: e.target.value}))} className="input-field w-full text-sm" rows={2} /></div>
              <div><label className="text-xs font-medium text-text-secondary">Description (BN)</label><textarea value={form.descriptionBn} onChange={e => setForm(p => ({...p, descriptionBn: e.target.value}))} className="input-field w-full text-sm" rows={2} /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} disabled={saving} className="btn-primary text-sm flex-1">{saving ? "..." : (lang === "bn" ? "সেভ করুন" : "Save")}</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-border rounded-xl text-text-secondary hover:text-primary">{lang === "bn" ? "বাতিল" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-text-secondary font-semibold">
              <th className="p-3">{lang === "bn" ? "লোগো" : "Logo"}</th>
              <th className="p-3">{lang === "bn" ? "নাম" : "Name"}</th>
              <th className="p-3">{lang === "bn" ? "ওয়েবসাইট" : "Website"}</th>
              <th className="p-3">{lang === "bn" ? "অর্ডার" : "Order"}</th>
              <th className="p-3">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
              <th className="p-3">{lang === "bn" ? "অ্যাকশন" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {sortedInst.map((inst, i) => (
              <tr key={inst.id} draggable="true"
                onDragStart={e => handleDragStart(e, inst.id)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverIdx(i); }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={e => handleDrop(e, inst.id)}
                onDragEnd={() => setDragOverIdx(null)}
                className={`border-t border-border transition-colors ${dragOverIdx === i ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"} cursor-grab active:cursor-grabbing`}>
                <td className="p-3">
                  {inst.logo_url ? (
                    <img src={inst.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{(inst.name_bn || inst.name).charAt(0)}</div>
                  )}
                </td>
                <td className="p-3 font-medium text-primary">{lang === "bn" ? inst.name_bn || inst.name : inst.name}</td>
                <td className="p-3 text-text-secondary">{inst.website_url ? <a href={inst.website_url} target="_blank" rel="noopener noreferrer" className="text-action hover:underline">{inst.website_url}</a> : "-"}</td>
                <td className="p-3 text-text-secondary">{inst.sort_order}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inst.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{inst.is_active ? "Active" : "Inactive"}</span></td>
                <td className="p-3 flex gap-1">
                  <button onClick={() => openEdit(inst)} className="px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20">{lang === "bn" ? "এডিট" : "Edit"}</button>
                  <button onClick={() => remove(inst.id)} className="px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100">{lang === "bn" ? "ডিলিট" : "Del"}</button>
                </td>
              </tr>
            ))}
            {institutions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-text-secondary">{lang === "bn" ? "কোনো প্রতিষ্ঠান নেই" : "No institutions yet"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
