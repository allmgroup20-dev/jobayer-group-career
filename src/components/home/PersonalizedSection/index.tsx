"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";

interface Banner {
  en: string; bn: string; icon: string; cta: string; ctaBn: string; link: string;
}

interface Course {
  id: number; name: string; name_bn: string | null; price: number; image_url: string | null;
}

interface Product {
  id: number; name: string; name_bn: string | null; price: number; image_url: string | null;
}

interface PersonalizeData {
  isPersonalized: boolean;
  segment?: string;
  topInterests?: string[];
  suggestedCategories?: string[];
  banners: Banner[];
  courses: Course[];
  products: Product[];
}

export function PersonalizedSection() {
  const { lang } = useLanguageStore();
  const [data, setData] = useState<PersonalizeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workerId = localStorage.getItem("worker_id");
    if (!workerId) { setLoading(false); return; }

    fetch(`/api/ai/personalize?workerId=${workerId}`)
      .then(r => r.json())
      .then((d: any) => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  return (
    <section className="space-y-6">
      {/* Personalized Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.banners.map((b, i) => (
          <Link key={i} href={b.link} className="block p-6 rounded-2xl bg-gradient-to-br from-action/10 to-secondary/20 border border-action/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <span className="text-4xl">{b.icon}</span>
            <h3 className="text-lg font-bold text-primary mt-2">{lang === "bn" ? b.bn : b.en}</h3>
            <span className="inline-block mt-3 text-sm font-semibold text-action">{lang === "bn" ? b.ctaBn : b.cta} →</span>
          </Link>
        ))}
      </div>

      {/* Interest-based Suggestions */}
      {data.isPersonalized && data.suggestedCategories && data.suggestedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider self-center">{lang === "bn" ? "আপনার আগ্রহ:" : "Your Interests:"}</span>
          {data.suggestedCategories.map((cat, i) => (
            <Link key={i} href={`/courses?category=${cat}`} className="px-3 py-1.5 text-xs font-medium rounded-full bg-bg-card border border-border text-text-secondary hover:bg-action hover:text-white hover:border-action transition-all duration-200">
              {cat.replace(/_/g, " ")}
            </Link>
          ))}
        </div>
      )}

      {/* Recommended Courses */}
      {data.courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{lang === "bn" ? "প্রস্তাবিত রিসোর্স" : "Recommended Resources"}</h3>
            <Link href="/courses" className="text-xs font-semibold text-action hover:underline">{lang === "bn" ? "সব দেখুন" : "See All"} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.courses.map((c) => (
              <Link key={c.id} href={`/checkout?productId=${c.id}`} className="group p-4 rounded-xl bg-bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-full h-20 rounded-lg bg-gradient-to-br from-action/20 to-secondary/20 mb-2 flex items-center justify-center text-2xl">📚</div>
                <h4 className="text-sm font-semibold text-primary group-hover:text-action transition-colors line-clamp-2">{lang === "bn" && c.name_bn ? c.name_bn : c.name}</h4>
                <p className="text-xs font-bold text-action mt-1">{c.price} TK</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products */}
      {data.products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{lang === "bn" ? "প্রস্তাবিত প্রোডাক্ট" : "Recommended Products"}</h3>
            <Link href="/product-list" className="text-xs font-semibold text-action hover:underline">{lang === "bn" ? "সব দেখুন" : "See All"} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.products.map((p) => (
              <Link key={p.id} href={`/checkout?productId=${p.id}`} className="group p-4 rounded-xl bg-bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-full h-20 rounded-lg bg-gradient-to-br from-primary/10 to-action/10 mb-2 flex items-center justify-center text-2xl">🛒</div>
                <h4 className="text-sm font-semibold text-primary group-hover:text-action transition-colors line-clamp-2">{lang === "bn" && p.name_bn ? p.name_bn : p.name}</h4>
                <p className="text-xs font-bold text-action mt-1">{p.price} TK</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
