// app/tabs/home.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const router = useRouter();

  const categories = ['الفطور', 'الغداء', 'العشاء', 'خاص', 'مناسبات', 'حلى', 'مشروبات'];

  const products = [
    {
      id: 1,
      title: 'شاورما عربي علي الفحم',
      price: 25,
      image: require('../../assets/images/food1.png'), 
    },
    {
      id: 2,
      title: 'شاورما عربي علي الفحم',
      price: 25,
      image: require('../../assets/images/food2.png'),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Category */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>الفئات</Text>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <Text style={styles.seeAll}>انظر الكل</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.activeCategory,
              ]}
              onPress={() => router.push(`/category/${cat}`)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>المنتجات</Text>
        </View>

        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <Image source={item.image} style={styles.productImage} />
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productPrice}>25 ريال</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#812732" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  morning: { fontSize: 14, color: '#888' },
  user: { fontSize: 20, fontWeight: 'bold', color: '#812732' },
  section: { marginTop: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#812732' },
  seeAll: { color: '#888', fontSize: 14 },
  categoryScroll: { marginTop: 10 },
  categoryButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategory: { backgroundColor: '#812732' },
  categoryText: { color: '#812732' },
  activeCategoryText: { color: '#fff' },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    elevation: 2,
  },
  productImage: { width: 70, height: 70, borderRadius: 8 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#812732' },
  productPrice: { fontSize: 14, color: '#555' },
});
