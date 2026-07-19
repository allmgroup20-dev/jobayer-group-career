"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import ImageUpload from "@/components/ui/ImageUpload";

interface Trainer {
  id: number; name: string; name_bn: string | null;
  specialty_en: string | null; specialty_bn: string | null;
  credential_en: string | null; credential_bn: string | null;
  bio_en: string | null; bio_bn: string | null;
  image_url: string | null; experience_years: number;
  institution_id: number | null; institution_name: string | null;
  sort_order: number; is_active: number;
  coursesEn: string[]; coursesBn: string[];
}

interface Institution {
  id: number; name: string; name_bn: string | null;
}

export default function CompanyTrainersPage() {
  const { lang } = useLanguageStore();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", nameBn: "", specialtyEn: "", specialtyBn: "",
    credentialEn: "", credentialBn: "", bioEn: "", bioBn: "",
    imageUrl: "", experienceYears: 0, institutionId: 0, sortOrder: 0,
    coursesEnStr: "", coursesBnStr: "", isActive: 1,
  });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [tRes, iRes] = await Promise.all([
      fetch("/api/trainers?all=1").then(r => r.json() as Promise<{ trainers: Trainer[] }>),
      fetch("/api/institutions?all=1").then(r => r.json() as Promise<{ institutions: Institution[] }>),
    ]);
    setTrainers(tRes.trainers || []);
    setInstitutions(iRes.institutions || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", nameBn: "", specialtyEn: "", specialtyBn: "", credentialEn: "", credentialBn: "", bioEn: "", bioBn: "", imageUrl: "", experienceYears: 0, institutionId: 0, sortOrder: 0, coursesEnStr: "", coursesBnStr: "", isActive: 1 });
    setShowForm(true);
  };

  const openEdit = (t: Trainer) => {
    setEditing(t);
    setForm({
      name: t.name, nameBn: t.name_bn || "", specialtyEn: t.specialty_en || "", specialtyBn: t.specialty_bn || "",
      credentialEn: t.credential_en || "", credentialBn: t.credential_bn || "",
      bioEn: t.bio_en || "", bioBn: t.bio_bn || "",
      imageUrl: t.image_url || "", experienceYears: t.experience_years,
      institutionId: t.institution_id || 0, sortOrder: t.sort_order,
      coursesEnStr: (t.coursesEn || []).join(", "), coursesBnStr: (t.coursesBn || []).join(", "),
      isActive: t.is_active,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return alert(lang === "bn" ? "নাম দিন" : "Enter name");
    setSaving(true);
    const body = {
      name: form.name, nameBn: form.nameBn || null,
      specialtyEn: form.specialtyEn || null, specialtyBn: form.specialtyBn || null,
      credentialEn: form.credentialEn || null, credentialBn: form.credentialBn || null,
      bioEn: form.bioEn || null, bioBn: form.bioBn || null,
      imageUrl: form.imageUrl || null, experienceYears: form.experienceYears,
      institutionId: form.institutionId || null, sortOrder: form.sortOrder,
      isActive: form.isActive,
      coursesEn: form.coursesEnStr.split(",").map(s => s.trim()).filter(Boolean),
      coursesBn: form.coursesBnStr.split(",").map(s => s.trim()).filter(Boolean),
    };
    try {
      const res = editing
        ? await fetch(`/api/trainers/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/trainers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    const sorted = [...trainers].sort((a, b) => a.sort_order - b.sort_order);
    const sourceIdx = sorted.findIndex(t => t.id === dragId);
    const targetIdx = sorted.findIndex(t => t.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;
    const [moved] = sorted.splice(sourceIdx, 1);
    sorted.splice(targetIdx, 0, moved);
    const updates: { id: number; sort_order: number }[] = [];
    sorted.forEach((item, i) => { if (item.sort_order !== i) updates.push({ id: item.id, sort_order: i }); });
    if (updates.length > 0) {
      await Promise.all(updates.map(u => fetch(`/api/trainers/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: u.sort_order }) })));
      load();
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "bn" ? "ডিলিট করবেন?" : "Delete?")) return;
    await fetch(`/api/trainers/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="p-6 text-text-secondary">Loading...</div>;
  const sortedTrainers = [...trainers].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-primary">👨‍🏫 {lang === "bn" ? "প্রশিক্ষক ব্যবস্থাপনা" : "Trainer Management"}</h1>
        <div className="flex gap-2">
          <button onClick={async () => {
            if (!confirm(lang === "bn" ? "সমস্ত বিদ্যমান ডেটা মুছে গিয়ে স্ট্যাটিক ডেটা বসবে। নিশ্চিত?" : "All existing data will be replaced. Confirm?")) return;
            setSeeding(true);
            try {
              const res = await fetch("/api/trainers/seed", { method: "POST" });
              const d = await res.json() as { success?: boolean; error?: string; trainersSeeded?: number };
              if (d.success) { alert(lang === "bn" ? `${d.trainersSeeded} জন প্রশিক্ষক ও প্রতিষ্ঠান সিঙ্ক হয়েছে` : `${d.trainersSeeded} trainers & institutions synced`); load(); }
              else alert(d.error || "Failed");
            } catch { alert("Failed"); }
            finally { setSeeding(false); }
          }} disabled={seeding} className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
            {seeding ? "..." : "🔄 " + (lang === "bn" ? "স্ট্যাটিক ডেটা সিঙ্ক" : "Sync Static Data")}
          </button>
          <button onClick={openNew} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90">+ {lang === "bn" ? "নতুন প্রশিক্ষক" : "New Trainer"}</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center py-10 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-primary mb-4">{editing ? (lang === "bn" ? "প্রশিক্ষক সম্পাদনা" : "Edit Trainer") : (lang === "bn" ? "নতুন প্রশিক্ষক" : "New Trainer")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-text-secondary">Name *</label><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Name (BN)</label><input value={form.nameBn} onChange={e => setForm(p => ({...p, nameBn: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Specialty (EN)</label><input value={form.specialtyEn} onChange={e => setForm(p => ({...p, specialtyEn: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Specialty (BN)</label><input value={form.specialtyBn} onChange={e => setForm(p => ({...p, specialtyBn: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Credential (EN)</label><input value={form.credentialEn} onChange={e => setForm(p => ({...p, credentialEn: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Credential (BN)</label><input value={form.credentialBn} onChange={e => setForm(p => ({...p, credentialBn: e.target.value}))} className="input-field w-full text-sm" /></div>
              <div className="col-span-2"><ImageUpload value={form.imageUrl} onChange={v => setForm(p => ({...p, imageUrl: v}))} label={lang === "bn" ? "ছবি" : "Image"} /></div>
              <div><label className="text-xs font-medium text-text-secondary">Experience (years)</label><input type="number" value={form.experienceYears} onChange={e => setForm(p => ({...p, experienceYears: parseInt(e.target.value) || 0}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(p => ({...p, sortOrder: parseInt(e.target.value) || 0}))} className="input-field w-full text-sm" /></div>
              <div><label className="text-xs font-medium text-text-secondary">Institution</label>
                <select value={form.institutionId} onChange={e => setForm(p => ({...p, institutionId: parseInt(e.target.value) || 0}))} className="input-field w-full text-sm">
                  <option value={0}>-- {lang === "bn" ? "কোনটি না" : "None"} --</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{lang === "bn" ? i.name_bn || i.name : i.name}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-text-secondary">Active</label>
                <select value={form.isActive} onChange={e => setForm(p => ({...p, isActive: parseInt(e.target.value)}))} className="input-field w-full text-sm">
                  <option value={1}>{lang === "bn" ? "সক্রিয়" : "Active"}</option>
                  <option value={0}>{lang === "bn" ? "নিষ্ক্রিয়" : "Inactive"}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-text-secondary">Courses (EN) <span className="text-gray-400">— কমা দিয়ে আলাদা করুন</span></label>
                <textarea value={form.coursesEnStr} onChange={e => setForm(p => ({...p, coursesEnStr: e.target.value}))} className="input-field w-full text-sm" rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-text-secondary">Courses (BN) <span className="text-gray-400">— কমা দিয়ে আলাদা করুন</span></label>
                <textarea value={form.coursesBnStr} onChange={e => setForm(p => ({...p, coursesBnStr: e.target.value}))} className="input-field w-full text-sm" rows={2} />
              </div>
              <div className="col-span-2"><label className="text-xs font-medium text-text-secondary">Bio (EN)</label><textarea value={form.bioEn} onChange={e => setForm(p => ({...p, bioEn: e.target.value}))} className="input-field w-full text-sm" rows={2} /></div>
              <div className="col-span-2"><label className="text-xs font-medium text-text-secondary">Bio (BN)</label><textarea value={form.bioBn} onChange={e => setForm(p => ({...p, bioBn: e.target.value}))} className="input-field w-full text-sm" rows={2} /></div>
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
              <th className="p-3">{lang === "bn" ? "নাম" : "Name"}</th>
              <th className="p-3">{lang === "bn" ? "পদবী" : "Title"}</th>
              <th className="p-3">{lang === "bn" ? "প্রতিষ্ঠান" : "Institution"}</th>
              <th className="p-3">{lang === "bn" ? "অভিজ্ঞতা" : "Exp"}</th>
              <th className="p-3">{lang === "bn" ? "অর্ডার" : "Order"}</th>
              <th className="p-3">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
              <th className="p-3">{lang === "bn" ? "অ্যাকশন" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrainers.map((t, i) => (
              <tr key={t.id} draggable="true"
                onDragStart={e => handleDragStart(e, t.id)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverIdx(i); }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={e => handleDrop(e, t.id)}
                onDragEnd={() => setDragOverIdx(null)}
                className={`border-t border-border transition-colors ${dragOverIdx === i ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"} cursor-grab active:cursor-grabbing`}>
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(lang === "bn" ? t.name_bn || t.name : t.name).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-primary">{lang === "bn" ? t.name_bn || t.name : t.name}</span>
                  </div>
                </td>
                <td className="p-3 text-text-secondary">{lang === "bn" ? t.credential_bn || t.specialty_bn : t.credential_en || t.specialty_en}</td>
                <td className="p-3 text-text-secondary">{t.institution_name || "-"}</td>
                <td className="p-3 text-text-secondary">{t.experience_years}y</td>
                <td className="p-3 text-text-secondary">{t.sort_order}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{t.is_active ? "Active" : "Inactive"}</span></td>
                <td className="p-3 flex gap-1">
                  <button onClick={() => openEdit(t)} className="px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20">{lang === "bn" ? "এডিট" : "Edit"}</button>
                  <button onClick={() => remove(t.id)} className="px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100">{lang === "bn" ? "ডিলিট" : "Del"}</button>
                </td>
              </tr>
            ))}
            {trainers.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-text-secondary">{lang === "bn" ? "কোনো প্রশিক্ষক নেই" : "No trainers yet"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
