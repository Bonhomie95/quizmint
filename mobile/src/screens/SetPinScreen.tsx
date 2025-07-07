import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../api/axios';
import { useUser } from '../store/useUser';
import UserHeader from '../components/UserHeader';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import {} from 'react-native';
import LottieView from 'lottie-react-native'; // ✅ Add this to show checkmark
import CheckAnimation from '../assets/lottie/check.json'; // your success tick animation

export default function SetPinScreen() {
  const { user } = useUser();
  const hasPin = !!user?.hasPin;

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const isValid6DigitPin = (pin: string) => /^\d{6}$/.test(pin);

  const isWeakPin = (pin: string) => {
    const repeated = /^(\d)\1{5}$/; // e.g., 111111
    const ascending = '0123456789';
    const descending = '9876543210';
    return (
      repeated.test(pin) || ascending.includes(pin) || descending.includes(pin)
    );
  };

  const submitPin = async () => {
    if (loading) return;
    Keyboard.dismiss();

    if (!isValid6DigitPin(newPin) || !isValid6DigitPin(confirmPin)) {
      return Alert.alert('❌ Invalid PIN', 'PIN must be exactly 6 digits');
    }

    if (newPin !== confirmPin) {
      return Alert.alert('❌ PIN Mismatch', "New and confirm PIN don't match");
    }

    if (isWeakPin(newPin)) {
      return Alert.alert('❌ Weak PIN', 'Please choose a less predictable PIN');
    }

    if (hasPin && !isValid6DigitPin(oldPin)) {
      return Alert.alert('❌ Missing', 'Old PIN is required to update');
    }

    setLoading(true);
    try {
      const body = hasPin ? { pin: newPin, oldPin } : { pin: newPin };
      const { data } = await axios.post('/auth/set-pin', body);

      Vibration.vibrate(100);
      setSuccess(true);
      setMsg(data.message);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setAttempts(0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update PIN';
      setMsg(errorMsg);
      setSuccess(false);
      setAttempts((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const PinStrengthMeter = ({ pin }: { pin: string }) => {
    const isStrong = pin.length === 6 && !isWeakPin(pin);
    return (
      <View style={{ marginVertical: 6 }}>
        <Text style={{ color: isStrong ? 'green' : 'orange' }}>
          {isStrong ? '✅ Strong PIN' : pin.length === 6 ? '⚠️ Weak PIN' : ''}
        </Text>
      </View>
    );
  };

  {
    loading ? (
      <ActivityIndicator
        size="large"
        color="#4f46e5"
        style={{ marginTop: 20 }}
      />
    ) : (
      <Button
        title={hasPin ? 'Update PIN' : 'Set PIN'}
        onPress={submitPin}
        disabled={attempts >= 5}
      />
    );
  }

  {
    attempts >= 5 && (
      <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
        ⚠️ Too many failed attempts. Try again later.
      </Text>
    );
  }

  {
    success && (
      <LottieView
        source={CheckAnimation}
        autoPlay
        loop={false}
        style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 10 }}
      />
    );
  }
  const InputField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
  }) => {
    const handleChange = (text: string) => {
      // Only allow digits and limit to 6 characters — avoid forceful mutation
      if (/^\d{0,6}$/.test(text)) {
        onChange(text);
      }
    };

    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.pinWrapper}>
          <TextInput
            value={value}
            onChangeText={handleChange}
            keyboardType="number-pad"
            secureTextEntry={!showPin}
            style={styles.input}
            maxLength={6}
            placeholder="Enter 6-digit PIN"
            returnKeyType="done"
            blurOnSubmit={false}
            textContentType="oneTimeCode"
            autoComplete="off"
            autoCapitalize="none"
            onSubmitEditing={Keyboard.dismiss}
            onFocus={() => setMsg('')} // Clear message on focus
            onBlur={() => {
              if (value.length < 6) {
                setMsg('❗ PIN must be exactly 6 digits');
              } else {
                setMsg('');
              }
            }}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity onPress={() => setShowPin(!showPin)}>
            <Ionicons
              name={showPin ? 'eye-off' : 'eye'}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <UserHeader />
      <Text style={styles.header}>
        {hasPin ? '🔐 Update Wallet PIN' : '🔐 Set Wallet PIN'}
      </Text>

      {hasPin && (
        <InputField label="Old PIN" value={oldPin} onChange={setOldPin} />
      )}

      <InputField label="New PIN" value={newPin} onChange={setNewPin} />
      <InputField
        label="Confirm New PIN"
        value={confirmPin}
        onChange={setConfirmPin}
      />

      <View style={{ marginTop: 20 }}>
        <Button title={hasPin ? 'Update PIN' : 'Set PIN'} onPress={submitPin} />
      </View>

      {msg ? (
        <Animatable.Text
          animation={success ? 'bounceIn' : 'fadeIn'}
          style={[styles.message, { color: success ? '#16a34a' : '#dc2626' }]}
        >
          {msg}
        </Animatable.Text>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    marginTop: 14,
    marginBottom: 4,
  },
  pinWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 6,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
