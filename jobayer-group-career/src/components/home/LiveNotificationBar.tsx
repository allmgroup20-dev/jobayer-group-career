"use client";

import { useEffect, useRef, useState } from "react";

const bdDistricts = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর",
  "ময়মনসিংহ", "কুমিল্লা", "নরসিংদী", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল",
  "ফরিদপুর", "বগুড়া", "দিনাজপুর", "পাবনা", "কুষ্টিয়া", "যশোর", "কক্সবাজার",
];

const names = [
  "সাকিব আহমেদ", "নাজনীন আক্তার", "করিম মিয়া", "সাদিয়া ইসলাম",
  "রাজিব হাসান", "ফারহানা ইয়াসমিন", "মো. সাজিদ হোসেন", "তানিয়া বেগম",
  "রবিউল আলম", "নুসরাত জাহান", "আরিফুল ইসলাম", "তামান্না হাসান",
  "মর্জিনা খাতুন", "শামীমা আক্তার", "ফারিয়া ইসলাম",
];

export default function LiveNotificationBar() {
  const [notification, setNotification] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const queueRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNext = () => {
    if (queueRef.current.length === 0) {
      setVisible(false);
      timerRef.current = null;
      return;
    }
    const msg = queueRef.current.shift()!;
    setNotification(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(showNext, 800);
    }, 4000);
  };

  useEffect(() => {
    const addNotif = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const district = bdDistricts[Math.floor(Math.random() * bdDistricts.length)];
      queueRef.current.push(`${name}, ${district} থেকে সদ্য যুক্ত হলেন!`);
      if (!timerRef.current) showNext();
    };
    addNotif();
    const interval = setInterval(addNotif, 8000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !notification) return null;

  return (
    <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-[9999] max-w-[94vw] md:max-w-[560px] px-4 py-3 rounded-xl bg-white border border-border shadow-xl flex items-center gap-2.5 animate-fade-up transition-all duration-[400ms]">
      <span className="flex-shrink-0 text-base">🎉</span>
      <span className="font-bold text-sm leading-relaxed text-text">{notification}</span>
    </div>
  );
}
