import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CategorySelectScreen from '../screens/CategorySelectScreen';
import QuizScreen from '../screens/QuizScreen';
import WalletScreen from '../screens/WalletScreen';
import SetPinScreen from '../screens/SetPinScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { useAuth } from '../store/useAuth';
import { useUser } from '../store/useUser';
import type { RootStackParamList } from '../types/navigation';
import BackupScreen from '../screens/BackupScreen';
import RewardHistoryScreen from '../screens/RewardHistoryScreen';
import MysteryBoxScreen from '../screens/MysteryBoxScreen';

// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { token } = useAuth();
  const { user } = useUser();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CategorySelect" component={CategorySelectScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      {/* <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="SetPIN" component={SetPinScreen} /> */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="RewardHistory" component={RewardHistoryScreen} />
      <Stack.Screen name="MysteryBox" component={MysteryBoxScreen} />
      {token && user?.pin ? (
        <Stack.Screen name="Wallet" component={WalletScreen} />
      ) : (
        <Stack.Screen name="SetPIN" component={SetPinScreen} />
      )}
    </Stack.Navigator>
  );
}
