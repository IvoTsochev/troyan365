import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
// Utils
import * as ImagePicker from "expo-image-picker";
import { useGlobalContext } from "../../context/GlobalProvider";
import { createListing } from "../../lib/supabase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import * as Haptics from "expo-haptics";
import { Camera } from "expo-camera";
import packageJson from "../../package.json";
// Components
import FormField from "../../components/FormField";
import { icons } from "../../constants";
import CustomButton from "../../components/CustomButton";

type ImageType = ImagePicker.ImagePickerAsset;

const Create = () => {
  const {
    userData,
    userSession,
    setShouldRefetchHome,
    setShouldRefetchProfile,
    hasCameraPermission,
    setHasCameraPermission,
  } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    thumbnail_image: ImageType | null;
    phone_number1: string;
    description?: string;
  }>({
    title: "",
    thumbnail_image: null,
    phone_number1: "",
    description: "",
  });

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const takePhoto = async () => {
    if (hasCameraPermission === false) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos."
        );
        return;
      }
      setHasCameraPermission(true);
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const photo = result.assets[0];
      const fileName = `${new Date().getTime()}_image.jpg`;

      setForm({
        ...form,
        thumbnail_image: { ...photo, name: fileName },
      });
    }
  };

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
        userId: userData?.user_id,
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
        description: "",
      });
      setUploading(false);
    }
  };

  const handleActionPress = async (index: number) => {
    if (index === 1) {
      openPicker({ selectType: "image" });
    }

    if (index === 2) {
      takePhoto();
    }
  };

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
    }
  };

  if (!userSession) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center px-4">
        <Text className="text-white text-xl mb-4 font-pbold">
          Влез, за да качиш обява
        </Text>
        <View className="w-full">
          <CustomButton
            title="Влез"
            handlePress={() => router.push("/sign-in")}
            containerStyles="mt-7"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full" edges={["top"]}>
      <KeyboardAwareScrollView className="px-4" extraHeight={120}>
        <Text className="text-2xl text-white font-pbold">Качи обява</Text>

        <FormField
          title="Заглавие на обявата"
          value={form.title}
          handleChangeText={(e) => {
            setForm({ ...form, title: e });
          }}
          otherStyles="mt-10"
          accessibilityLabel="Заглавие на обявата"
        />

        <FormField
          title="Описание"
          value={form.description || ""}
          handleChangeText={(e) => {
            setForm({ ...form, description: e });
          }}
          otherStyles="mt-10"
          accessibilityLabel="Описание на обявата"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Главна снимка
          </Text>
          <TouchableOpacity
            onPress={() => {
              showActionSheet();
            }}
          >
            {form.thumbnail_image ? (
              <Image
                source={{ uri: form.thumbnail_image.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode="cover"
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
          accessibilityLabel="Телефон за връзка"
        />
        <CustomButton
          title={uploading ? "Публикуване..." : "Публикувай обява"}
          handlePress={createListingHandler}
          containerStyles="mt-7"
          isLoading={uploading}
        />
        <View className="flex justify-center items-center my-3">
          <Text className="text-gray-400">Version: {packageJson.version}</Text>
        </View>
      </KeyboardAwareScrollView>
      <ActionSheet
        ref={actionSheetRef}
        options={["Cancel", "Снимка от галерия", "Направи снимка"]}
        cancelButtonIndex={0}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};
export default Create;
