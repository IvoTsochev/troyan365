import React, { useRef } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../constants";
import { HeartIcon } from "react-native-heroicons/outline";
// Context
import { useGlobalContext } from "../context/GlobalProvider";
// Utils
import * as Haptics from "expo-haptics";
import {
  deleteListing,
  deleteListingFolder,
  getImageUrl,
} from "../lib/supabase";
import ActionSheet from "react-native-actionsheet";
// TS
import { ListingType } from "../types/types";

type PropTypes = {
  listing: ListingType;
};

const ListingCard = ({
  listing: {
    title,
    thumbnail_url,
    id: listingId,
    creator_id,
    users: listingCreator,
    listing_id,
  },
}: PropTypes) => {
  const { loggedUser, setShouldRefetchHome, setShouldRefetchProfile } =
    useGlobalContext();

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
    }
  };

  const handleActionPress = async (index: number) => {
    if (index === 1) {
      try {
        if (!loggedUser?.id) return;
        await deleteListing({
          listingId: listing_id,
        });

        await deleteListingFolder({
          loggedUserId: loggedUser.id,
          listingId: listing_id,
        });

        setShouldRefetchHome(true);
        setShouldRefetchProfile(true);

        Alert.alert("Изтрита", "Публикацията е изтрита");
      } catch (error) {
        Alert.alert("Грешка", "Грешка при изтриване на публикацията");
        console.error(error);
      }
    } else if (index === 2) {
      Alert.alert("Деактивирана", "Публикацията е деактивирана");
    }
  };

  return (
    <SafeAreaView className="bg-primary">
      <View className="flex-col items-center px-4">
        <View className="flex-row gap-3 items-start">
          <View className="justify-center items-center flex-row flex-1">
            <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
              {/* AVATAR */}
            </View>
            <View className="justify-center flex-1 ml-3 gap-y-1">
              <Text
                className="text-white font-psemibold text-sm"
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text
                className="text-xs text-gray-100 font-pregular"
                numberOfLines={1}
              >
                {listingCreator?.username}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="p-4 mr-3">
            <HeartIcon className="w-5 h-5" color="red" />
          </TouchableOpacity>

          {loggedUser?.id === creator_id && (
            <TouchableOpacity className="p-4" onPress={showActionSheet}>
              <Image
                source={icons.menu}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => console.log("clicky Listing Card")}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center border-2 border-white/20"
        >
          <Image
            source={{
              uri: getImageUrl({
                bucketName: "listings_bucket",
                imagePath: thumbnail_url,
              }),
            }}
            className="w-full h-full rounded-xl"
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      <ActionSheet
        ref={actionSheetRef}
        options={["Cancel", "Изтрии публикация", "Деактивирай публикация"]}
        cancelButtonIndex={0}
        destructiveButtonIndex={1}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};

export default ListingCard;
