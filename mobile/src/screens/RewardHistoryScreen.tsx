import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../api/axios';
import dayjs from 'dayjs';

interface Transaction {
  _id: string;
  coins: number;
  type: 'earn' | 'spend';
  source: string;
  note?: string;
  createdAt: string;
}

export default function RewardHistoryScreen() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/user/reward-history');
      setHistory(data.transactions);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: any) => (
    <SafeAreaView style={styles.item}>
      <Text style={styles.title}>
        {item.type === 'earn' ? '🟢 Earned' : '🔴 Spent'} {item.coins} coins
      </Text>
      <Text style={styles.subtitle}>
        Source: {item.source} • {new Date(item.createdAt).toLocaleString()}
      </Text>
      {item.note && <Text style={styles.note}>📝 {item.note}</Text>}
      <Text style={styles.timeText}>
        {dayjs(item.timestamp).format('MMM D, YYYY • h:mm A')}
      </Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Text style={styles.header}>🪙 Reward History</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4f46e5"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 13,
  },
  note: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280', // Tailwind gray-500
    marginTop: 4,
    fontStyle: 'italic',
  },
});
