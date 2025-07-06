import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from '../components/UserHeader';

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <UserHeader />
      <Text style={{ fontSize: 22, marginBottom: 20 }}>⚙️ Settings</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('EditProfile' as never)}
        style={btnStyle}
      >
        <Text>✏️ Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('SetPIN' as never)}
        style={btnStyle}
      >
        <Text>🔐 Set / Change PIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Wallet' as never)}
        style={btnStyle}
      >
        <Text>💸 Manage Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Backup' as never)}
        style={btnStyle}
      >
        <Text>🧬 Backup Game (Optional)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const btnStyle = {
  backgroundColor: '#f4f4f5',
  padding: 14,
  borderRadius: 8,
  marginBottom: 12,
};
