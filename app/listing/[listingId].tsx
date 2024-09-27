import React, { useState, useEffect } from "react";
import { Text, View, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Utils
import { getSpecificListing } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { getImageUrl } from "../../lib/supabase";
// TS
import { ListingType } from "../../types/types";

const SingleListing = () => {
  const [listing, setListing] = useState<ListingType | null>(null);
  const [loading, setLoading] = useState(true);

  const { listingId } = useLocalSearchParams();

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
          </View>
          <View>
            {listing?.description ? (
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
              Телефон: {listing?.phone_number1}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SingleListing;
