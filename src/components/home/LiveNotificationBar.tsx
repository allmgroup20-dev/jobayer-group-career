"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { liveNotifText } from "@/data/home/salary";

const bdDistricts = [
  "\u09A2\u09BE\u0995\u09BE", "\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE", "\u09B0\u09BE\u099C\u09B6\u09BE\u09B9\u09C0", "\u0996\u09C1\u09B2\u09A8\u09BE", "\u09B8\u09BF\u09B2\u09C7\u099F", "\u09AC\u09B0\u09BF\u09B6\u09BE\u09B2", "\u09B0\u0982\u09AA\u09C1\u09B0",
  "\u09AE\u09DF\u09AE\u09A8\u09B8\u09BF\u0982\u09B9", "\u0995\u09C1\u09AE\u09BF\u09B2\u09CD\u09B2\u09BE", "\u09A8\u09B0\u09B8\u09BF\u0982\u09A6\u09C0", "\u0997\u09BE\u099C\u09C0\u09AA\u09C1\u09B0", "\u09A8\u09BE\u09B0\u09BE\u09DF\u09A3\u0997\u099E\u09CD\u099C", "\u099F\u09BE\u0999\u09CD\u0997\u09BE\u0987\u09B2",
  "\u09AB\u09B0\u09BF\u09A6\u09AA\u09C1\u09B0", "\u09AC\u0997\u09C1\u09A1\u09BC\u09BE", "\u09A6\u09BF\u09A8\u09BE\u099C\u09AA\u09C1\u09B0", "\u09AA\u09BE\u09AC\u09A8\u09BE", "\u0995\u09C1\u09B7\u09CD\u099F\u09BF\u09AF\u09BC\u09BE", "\u09AF\u09B6\u09CB\u09B0", "\u0995\u0995\u09CD\u09B8\u09AC\u09BE\u099C\u09BE\u09B0",
];

const names = [
  "\u09B8\u09BE\u0995\u09BF\u09AC \u0986\u09B9\u09AE\u09C7\u09A6", "\u09A8\u09BE\u099C\u09A8\u09C0\u09A8 \u0986\u0995\u09CD\u09A4\u09BE\u09B0", "\u0995\u09B0\u09BF\u09AE \u09AE\u09BF\u09AF\u09BC\u09BE", "\u09B8\u09BE\u09A6\u09BF\u09AF\u09BC\u09BE \u0987\u09B8\u09B2\u09BE\u09AE",
  "\u09B0\u09BE\u099C\u09BF\u09AC \u09B9\u09BE\u09B8\u09BE\u09A8", "\u09AB\u09BE\u09B0\u09B9\u09BE\u09A8\u09BE \u0987\u09AF\u09BC\u09BE\u09B8\u09AE\u09BF\u09A8", "\u09AE\u09CB. \u09B8\u09BE\u099C\u09BF\u09A6 \u09B9\u09CB\u09B8\u09C7\u09A8", "\u09A4\u09BE\u09A8\u09BF\u09AF\u09BC\u09BE \u09AC\u09C7\u0997\u09AE",
  "\u09B0\u09AC\u09BF\u0989\u09B2 \u0986\u09B2\u09AE", "\u09A8\u09C1\u09B8\u09B0\u09BE\u09A4 \u099C\u09BE\u09B9\u09BE\u09A8", "\u0986\u09B0\u09BF\u09AB\u09C1\u09B2 \u0987\u09B8\u09B2\u09BE\u09AE", "\u09A4\u09BE\u09AE\u09BE\u09A8\u09CD\u09A8\u09BE \u09B9\u09BE\u09B8\u09BE\u09A8",
  "\u09AE\u09B0\u09CD\u099C\u09BF\u09A8\u09BE \u0996\u09BE\u09A4\u09C1\u09A8", "\u09B6\u09BE\u09AE\u09BF\u09AE\u09BE \u0986\u0995\u09CD\u09A4\u09BE\u09B0", "\u09AB\u09BE\u09B0\u09BF\u09AF\u09BC\u09BE \u0987\u09B8\u09B2\u09BE\u09AE",
];

interface Props {
  message?: string | null;
}

export default function LiveNotificationBar({ message }: Props) {
  const { lang } = useLanguageStore();
  const [notification, setNotification] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const queueRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMsgRef = useRef<string | null>(null);

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
    if (!message || message === lastMsgRef.current) return;
    lastMsgRef.current = message;
    queueRef.current.push(message);
    if (!timerRef.current) showNext();
  }, [message]);

  useEffect(() => {
    if (message !== undefined) return;
    const addNotif = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const district = bdDistricts[Math.floor(Math.random() * bdDistricts.length)];
      const msg = name + ", " + district + " " + (lang === "bn" ? liveNotifText.joinedRecent : liveNotifText.joinedRecentEn);
      queueRef.current.push(msg);
      if (!timerRef.current) showNext();
    };
    addNotif();
    const interval = setInterval(addNotif, 8000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lang, message]);

  if (!visible || !notification) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[9999] max-w-[94vw] md:max-w-[560px] px-4 py-3 rounded-xl bg-white border border-border shadow-xl flex items-center gap-2.5 animate-fade-up transition-all duration-[400ms] float-slot-toast">
      <span className="flex-shrink-0 text-base">{String.fromCodePoint(0x1F389)}</span>
      <span className="font-bold text-sm leading-relaxed text-text">{notification}</span>
    </div>
  );
}
