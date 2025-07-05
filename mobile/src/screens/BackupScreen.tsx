import { useAuth } from '../store/useAuth';
import { View, Text, Button, Alert } from 'react-native';
import axios from '../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BackupScreen() {
  const { setMnemonic } = useAuth();

  const generateBackup = async () => {
    try {
      const res = await axios.post('/auth/generate-backup');
      const phrase = res.data.mnemonic;
      setMnemonic(phrase);
      Alert.alert('Backup Created', phrase);
    } catch {
      Alert.alert('Error', 'Could not generate backup phrase');
    }
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <Text>🔐 Backup your game with 24-word phrase</Text>
      <Button title="Generate Backup Phrase" onPress={generateBackup} />
    </SafeAreaView>
  );
}

