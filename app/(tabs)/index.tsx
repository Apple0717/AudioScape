import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  View,
  Text,
} from "react-native";
import { HomeFeed } from "@/components/HomeFeed";
import innertube from "@/components/yt";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

interface FeedResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface HomeFeedType {
  sections?: (MusicCarouselShelf | MusicTasteBuilderShelf)[];
}

interface MusicCarouselShelf {
  contents?: any[];
}

interface MusicTasteBuilderShelf {}

function isMusicCarouselShelf(
  section: MusicCarouselShelf | MusicTasteBuilderShelf
): section is MusicCarouselShelf {
  return "contents" in section;
}

export default function HomeScreen() {
  const [homeFeedResults, setHomeFeedResults] = useState<FeedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { top, bottom } = useSafeAreaInsets();
  const { playAudio } = useMusicPlayer();
  const router = useRouter();

  useEffect(() => {
    const getHomeFeed = async () => {
      setIsLoading(true);
      try {
        const yt = await innertube;
        const homeFeed: HomeFeedType = await yt.music.getHomeFeed();

        if (homeFeed?.sections && homeFeed.sections.length > 0) {
          const firstSection = homeFeed.sections[0];

          if (
            isMusicCarouselShelf(firstSection) &&
            Array.isArray(firstSection.contents)
          ) {
            const formattedResults: FeedResult[] = firstSection.contents
              .filter((item: any) => item?.id && item?.title)
              .map((item: any) => ({
                id: item.id,
                title: item.title,
                artist: item.artists?.[0]?.name ?? "Unknown Artist",
                thumbnail:
                  item.thumbnail?.contents?.[0]?.url ??
                  "https://placehold.co/50",
              }));
            setHomeFeedResults(formattedResults);
          } else {
            setHomeFeedResults([]);
            Alert.alert("No results", "No songs found in the home feed.");
          }
        } else {
          setHomeFeedResults([]);
          Alert.alert("No results", "Unable to fetch home feed.");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An error occurred while fetching the home feed. Please try again."
        );
      }
      setIsLoading(false);
    };

    getHomeFeed();
  }, []);

  const handleSongSelect = (song: FeedResult) => {
    playAudio(song);
  };

  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/transparent-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>AudioScape</Text>
        <EvilIcons
          name={"search"}
          color={"white"}
          style={{ marginLeft: 165 }}
          size={35}
          onPress={() => {
            router.navigate("/(tabs)/search");
          }}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <HomeFeed results={homeFeedResults} onItemClick={handleSongSelect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 5,
    borderRadius: 50,
  },
});
