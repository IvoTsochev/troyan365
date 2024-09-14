import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { icons } from "../constants";
import { ResizeMode, Video } from "expo-av";
import { Menu, Provider } from "react-native-paper";
import { deleteListing } from "../lib/appwrite";

type PropTypes = {
  video: {
    title: string;
    thumbnail_url: string;
    video: string;
    $id: string;
    creator: {
      username: string;
      avatar: string;
      $id: string;
    };
  };
};

const VideoCard = ({
  video: {
    title,
    thumbnail_url,
    video,
    $id: listingId,
    creator: { username, avatar, $id: creatorId },
  },
}: PropTypes) => {
  const [play, setPlay] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleDelete = () => {
    Alert.alert(
      "Потвърди изтриване",
      "Сигурен ли си че искаш да изтриеш този пост?",
      [
        { text: "Откажи", style: "cancel" },
        {
          text: "Изтрии",
          onPress: async () => {
            try {
              await deleteListing(listingId);
            } catch (error) {
              console.error("Error deleting listing:", error);
            }
          },
        },
      ]
    );
    closeMenu();
  };

  const handleMarkInactive = () => {
    console.log("Listing marked as inactive");
    closeMenu();
  };

  return (
    <Provider>
      <View className="flex-col items-center px-4 mb-14">
        <View className="flex-row gap-3 items-start">
          <View className="justify-center items-center flex-row flex-1">
            <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
              <Image
                source={{ uri: avatar }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>
            <View className="justify-center flex-1 ml-3 gap-y-1">
              <Text
                className="text-white font-psemibold text-sm"
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text
                className="text-xs text-gray-100 font-pregular"
                numberOfLines={1}
              >
                {username}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="pt-2"
            onPress={openMenu}
            onLayout={(event) => {
              const { x, y } = event.nativeEvent.layout;
              setMenuAnchor({ x, y });
            }}
          >
            <Image
              source={icons.menu}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={{ x: menuAnchor.x, y: menuAnchor.y + 10 }}
          >
            <Menu.Item onPress={handleDelete} title="Изтрии" />
            <Menu.Item onPress={handleMarkInactive} title="Де-активирай" />
          </Menu>
        </View>

        {play ? (
          <Video
            source={{ uri: video }}
            className="w-full h-60 rounded-xl mt-3"
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={(status: any) => {
              console.log("Playback status:", status);
              if (status.didJustFinish) {
                setPlay(false);
              }
            }}
            isMuted
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPlay(true)}
            className="w-full h-60 rounded-xl mt-3 relative justify-center items-center border-2 border-white/20"
          >
            <Image
              source={{ uri: thumbnail_url }}
              className="w-full h-full rounded-xl mt-3"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      </View>
    </Provider>
  );
};

export default VideoCard;
