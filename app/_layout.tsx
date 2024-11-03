import React, { useEffect, useState } from "react";
import { Stack, SplashScreen, router } from "expo-router";
import { useFonts } from "expo-font";
import GlobalProvider from "../context/GlobalProvider";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { EllipsisVerticalIcon } from "react-native-heroicons/outline";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

Sentry.init({
  dsn: "https://f0be64d9941410ac6ca242259be80eba@o4508035960930304.ingest.de.sentry.io/4508035965124688",
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// const prefix = Linking.createURL("/");

const RootLayout = () => {
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

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

  // useEffect(() => {
  //   const handleDeepLink = (event: any) => {
  //     let url = event.url;
  //     const data = Linking.parse(url);

  //     if (data.path === "reset-password" && !deepLinkHandled) {
  //       console.log("into if");
  //       console.log("what is data link", data);

  //       setTimeout(() => {
  //         router.push({
  //           pathname: "/reset-password",
  //           params: {
  //             token: data.queryParams?.token,
  //             email: data.queryParams?.email,
  //           },
  //         });
  //         setDeepLinkHandled(true);

  //         // url = null;
  //         // data.path = null;
  //       }, 100);
  //     }
  //   };

  //   const subscription = Linking.addEventListener("url", handleDeepLink);

  //   Linking.getInitialURL().then((url) => {
  //     if (url && !deepLinkHandled) {
  //       handleDeepLink({ url });
  //     }
  //   });

  //   return () => subscription.remove();
  // }, [deepLinkHandled]);

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
