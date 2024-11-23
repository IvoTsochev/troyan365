import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import GlobalProvider from "../context/GlobalProvider";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { EllipsisVerticalIcon } from "react-native-heroicons/outline";
import "./global.css";

Sentry.init({
  dsn: "https://f0be64d9941410ac6ca242259be80eba@o4508035960930304.ingest.de.sentry.io/4508035965124688",
});

// SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// const prefix = Linking.createURL("/");

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Ubuntu-Bold": require("../assets/fonts/Ubuntu-Bold.ttf"),
    "Ubuntu-Light": require("../assets/fonts/Ubuntu-Light.ttf"),
    "Ubuntu-Medium": require("../assets/fonts/Ubuntu-Medium.ttf"),
    "Ubuntu-Regular": require("../assets/fonts/Ubuntu-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <GlobalProvider>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="search/[query]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="listing/[listingId]"
            options={{
              headerShown: true,
              headerTintColor: "#FFA001",
              headerBackTitle: "Назад",
              headerStyle: {
                backgroundColor: "#161622",
              },
              title: "Обява",
              animation: "default",
              headerTitleAlign: "center",
              headerRight: () => (
                <View>
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="edit/[listingId]"
            options={{
              headerShown: true,
              headerTintColor: "#FFA001",
              headerBackTitle: "Назад",
              headerStyle: {
                backgroundColor: "#161622",
              },
              title: "Редактиране",
              animation: "default",
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GlobalProvider>
  );
};

export default RootLayout;
