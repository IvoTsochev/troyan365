import React from "react";
// Components
import { Text, View, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
// Utils
import { useGlobalContext } from "../../context/GlobalProvider";
import useFetchFavorites from "../../hooks/useFetchFavorites";

const Favorites = () => {
  const { myFavoriteIds, myFavoriteIdsFromStorage, userData } =
    useGlobalContext();

  const currentFavoriteIds = userData?.user_id
    ? myFavoriteIds
    : myFavoriteIdsFromStorage;

  const {
    data: myFavoritesData,
    isFetching,
    refetch,
  } = useFetchFavorites({
    myFavoriteIds: currentFavoriteIds,
    supabaseIds: myFavoriteIds,
    storageIds: myFavoriteIdsFromStorage,
  });

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={myFavoritesData}
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
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={"#FF9C01"}
          />
        }
      />
    </SafeAreaView>
  );
};

export default Favorites;
