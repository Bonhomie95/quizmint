import React, { useEffect, useState } from 'react';
import {
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  Alert,
  Clipboard,
  View,
} from 'react-native';
import axios from '../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native'; // to refresh on screen open
import { Ionicons } from '@expo/vector-icons';
import * as ClipboardAPI from 'expo-clipboard';

export default function BackupScreen() {
  const isFocused = useIsFocused();

  const [mnemonic, setMnemonic] = useState('');
  const [hasBackup, setHasBackup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restoreInput, setRestoreInput] = useState('');
  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState('');

  const checkBackupStatus = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setHasBackup(!!data.backupMnemonicHash);
    } catch {
      Alert.alert('Error', 'Could not check backup status');
    } finally {
      setLoading(false);
    }
  };

  const generateBackup = async () => {
    try {
      const res = await axios.post('/auth/generate-backup');
      setMnemonic(res.data.mnemonic);
      setHasBackup(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to generate backup';
      Alert.alert('Error', msg);
    }
  };

  const handleRestore = async () => {
    if (!restoreInput.trim()) {
      return setRestoreMsg('⚠️ Please enter your backup phrase');
    }

    try {
      const { data } = await axios.post('/auth/restore', {
        mnemonic: restoreInput,
      });
      setRestoreMsg(`✅ Restored as ${data.user.username}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Restore failed';
      setRestoreMsg(`❌ ${msg}`);
    }
  };

  const copyToClipboard = async () => {
    await ClipboardAPI.setStringAsync(mnemonic);
    Alert.alert('Copied ✅', 'Backup phrase copied to clipboard');
  };

  useEffect(() => {
    if (isFocused) {
      checkBackupStatus();
      setMnemonic('');
      setRestoreInput('');
      setShowRestoreInput(false);
      setRestoreMsg('');
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
        🔐 Backup your account with a 24-word phrase
      </Text>

      {!hasBackup ? (
        <Button title="Generate Backup Phrase" onPress={generateBackup} />
      ) : (
        <Button
          title="Restore From Backup"
          onPress={() => setShowRestoreInput(true)}
        />
      )}

      {mnemonic ? (
        <View
          style={{
            marginTop: 16,
            backgroundColor: '#f3f4f6',
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text
            selectable
            style={{ fontStyle: 'italic', fontSize: 14, marginBottom: 10 }}
          >
            {mnemonic}
          </Text>
          <TouchableOpacity
            onPress={copyToClipboard}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: '#4f46e5',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 6,
            }}
          >
            <Ionicons name="copy-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', marginLeft: 6 }}>Copy Phrase</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showRestoreInput && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            placeholder="Paste your 24-word backup phrase"
            multiline
            numberOfLines={3}
            value={restoreInput}
            onChangeText={setRestoreInput}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
            }}
          />
          <Button title="Restore Now" onPress={handleRestore} />
          {restoreMsg ? (
            <Text
              style={{
                marginTop: 10,
                color: restoreMsg.includes('✅') ? '#16a34a' : '#dc2626',
              }}
            >
              {restoreMsg}
            </Text>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}
