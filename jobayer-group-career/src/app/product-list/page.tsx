"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore, useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const sampleProducts = [
  { id: 1, name: "Starter Business Kit", nameBn: "স্টার্টার বিজনেস কিট", price: 2990, currency: "BDT", category: "business", image: "📦", commission: 10 },
  { id: 2, name: "Premium Career Package", nameBn: "প্রিমিয়াম ক্যারিয়ার প্যাকেজ", price: 9990, currency: "BDT", category: "career", image: "🎯", commission: 15 },
  { id: 3, name: "Elite Success Bundle", nameBn: "এলিট সাকসেস বান্ডেল", price: 24990, currency: "BDT", category: "elite", image: "👑", commission: 20 },
  { id: 4, name: "Digital Marketing Course", nameBn: "ডিজিটাল মার্কেটিং কোর্স", price: 1990, currency: "BDT", category: "education", image: "📚", commission: 25 },
  { id: 5, name: "Team Building Workshop", nameBn: "টিম বিল্ডিং ওয়ার্কশপ", price: 4990, currency: "BDT", category: "business", image: "🤝", commission: 12 },
  { id: 6, name: "Leadership Program", nameBn: "লিডারশিপ প্রোগ্রাম", price: 14990, currency: "BDT", category: "career", image: "⭐", commission: 18 },
  { id: 7, name: "Smart Business Pack", nameBn: "স্মার্ট বিজনেস প্যাক", price: 7990, currency: "BDT", category: "business", image: "💼", commission: 15 },
  { id: 8, name: "Annual Membership", nameBn: "বার্ষিক মেম্বারশিপ", price: 19990, currency: "BDT", category: "elite", image: "🏆", commission: 22 },
  { id: 9, name: "Communication Skills Pro", nameBn: "কমিউনিকেশন স্কিলস প্রো", price: 3990, currency: "BDT", category: "education", image: "🎤", commission: 20 },
  { id: 10, name: "Global Business Access", nameBn: "গ্লোবাল বিজনেস অ্যাক্সেস", price: 49990, currency: "BDT", category: "elite", image: "🌍", commission: 30 },
  { id: 11, name: "Facebook Ads Mastery", nameBn: "ফেসবুক এডস মাস্টারি", price: 5990, currency: "BDT", category: "education", image: "📱", commission: 20 },
  { id: 12, name: "Entrepreneur Starter", nameBn: "এন্টারপ্রেনার স্টার্টার", price: 999, currency: "BDT", category: "business", image: "🚀", commission: 10 },
];

export default function ProductsPage() {
  const { lang } = useLanguageStore();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedCat, setSelectedCat] = useState("all");
  const [addedMsg, setAddedMsg] = useState<number | null>(null);

  const categories = [
    { key: "all", en: "All Products", bn: "সব পণ্য" },
    { key: "business", en: "Business", bn: "ব্যবসা" },
    { key: "career", en: "Career", bn: "ক্যারিয়ার" },
    { key: "elite", en: "Elite", bn: "এলিট" },
    { key: "education", en: "Education", bn: "শিক্ষা" },
  ];

  const filtered = selectedCat === "all" ? sampleProducts : sampleProducts.filter((p) => p.category === selectedCat);

  const handleAddToCart = (product: typeof sampleProducts[0]) => {
    addItem({
      productId: product.id,
      name: lang === "bn" ? product.nameBn : product.name,
      price: product.price,
      currency: product.currency,
      quantity: 1,
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
            {lang === "bn" ? "পণ্য কিনুন এবং কমিশন উপার্জন করুন" : "Buy products and earn commissions"}
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
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{product.image}</div>
              <h3 className="font-bold text-primary mb-2">{lang === "bn" ? product.nameBn : product.name}</h3>
              <p className="text-2xl font-bold text-action mb-2">{formatCurrency(product.price, product.currency)}</p>
              <p className="text-xs text-text-secondary mb-4">
                {lang === "bn" ? `কমিশন: ${product.commission}%` : `Commission: ${product.commission}%`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => handleAddToCart(product)} className="btn-primary text-xs !px-4 !py-2.5 flex-1">
                  {addedMsg === product.id
                    ? (lang === "bn" ? "✓ যোগ হয়েছে" : "✓ Added")
                    : (lang === "bn" ? "কার্টে যোগ করুন" : "Add to Cart")}
                </button>
                <Link href={`/checkout?product=${product.id}`} className="btn-secondary text-xs !px-4 !py-2.5">
                  {lang === "bn" ? "কিনুন" : "Buy"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
