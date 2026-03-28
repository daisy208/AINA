import * as Crypto from "expo-crypto";
import CryptoJS from "crypto-js";

function deriveKey(passphrase, saltHex) {
  return CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse(saltHex), {
    keySize: 256 / 32,
    iterations: 120000,
    hasher: CryptoJS.algo.SHA256,
  });
}

function randomHex(bytes = 16) {
  return CryptoJS.lib.WordArray.random(bytes).toString(CryptoJS.enc.Hex);
}

export async function encryptEvidence(plainText, passphrase) {
  const salt = randomHex(16);
  const iv = randomHex(16);
  const key = deriveKey(passphrase, salt);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, encrypted);

  return {
    encrypted,
    hash,
    meta: { salt, iv, algorithm: "AES-256-CBC", kdf: "PBKDF2-SHA256" },
  };
}

export function decryptEvidence(encrypted, passphrase, meta) {
  const key = deriveKey(passphrase, meta.salt);
  const bytes = CryptoJS.AES.decrypt(encrypted, key, {
    iv: CryptoJS.enc.Hex.parse(meta.iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return bytes.toString(CryptoJS.enc.Utf8);
}
