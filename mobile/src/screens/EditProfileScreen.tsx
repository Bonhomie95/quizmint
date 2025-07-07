import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Filter } from 'bad-words';
import { useUser } from '../store/useUser';
import axios from '../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import UserHeader from '../components/UserHeader';

const avatarChoices = [
  'https://i.pravatar.cc/150?u=a',
  'https://i.pravatar.cc/150?u=b',
  'https://i.pravatar.cc/150?u=c',
  'https://i.pravatar.cc/150?u=d',
  'https://i.pravatar.cc/150?u=e',
  'https://i.pravatar.cc/150?u=f',
];

const nicknamePrefixes = ['Speedy', 'Nimble', 'Witty', 'Zen', 'Turbo', 'Epic'];
const nicknameAnimals = ['Tiger', 'Panda', 'Falcon', 'Otter', 'Lynx', 'Dino'];

export default function EditProfileScreen() {
  const { user, setUser } = useUser();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const filter = new Filter();

  const updateProfile = async () => {
    if (!username || !avatar) {
      Alert.alert('❌ Error', 'Username and avatar are required');
      return;
    }

    if (filter.isProfane(username)) {
      Alert.alert('❌ Inappropriate username');
      return;
    }

    if (username.length < 3 || username.length > 50) {
      Alert.alert('❌ Error', 'Username must be between 3 and 50 characters');
      return;
    }

    if (!user) {
      Alert.alert('User not found in store.');
      return;
    }

    try {
      const { data } = await axios.patch('/user/update-profile', {
        username,
        avatar,
      });

      setUser({ ...user, username: data.username, avatar: data.avatar });
      Alert.alert('✅ Profile updated');
    } catch (err: any) {
      Alert.alert('❌ Error', err.response?.data?.message || 'Update failed');
      console.log('Update error:', err);
    }
  };

  const generateNickname = () => {
    const prefix =
      nicknamePrefixes[Math.floor(Math.random() * nicknamePrefixes.length)];
    const animal =
      nicknameAnimals[Math.floor(Math.random() * nicknameAnimals.length)];
    const number = Math.floor(Math.random() * 900 + 100);
    setUsername(`${prefix}${animal}${number}`);
  };

  const generateAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://i.pravatar.cc/150?u=${randomSeed}`);
  };

  if (!user) {
    return (
      <SafeAreaView style={{ padding: 20 }}>
        <Text>Loading user data...</Text>
      </SafeAreaView>
    );
  }
  if (!user.uuid) {
    return (
      <SafeAreaView style={{ padding: 20 }}>
        <Text style={{ color: 'red' }}>User not authenticated.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <UserHeader />
      <Text style={styles.title}>✍️ Edit Profile</Text>
      <Text style={{ fontSize: 16, color: user.tier?.color }}>
        Tier {user.tier?.level} — {user.tier?.emoji}
      </Text>

      <TextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <View style={styles.actionRow}>
        <Button title="🎲 Nickname" onPress={generateNickname} />
        <Button title="🔀 New Avatar" onPress={generateAvatar} />
      </View>

      <Text style={{ marginVertical: 10 }}>Pick an Avatar:</Text>
      <FlatList
        data={avatarChoices}
        keyExtractor={(url) => url}
        horizontal
        renderItem={({ item }) => {
          const isSelected = avatar === item;
          return (
            <TouchableOpacity
              onPress={() => setAvatar(item)}
              style={{ marginRight: 12 }}
            >
              <Animatable.View
                animation={isSelected ? 'pulse' : undefined}
                duration={400}
                iterationCount="infinite"
                style={styles.avatarWrapper}
              >
                <Image
                  source={{ uri: item }}
                  style={[
                    styles.avatar,
                    isSelected && { borderWidth: 3, borderColor: '#4f46e5' },
                  ]}
                />
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4f46e5"
                    style={styles.checkmark}
                  />
                )}
              </Animatable.View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="✅ Save Changes" onPress={updateProfile} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ccc',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});
