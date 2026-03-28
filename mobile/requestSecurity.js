import * as Crypto from "expo-crypto";

export async function buildReplayHeaders() {
  const timestamp = Date.now().toString();
  const nonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${timestamp}-${Math.random().toString(36).slice(2)}`
  );

  return {
    "x-request-nonce": nonce,
    "x-request-timestamp": timestamp,
  };
}
