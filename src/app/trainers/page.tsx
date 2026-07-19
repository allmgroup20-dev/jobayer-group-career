"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLanguageStore } from "@/lib/store";

export default function TrainersPage() {
  const { lang } = useLanguageStore();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroredTrainers, setErroredTrainers] = useState<Set<number>>(new Set());
  const [erroredInsts, setErroredInsts] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/trainers").then(r => r.json() as Promise<{ trainers: any[] }>),
      fetch("/api/institutions").then(r => r.json() as Promise<{ institutions: any[] }>),
    ]).then(([tData, iData]) => {
      setTrainers(tData.trainers || []);
      setInstitutions(iData.institutions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="badge mx-auto mb-3">👨‍🏫 {lang === "bn" ? "আমাদের প্রশিক্ষক" : "Our Trainers"}</div>
          <h1 className="text-2xl md:text-3xl font-black text-text">
            {lang === "bn"
              ? `দেশের সেরা ${trainers.length} জন বিশেষজ্ঞ প্রশিক্ষক`
              : `Bangladesh's Top ${trainers.length} Expert Trainers`}
          </h1>
          <p className="text-text-secondary font-semibold mt-2 max-w-2xl mx-auto">
            {lang === "bn"
              ? `প্রতিটি প্রশিক্ষকই নিজ নিজ ক্ষেত্রে ৫+ বছরের অভিজ্ঞ। রিয়েল মার্কেট প্রজেক্ট ও হাতে-কলমে শেখান।`
              : "Each trainer has 5+ years of experience. They teach real market projects hands-on."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((trainer) => {
            const courses = lang === "bn"
              ? (trainer.coursesBn?.length ? trainer.coursesBn : trainer.coursesEn || [])
              : (trainer.coursesEn?.length ? trainer.coursesEn : trainer.coursesBn || []);
            return (
              <div key={trainer.id} className="rounded-2xl p-5 bg-white border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-info to-orange flex-shrink-0">
                    {trainer.image_url && !erroredTrainers.has(trainer.id) ? (
                      <img src={trainer.image_url} alt={trainer.name_bn || trainer.name} className="w-full h-full object-cover" onError={() => setErroredTrainers(p => new Set(p).add(trainer.id))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {(trainer.name_bn || trainer.name).charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-text">{lang === "bn" && trainer.name_bn ? trainer.name_bn : trainer.name}</h3>
                    <p className="text-info text-sm font-bold">{lang === "bn" ? trainer.specialty_bn : trainer.specialty_en}</p>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">{lang === "bn" ? trainer.credential_bn : trainer.credential_en}</p>
                    {trainer.institution_name && (
                      <p className="text-xs text-action font-semibold mt-0.5">
                        {trainer.institution_logo && `${trainer.institution_name}`}
                        {!trainer.institution_logo && trainer.institution_name}
                      </p>
                    )}
                  </div>
                </div>
                {courses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-bold text-text-secondary mb-2">📚 {courses.length}টি {lang === "bn" ? "কোর্স:" : "courses:"}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {courses.slice(0, 3).map((c: string, ci: number) => (
                        <span key={ci} className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold">{c}</span>
                      ))}
                      {courses.length > 3 && (
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">+{courses.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {institutions.length > 0 && (
          <div className="rounded-2xl p-5 bg-white border border-border mt-6">
            <div className="badge mx-auto mb-3">🏛️ {lang === "bn" ? "আমাদের প্রতিষ্ঠানসমূহ" : "Our Institutions"}</div>
            <p className="text-sm font-bold text-text-secondary text-center -mt-2 mb-4">
              {lang === "bn"
                ? "যেসব প্ল্যাটফর্ম ও প্রতিষ্ঠানের কোর্স আপনি ফ্রিতে পাচ্ছেন"
                : "Courses you get for free from these platforms & institutions"}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {institutions.map((inst) => (
                <div key={inst.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg border border-border min-w-[80px]">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                    {inst.logo_url && !erroredInsts.has(inst.id) ? (
                      <img src={inst.logo_url} alt={inst.name_bn || inst.name} className="w-full h-full object-contain" onError={() => setErroredInsts(p => new Set(p).add(inst.id))} />
                    ) : (
                      <span className="text-lg font-bold text-primary">{(inst.name_bn || inst.name).charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text text-center leading-tight">{lang === "bn" ? inst.name_bn || inst.name : inst.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-info/5 border border-primary/20">
          <h2 className="text-lg font-black text-text mb-2">{lang === "bn" ? "আপনার প্রশিক্ষক কে?" : "Who is Your Trainer?"}</h2>
          <p className="text-text-secondary font-semibold max-w-xl mx-auto">
            {lang === "bn"
              ? "রেজিস্টার করার পর আপনি আপনার পছন্দের প্রশিক্ষকের কোর্স বেছে নিতে পারবেন। সব কোর্সই আপনার জন্য উন্মুক্ত!"
              : "After registration, you can choose courses from your preferred trainer. All courses are open to you!"}
          </p>
        </div>
      </div>
    </div>
  );
}
