import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../store/useAuth';
import axios from '../api/axios';
import UserHeader from '../components/UserHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestoreScreen() {
  const { setToken, setMnemonic } = useAuth();
  const [phrase, setPhrase] = useState('');

  const restore = async () => {
    try {
      const res = await axios.post('/auth/restore', { mnemonic: phrase });
      setToken(res.data.token);
      setMnemonic(phrase);
      Alert.alert('✅ Restored');
    } catch {
      Alert.alert('❌ Invalid or failed restore');
    }
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <UserHeader />
      <TextInput
        placeholder="Enter 24-word phrase"
        value={phrase}
        onChangeText={setPhrase}
        multiline
        style={{ borderWidth: 1, padding: 10 }}
      />
      <Button title="Restore" onPress={restore} />
    </SafeAreaView>
  );
}
