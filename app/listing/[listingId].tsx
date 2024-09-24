import React, { useState, useEffect } from "react";
import { Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Utils
import { getSpecificListing } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { getImageUrl } from "../../lib/supabase";
// TS
import { ListingType } from "../../types/types";

const SingleListing = () => {
  const [listing, setListing] = useState<ListingType | null>(null);
  const { listingId } = useLocalSearchParams();

  const fetchData = async () => {
    const data = await getSpecificListing(listingId);
    if (data) {
      console.log("data", data);

      setListing(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [listingId]);

  console.log("what is listing", listing);

  return (
    <SafeAreaView className="bg-primary h-full">
      {listing ? (
        <View className="w-full px-3">
          <Text className="text-white mb-3 text-center font-psemibold text-2xl">
            {listing.title}
          </Text>
          <View className="h-60 border-2 border-white/20 rounded-xl">
            <Image
              source={{
                uri: getImageUrl({
                  bucketName: "listings_bucket",
                  imagePath: listing.thumbnail_url,
                }),
              }}
              className="w-full h-full rounded-xl"
              resizeMode="contain"
            />
          </View>
          <View>
            {listing.description ? (
              <View>
                <Text className="text-white mt-3 font-psemibold text-2xl">
                  Описание:
                </Text>
                <Text className="text-white mt-3 font-pregular text-lg">
                  {listing.description}
                </Text>
              </View>
            ) : (
              <Text className="text-white mt-3">Няма описание</Text>
            )}

            <Text className="text-white mt-3 font-pregular text-lg">
              Телефон: {listing.phone_number1}
            </Text>
          </View>
        </View>
      ) : (
        <View></View>
      )}
    </SafeAreaView>
  );
};

export default SingleListing;
