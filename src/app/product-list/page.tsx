"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguageStore, useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

interface Product {
  id: number; name: string; nameBn: string | null; price: number;
  currency: string; commissionPercentage: number; imageUrl: string | null;
  category: string | null; stock: number; premiumMembership: number;
  productType: string; directBuy: number;
  minPrice?: number; maxPrice?: number; aiPriceEnabled?: number;
}

const categoryKeys = ["business", "career", "elite", "education"];
const categoryLabels: Record<string, { en: string; bn: string }> = {
  all: { en: "All Products", bn: "সব পণ্য" },
  business: { en: "Business", bn: "ব্যবসা" },
  career: { en: "Career", bn: "ক্যারিয়ার" },
  elite: { en: "Elite", bn: "এলিট" },
  education: { en: "Education", bn: "শিক্ষা" },
};

const emojiFallback: Record<string, string> = {
  business: "📦", career: "🎯", elite: "👑", education: "📚",
};

export default function ProductsPage() {
  const { lang } = useLanguageStore();
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [addedMsg, setAddedMsg] = useState<number | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [aiPrices, setAiPrices] = useState<Record<number, { aiPrice: number; basePrice: number; message: string }>>({});
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json() as Promise<{ products?: Product[] }>)
      .then(data => {
        if (data.products) {
          setProducts(data.products);
          const wid = localStorage.getItem("worker_id");
          if (wid) {
            const ids = data.products.map((p: Product) => p.id);
            fetch("/api/ai-price", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ workerId: wid, productIds: ids }),
            })
              .then(r => r.json() as Promise<{ prices?: Record<number, { aiPrice: number; basePrice: number; message: string }> }>)
              .then(d => { if (d.prices) setAiPrices(d.prices); })
              .catch(() => {})
              .finally(() => setPriceLoading(false));
          } else {
            setPriceLoading(false);
          }
        }
      })
      .catch(() => { setPriceLoading(false); });
  }, []);

  const getWorkerId = () => { try { return localStorage.getItem("worker_id") || ""; } catch { return ""; } };

  const categories = [
    { key: "all", ...categoryLabels.all },
    ...categoryKeys.map(k => ({ key: k, ...categoryLabels[k] })),
  ];

  const filtered = selectedCat === "all" ? products : products.filter(p => p.category === selectedCat);

  const getPrice = (product: Product) => {
    if (aiPrices[product.id]) return aiPrices[product.id].aiPrice;
    return product.price;
  };

  const handleAddToCart = (product: Product) => {
    const price = getPrice(product);
    addItem({
      productId: product.id,
      name: lang === "bn" && product.nameBn ? product.nameBn : product.name,
      price,
      currency: product.currency || "BDT",
      quantity: 1,
      productType: product.productType,
    });
    setAddedMsg(product.id);
    setTimeout(() => setAddedMsg(null), 2000);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {lang === "bn" ? "আমাদের পণ্য" : "Our Products"}
          </h1>
          <p className="text-text-secondary">
            {lang === "bn" ? "পণ্য কিনুন" : "Buy products"}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCat(cat.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCat === cat.key
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white border border-border text-text-secondary hover:border-primary/30"
              }`}
            >
              {lang === "bn" ? cat.bn : cat.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <div key={product.id} className="card hover:shadow-xl hover:-translate-y-1 group animate-fade-up">
              <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300 relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{emojiFallback[product.category || ""] || "📦"}</span>
                )}
                {product.premiumMembership === 1 && (
                  <span className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    ⭐ PREMIUM
                  </span>
                )}
                {product.productType === "virtual" && (
                  <span className="absolute bottom-2 left-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {lang === "bn" ? "ডিজিটাল" : "DIGITAL"}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-primary mb-2">
                {lang === "bn" && product.nameBn ? product.nameBn : product.name}
              </h3>
              {product.aiPriceEnabled === 1 && aiPrices[product.id] ? (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-action">{formatCurrency(aiPrices[product.id].aiPrice, product.currency || "BDT")}</p>
                  {aiPrices[product.id].aiPrice < product.price && (
                    <p className="text-xs text-text-secondary line-through">{formatCurrency(product.price, product.currency || "BDT")}</p>
                  )}
                  {aiPrices[product.id].message && (
                    <p className="text-xs text-green-600 font-medium mt-0.5">{aiPrices[product.id].message}</p>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-bold text-action mb-4">{formatCurrency(product.price, product.currency || "BDT")}</p>
              )}
              {priceLoading && product.aiPriceEnabled === 1 && (
                <div className="mb-4">
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
              )}
              <div className="flex gap-2">
                {product.directBuy === 1 ? (
                  <button onClick={() => { window.location.href = `/checkout?product=${product.id}&aiPrice=${getPrice(product)}`; }} className="btn-primary text-xs !px-4 !py-2.5 w-full">
                    {lang === "bn" ? "কিনুন" : "Buy"}
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleAddToCart(product)} className="btn-primary text-xs !px-3 !py-2 shrink-0">
                      {addedMsg === product.id
                        ? (lang === "bn" ? "✓ যোগ হয়েছে" : "✓ Added")
                        : (lang === "bn" ? "কার্টে যোগ করুন" : "Add to Cart")}
                    </button>
                    <button onClick={() => { handleAddToCart(product); window.location.href = `/checkout?product=${product.id}&aiPrice=${getPrice(product)}`; }} className="btn-secondary text-sm !px-6 !py-2.5 flex-1 font-semibold">
                      {lang === "bn" ? "কিনুন" : "Buy"}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setReviewProduct(product)}
                className="mt-3 w-full text-xs text-text-secondary hover:text-primary transition-colors border border-border rounded-lg py-2"
              >
                ⭐ {lang === "bn" ? "রিভিউ দেখুন" : "View Reviews"}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-secondary">
              {lang === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}
            </div>
          )}
        </div>
      </div>

      {reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setReviewProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">
                ⭐ {lang === "bn" && reviewProduct.nameBn ? reviewProduct.nameBn : reviewProduct.name}
              </h3>
              <button onClick={() => setReviewProduct(null)} className="text-text-secondary hover:text-primary text-xl">✕</button>
            </div>
            <ReviewList productId={String(reviewProduct.id)} productType="product" />
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold text-sm text-primary mb-3">
                {lang === "bn" ? "আপনার রিভিউ দিন" : "Write a Review"}
              </h4>
              <ReviewForm productId={String(reviewProduct.id)} productType="product" workerId={getWorkerId()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
