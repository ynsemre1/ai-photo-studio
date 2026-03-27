type SessionEventListener = () => void;

const listeners: Set<SessionEventListener> = new Set();

export function onSessionExpired(listener: SessionEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionExpired(): void {
  listeners.forEach((fn) => fn());
}
