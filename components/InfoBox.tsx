import { StyleSheet, Text, View } from "react-native";
import React from "react";

type PropTypes = {
  title: string;
  subtitle?: string;
  containerStyle?: string;
  titleStyles: string;
};

const InfoBox = ({
  title,
  subtitle,
  containerStyle,
  titleStyles,
}: PropTypes) => {
  return (
    <View className={containerStyle}>
      <Text className={`text-white text-center font-pbold ${titleStyles}`}>
        {title}
      </Text>
      <Text className="text-sm text-gray-100 text-center font-pregular">
        {subtitle}
      </Text>
    </View>
  );
};

export default InfoBox;
