/*
THIS IS A SAMPLE STORE. REPLACE WITH YOUR OWN STORE.
*/
import { create } from "zustand";

export const useTemplateStore = create((set) => ({
  // Initial state
  value: "",
  count: 0,

  // Actions
  setValue: (value) => set({ value }),
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
