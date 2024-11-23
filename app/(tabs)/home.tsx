import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
// Components
import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
// Constants
import { images } from "../../constants";
// Utils
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLatestListings, loadMoreListings } from "../../lib/supabase";
// TS
import { ListingType } from "../../types/types";

const Home = () => {
  const [listingsData, setListingsData] = useState<ListingType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const { shouldRefetchHome, setShouldRefetchHome, userData } =
    useGlobalContext();

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const data = await getLatestListings();
      if (data) {
        setListingsData(data);
      }
    } catch (error: any) {
      console.log("Error fetching listings", error.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (shouldRefetchHome) {
      fetchData();
      setShouldRefetchHome(false);
    }
  }, [shouldRefetchHome]);

  const fetchMoreData = async () => {
    const data = await loadMoreListings({
      currentPage,
    });
    if (data.length > 0) {
      setListingsData((prevData) => {
        const uniqueListings = [
          ...prevData,
          ...data.filter(
            (newListing) =>
              !prevData.some(
                (existingListing) =>
                  existingListing.listing_id === newListing.listing_id
              )
          ),
        ];
        return uniqueListings;
      });
      setCurrentPage(currentPage + 1);
    }
  };

  const onRefresh = async () => {
    setListingsData([]);
    setCurrentPage(0);
    await fetchData();
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={listingsData}
        keyExtractor={(item) => item.listing_id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100 py-3">
                  Добре дошъл
                </Text>
                {userData?.username && (
                  <Text className="text-2xl font-pbold text-white">
                    {userData?.username}
                  </Text>
                )}
              </View>
              <View className="mt-1.5 ">
                {userData?.avatar_url ? (
                  <TouchableOpacity onPress={() => router.push("/profile")}>
                    <Image
                      source={{
                        uri: userData?.avatar_url,
                      }}
                      className="w-9 h-10 rounded-full"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={images.logoSmall}
                    className="w-9 h-10 rounded-full"
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
            <SearchInput />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Няма публикувани реклами"
            subtitle="Все още няма публикувани реклами. Може би е време да публикувате първата си?"
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"#FF9C01"}
          />
        }
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

export default Home;
