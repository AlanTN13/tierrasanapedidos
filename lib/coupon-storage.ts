const KEY = "tierra-sana-coupon-v1";
const EVENT = "tierra-sana-coupon-updated";
const memory = new Map<string, string>();

export function readCoupon(scope = "public") {
  if (typeof window === "undefined") return "";
  try { return window.localStorage.getItem(`${KEY}-${scope}`) ?? ""; } catch { return memory.get(scope) ?? ""; }
}

export function writeCoupon(code: string, scope = "public") {
  memory.set(scope, code);
  try {
    if (code) window.localStorage.setItem(`${KEY}-${scope}`, code);
    else window.localStorage.removeItem(`${KEY}-${scope}`);
  } catch { /* Session memory still works if storage is unavailable. */ }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCoupon(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}
