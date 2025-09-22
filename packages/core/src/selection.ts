import { create } from "zustand";

export type Id = string;
export interface SelectionState {
  selected: Set<Id>;
  set(ids: Id[] | Set<Id>): void;
  toggle(id: Id): void;
  clear(): void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selected: new Set<Id>(),
  set: (ids) => set({ selected: new Set(Array.isArray(ids) ? ids : [...ids]) }),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selected);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selected: next };
    }),
  clear: () => set({ selected: new Set() }),
}));
