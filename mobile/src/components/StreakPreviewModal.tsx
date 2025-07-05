import {
  Modal,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { streakRewardsPreview } from '../utils/streakPreview';

export default function StreakPreviewModal({
  visible,
  onClose,
  currentDay,
}: {
  visible: boolean;
  onClose: () => void;
  currentDay: number;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>🔥 Streak Rewards Preview</Text>
          <FlatList
            data={streakRewardsPreview}
            keyExtractor={(item) => String(item.day)}
            renderItem={({ item }) => {
              const isToday = item.day === currentDay;
              return (
                <View style={[styles.row, isToday && styles.highlight]}>
                  <Text style={[styles.cell, isToday && styles.highlightText]}>
                    Day {item.day}
                  </Text>
                  <Text style={[styles.cell, isToday && styles.highlightText]}>
                    {item.multiplier}
                  </Text>
                  <Text style={[styles.cell, isToday && styles.highlightText]}>
                    +{item.total} Coins
                  </Text>
                </View>
              );
            }}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  cell: {
    fontSize: 16,
    width: '33%',
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
  },
  highlight: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
