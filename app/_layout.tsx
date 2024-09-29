import React, { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import GlobalProvider from "../context/GlobalProvider";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://f0be64d9941410ac6ca242259be80eba@o4508035960930304.ingest.de.sentry.io/4508035965124688",
});

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <GlobalProvider>
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
    </GlobalProvider>
  );
};

export default RootLayout;
