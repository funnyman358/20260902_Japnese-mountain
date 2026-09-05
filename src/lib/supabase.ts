"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** 環境変数が設定されていれば端末間同期が使える */
export const syncAvailable = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!syncAvailable) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // 紛らわしい文字(i,l,o,0,1)を除外

/** 推測されない同期キーを作る（20文字 ≒ 約99ビット） */
export function generateSyncKey(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return [chars.slice(0, 5), chars.slice(5, 10), chars.slice(10, 15), chars.slice(15, 20)]
    .map((g) => g.join(""))
    .join("-");
}

export function normalizeSyncKey(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9-]/g, "");
}

export function isValidSyncKey(key: string): boolean {
  return /^[a-z0-9-]{16,64}$/.test(key);
}
