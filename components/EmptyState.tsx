import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

import { images } from "../constants";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

type PropTypes = {
  title: string;
  subtitle: string;
  showButton?: boolean;
};

const EmptyState = ({ title, subtitle, showButton = true }: PropTypes) => {
  return (
    <View className="justify-center items-center px-4">
      <Image
        source={images.empty}
        className="w-[270px] h-[215px]"
        resizeMode="contain"
      />
      <Text className="text-xl text-center font-pbold text-white mt-2">
        {title}
      </Text>
      <Text className="font-pmedium text-sm text-gray-100">{subtitle}</Text>

      {showButton && (
        <CustomButton
          title="Създай обява"
          handlePress={() => router.push("/create")}
          containerStyles="w-full my-5"
        />
      )}
    </View>
  );
};

export default EmptyState;
