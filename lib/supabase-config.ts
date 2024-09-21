import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};
// Cloud URL
// const supabaseUrl = "https://qeecuxesbmiidpvycjqq.supabase.co" || "";
// Cloud Key
// const supabaseAnonKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZWN1eGVzYm1paWRwdnljanFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5NTQ4MjEsImV4cCI6MjA0MTUzMDgyMX0.WHj3hqx9bZgHFPfVDjwa8jhqiZra5ESa9FK0zwiQG0U" ||
//   "";

// Self-hosted URL
const supabaseUrl = "http://139.162.163.228:8000" || "";
// Self-hosted Key
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzI2Nzc5NjAwLAogICJleHAiOiAxODg0NTQ2MDAwCn0.ynnyiKRZ3bx8fRIc0ezgYqrNVMHmtNz1rTJZNpaAgPY" ||
  "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
