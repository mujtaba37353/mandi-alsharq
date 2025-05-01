// app/admin/(tabs)/reports.tsx

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const router = useRouter();

  const reports = [
    {
      id: '1',
      title: 'تقرير المبيعات - فرع الرياض',
      type: 'فرع',
      date: '01/04/2025 - 30/04/2025',
    },
    {
      id: '2',
      title: 'تقرير المستخدم - كاشير',
      type: 'مستخدم',
      date: '01/04/2025 - 07/04/2025',
    },
    {
      id: '3',
      title: 'تقرير المنتج - مندي لحم',
      type: 'منتج',
      date: 'كل الأوقات',
    },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/admin/report/${item.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>النوع: {item.type}</Text>
        <Text style={styles.cardMeta}>الفترة: {item.date}</Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => {
          // download report action (placeholder)
        }}
      >
        <Ionicons name="download-outline" size={22} color="#812732" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>التقارير</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/admin/create-report')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.createButtonText}>إنشاء تقرير جديد</Text>
      </TouchableOpacity>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    padding: 20,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#812732',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: '#555',
  },
  downloadButton: {
    padding: 8,
    marginLeft: 10,
  },
});
