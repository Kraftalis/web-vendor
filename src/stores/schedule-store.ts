import { create } from "zustand";
import { Views, type View } from "react-big-calendar";

/**
 * Schedule store — manages the shared state between Mini Calendar and Main Calendar.
 */

interface ScheduleState {
  currentDate: Date;
  currentView: View;
  viewMode: "calendar" | "agenda";

  // Actions
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: View) => void;
  setViewMode: (mode: "calendar" | "agenda") => void;
  navigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  currentDate: new Date(),
  currentView: Views.MONTH,
  viewMode: "calendar",

  setCurrentDate: (date) => set({ currentDate: date }),
  setCurrentView: (view) => set({ currentView: view }),
  setViewMode: (mode) => set({ viewMode: mode }),

  navigate: (action) =>
    set((state) => {
      let newDate = new Date(state.currentDate);
      const view = state.currentView;

      if (action === "TODAY") {
        newDate = new Date();
      } else if (action === "PREV") {
        if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() - 1);
        else if (view === Views.WEEK) newDate.setDate(newDate.getDate() - 7);
        else if (view === Views.DAY) newDate.setDate(newDate.getDate() - 1);
      } else if (action === "NEXT") {
        if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() + 1);
        else if (view === Views.WEEK) newDate.setDate(newDate.getDate() + 7);
        else if (view === Views.DAY) newDate.setDate(newDate.getDate() + 1);
      }

      return { currentDate: newDate };
    }),
}));
