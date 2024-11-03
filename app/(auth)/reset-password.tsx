import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
// Components
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
// Utils
// import { resetPassword } from "../../lib/supabase";
import { Alert, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  useRouter,
  useLocalSearchParams,
  useGlobalSearchParams,
} from "expo-router";
import { updateUserAuthData } from "../../lib/supabase";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { token, email } = useLocalSearchParams();

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Грешка", "Моля въведете нова парола.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Грешка", "Паролата трябва да бъде поне 6 символа.");
      return;
    }

    setLoading(true);

    try {
      await updateUserAuthData({
        newPassword: newPassword,
      });

      router.push("/sign-in");
    } catch (error) {
      Alert.alert(
        "Грешка",
        "Възникна грешка при възстановяването на паролата."
      );
      // router.push("/home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full justify-center items-center">
      <KeyboardAwareScrollView className="px-4 h-full w-full" extraHeight={10}>
        <Text className="text-white text-2xl">Reset Password screen</Text>
        <FormField
          title="Парола"
          value={newPassword}
          handleChangeText={(e) => setNewPassword(e)}
          otherStyles=""
          placeholder="нова парола"
        />
        <View className="w-full flex justify-center items-center">
          <CustomButton
            title="Възстанови парола"
            handlePress={() => handleResetPassword()}
            containerStyles="w-3/4 mt-5"
            isLoading={loading}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
