import React from "react";
import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGlobalContext } from "../context/GlobalProvider";

export default function TabLayout() {
  const { loading } = useGlobalContext();

  if (!loading) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-primary h-full flex-1 justify-center flex-row p-10">
      <ActivityIndicator size="large" color="#00ff00" />
    </SafeAreaView>
  );
}
