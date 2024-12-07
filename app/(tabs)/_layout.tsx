import React, { Fragment } from "react";
import { Text, View, Image } from "react-native";
import { Tabs } from "expo-router";
import { icons } from "../../constants";
import { StatusBar } from "expo-status-bar";

const TabIcon = ({
  icon,
  color,
  name,
  focused,
}: {
  icon: string;
  color: string;
  name?: string;
  focused: boolean;
}) => {
  return (
    <View className="items-center justify-center">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`
          ${focused ? "font-pbold" : "font-pregular"} 
          text-xs 
          w-full
          `}
        style={{ color: color }}
      >
        {name && name}
      </Text>
    </View>
  );
};

const TabsLayout = (props) => {
  return (
    <Fragment>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 84,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontFamily: "Ubuntu-Bold",
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Начало",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.home} color={color} focused={focused} />
            ),
            tabBarAccessibilityLabel: "Начало",
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Любими",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.bookmark} color={color} focused={focused} />
            ),
            tabBarAccessibilityLabel: "Любими",
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Публикувай",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.plus} color={color} focused={focused} />
            ),
            tabBarAccessibilityLabel: "Публикувай",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Профил",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.profile} color={color} focused={focused} />
            ),
            tabBarAccessibilityLabel: "Профил",
          }}
        />
      </Tabs>
    </Fragment>
  );
};

export default TabsLayout;
