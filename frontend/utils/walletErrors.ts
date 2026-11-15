export type WalletErrorCode =
  | "WALLET_NOT_INSTALLED"
  | "USER_REJECTED"
  | "ADDRESS_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "UNEXPECTED_RESPONSE"
  | "UNKNOWN_ERROR";

export interface WalletErrorDetails {
  code: WalletErrorCode;
  userMessage: string;
  technicalMessage: string;
  recoverable: boolean;
  timestamp: number;
}

const MISSING_EXTENSION_PATTERNS = [
  /not installed/i,
  /extension.*missing/i,
  /freighter.*not.*found/i,
  /install.*freighter/i,
];

const USER_REJECTION_PATTERNS = [
  /user declined/i,
  /user rejected/i,
  /access denied/i,
  /rejected by user/i,
  /declined access/i,
  /cancelled/i,
  /canceled/i,
];

const ADDRESS_PATTERNS = [
  /retrieve wallet address/i,
  /empty address/i,
  /no public key/i,
  /not unlocked/i,
];

const NETWORK_PATTERNS = [
  /network/i,
  /timeout/i,
  /failed to fetch/i,
  /rpc/i,
];

export function extractRawErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const maybeErr = error as { message?: unknown; error?: { message?: unknown } | string };
    if (typeof maybeErr.message === "string") {
      return maybeErr.message;
    }
    if (typeof maybeErr.error === "string") {
      return maybeErr.error;
    }
    if (maybeErr.error && typeof maybeErr.error === "object" && typeof maybeErr.error.message === "string") {
      return maybeErr.error.message;
    }
  }
  return "Unknown wallet error occurred";
}

/**
 * Classifies any thrown wallet error or unexpected response into a structured
 * WalletErrorDetails object with a safe, user-friendly message.
 */
export function classifyWalletError(error: unknown, now: number = Date.now()): WalletErrorDetails {
  const technicalMessage = extractRawErrorMessage(error);

  if (MISSING_EXTENSION_PATTERNS.some((pattern) => pattern.test(technicalMessage))) {
    return {
      code: "WALLET_NOT_INSTALLED",
      userMessage:
        "Freighter wallet extension was not detected. Please install or enable Freighter in your browser and try again.",
      technicalMessage,
      recoverable: true,
      timestamp: now,
    };
  }

  if (USER_REJECTION_PATTERNS.some((pattern) => pattern.test(technicalMessage))) {
    return {
      code: "USER_REJECTED",
      userMessage:
        "Wallet connection request was declined. Click 'Connect Wallet' whenever you are ready to approve access.",
      technicalMessage,
      recoverable: true,
      timestamp: now,
    };
  }

  if (ADDRESS_PATTERNS.some((pattern) => pattern.test(technicalMessage))) {
    return {
      code: "ADDRESS_UNAVAILABLE",
      userMessage:
        "Unable to read your Stellar address. Please unlock your Freighter wallet and ensure an account is selected.",
      technicalMessage,
      recoverable: true,
      timestamp: now,
    };
  }

  if (NETWORK_PATTERNS.some((pattern) => pattern.test(technicalMessage))) {
    return {
      code: "NETWORK_ERROR",
      userMessage:
        "Could not verify the Stellar network from your wallet. Please check your wallet network settings and try again.",
      technicalMessage,
      recoverable: true,
      timestamp: now,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    userMessage:
      "Something went wrong while connecting to your wallet. Please refresh or check the Freighter extension and try again.",
    technicalMessage,
    recoverable: true,
    timestamp: now,
  };
}

/**
 * Logs technical wallet errors in a structured format for debugging without crashing the app.
 */
export function handleAndLogWalletError(
  error: unknown,
  context: string = "wallet",
): WalletErrorDetails {
  const details = classifyWalletError(error);
  console.error(`[WalletError:${context}] [${details.code}] ${details.technicalMessage}`, {
    code: details.code,
    context,
    timestamp: new Date(details.timestamp).toISOString(),
  });
  return details;
}
