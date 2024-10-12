import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import {
  CLOUD_SUPABASE_URL,
  CLOUD_ANON_KEY,
  LINODE_SUPABASE_URL,
  LINODE_ANON_KEY,
} from "@env";

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

// CLOUD
// const supabaseUrl = CLOUD_SUPABASE_URL;
// const supabaseAnonKey = CLOUD_ANON_KEY;

// SELF-HOSTED
const supabaseUrl = LINODE_SUPABASE_URL;
const supabaseAnonKey = LINODE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
