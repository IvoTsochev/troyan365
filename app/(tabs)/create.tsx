import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/FormField";
import { icons } from "../../constants";
import CustomButton from "../../components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { createListing } from "../../lib/supabase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type ImageType = ImagePicker.ImagePickerAsset;

const Create = () => {
  const { loggedUser, session, setShouldRefetchHome, setShouldRefetchProfile } =
    useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    thumbnail_image: ImageType | null;
    phone_number1: string;
  }>({
    title: "",
    thumbnail_image: null,
    phone_number1: "",
  });

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
      const pickedFile = result.assets[0]; // This contains uri, width, height, etc.
      const fileName =
        pickedFile.fileName || `${new Date().getTime()}_image.jpg`;

      if (selectType === "image") {
        setForm({
          ...form,
          thumbnail_image: { ...pickedFile, name: fileName },
        });
      }
    }
  };

  const createListingHandler = async () => {
    if (!form.phone_number1 || !form.title) {
      Alert.alert("Грешка", "Моля попълнете всички полета");
      return;
    }

    setUploading(true);
    try {
      await createListing({
        form,
        userId: loggedUser?.id,
      });
      Alert.alert("Готово", "Публикацията скоро ще бъде публикувана");

      setShouldRefetchHome(true);
      setShouldRefetchProfile(true);

      router.push("/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Грешка", "Грешка при качването на публикацията");
    } finally {
      setForm({
        title: "",
        thumbnail_image: null,
        phone_number1: "",
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAwareScrollView className="px-4 my-6" extraHeight={120}>
        <Text className="text-2xl text-white font-psemibold">Качи обява</Text>

        <FormField
          title="Заглавие на обявата"
          value={form.title}
          handleChangeText={(e) => {
            setForm({ ...form, title: e });
          }}
          otherStyles={`mt-10 
          }`}
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Главна снимка
          </Text>
          <TouchableOpacity
            onPress={() => {
              openPicker({ selectType: "image" });
            }}
          >
            {form.thumbnail_image ? (
              <Image
                source={{ uri: form.thumbnail_image.uri }}
                className="w-full h-64 rounded-2xl"
                useNativeControls
                resizeMode="cover"
                isLooping
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Избери снимка
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FormField
          title="Телефон за връзка"
          value={form.phone_number1}
          handleChangeText={(e) => {
            setForm({ ...form, phone_number1: e });
          }}
          otherStyles="mt-7"
        />
        <CustomButton
          title={
            session && uploading
              ? "Публикуване..."
              : session
              ? "Публикувай обява"
              : "Влез"
          }
          handlePress={
            session ? createListingHandler : () => router.push("/sign-in")
          }
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
export default Create;
