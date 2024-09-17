import React, { useState, useRef } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../constants";
import { HeartIcon } from "react-native-heroicons/outline";
import { ResizeMode, Video } from "expo-av";
// Context
import { useGlobalContext } from "../context/GlobalProvider";
// Utils
import * as Haptics from "expo-haptics";
import { getImageUrl } from "../lib/supabase";
import ActionSheet from "react-native-actionsheet";

type PropTypes = {
  listing: {
    title: string;
    thumbnail_url: string;
    video: string;
    id: string;
    creator_id: string;
  };
};

const ListingCard = ({
  listing: { title, thumbnail_url, video, id: listingId, creator_id },
}: PropTypes) => {
  const [play, setPlay] = useState(false);

  const { loggedUser } = useGlobalContext();

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
    }
  };

  const handleActionPress = (index: number) => {
    if (index === 1) {
      Alert.alert("Deleted", "Listing deleted successfully");
    } else if (index === 2) {
      Alert.alert("Inactive", "Listing set to inactive");
    }
  };

  return (
    <SafeAreaView className="bg-primary">
      <View className="flex-col items-center px-4 mb-14">
        <View className="flex-row gap-3 items-start">
          <View className="justify-center items-center flex-row flex-1">
            <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5"></View>
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
                {loggedUser?.email}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="pt-2 mr-3">
            <HeartIcon className="w-5 h-5 pt-2" color="red" />
          </TouchableOpacity>

          {loggedUser?.id === creator_id && (
            <TouchableOpacity className="pt-2" onPress={showActionSheet}>
              <Image
                source={icons.menu}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {play ? (
          <Video
            source={{ uri: video }}
            className="w-full h-60 rounded-xl mt-3"
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={(status: any) => {
              if (status.didJustFinish) {
                setPlay(false);
              }
            }}
            isMuted
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPlay(true)}
            className="w-full h-60 rounded-xl mt-3 relative justify-center items-center border-2 border-white/20"
          >
            <Image
              source={{
                uri: getImageUrl({
                  bucketName: "listings_bucket",
                  imagePath: thumbnail_url,
                }),
              }}
              className="w-full h-full rounded-xl mt-3"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      </View>
      <ActionSheet
        ref={actionSheetRef}
        options={["Cancel", "Изтрии рекламата", "Make Listing Inactive"]}
        cancelButtonIndex={0}
        destructiveButtonIndex={1}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};

export default ListingCard;
