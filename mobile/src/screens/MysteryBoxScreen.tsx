import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from '../api/axios';
import { useUser } from '../store/useUser';

export default function MysteryBoxScreen() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [box, setBox] = useState(null as any);
  const [timeLeft, setTimeLeft] = useState('');

  const fetchBox = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/box/my-latest');
      setBox(data.box);
      updateCountdown(data.box.unlockAt);
    } catch (err: any) {
      Alert.alert(
        'No Mystery Box',
        err.response?.data?.message || 'No box available.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = (unlockTime: string) => {
    const interval = setInterval(() => {
      const now = new Date();
      const unlock = new Date(unlockTime);
      const diff = unlock.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Ready to Open!');
        clearInterval(interval);
        return;
      }

      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${hrs}h ${mins}m remaining`);
    }, 1000);
  };

  const fastUnlock = async () => {
    if (!user) return;

    const now = new Date();
    const unlock = new Date(box.unlockAt);
    const hoursLeft = Math.ceil((unlock.getTime() - now.getTime()) / 3600000);
    const cost = hoursLeft * 50;

    if (user.coins < cost) {
      return Alert.alert(
        'Insufficient Coins',
        `You need ${cost} coins to unlock now.`
      );
    }

    const confirm = await new Promise((resolve) => {
      Alert.alert(
        'Fast Unlock?',
        `Spend ${cost} coins to unlock this box now?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Unlock', onPress: () => resolve(true) },
        ]
      );
    });

    if (confirm) {
      try {
        const { data } = await axios.post('/box/unlock', { boxId: box._id });
        setUser({ ...user, coins: data.coins }); // ✅ safe to use now
        fetchBox();
        Alert.alert('Unlocked!', 'Box is now ready to open');
      } catch (err: any) {
        Alert.alert(
          'Error',
          err.response?.data?.message || 'Could not unlock.'
        );
      }
    }
  };

  const openBox = async () => {
    try {
      const { data } = await axios.post('/box/open', { boxId: box._id });
      setUser({ ...user!, coins: data.coins });
      setBox(null);
      Alert.alert(
        '🎁 You Won!',
        `${data.reward} coins from the ${box.boxType} box`
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Could not open box.'
      );
    }
  };

  useEffect(() => {
    fetchBox();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  if (!box)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎁 No Mystery Box Yet</Text>
        <Text style={styles.subtitle}>
          Win quizzes or level up to earn one!
        </Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎁 {box.boxType.toUpperCase()} Box</Text>
      <Text style={styles.subtitle}>{timeLeft}</Text>

      {timeLeft === 'Ready to Open!' ? (
        <TouchableOpacity onPress={openBox} style={styles.button}>
          <Text style={styles.buttonText}>Open Now</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={fastUnlock}
          style={[styles.button, { backgroundColor: '#facc15' }]}
        >
          <Text style={styles.buttonText}>Fast Unlock</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
