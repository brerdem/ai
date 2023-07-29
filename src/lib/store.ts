import { create } from "zustand";

interface TextState {
  text: string;
  title: string;
  addText: (text: string) => void;
  addTitle: (title: string) => void;
  clearText: () => void;
}

export const useTextStore = create<TextState>((set) => ({
  text: "",
  title: "",
  addText: (text: string) => set(() => ({ text })),
  addTitle: (title: string) => set(() => ({ title })),
  clearText: () => set({ text: "" }),
}));
