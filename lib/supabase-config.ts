import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import {
  EXPO_PUBLIC_CLOUD_SUPABASE_URL,
  EXPO_PUBLIC_CLOUD_ANON_KEY,
  EXPO_PUBLIC_LINODE_SUPABASE_URL,
  EXPO_PUBLIC_LINODE_ANON_KEY,
} from "@env";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    const sessionData = JSON.parse(value);
    const minimalSessionData = {
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: sessionData.expires_at,
      userId: sessionData.user.id,
    };
    const minimalValue = JSON.stringify(minimalSessionData);

    return SecureStore.setItemAsync(key, minimalValue);

    // SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// CLOUD
const supabaseUrl = EXPO_PUBLIC_CLOUD_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_CLOUD_ANON_KEY;

// SELF-HOSTED
// const supabaseUrl = EXPO_PUBLIC_LINODE_SUPABASE_URL;
// const supabaseAnonKey = EXPO_PUBLIC_LINODE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
