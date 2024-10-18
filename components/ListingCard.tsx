import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../constants";
// Components
import { HeartIcon } from "react-native-heroicons/outline";
// Context
import { useGlobalContext } from "../context/GlobalProvider";
// Utils
import * as Haptics from "expo-haptics";
import {
  addFavorite,
  deleteListing,
  deleteListingFolder,
  getImageUrl,
  removeFavorite,
} from "../lib/supabase";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import { router } from "expo-router";
import { logAsyncStorage } from "../utils/logAsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateFavoritesInStorage } from "../utils/asyncstorage/updateFavorites";
import { toggleListingActivation } from "../lib/supabase";
// TS
import { ListingType } from "../types/types";

type PropTypes = {
  listing: ListingType;
};

const ListingCard = ({
  listing: {
    title,
    thumbnail_url,
    creator_id,
    users: listingCreator,
    listing_id,
    is_active,
  },
}: PropTypes) => {
  const {
    loggedUser,
    setShouldRefetchHome,
    setShouldRefetchProfile,
    myFavoriteIds,
    setMyFavoriteIds,
    myFavoriteIdsFromStorage,
    setMyFavoriteIdsFromStorage,
    userData,
  } = useGlobalContext();
  const [isListingFavorited, setIsListingFavorited] = useState(false);
  const [isListingActive, setIsListingActive] = useState(is_active);
  const [optionLoading, setOptionLoading] = useState(false);

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
    }
  };

  const handleActionPress = async (index: number) => {
    if (index === 1) {
      try {
        if (!loggedUser?.id) return;
        await deleteListing({
          listingId: listing_id,
        });

        await deleteListingFolder({
          loggedUserId: loggedUser.id,
          listingId: listing_id,
        });

        setShouldRefetchHome(true);
        setShouldRefetchProfile(true);

        Alert.alert("Изтрита", "Публикацията е изтрита");
      } catch (error) {
        Alert.alert("Грешка", "Грешка при изтриване на публикацията");
        console.error(error);
      }
    } else if (index === 2) {
      try {
        setOptionLoading(true);
        setIsListingActive(!isListingActive);
        await toggleListingActivation({
          listingId: listing_id,
          isActive: !isListingActive,
        });
        setShouldRefetchHome(true);
        Alert.alert(
          !isListingActive ? "Активирана" : "Деактивирана",
          !isListingActive
            ? "Публикацията е активирана"
            : "Публикацията е деактивирана"
        );
      } catch (error) {
        Alert.alert(
          "Грешка",
          !isListingActive
            ? "Грешка при активиране на публикацията"
            : "Грешка при деактивиране на публикацията"
        );
      } finally {
        setOptionLoading(false);
      }
    } else if (index === 3) {
      router.push(`/edit/${listing_id}`);
    }
  };

  const toggleFavoritesHandler = async () => {
    const isFavorited = myFavoriteIds.some(
      (item) => item.listing_id === listing_id
    );

    try {
      if (loggedUser?.id) {
        const updatedFavorites = await updateFavoritesInStorage(
          listing_id,
          isFavorited
        );
        setMyFavoriteIdsFromStorage(updatedFavorites);

        if (isFavorited) {
          setMyFavoriteIds(
            myFavoriteIds.filter((item) => item.listing_id !== listing_id)
          );
          await removeFavorite({
            userId: loggedUser.id,
            listingId: listing_id,
          });
        } else {
          setMyFavoriteIds([...myFavoriteIds, { listing_id }]);
          await addFavorite({
            userId: loggedUser.id,
            listingId: listing_id,
          });
        }
      } else {
        const currentStorage = await AsyncStorage.getItem("myFavoritesStorage");
        const isListingInFavoritesStorage = currentStorage
          ? JSON.parse(currentStorage).some(
              (item: { listing_id: string }) => item.listing_id === listing_id
            )
          : false;

        const updatedFavorites = await updateFavoritesInStorage(
          listing_id,
          isListingInFavoritesStorage
        );
        setMyFavoriteIdsFromStorage(updatedFavorites);
      }

      logAsyncStorage();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  useEffect(() => {
    setIsListingFavorited(
      loggedUser?.id
        ? myFavoriteIds.some((item) => item.listing_id === listing_id)
        : myFavoriteIdsFromStorage.some(
            (item) => item.listing_id === listing_id
          )
    );
  }, [myFavoriteIds, myFavoriteIdsFromStorage]);

  return (
    <SafeAreaView className="bg-primary">
      <TouchableOpacity
        className={`flex-col items-center px-4 ${
          !isListingActive && "opacity-30"
        }`}
        onPress={() => router.push(`/listing/${listing_id}`)}
      >
        <View className="flex-row gap-3 items-start">
          <View className="justify-center items-center flex-row flex-1">
            <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
              {userData?.avatar_url && (
                <Image
                  source={{
                    uri: userData?.avatar_url,
                  }}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              )}
            </View>
            <View className="justify-center flex-1 ml-3 gap-y-1">
              <Text
                className="text-white font-psemibold text-sm"
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text
                className="text-xs text-gray-100 font-pregular"
                numberOfLines={1}
              >
                {listingCreator?.username}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="p-4 mr-3"
            onPress={toggleFavoritesHandler}
          >
            <HeartIcon
              className="w-5 h-5"
              color="red"
              fill={isListingFavorited ? "red" : "transparent"}
            />
          </TouchableOpacity>

          {loggedUser?.id === creator_id && (
            <TouchableOpacity className="p-4" onPress={showActionSheet}>
              {optionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image
                  source={icons.menu}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View className="w-full h-60 rounded-xl mt-3 relative justify-center items-center border-2 border-white/20">
          {thumbnail_url ? (
            <Image
              source={{
                uri: getImageUrl({
                  bucketName: "listings_bucket",
                  imagePath: thumbnail_url,
                }),
              }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={images.noImage}
              className="w-full h-full rounded-lg"
              resizeMode="contain"
            />
          )}
        </View>
      </TouchableOpacity>
      <ActionSheet
        ref={actionSheetRef}
        options={[
          "Откажи",
          "Изтрии публикация",
          isListingActive ? "Деактивирай публикация" : "Активирай публикация",
          "Редактирай публикация",
        ]}
        cancelButtonIndex={0}
        destructiveButtonIndex={1}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};

export default ListingCard;
