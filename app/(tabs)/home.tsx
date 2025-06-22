import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserLocation from '../hooks/useUserLocation';

const BASE_URL = 'https://cam4rent.net';

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const { location, loading, granted, requestLocationPermission } = useUserLocation();
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (granted && location && !loading) {
      fetchProducts(location.latitude, location.longitude);
      fetchWishlist();
    }
  }, [granted, loading, location?.latitude, location?.longitude]);

  const fetchWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data);
      }
    } catch (error) {
      console.log('Wishlist error:', error);
    }
  };

  const isInWishlist = (productId) => wishlist.some((item) => item.productId === productId);

  const fetchAllCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCategories(data);
        setSelectedCategory(data[0]?._id || null);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.log('Category fetch error:', err);
      setCategories([]);
    }
  };

  const fetchProducts = async (latitude, longitude) => {
    try {
      setProductsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/products/all-with-nearest-branch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await res.json();
      if (res.ok) {
        setProducts(data.products.map(p => ({ ...p, branchId: data.branch?._id })));
        const branchIdFromResponse = data.branch?._id || data.branch?.id;
        if (branchIdFromResponse) {
          setBranchId(branchIdFromResponse);
          await fetchAllCategories();
        }

      } else {
        Alert.alert('خطأ', 'فشل تحميل المنتجات');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    } finally {
      setProductsLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) =>
        p.categoryId === selectedCategory || p.category?._id === selectedCategory
      )
    : products;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>الفئات</Text>
        </View>
        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              const arName = cat.translations?.find(t => t.language === 'AR')?.name || cat.name;
              return (
                <TouchableOpacity
                  key={catId}
                  style={[styles.categoryButton, selectedCategory === catId && styles.activeCategory]}
                  onPress={() => router.push(`/category/${catId}`)} // ✅ هذا هو التعديل المطلوب فقط
                >
                  <Text style={[styles.categoryText, selectedCategory === catId && styles.activeCategoryText]}>
                    {arName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={{ marginTop: 10, color: '#888' }}>لا توجد فئات متاحة</Text>
        )}

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المنتجات</Text>
        {productsLoading ? (
          <Text style={{ textAlign: 'center', marginVertical: 20, color: '#888' }}>
            جاري تحميل المنتجات...
          </Text>
        ) : (
          filteredProducts.map((item) => {
            const arTranslation = item.translations?.find((t) => t.language === 'AR');
            return (
              <View key={item.id} style={styles.productCard}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', flex: 1 }}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <Text style={styles.productTitle}>{arTranslation?.name || item.name}</Text>
                    <Text style={styles.productPrice}>{item.price} ريال</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#812732" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ backgroundColor: '#eee', padding: 8, borderRadius: 8 }}>
                    <Ionicons
                      name={isInWishlist(item.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isInWishlist(item.id) ? '#812732' : '#888'}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(`/product/${item.id}`)}
                    style={{ backgroundColor: '#812732', padding: 8, borderRadius: 8 }}
                  >
                    <Ionicons name="cart" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {!granted && !loading && (
          <TouchableOpacity onPress={requestLocationPermission} style={styles.permissionButton}>
            <Text style={styles.permissionText}>السماح باستخدام الموقع</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  section: { marginTop: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#812732' },
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
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    elevation: 2,
  },
  productImage: { width: 70, height: 70, borderRadius: 8 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#812732' },
  productPrice: { fontSize: 14, color: '#555' },
  permissionButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#812732',
    borderRadius: 10,
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
