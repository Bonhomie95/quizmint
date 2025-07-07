import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../store/useUser';
import { useNavigation } from '@react-navigation/native';
import axios from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StreakPreviewModal from '../components/StreakPreviewModal';

export default function HomeScreen() {
  const { user, setUser } = useUser();
  const navigation = useNavigation();
  const [showPreview, setShowPreview] = useState(false);

  const fallbackAvatar = 'https://i.pravatar.cc/150?u=guest';
  const fallbackUsername = 'Guest' + Math.floor(Math.random() * 100000);

  // ✅ Detect referral from deep link URL
  const checkForReferral = async () => {
    const url = await Linking.getInitialURL();
    if (url?.includes('?ref=')) {
      const ref = url.split('?ref=')[1];
      await AsyncStorage.setItem('ref_code', ref);
      console.log('📥 Referral code saved:', ref);
    }
  };

  // ✅ Auto-register or load existing user
  const bootstrap = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');

      if (!storedToken) {
        const ref = await AsyncStorage.getItem('ref_code');
        const endpoint = ref ? `/auth/register?ref=${ref}` : '/auth/register';

        const { data } = await axios.post(endpoint);

        await AsyncStorage.setItem('auth_token', data.token);
        setUser(data.user);
        console.log('✅ New user registered:', data.user);
      } else {
        // token already saved, axios interceptor will handle Authorization
        const { data } = await axios.get('/user/me');
        setUser(data.user);
        console.log('✅ Existing user loaded:', data.user);
      }
    } catch (err) {
      console.warn('❌ Failed to initialize user:', err);
      await AsyncStorage.removeItem('auth_token'); // remove malformed/expired
      setUser(null);
    }
  };

  useEffect(() => {
    if (user?.streak === 1) {
      setShowPreview(true);
    }
  }, [user?.streak]);

  useEffect(() => {
    checkForReferral().finally(() => bootstrap());
  }, []);

  const avatar = user?.avatar || fallbackAvatar;
  const username = user?.username || fallbackUsername;
  const coins = user?.coins ?? 0;

  const claimStreak = async () => {
    try {
      const { data } = await axios.post('/session/streak');
      setUser({ ...user!, streak: data.streak, coins: data.coins });
      Alert.alert(
        '🎉 Daily Claim',
        `+${data.bonus} coins for Day ${data.streak}`
      );
    } catch (err: any) {
      Alert.alert('Oops', err.response?.data?.message || 'Already claimed');
    }
  };

  const shareApp = async () => {
    const message = `🔥 Play QuizMint & earn crypto!\nUse my invite: https://quizmint.app?ref=${user?._id}`;

    try {
      await Share.share({
        message,
        title: 'Invite your friends!',
      });

      await axios.post('/user/shared'); // Reward sharer
      Alert.alert('✅ Invite shared!', 'You may receive bonus coins shortly.');
    } catch (err) {
      console.warn('Sharing error:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ padding: 20 }}>
        {/* 👤 Profile */}
        <View style={styles.profileCard}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.coins}>🪙 {coins} Coins</Text>
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate('CategorySelect' as never)}
        >
          <Text style={styles.ctaText}>🎮 Start Game</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={claimStreak} style={styles.streakCard}>
          <Text style={styles.streakText}>🔥 Claim Daily Streak</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 30, gap: 14 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard' as never)}
            style={styles.glassButtonStyle}
          >
            <Text style={styles.glassText}>📊 View Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as never)}
            style={styles.glassButtonStyle}
          >
            <Text style={styles.glassText}>⚙️ Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareApp} style={styles.glassButtonStyle}>
            <Text style={styles.glassText}>📨 Invite Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('RewardHistory' as never)}
            style={styles.glassButtonStyle}
          >
            <Text style={styles.glassText}>🪙 Reward History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPreview(true)}
            style={{ marginTop: 10 }}
          >
            <Text style={{ color: '#4f46e5', textAlign: 'center' }}>
              📈 View Streak Rewards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('MysteryBox' as never)}
            style={styles.glassButtonStyle}
          >
            <Text style={styles.glassText}>🎁 Mystery Box</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StreakPreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        currentDay={user?.streak || 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  coins: {
    fontSize: 14,
    color: '#6b7280',
  },
  cta: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  streakCard: {
    backgroundColor: '#dcfce7',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  streakText: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
  },
  glassButtonStyle: {
    paddingVertical: 14,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  glassText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
});
