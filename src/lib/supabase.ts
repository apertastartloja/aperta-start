import { createClient } from "@supabase/supabase-js";

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key];
    }
  } catch {
    // Ignore
  }
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
  } catch {
    // Ignore
  }
  return undefined;
};

const supabaseUrl =
  getEnv("VITE_SUPABASE_URL") || "https://cnrvktfpbdzvlocdjmcs.supabase.co";
const supabaseAnonKey =
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucnZrdGZwYmR6dmxvY2RqbWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MDA5NTEsImV4cCI6MjEwMTM3Njk1MX0.FTrLbb-427gHpF2QnG4809-4EedFl3ZXYIq9Vrs7Dno";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
