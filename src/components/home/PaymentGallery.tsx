"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useLanguageStore } from "@/lib/store";
import { useSiteContent } from "@/lib/use-site-content";
import { galleryImages, paymentGalleryText } from "@/data/home/gallery";

const galleryDefaults = { titleBn: paymentGalleryText.titleBn, titleEn: paymentGalleryText.titleEn, images: galleryImages };
type GalleryContent = typeof galleryDefaults;

export default function PaymentGallery() {
  const { lang } = useLanguageStore();
  const { content, enabled } = useSiteContent<GalleryContent>("gallery", galleryDefaults, { enabledByDefault: false });
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!enabled) return null;
  const images = content.images;
  const t = content;

  const go = useCallback((dir: 1 | -1) => {
    setLightbox(prev => (prev === null ? prev : (prev + dir + images.length) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
      <div className="section-header">
        <h3 className="text-base md:text-lg font-black text-text">💰 {lang === "bn" ? t.titleBn : t.titleEn}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            aria-label={img.alt}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-bg border border-border cursor-pointer p-0 hover:shadow-lg transition-all"
          >
            <Image src={img.src} alt={img.alt} fill loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white text-2xl border-none bg-transparent cursor-pointer z-10 w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full">✕</button>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white text-3xl border-none bg-transparent cursor-pointer w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white/10 rounded-full">←</button>
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image src={images[lightbox].src} alt={images[lightbox].alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 800px" />
          </div>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white text-3xl border-none bg-transparent cursor-pointer w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white/10 rounded-full">→</button>
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all ${i === lightbox ? "bg-white scale-125" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
