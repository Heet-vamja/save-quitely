/**
 * In-memory mock OTP store (replace with Redis in production).
 * Key: phone, Value: { otp, name, expiresAt }
 */
const store = new Map<
  string,
  { otp: string; name: string; expiresAt: number }
>();

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export const otpStore = {
  set(phone: string, otp: string, name: string): void {
    store.set(phone, {
      otp,
      name,
      expiresAt: Date.now() + TTL_MS,
    });
  },

  get(phone: string): { otp: string; name: string } | null {
    const entry = store.get(phone);
    if (!entry || Date.now() > entry.expiresAt) {
      store.delete(phone);
      return null;
    }
    return { otp: entry.otp, name: entry.name };
  },

  delete(phone: string): void {
    store.delete(phone);
  },
};
