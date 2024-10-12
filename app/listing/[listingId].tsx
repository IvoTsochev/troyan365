import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Utils
import { getSpecificListing } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { getImageUrl } from "../../lib/supabase";
import ActionSheet from "react-native-actionsheet";
import * as Haptics from "expo-haptics";
// TS
import { ListingType } from "../../types/types";
import { images } from "../../constants";

const SingleListing = () => {
  const [listing, setListing] = useState<ListingType | null>(null);
  const [loading, setLoading] = useState(true);

  const { listingId } = useLocalSearchParams();

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const fetchData = async () => {
    try {
      const data = await getSpecificListing(listingId);
      if (data) {
        setListing(data);
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      Alert.alert("Error", "Unable to make a call")
    );
  };

  const handleMessagePress = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`).catch((err) =>
      Alert.alert("Error", "Unable to send a message")
    );
  };

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
    }
  };

  const handleActionPress = async (index: number) => {
    if (index === 1) {
      if (listing?.phone_number1) {
        handlePhonePress(listing?.phone_number1);
      }
    }

    if (index === 2) {
      if (listing?.phone_number1) {
        handleMessagePress(listing?.phone_number1);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [listingId]);

  return (
    <SafeAreaView className="bg-primary h-full">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF9C01" />
        </View>
      ) : (
        <View className="w-full px-3">
          <Text className="text-white mb-3 text-center font-psemibold text-2xl">
            {listing?.title}
          </Text>
          <View className="h-60 border-2 border-white/20 rounded-xl">
            {listing?.thumbnail_url ? (
              <Image
                source={{
                  uri: getImageUrl({
                    bucketName: "listings_bucket",
                    imagePath: listing?.thumbnail_url,
                  }),
                }}
                className="w-full h-full rounded-xl"
                resizeMode="contain"
              />
            ) : (
              <Image
                source={images.noImage}
                className="w-full h-full rounded-xl"
                resizeMode="contain"
              />
            )}
          </View>
          <View>
            {listing?.description ? (
              <View className="border-2 border-white/20 rounded-xl mt-3 p-3">
                <Text className="text-white font-psemibold text-2xl">
                  Описание:
                </Text>
                <Text className="text-white font-pregular text-lg">
                  {listing?.description}
                </Text>
              </View>
            ) : (
              <View className="border-2 border-white/20 rounded-xl mt-3 p-3">
                <Text className="text-white">Няма описание</Text>
              </View>
            )}
            <TouchableOpacity
              className="border-2 border-white/20 rounded-xl mt-3 p-3"
              onPress={() => {
                showActionSheet();
              }}
            >
              <Text className="text-white font-pregular text-lg">
                Телефон: {listing?.phone_number1}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ActionSheet
        ref={actionSheetRef}
        options={["Cancel", "Обади се", "Изпрати съобщение"]}
        cancelButtonIndex={0}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};

export default SingleListing;
