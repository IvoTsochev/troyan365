import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  addFavorite,
  getMyFavoriteListingIds,
  listingExists,
  signIn,
} from "../../lib/supabase";
import { getFavoriteIdsFromAsyncStorage } from "../../utils/asyncstorage/getFavoriteIdsFromAsyncStorage";

const SignIn = () => {
  const { setIsLogged, setMyFavoriteIds } = useGlobalContext();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInHandler = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Грешка", "Моля попълнете всички полета.");
    }

    setIsSubmitting(true);

    try {
      const { error, data } = await signIn(form.email, form.password);
      if (error) {
        throw new Error("Грешка при влизането, опитайтее отново", error);
      }
      const userId = data.session?.user?.id;

      const tableFavorites = await getMyFavoriteListingIds({ userId });

      const favoritesFromStorage = await getFavoriteIdsFromAsyncStorage();

      let existingFavorites = [];
      if (favoritesFromStorage.length > 0) {
        existingFavorites = await Promise.all(
          favoritesFromStorage?.map(async (favorite: any) => {
            const exists = await listingExists(favorite.listing_id);
            return exists ? favorite : null;
          })
        );
      }

      const validFavoritesFromStorage = existingFavorites.filter(Boolean);

      const missingFavorites = validFavoritesFromStorage?.filter(
        (favorite: any) =>
          !tableFavorites.some(
            (tableFavorite) => tableFavorite.listing_id === favorite.listing_id
          )
      );

      if (missingFavorites.length > 0) {
        await Promise.all(
          missingFavorites?.map(
            async (favorite) =>
              await addFavorite({ userId, listingId: favorite.listing_id })
          )
        );
      }

      const updatedFavorites = await getMyFavoriteListingIds({
        userId,
      });

      setMyFavoriteIds(updatedFavorites);

      setIsLogged(true);

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[45vh] px-4 my-6">
          <View className="flex flex-row justify-start">
            <Image
              source={images.logoSmall}
              resizeMode="contain"
              className="w-[50px] h-[35px]"
            />
            <Text className="text-2xl text-white font-pextrabold">
              Троян Бизнеси
            </Text>
          </View>
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Влез в профила си
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Парола"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title={isSubmitting ? "Влизане..." : "Влез"}
            handlePress={signInHandler}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Нямаш профил?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Създай сега
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
