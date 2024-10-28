import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment } from "react";

const AuthLayout = () => {
  return (
    <Fragment>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: true,
            headerTintColor: "#FFA001",
            headerBackTitle: "Назад",
            headerStyle: {
              backgroundColor: "#161622",
            },
            title: "Забравена парола",
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            headerShown: true,
            headerTintColor: "#FFA001",
            headerBackTitle: "Назад",
            headerStyle: {
              backgroundColor: "#161622",
            },
            title: "Забравена парола",
          }}
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#161622" />
    </Fragment>
  );
};

export default AuthLayout;
