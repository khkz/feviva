import type { EngineEvent, EngineListener } from "./types";

/** Minimal listener set shared by the engines. */
export class EngineEmitter {
  private listeners = new Set<EngineListener>();

  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: EngineEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("[audio] listener failed", error);
      }
    });
  }
}
