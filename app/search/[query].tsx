import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
// Components
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
// Utils
import { searchListings } from "../../lib/supabase";
import { ListingType } from "../../types/types";

const Search = () => {
  const { query } = useLocalSearchParams();
  const [searchedListings, setSearchedListings] = useState<ListingType[]>([]);

  const fetchData = async () => {
    const data = await searchListings({ query });
    if (data) {
      setSearchedListings(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={searchedListings}
        keyExtractor={(item) => item.listing_id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Резултати
            </Text>
            <Text className="text-2xl font-psemibold text-white">{query}</Text>
            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for the search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
