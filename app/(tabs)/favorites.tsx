import React, { useState, useEffect, useCallback } from "react";
// Components
import { Text, View, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
// Utils
import { useGlobalContext } from "../../context/GlobalProvider";
import { getSpecificListing } from "../../lib/supabase";

const Favorites = () => {
  const { myFavoriteIds, loggedUser, myFavoriteIdsFromStorage } =
    useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [myFavorites, setMyFavorites] = useState();

  const fetchFavorites = async () => {
    let data;
    if (loggedUser?.id) {
      data = await Promise.all(
        myFavoriteIds.map(async (id) => {
          const listing = await getSpecificListing(id.listing_id);
          return listing;
        })
      );
    } else {
      data = await Promise.all(
        myFavoriteIdsFromStorage.map(async (id) => {
          const listing = await getSpecificListing(id.listing_id);
          return listing;
        })
      );
    }

    setMyFavorites(data);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [myFavoriteIds, myFavoriteIdsFromStorage]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={myFavorites}
        keyExtractor={(item) => item?.listing_id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <Text className="text-2xl text-white font-psemibold">Любими</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Няма любими публикации"
            subtitle="Все още нямате любими публикации."
            showButton={false}
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

export default Favorites;
