import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import { icons } from "../constants";
import { router, usePathname } from "expo-router";

type PropTypes = {
  initialQuery?: any;
};

const SearchInput = ({ initialQuery }: PropTypes) => {
  const [query, setQuery] = useState(initialQuery || "");
  const pathname = usePathname();

  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="mt-0.5 text-white flex-1 font-pregular h-full text-xl align-middle"
        value={query}
        placeholder="Потърси обяви"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
        accessibilityLabel="търси обяви"
      />

      <TouchableOpacity
        onPress={() => {
          if (!query)
            return Alert.alert(
              "Внимание",
              "Моля въведете ключова дума за търсене"
            );

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} className="size-8" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
