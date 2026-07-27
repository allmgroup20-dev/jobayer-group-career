"use client";
import { create } from "zustand";

interface ChatStore {
  unreadCount: number;
  incrementUnread: () => void;
  resetUnread: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  unreadCount: 0,
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
  open: false,
  setOpen: (o) => set({ open: o }),
}));
