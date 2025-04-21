import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const categories = [
  {
    name: 'الفطور',
    image: require('../../assets/images/food1.png'),
  },
  {
    name: 'الغداء',
    image: require('../../assets/images/food2.png'),
  },
  {
    name: 'العشاء',
    image: require('../../assets/images/food1.png'),
  },
  {
    name: 'مناسبات',
    image: require('../../assets/images/food2.png'),
  },
];

export default function AllCategories() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#812732" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category</Text>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search"
        style={styles.searchInput}
      />

      {/* Categories List */}
      <View style={styles.list}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.item}
            onPress={() => router.push(`/category/${cat.name}`)}
          >
            <Image source={cat.image} style={styles.image} />
            <Text style={styles.name}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#812732', flex: 1, textAlign: 'center', marginRight: 30 },
  searchInput: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  list: { gap: 20 },
  item: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  image: { width: '100%', height: 150 },
  name: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#812732',
    paddingVertical: 10,
  },
});
