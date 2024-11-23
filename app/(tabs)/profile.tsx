import React, { useEffect, useRef } from "react";
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
import ActionSheet from "@alessiocancian/react-native-actionsheet";
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
import { signOut, deleteAvatar } from "../../lib/supabase";
import { UserType } from "../../types/types";
import { uploadAvatar } from "../../lib/supabase";
import useFetchUserListings from "../../hooks/useFetchUserListings";

const Profile = () => {
  const {
    setIsLogged,
    userSession,
    setUserSession,
    setShouldRefetchProfile,
    shouldRefetchProfile,
    userData,
    setUserData,
    setMyFavoriteIds,
  } = useGlobalContext();
  const actionSheetRef = useRef<ActionSheet | null>(null);

  const {
    data: myListingsData,
    isFetching,
    refetch,
  } = useFetchUserListings({ userId: userData ? userData.user_id : "" });

  useEffect(() => {
    if (shouldRefetchProfile) {
      refetch();
      setShouldRefetchProfile(false);
    }
  }, [shouldRefetchProfile, refetch, setShouldRefetchProfile]);

  const logout = async () => {
    await signOut();
    setUserSession(null);
    setIsLogged(false);
    setUserData(null);
    setMyFavoriteIds([]);

    router.replace("/home");
  };

  if (!userSession) {
    return (
      <SafeAreaView
        className="bg-primary h-full justify-center items-center"
        edges={["top"]}
      >
        <Text className="text-white text-xl mb-4">
          Не сте влезли в профиле си
        </Text>
        <CustomButton
          title="Влез"
          handlePress={() => router.push("/sign-in")}
          containerStyles="w-1/2"
        />
        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          className="mt-5"
        >
          <Text className="text-white text-xl">Забравена парола?</Text>
        </TouchableOpacity>
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
        userId: userData?.user_id.toString() || "",
        file: pickedFile,
      });

      if (updateData && updateData.avatar_url) {
        setUserData((prev: UserType | null) => ({
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
        userId: userData?.user_id,
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

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={myListingsData}
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
              title={userData?.username || ""}
              containerStyle="mt-5"
              titleStyles="text-lg font-bold"
            />

            <InfoBox title={userData?.email || ""} titleStyles="text-sm" />

            <View className="mt-5 flex-row">
              <InfoBox
                title={myListingsData?.length.toString() || "0"}
                subtitle="Публикации"
                containerStyle=""
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
            refreshing={isFetching}
            onRefresh={refetch}
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
