import { useState } from "react";
import { FlatList, Image, TouchableOpacity } from "react-native";
// Utils
import * as Animatable from "react-native-animatable";
import { getImageUrl } from "../lib/supabase";
import { images } from "../constants";
import { ListingType } from "../types/types";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1.1,
  },
};

const zoomOut = {
  0: {
    scale: 1.1,
  },
  1: {
    scale: 0.9,
  },
};

type PropTypes = {
  activeItem: string;
  item: any;
};

type PostType = {
  posts: ListingType[];
};

const TrendingItem = ({ activeItem, item }: PropTypes) => {
  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      <TouchableOpacity
        className="relative justify-center items-center border-2 border-white/20"
        activeOpacity={0.7}
      >
        <Image
          source={
            item.thumbnail_url
              ? {
                  uri: getImageUrl({
                    bucketName: "listings_bucket",
                    imagePath: item.thumbnail_url,
                  }),
                }
              : images.noImage
          }
          className="w-52 h-72 bg-white/10"
          resizeMode={item.thumbnail_url ? "cover" : "contain"}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
};

const Trending = ({ posts }: PostType) => {
  const [activeItem, setActiveItem] = useState(posts[1]);

  const viewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.listing_id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
      horizontal
    />
  );
};

export default Trending;
