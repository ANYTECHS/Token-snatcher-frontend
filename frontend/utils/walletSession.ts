export const WALLET_SESSION_STORAGE_KEY = "freighter_wallet_session_v1";
export const LEGACY_ADDRESS_STORAGE_KEY = "freighter_connected_address";
export const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface PersistedWalletSession {
  address: string;
  network: string | null;
  connectedAt: number;
  expiresAt: number;
  version: 1;
}

const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

export function isValidStellarAddress(address: unknown): address is string {
  return typeof address === "string" && STELLAR_PUBLIC_KEY_REGEX.test(address.trim());
}

export function isSessionExpired(
  session: Pick<PersistedWalletSession, "expiresAt">,
  now: number = Date.now(),
): boolean {
  return !Number.isFinite(session.expiresAt) || now >= session.expiresAt;
}

export function saveWalletSession(
  address: string,
  network: string | null = null,
  ttlMs: number = DEFAULT_SESSION_TTL_MS,
  now: number = Date.now(),
): PersistedWalletSession | null {
  if (typeof window === "undefined") return null;
  const trimmed = address.trim();
  if (!isValidStellarAddress(trimmed)) return null;

  const safeTtl = Math.max(60_000, ttlMs);
  const session: PersistedWalletSession = {
    address: trimmed,
    network,
    connectedAt: now,
    expiresAt: now + safeTtl,
    version: 1,
  };

  try {
    localStorage.setItem(WALLET_SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(LEGACY_ADDRESS_STORAGE_KEY, trimmed);
    return session;
  } catch {
    return null;
  }
}

export function clearWalletSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WALLET_SESSION_STORAGE_KEY);
    localStorage.removeItem(LEGACY_ADDRESS_STORAGE_KEY);
  } catch {
    // Ignore storage quota / security errors
  }
}

export function loadWalletSession(now: number = Date.now()): PersistedWalletSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(WALLET_SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedWalletSession>;
      if (
        parsed &&
        parsed.version === 1 &&
        isValidStellarAddress(parsed.address) &&
        typeof parsed.connectedAt === "number" &&
        typeof parsed.expiresAt === "number"
      ) {
        if (isSessionExpired({ expiresAt: parsed.expiresAt }, now)) {
          clearWalletSession();
          return null;
        }
        return {
          address: parsed.address,
          network: typeof parsed.network === "string" ? parsed.network : null,
          connectedAt: parsed.connectedAt,
          expiresAt: parsed.expiresAt,
          version: 1,
        };
      }
      clearWalletSession();
      return null;
    }

    // Fallback migration for legacy address-only storage key
    const legacyAddress = localStorage.getItem(LEGACY_ADDRESS_STORAGE_KEY);
    if (legacyAddress && isValidStellarAddress(legacyAddress)) {
      return saveWalletSession(legacyAddress, null, DEFAULT_SESSION_TTL_MS, now);
    }
    if (legacyAddress) {
      clearWalletSession();
    }
  } catch {
    clearWalletSession();
  }

  return null;
}
