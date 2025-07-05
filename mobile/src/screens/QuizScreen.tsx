import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import ConfettiCannonLib from 'react-native-confetti-cannon';
import ModalLib from 'react-native-modal';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { useUser } from '../store/useUser';
import questionsData from '../assets/questions.json';
import { RootStackParamList } from '../types/navigation';
import { Question } from '../types/question';
import UserHeader from '../components/UserHeader';

const ConfettiCannon = ConfettiCannonLib as any;
const Modal = ModalLib as any;
const { width } = Dimensions.get('window');

const categoryEmojis: Record<string, string> = {
  Geography: '🗺️',
  History: '🏛️',
  Puzzle: '🧩',
  Science: '🔬',
  Logic: '🧠',
};

type QuizRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

export default function QuizScreen() {
  const route = useRoute<QuizRouteProp>();
  const navigation = useNavigation();
  const { category } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [selected, setSelected] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coinAnim] = useState(new Animated.Value(0));
  const { user, setUser } = useUser();
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   const all = (questionsData as Record<string, Question[]>)[category];

  //   if (all && all.length) {
  //     const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 10);
  //     setQuestions(shuffled);
  //     setLoadingQuestion(false); // ✅ this was missing
  //   } else {
  //     Alert.alert('❌ No questions found for this category');
  //     navigation.goBack();
  //   }
  // }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { data } = await axios.post('/generate-questions', { category });
        setQuestions(data.questions);
        setLoadingQuestion(false);
      } catch (err) {
        Alert.alert('❌ Error', 'Could not load questions');
        console.log(err)
        navigation.goBack();
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      Alert.alert('⏱️ Time’s Up!', 'Game Over', [
        { text: 'Return Home', onPress: endGame },
      ]);
      return;
    }

    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

  const shareScore = async () => {
    const message = `🎉 I just scored ${score}/${questions.length} in ${category} on QuizMint!\nJoin me & earn crypto 👉 https://quizmint.app?ref=${user?.uuid}`;
    try {
      await Share.share({ message, title: 'QuizMint Score' });
      await axios.post('/user/shared');
      Alert.alert('✅ Shared!', 'You may receive bonus coins for sharing.');
    } catch (err) {
      console.warn('Sharing error:', err);
    }
  };

  const playCelebration = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/celebration.mp3')
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Sound error:', e);
    }
  };

  const endGame = async () => {
    if (timerRef.current) clearTimeout(timerRef.current); // ✅ Stop timer
    if (soundRef.current) await soundRef.current.stopAsync();

    setShowModal(false);
    navigation.navigate('Home' as never);
  };

  const animateCoin = () => {
    coinAnim.setValue(0);
    Animated.timing(coinAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const selectAnswer = async (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = questions[currentIndex].answer;
    const isCorrect = option === correct;

    if (isCorrect) {
      setScore((s) => s + 1);
      animateCoin();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (!isCorrect) {
        Alert.alert('💥 Wrong Answer', 'Game Over!', [
          { text: 'Return Home', onPress: endGame },
        ]);
      } else {
        nextQuestion();
      }
    }, 800);
  };

  const nextQuestion = () => {
    setLoadingQuestion(true);
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(10);
        setShowHint(false);
        setSelected('');
      } else {
        finishQuiz();
      }
      setLoadingQuestion(false);
    }, 1000);
  };

  const finishQuiz = async () => {
    setShowConfetti(true);
    setShowModal(true);
    await playCelebration();
    try {
      const { data } = await axios.post('/session/save', {
        category,
        score,
        total: questions.length,
        usedHints: showHint ? 1 : 0,
      });
      setTotalPoints(data.totalPoints);
      setUser({ ...user!, allTimePoints: data.updatedPoints });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (soundRef.current) await soundRef.current.stopAsync();
    } catch (err) {
      console.warn('Session save failed:', err);
    }
  };

  const useHint = async () => {
    if (showHint) return;
    try {
      const { data } = await axios.post('/session/hint');
      setShowHint(true);
      setUser({ ...user!, coins: data.coins });
    } catch {
      Alert.alert('❌ Not enough coins for hint');
    }
  };

  const q = questions[currentIndex] || null;

  if (loadingQuestion || !q) {
    return (
      <SafeAreaView style={styles.container}>
        <UserHeader />
        <ActivityIndicator
          size="large"
          color="#4f46e5"
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <UserHeader />
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <Text style={styles.timer}>⏱️ {timeLeft}s</Text>
      <Text style={styles.categoryTitle}>
        {categoryEmojis[category] || '❓'} {category} — {currentIndex + 1}/
        {questions.length}
      </Text>

      <Text style={styles.questionText}>{q.question}</Text>

      {showHint && q.hint && <Text style={styles.hintText}>💡 {q.hint}</Text>}

      {!showHint && q.hint && (
        <TouchableOpacity onPress={useHint} style={styles.hintButton}>
          <Text>💡 Use Hint (-50 coins)</Text>
        </TouchableOpacity>
      )}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {q.options.map((opt) => {
          const isCorrect = selected && opt === q.answer;
          const isWrong = selected === opt && opt !== q.answer;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => selectAnswer(opt)}
              style={[
                styles.optionButton,
                isCorrect && { backgroundColor: '#bbf7d0' },
                isWrong && { backgroundColor: '#fecaca' },
                { width: '48%' },
              ]}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.Text
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          fontSize: 22,
          color: '#10b981',
          opacity: coinAnim,
          transform: [
            {
              translateY: coinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -40],
              }),
            },
          ],
        }}
      >
        +1 🧠
      </Animated.Text>

      {showConfetti && (
        <>
          <View style={styles.dimBackground} />
          <ConfettiCannon count={100} origin={{ x: width / 2, y: 0 }} />
        </>
      )}

      <Modal isVisible={showModal}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>🎉 Quiz Complete!</Text>
          <Text style={styles.modalScore}>
            Score: {score} / {questions.length}
          </Text>
          {totalPoints !== null && (
            <Text style={{ fontSize: 18, marginTop: 8, color: '#22c55e' }}>
              +{totalPoints} Points Earned!
            </Text>
          )}
          <TouchableOpacity style={styles.shareButton} onPress={shareScore}>
            <Text style={{ color: '#1f2937', textAlign: 'center' }}>
              📤 Share Score
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={endGame}>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              🔙 Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {showModal && (
        <LottieView
          autoPlay
          loop={false}
          source={require('../assets/lottie/coin.json')}
          style={styles.lottieStyle}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#4f46e5',
    height: '100%',
  },
  timer: { textAlign: 'right', color: 'gray', marginVertical: 4 },
  categoryTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  questionText: { fontSize: 22, fontWeight: '600', marginVertical: 10 },
  optionButton: {
    padding: 15,
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    marginVertical: 5,
  },
  optionText: { fontSize: 18 },
  hintButton: {
    backgroundColor: '#fef08a',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  hintText: {
    fontStyle: 'italic',
    color: 'gray',
    marginBottom: 10,
  },
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 22, marginBottom: 10 },
  modalScore: { fontSize: 18, color: 'gray' },
  backButton: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  lottieStyle: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  shareButton: {
    marginTop: 10,
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
});
