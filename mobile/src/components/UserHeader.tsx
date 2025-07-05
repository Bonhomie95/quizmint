import { View, Text, Image, StyleSheet } from 'react-native';
import { useUser } from '../store/useUser';

export default function UserHeader() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <View style={{ 
  borderWidth: 3, 
  borderColor: user.tier?.color || '#d1d5db', 
  borderRadius: 100,
  padding: 3 
}}>
  <Image source={{ uri: user.avatar }} style={{ width: 80, height: 80, borderRadius: 100 }} />
  <Text style={{ position: 'absolute', bottom: -8, right: -8 }}>
    {user.tier?.emoji || '🥚'}
  </Text>
  <Text style={styles.username}>{user.username}</Text>
</View>

  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
