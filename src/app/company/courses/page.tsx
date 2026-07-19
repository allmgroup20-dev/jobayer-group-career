"use client";

import { useState, useMemo } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface CourseCategory {
  id: number;
  name: string;
  nameBn: string | null;
  icon: string;
  isVisible: number;
  parentId: number | null;
}

interface Trainer {
  id: number; name: string; name_bn: string | null;
}

interface Institution {
  id: number; name: string; name_bn: string | null;
}

interface Course {
  id: number;
  title: string;
  titleBn: string | null;
  description: string | null;
  descriptionBn: string | null;
  categoryIds: number[];
  categoryNames: string[];
  categoryNamesBn: string[];
  isNew: number;
  isVisible: number;
  icon: string;
  price: number;
  isPremium: number;
  createdAt: string;
  updatedAt: string;
  trainerId?: number | null;
  institutionId?: number | null;
}

interface CourseFile {
  id: number;
  courseId: number;
  label: string | null;
  labelBn: string | null;
  url: string;
  fileType: string;
  sortOrder: number;
}

const emptyForm = () => ({
  title: "", titleBn: "", description: "", descriptionBn: "",
  categoryIds: [] as number[], isNew: 1, isVisible: 1, icon: "📌", price: "", isPremium: 0,
  trainerId: 0, institutionId: 0,
});

