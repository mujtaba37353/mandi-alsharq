import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const allProducts = [
  {
    id: 1,
    title: 'ساندويتش بيض',
    image: require('../../assets/images/food1.png'),
    category: 'الفطور',
  },
  {
    id: 2,
    title: 'بان كيك',
    image: require('../../assets/images/food2.png'),
    category: 'الفطور',
  },
  {
    id: 3,
    title: 'فطور شرقي',
    image: require('../../assets/images/food1.png'),
    category: 'الفطور',
  },
  {
    id: 4,
    title: 'وافل بالعسل',
    image: require('../../assets/images/food2.png'),
    category: 'الفطور',
  },
  {
    id: 1,
    title: 'ساندويتش بيض',
    image: require('../../assets/images/food1.png'),
    category: 'الغداء',
  },
  {
    id: 2,
    title: 'بان كيك',
    image: require('../../assets/images/food2.png'),
    category: 'الغداء',
  },
  {
    id: 3,
    title: 'فطور شرقي',
    image: require('../../assets/images/food1.png'),
    category: 'الغداء',
  },
  {
    id: 4,
    title: 'وافل بالعسل',
    image: require('../../assets/images/food2.png'),
    category: 'الغداء',
  },
  {
    id: 1,
    title: 'ساندويتش بيض',
    image: require('../../assets/images/food1.png'),
    category: 'العشاء',
  },
  {
    id: 2,
    title: 'بان كيك',
    image: require('../../assets/images/food2.png'),
    category: 'الغداء',
  },
  {
    id: 3,
    title: 'فطور شرقي',
    image: require('../../assets/images/food1.png'),
    category: 'الغداء',
  },
  {
    id: 4,
    title: 'وافل بالعسل',
    image: require('../../assets/images/food2.png'),
    category: 'العشاء',
  },
  {
    id: 1,
    title: 'ساندويتش بيض',
    image: require('../../assets/images/food1.png'),
    category: 'خاص',
  },
  {
    id: 2,
    title: 'بان كيك',
    image: require('../../assets/images/food2.png'),
    category: 'خاص',
  },
  {
    id: 3,
    title: 'فطور شرقي',
    image: require('../../assets/images/food1.png'),
    category: 'خاص',
  },
  {
    id: 4,
    title: 'وافل بالعسل',
    image: require('../../assets/images/food2.png'),
    category: 'خاص',
  },
];

export default function CategoryPage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();

  const filteredProducts = allProducts.filter((item) => item.category === name);

  return (
    <View style={styles.container}>
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

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>{name}</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      {/* Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <Image source={item.image} style={styles.cardImage} />
            <TouchableOpacity style={styles.heartButton}>
              <Ionicons name="heart-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50 },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#812732', flex: 1, textAlign: 'center', marginRight: 30 },
  searchInput: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    fontSize: 14,
    color: '#333',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#812732' },
  seeAll: { color: '#888', fontSize: 14 },
  card: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#812732',
    padding: 6,
    borderRadius: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
});
