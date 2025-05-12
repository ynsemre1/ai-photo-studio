const isDebug = __DEV__;

export const Logger = {
  log: (...args: any[]) => {
    if (isDebug) console.log("[LOG]:", ...args);
  },
  warn: (...args: any[]) => {
    if (isDebug) console.warn("[WARN]:", ...args);
  },
  error: (...args: any[]) => {
    if (isDebug) console.error("[ERROR]:", ...args);
  },
};