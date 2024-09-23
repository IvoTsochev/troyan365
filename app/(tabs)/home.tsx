import React, { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, Image, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Components
import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
// Constants
import { images } from "../../constants";
// Utils
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLatestListings } from "../../lib/supabase";
// TS
import { ListingType } from "../../types/types";

const Home = () => {
  const [listingsData, setListingsData] = useState<ListingType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { loggedUser, shouldRefetchHome, setShouldRefetchHome, userData } =
    useGlobalContext();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (shouldRefetchHome) {
      fetchData();
      setShouldRefetchHome(false);
    }
  }, [shouldRefetchHome]);

  const fetchData = async () => {
    const data = await getLatestListings();
    if (data) {
      setListingsData(data);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

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
                <Text className="font-pmedium text-sm text-gray-100">
                  Добре дошъл
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {loggedUser?.user_metadata.username}
                </Text>
              </View>
              <View className="mt-1.5 ">
                {userData?.avatar_url ? (
                  <Image
                    source={{
                      uri: userData?.avatar_url,
                    }}
                    className="w-9 h-10 rounded-full"
                    resizeMode="cover"
                  />
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

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-3">
                Последни публикации
              </Text>

              <Trending posts={listingsData ?? []} />
            </View>
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
      />
    </SafeAreaView>
  );
};

export default Home;
