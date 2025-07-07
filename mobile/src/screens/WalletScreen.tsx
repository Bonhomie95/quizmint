import React, { useState } from 'react';
import { TextInput, Button, Text } from 'react-native';
import axios from '../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from '../components/UserHeader';

export default function WalletScreen() {
  const [wallet, setWallet] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');

  const updateWallet = async () => {
    try {
      const { data } = await axios.post('/update-wallet', { wallet, pin });
      setMsg('Wallet updated: ' + data.wallet);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <UserHeader />
      <TextInput
        placeholder="Enter new wallet address"
        value={wallet}
        onChangeText={setWallet}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Update Wallet" onPress={updateWallet} />
      {msg && <Text style={{ marginTop: 10 }}>{msg}</Text>}
    </SafeAreaView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },
};
