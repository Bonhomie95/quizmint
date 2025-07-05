import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from '../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from '../components/UserHeader';

export default function SetPinScreen() {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState('');

  const submitPin = async () => {
    if (newPin !== confirmPin) return setMsg("PINs don't match");
    try {
      const { data } = await axios.post('/set-pin', { pin: newPin, oldPin });
      setMsg(data.message);
    } catch (err:any) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <UserHeader />
      <Text>Old PIN (if changing)</Text>
      <TextInput keyboardType="numeric" secureTextEntry value={oldPin} onChangeText={setOldPin} style={styles.input} />
      <Text>New PIN</Text>
      <TextInput keyboardType="numeric" secureTextEntry value={newPin} onChangeText={setNewPin} style={styles.input} />
      <Text>Confirm New PIN</Text>
      <TextInput keyboardType="numeric" secureTextEntry value={confirmPin} onChangeText={setConfirmPin} style={styles.input} />
      <Button title="Set PIN" onPress={submitPin} />
      {msg && <Text style={{ marginTop: 10 }}>{msg}</Text>}
    </SafeAreaView>
  );
}

const styles = {
  input: {
    borderWidth: 1, padding: 10, marginVertical: 6, borderRadius: 6,
  },
};
