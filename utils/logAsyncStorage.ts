// debugUtils.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const logAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log("AsyncStorage contents:", items);
  } catch (error) {
    console.error("Error logging AsyncStorage:", error);
  }
};
