import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyState from "../../components/EmptyState";
import ListingCard from "../../components/ListingCard";
import { useGlobalContext } from "../../context/GlobalProvider";
import { icons } from "../../constants";
import InfoBox from "../../components/InfoBox";
import { router } from "expo-router";
import CustomButton from "../../components/CustomButton";
import { signOut, getUserListings } from "../../lib/supabase";

const Profile = () => {
  const [myListings, setMyListings] = useState([]);
  const {
    loggedUser,
    setLoggedUser,
    setIsLogged,
    session,
    setSession,
    setShouldRefetchProfile,
    shouldRefetchProfile,
  } = useGlobalContext();

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

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={myListings}
        keyExtractor={(item) => item?.id}
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
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              {/* <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              /> */}
            </View>
            <InfoBox
              title={loggedUser?.user_metadata.username}
              containerStyle="mt-5"
              titleStyles="text-lg font-bold"
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
      />
    </SafeAreaView>
  );
};

export default Profile;
