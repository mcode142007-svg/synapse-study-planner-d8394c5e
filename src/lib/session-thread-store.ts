import { create } from "zustand";

export type SessionThreadMessage = {
  role: "user" | "model";
  content: string;
};

type SessionThreadState = {
  threads: Record<string, SessionThreadMessage[]>;
  appendMessage: (sessionId: string, message: SessionThreadMessage) => void;
  clearThread: (sessionId: string) => void;
};

export const useSessionThreadStore = create<SessionThreadState>((set) => ({
  threads: {},
  appendMessage: (sessionId, message) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [sessionId]: [...(state.threads[sessionId] ?? []), message],
      },
    })),
  clearThread: (sessionId) =>
    set((state) => {
      const next = { ...state.threads };
      delete next[sessionId];
      return { threads: next };
    }),
}));