export default function CompanyCoursesPage() {
  const { lang } = useLanguageStore();
  const { data: coursesData, loading, refresh: refreshCourses } = useSWRFetch<{ courses?: Course[] }>(
    "/api/courses",
    { ttlMs: 60_000 }
  );
  const { data: catsData, refresh: refreshCats } = useSWRFetch<{ categories?: CourseCategory[] }>(
    "/api/courses/categories",
    { ttlMs: 120_000 }
  );
  const { data: trainersData } = useSWRFetch<{ trainers?: Trainer[] }>(
    "/api/trainers?all=1",
    { ttlMs: 120_000 }
  );
  const { data: institutionsData } = useSWRFetch<{ institutions?: Institution[] }>(
    "/api/institutions?all=1",
    { ttlMs: 120_000 }
  );
  const courses = coursesData?.courses ?? [];
  const categories = catsData?.categories ?? [];
  const trainers = trainersData?.trainers ?? [];
  const institutions = institutionsData?.institutions ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  const [files, setFiles] = useState<CourseFile[]>([]);
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileLabel, setNewFileLabel] = useState("");

  const resetForm = () => {
    setForm(emptyForm()); setEditingId(null); setShowAdd(false); setError(""); setFiles([]);
  };

  // Build tree for checkbox display
  const buildTree = (items: CourseCategory[], parentId: number | null = null, depth = 0): (CourseCategory & { depth: number })[] => {
    const result: (CourseCategory & { depth: number })[] = [];
    for (const item of items) {
      const p = item.parentId === parentId || (item.parentId === null && parentId === null && depth === 0);
      if (p) {
        result.push({ ...item, depth });
        result.push(...buildTree(items, item.id, depth + 1));
      }
    }
    return result;
  };

  const catTree = useMemo(() => buildTree(categories), [categories]);

  const toggleCategory = (id: number) => {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(c => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const startEdit = async (c: Course) => {
    setForm({
      title: c.title, titleBn: c.titleBn || "", description: c.description || "", descriptionBn: c.descriptionBn || "",
      categoryIds: c.categoryIds || [],
      isNew: c.isNew, isVisible: c.isVisible, icon: c.icon || "📌",
      price: String(c.price || 0), isPremium: c.isPremium,
      trainerId: c.trainerId || 0, institutionId: c.institutionId || 0,
    });
    setEditingId(c.id);
    setShowAdd(true);
    setError("");

    const res = await fetch(`/api/courses/${c.id}/files`);
    const data = await res.json() as { files?: CourseFile[] };
    setFiles(data.files ?? []);
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = {
        title: form.title, titleBn: form.titleBn || null, description: form.description || null,
        descriptionBn: form.descriptionBn || null,
        categoryIds: form.categoryIds,
        isNew: form.isNew, isVisible: form.isVisible, icon: form.icon || "📌",
        price: parseFloat(form.price) || 0, isPremium: form.isPremium,
        trainerId: form.trainerId || null, institutionId: form.institutionId || null,
      };

      const url = editingId ? `/api/courses/${editingId}` : "/api/courses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");

      refreshCourses(); resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === "bn" ? "নিশ্চিতভাবে রিসোর্সটি ডিলিট করবেন?" : "Are you sure you want to delete this resource?")) return;
    try { const res = await fetch(`/api/courses/${id}`, { method: "DELETE" }); if (res.ok) refreshCourses(); } catch {}
  };

  const toggleField = (id: number, field: string, value: number) => {
    fetch(`/api/courses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) })
      .then(() => refreshCourses()).catch(() => {});
  };

  const addFile = async (courseId: number) => {
    if (!newFileUrl) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/files`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newFileUrl, label: newFileLabel || null, fileType: "link" }),
      });
      if (res.ok) {
        setNewFileUrl(""); setNewFileLabel("");
        const fres = await fetch(`/api/courses/${courseId}/files`);
        const fdata = await fres.json() as { files?: CourseFile[] };
        setFiles(fdata.files ?? []);
      }
    } catch {}
  };

  const deleteFile = async (courseId: number, fileId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/files/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch {}
  };

  const catNames = (c: Course) => {
    const names = lang === "bn" && c.categoryNamesBn?.length
      ? c.categoryNamesBn : c.categoryNames;
    return names?.join(", ") || "";
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "রিসোর্স ব্যবস্থাপনা" : "Manage Resources"}</h1>
            <p className="text-sm text-text-secondary mt-1">{courses.length} {lang === "bn" ? "টি রিসোর্স" : "resources"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={async () => {
              if (courses.length > 0 && !confirm(lang === "bn"
                ? `${courses.length} টি রিসোর্স আছে। আবার ইম্পোর্ট করলে পুরনো ডাটা মুছে নতুন করে বসবে। নিশ্চিত?`
                : `${courses.length} resources exist. Re-importing will delete all and re-seed. Confirm?`)) return;
              setSeeding(true); setError("");
              try {
                const res = await fetch("/api/courses/seed", { method: "POST" });
                const data = await res.json() as { error?: string; coursesSeeded?: number; categoriesSeeded?: number };
                if (!res.ok) throw new Error(data.error || "Seed failed");
                refreshCourses(); refreshCats();
                alert(lang === "bn"
                  ? `${data.categoriesSeeded}টি ক্যাটাগরি ও ${data.coursesSeeded}টি রিসোর্স ইম্পোর্ট হয়েছে`
                  : `${data.categoriesSeeded} categories and ${data.coursesSeeded} resources imported`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Seed failed");
              } finally { setSeeding(false); }
            }} disabled={seeding}>
              {seeding ? "⏳" : "🌱"} {lang === "bn" ? (courses.length > 0 ? "পুনরায় ইম্পোর্ট" : "স্ট্যাটিক ডাটা ইম্পোর্ট") : (courses.length > 0 ? "Re-import Data" : "Import Static Data")}
            </Button>
            <Button onClick={() => { resetForm(); setShowAdd(!showAdd); }}>
              {lang === "bn" ? "নতুন রিসোর্স" : "Add Resource"}
            </Button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        {showAdd && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-bold text-primary mb-4">
              {editingId ? (lang === "bn" ? "রিসোর্স সম্পাদনা করুন" : "Edit Resource") : (lang === "bn" ? "নতুন রিসোর্স যোগ করুন" : "Add New Resource")}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder={lang === "bn" ? "শিরোনাম (ইংরেজি)" : "Title (EN)"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
              <input type="text" placeholder={lang === "bn" ? "শিরোনাম (বাংলা)" : "Title (BN)"} value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} className="input-field" />
              <input type="text" placeholder={lang === "bn" ? "আইকন (ইমোজি)" : "Icon (Emoji)"} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" />
              <input type="number" placeholder={lang === "bn" ? "মূল্য (যদি প্রযোজ্য হয়)" : "Price (if applicable)"} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">{lang === "bn" ? "প্রশিক্ষক" : "Trainer"}</label>
                <select value={form.trainerId} onChange={e => {
                  const tid = parseInt(e.target.value) || 0;
                  const t = trainers.find(x => x.id === tid);
                  setForm({ ...form, trainerId: tid, institutionId: (t as any)?.institution_id || form.institutionId });
                }} className="input-field w-full text-sm">
                  <option value={0}>-- {lang === "bn" ? "কোনটি না" : "None"} --</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{lang === "bn" && t.name_bn ? t.name_bn : t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">{lang === "bn" ? "প্রতিষ্ঠান" : "Institution"}</label>
                <select value={form.institutionId} onChange={e => setForm({ ...form, institutionId: parseInt(e.target.value) || 0 })} className="input-field w-full text-sm">
                  <option value={0}>-- {lang === "bn" ? "কোনটি না" : "None"} --</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{lang === "bn" && i.name_bn ? i.name_bn : i.name}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <h4 className="font-semibold text-sm text-primary mb-2">{lang === "bn" ? "ক্যাটাগরি (একাধিক সিলেক্ট করুন)" : "Categories (select multiple)"}</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 max-h-48 overflow-y-auto p-2 border border-border rounded-xl">
                {catTree.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer select-none text-sm py-1"
                    style={{ paddingLeft: `${cat.depth * 16 + 4}px` }}>
                    <input type="checkbox" checked={form.categoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)} className="w-4 h-4 accent-primary" />
                    <span>{cat.icon} {lang === "bn" && cat.nameBn ? cat.nameBn : cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <h4 className="font-semibold text-sm text-primary mb-2">{lang === "bn" ? "বিবরণ" : "Description"}</h4>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field w-full !py-2 text-sm" rows={3} placeholder={lang === "bn" ? "বিবরণ লিখুন (ইংরেজি)" : "Description (EN)"} />
              <textarea value={form.descriptionBn} onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })} className="input-field w-full !py-2 text-sm mt-2" rows={3} placeholder={lang === "bn" ? "বিবরণ লিখুন (বাংলা)" : "Description (BN)"} />
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <h4 className="font-semibold text-sm text-primary mb-2">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</h4>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isNew === 1} onChange={(e) => setForm({ ...form, isNew: e.target.checked ? 1 : 0 })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-semibold text-green-600">
                    {lang === "bn" ? "🆕 নতুন" : "🆕 New"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isVisible === 1} onChange={(e) => setForm({ ...form, isVisible: e.target.checked ? 1 : 0 })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-text-secondary">
                    {lang === "bn" ? "👁️ দৃশ্যমান (ইউজার দেখতে পাবে)" : "👁️ Visible (Users can see)"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isPremium === 1} onChange={(e) => setForm({ ...form, isPremium: e.target.checked ? 1 : 0 })} className="w-4 h-4 accent-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">⭐ {lang === "bn" ? "প্রিমিয়াম" : "Premium"}</span>
                </label>
              </div>
            </div>

            {editingId && (
              <div className="border-t border-border pt-4 mb-4">
                <h4 className="font-semibold text-sm text-primary mb-2">{lang === "bn" ? "রিসোর্স ফাইল/লিংক" : "Resource Files/Links"}</h4>
                <div className="space-y-2 mb-3">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-sm">
                      <span className="text-xs text-gray-400 w-6">{f.sortOrder}</span>
                      <span className="flex-1 truncate">{f.label || f.url}</span>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">🔗</a>
                      <button onClick={() => deleteFile(editingId, f.id)} className="text-red-500 hover:text-red-700 text-xs">🗑️</button>
                    </div>
                  ))}
                  {files.length === 0 && <p className="text-xs text-text-secondary">{lang === "bn" ? "কোনো ফাইল যোগ করা হয়নি" : "No files added yet"}</p>}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder={lang === "bn" ? "লেবেল (যেমন: ভিডিও লিংক)" : "Label (e.g. Video Link)"} value={newFileLabel} onChange={(e) => setNewFileLabel(e.target.value)} className="input-field flex-1 !py-1.5 text-sm" />
                  <input type="text" placeholder={lang === "bn" ? "URL" : "URL"} value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)} className="input-field flex-1 !py-1.5 text-sm" />
                  <Button size="sm" onClick={() => addFile(editingId)}>{lang === "bn" ? "যোগ" : "Add"}</Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end border-t border-border pt-4">
              <Button variant="ghost" onClick={resetForm}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
              <Button onClick={handleSave} disabled={saving || !form.title}>
                {saving ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...") : (lang === "bn" ? "সেভ করুন" : "Save")}
              </Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "রিসোর্স" : "Resource"}</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "ক্যাটাগরি" : "Category"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "নতুন" : "New"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "দৃশ্যমান" : "Visible"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">⭐</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "কাজ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-medium text-primary">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.icon || "📌"}</span>
                        <div>
                          <span>{lang === "bn" && c.titleBn ? c.titleBn : c.title}</span>
                          <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            c.isPremium ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                          }`}>
                            {c.isPremium ? "Premium" : "Free"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{catNames(c)}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleField(c.id, "isNew", c.isNew ? 0 : 1)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.isNew ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {c.isNew ? "🆕" : "—"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleField(c.id, "isVisible", c.isVisible ? 0 : 1)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.isVisible ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"}`}>
                        {c.isVisible ? (lang === "bn" ? "হ্যাঁ" : "Yes") : (lang === "bn" ? "না" : "No")}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      {c.isPremium === 1 ? <span className="text-amber-500">⭐</span> : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => startEdit(c)} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded" title={lang === "bn" ? "সম্পাদনা" : "Edit"}>✏️</button>
                        <button onClick={() => handleDelete(c.id)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded" title={lang === "bn" ? "ডিলিট" : "Delete"}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-secondary text-sm">
                      <div className="mb-3 text-3xl">📭</div>
                      {lang === "bn" ? "কোনো রিসোর্স নেই। উপরে \"Import Static Data\" বাটনে ক্লিক করে ৮০০+ রিসোর্স ইম্পোর্ট করুন, অথবা ম্যানুয়ালি রিসোর্স যোগ করুন।" : "No resources. Click \"Import Static Data\" above to import 800+ resources, or add manually."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
