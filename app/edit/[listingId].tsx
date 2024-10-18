import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
// Utils
import { getSpecificListing, updateListing } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getImageUrl, removeThumbnail } from "../../lib/supabase";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
// Components
import FormField from "../../components/FormField";
import { icons } from "../../constants";
import CustomButton from "../../components/CustomButton";

const Edit = () => {
  const {
    hasCameraPermission,
    setHasCameraPermission,
    loggedUser,
    setShouldRefetchProfile,
  } = useGlobalContext();

  const [listing, setListing] = useState({
    title: "",
    thumbnail_url: "",
    phone_number1: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);

  const actionSheetRef = useRef<ActionSheet | null>(null);

  const { listingId } = useLocalSearchParams();

  const fetchData = async () => {
    const data = await getSpecificListing(listingId);
    if (data) {
      setListing(data);
    }
  };

  const openPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const pickedFile = result.assets[0];
      const fileName =
        pickedFile.fileName || `${new Date().getTime()}_image.jpg`;

      setListing({
        ...listing,
        thumbnail_url: { ...pickedFile, name: fileName },
      });
    }
  };

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

      setListing({
        ...listing,
        thumbnail_url: { ...photo, name: fileName },
      });
    }
  };

  const removeMainThumbnail = async () => {
    if (listing.thumbnail_url) {
      try {
        await removeThumbnail({
          listingId,
          userId: loggedUser?.id || "",
        });
        setListing({ ...listing, thumbnail_url: "" });

        Alert.alert("Готово", "Главната снимка е премахната");

        setShouldRefetchProfile(true);

        router.push("/profile");
      } catch (error) {
        console.error(error);
      }
    } else {
      Alert.alert("Грешка", "Няма избрана главна снимка");
    }
  };

  const handleActionPress = async (index: number) => {
    if (index === 1) {
      // images from gallery
      openPicker();
    }

    if (index === 2) {
      // take photo
      takePhoto();
    }

    if (index === 3) {
      // remove main thumbnail image
      removeMainThumbnail();
    }
  };

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (actionSheetRef.current !== null) {
      actionSheetRef.current.show();
    }
  };

  const updateListingHandler = async () => {
    if (!listing.phone_number1 || !listing.title) {
      Alert.alert("Грешка", "Моля попълнете всички полета");
      return;
    }

    setUploading(true);
    try {
      await updateListing({
        form: listing,
        listingId,
        userId: loggedUser?.id || "",
      });
      Alert.alert("Готово", "Публикацията е успешно редактирана");

      setShouldRefetchProfile(true);

      router.push("/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Грешка", "Грешка при качването на публикацията");
    } finally {
      setListing({
        title: "",
        thumbnail_url: "",
        phone_number1: "",
        description: "",
      });
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [listingId]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAwareScrollView className="px-4" extraHeight={120}>
        <Text className="text-2xl text-white font-psemibold">
          Редактирай обява
        </Text>

        <FormField
          title="Заглавие на обявата"
          value={listing?.title || ""}
          handleChangeText={(e) => {
            setListing({ ...listing, title: e });
          }}
          otherStyles={`mt-10 
          }`}
        />

        <FormField
          title="Описание"
          value={listing?.description || ""}
          handleChangeText={(e) => {
            setListing({ ...listing, description: e });
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
              showActionSheet();
            }}
          >
            {listing?.thumbnail_url ? (
              <Image
                source={{
                  uri: listing.thumbnail_url.uri
                    ? listing.thumbnail_url.uri
                    : getImageUrl({
                        bucketName: "listings_bucket",
                        imagePath: listing.thumbnail_url,
                      }),
                }}
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
          value={listing.phone_number1}
          handleChangeText={(e) => {
            setListing({ ...listing, phone_number1: e });
          }}
          otherStyles="mt-7"
        />

        <CustomButton
          title={uploading ? "Запазване..." : "Запази"}
          handlePress={updateListingHandler}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </KeyboardAwareScrollView>
      <ActionSheet
        ref={actionSheetRef}
        options={[
          "Cancel",
          "Снимка от галерия",
          "Направи снимка",
          "Премахни главна снимка",
        ]}
        cancelButtonIndex={0}
        onPress={handleActionPress}
      />
    </SafeAreaView>
  );
};

export default Edit;
