import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import UserHeader from '../components/UserHeader';


const { width } = Dimensions.get('window');

const categories = [
  {
    name: 'Geography',
    emoji: '🗺️',
    animation: require('../assets/lottie/history.json'),
  },
  {
    name: 'History',
    emoji: '📜',
    animation: require('../assets/lottie/history.json'),
  },
  {
    name: 'Puzzle',
    emoji: '🧩',
    animation: require('../assets/lottie/history.json'),
  },
  {
    name: 'Science',
    emoji: '🧪',
    animation: require('../assets/lottie/history.json'),
  },
  {
    name: 'Logic',
    emoji: '💡',
    animation: require('../assets/lottie/history.json'),
  },
];

export default function CategorySelectScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState<string | null>(null);

  const goToQuiz = (category: string) => {
    setSelected(category);
    setTimeout(() => {
      navigation.navigate('Quiz', { category });
    }, 400); // small delay for pulse effect
  };

  return (
    <SafeAreaView style={styles.container}>
      <UserHeader />
      <Text style={styles.title}>🧠 Choose a Category</Text>

      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.name}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => {
          const isSelected = selected === item.name;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => goToQuiz(item.name)}
            >
              <LottieView
                source={item.animation}
                autoPlay
                loop
                style={styles.lottie}
              />
              <Text style={styles.categoryText}>
                {item.emoji} {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  card: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: '#e0e7ff',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#4f46e5',
    transform: [{ scale: 1.05 }],
  },
  lottie: {
    width: 60,
    height: 60,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    color: '#1f2937',
    textAlign: 'center',
  },
});
