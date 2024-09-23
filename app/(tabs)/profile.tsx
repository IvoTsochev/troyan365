import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import ActionSheet from "react-native-actionsheet";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
// Components
import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
import InfoBox from "../../components/InfoBox";
import CustomButton from "../../components/CustomButton";
// Utils
import { useGlobalContext } from "../../context/GlobalProvider";
import { icons } from "../../constants";
import {
  signOut,
  getUserListings,
  getImageUrl,
  deleteAvatar,
} from "../../lib/supabase";
import { ListingType, UserType } from "../../types/types";
import { uploadAvatar } from "../../lib/supabase";

type ImageType = ImagePicker.ImagePickerAsset;

const Profile = () => {
  const [myListings, setMyListings] = useState<ListingType[]>([]);
  const {
    loggedUser,
    setLoggedUser,
    setIsLogged,
    session,
    setSession,
    setShouldRefetchProfile,
    shouldRefetchProfile,
    setShouldRefetchHome,
    userData,
    setUserData,
  } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const fetchData = async () => {
    const data = await getUserListings(loggedUser?.id);
    if (data) {
      setMyListings(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (shouldRefetchProfile) {
      fetchData();
      setShouldRefetchProfile(false);
    }
  }, [shouldRefetchProfile]);

  const logout = async () => {
    await signOut();
    setLoggedUser(undefined);
    setSession(null);
    setIsLogged(false);

    router.replace("/home");
  };

  if (!session) {
    return (
      <SafeAreaView className="bg-primary h-full justify-center items-center">
        <Text className="text-white text-xl mb-4">
          Не сте влезли в профиле си
        </Text>
        <CustomButton
          title="Влез"
          handlePress={() => router.push("/sign-in")}
          containerStyles="w-1/2"
        />
      </SafeAreaView>
    );
  }

  const openPicker = async ({
    selectType,
  }: {
    selectType: "image" | "video";
  }) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        selectType === "image"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const pickedFile = result.assets[0];

      const { updateData } = await uploadAvatar({
        userId: `${loggedUser?.id}`,
        file: pickedFile,
      });

      if (updateData && updateData.avatar_url) {
        setUserData((prev: UserType | undefined) => ({
          ...prev,
          avatar_url: `${updateData.avatar_url}?time=${new Date().getTime()}`,
        }));
      }

      Alert.alert("Успешно", "Снимката е качена успешно");
    }
  };

  const handleActionPress = async (index: number) => {
    if (index === 1) {
      openPicker({ selectType: "image" });
    }

    if (index === 2) {
      if (!userData?.avatar_url) {
        Alert.alert("Грешка", "Нямате профилна снимка за изтриване");
        return;
      }
      setUserData((prev: any) => ({ ...prev, avatar_url: "" }));
      await deleteAvatar({
        userId: `${loggedUser?.id}`,
      });

      Alert.alert("Успешно", "Профилната снимка е изтрита успешно");
    }
  };

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
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
        data={myListings}
        keyExtractor={(item) => item?.listing_id.toString()}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              className="w-full items-end mb-10"
              onPress={logout}
            >
              <Image
                source={icons.logout}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={showActionSheet}>
              <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
                {userData?.avatar_url && (
                  <Image
                    source={{
                      uri: userData?.avatar_url,
                    }}
                    className="w-[90%] h-[90%] rounded-lg"
                    resizeMode="cover"
                  />
                )}
              </View>
            </TouchableOpacity>
            <InfoBox
              title={loggedUser?.user_metadata.username}
              containerStyle="mt-5"
              titleStyles="text-lg font-bold"
            />

            <InfoBox
              title={loggedUser?.user_metadata.email}
              titleStyles="text-sm"
            />

            <View className="mt-5 flex-row">
              <InfoBox
                title={myListings?.length.toString() || "0"}
                subtitle="Постове"
                containerStyle="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox
                title="1.2k"
                subtitle="Последователи"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Няма публикации"
            subtitle="Все още нямате публикации."
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

      <ActionSheet
        ref={actionSheetRef}
        options={["Cancel", "Смени профилна снимка", "Изтрий профилна снимка"]}
        cancelButtonIndex={0}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};

export default Profile;
