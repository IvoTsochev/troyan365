import { useState } from "react";
import { FlatList, Image, TouchableOpacity } from "react-native";
// Utils
import * as Animatable from "react-native-animatable";
import { getImageUrl } from "../lib/supabase";

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
          source={{
            uri: getImageUrl({
              bucketName: "listings_bucket",
              imagePath: item.thumbnail_url,
            }),
          }}
          className="w-52 h-72 bg-white/10"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[1]);

  const viewableItemsChanged = ({ viewableItems }) => {
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
