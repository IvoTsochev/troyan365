import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// Constants
import { images } from "../../constants";
// Components
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
// Context
import { useGlobalContext } from "../../context/GlobalProvider";
// Helpers
import { signUp } from "../../lib/supabase";

const SignUp = () => {
  const { setLoggedUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const signUpHandler = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error, user } = await signUp(
        form.username,
        form.email,
        form.password
      );

      if (error) {
        throw error;
      }

      setLoggedUser(user);
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
      <KeyboardAwareScrollView className="px-4 my-6" extraHeight={120}>
        <ScrollView>
          <View className="w-full justify-center min-h-[45vh] px-4">
            <Text className="text-2xl text-white text-semibold font-psemibold">
              Създай профил
            </Text>

            <FormField
              title="Потребителско име"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-10"
            />

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
              title={isSubmitting ? "Създаване..." : "Създай профил"}
              handlePress={signUpHandler}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />

            <View className="justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Вече имаш профил?
              </Text>
              <Link
                href="/sign-in"
                className="text-lg font-psemibold text-secondary"
              >
                Влез
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
