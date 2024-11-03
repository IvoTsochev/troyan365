import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
// Components
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
// Utils
import { resetPassword } from "../../lib/supabase";
import { Alert, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        "Успешно",
        "Изпратихме ви имейл с линк за възстановяване на паролата."
      );
      router.push("/home");
    } catch (error) {
      Alert.alert(
        "Грешка",
        "Възникна грешка при изпращането на имейл за възстановяване на паролата."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full justify-center items-center">
      <KeyboardAwareScrollView className="px-4 h-full w-full" extraHeight={10}>
        <Text>Forgot Password screen</Text>
        <FormField
          title=""
          value={email}
          handleChangeText={(e) => setEmail(e)}
          otherStyles=""
          placeholder="your@email.com"
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

export default ForgotPassword;
