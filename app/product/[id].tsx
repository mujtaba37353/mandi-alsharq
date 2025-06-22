import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [wishlistId, setWishlistId] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProduct(data);
        setTotalPrice(parseFloat(data.price));
      } else {
        Alert.alert('خطأ', data.message || 'فشل في تحميل المنتج');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const checkWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const found = data.find((item) => item.productId === id);
        if (found) {
          setWishlistId(found.id);
          setIsInWishlist(true);
        }
      }
    } catch (err) {
      console.log('Wishlist check error:', err);
    }
  };

  useEffect(() => {
    fetchProduct();
    checkWishlist();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          branchId: product.branch?.id || product.branchId,
          quantity: 1,
          notes: '',
          specificationId: selectedAddon?.id || null,
          price: totalPrice,
        }),
      });

      if (res.ok) {
        Alert.alert('تمت الإضافة', 'تمت إضافة المنتج إلى السلة');
      } else {
        const data = await res.json();
        Alert.alert('فشل الإضافة', data.message || 'حدث خطأ أثناء إضافة المنتج');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!isInWishlist) {
        const res = await fetch(`${BASE_URL}/wishlist`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            branchId: product.branch?.id || product.branchId,
            notes: 'Favorite from product details',
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setWishlistId(data.id);
          setIsInWishlist(true);
          Alert.alert('تمت الإضافة', 'تمت إضافة المنتج إلى المفضلة');
        } else {
          Alert.alert('فشل الإضافة', data.message || 'حدث خطأ أثناء الإضافة');
        }
      } else {
        const res = await fetch(`${BASE_URL}/wishlist/${wishlistId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setWishlistId(null);
          setIsInWishlist(false);
          Alert.alert('تم الحذف', 'تم حذف المنتج من المفضلة');
        } else {
          const data = await res.json();
          Alert.alert('فشل الحذف', data.message || 'حدث خطأ أثناء الحذف');
        }
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const toggleAddon = (addon) => {
  if (selectedAddon?.id === addon.id) {
    setSelectedAddon(null);
    setTotalPrice(parseFloat(product.price));
  } else {
    setSelectedAddon(addon);
    const addonPrice = parseFloat(addon.price || 0);
    setTotalPrice(parseFloat(product.price) + addonPrice);
  }
};


  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>جارٍ تحميل المنتج...</Text>
      </View>
    );
  }

  const arTranslation = product.translations?.find((t) => t.language === 'AR');

  return (
    <ScrollView style={styles.container}>
      <View>
        <Image
          source={{ uri: product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}` }}
          style={styles.image}
        />

        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/home`)}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{arTranslation?.name || product.name}</Text>
        <Text style={styles.sub}>{arTranslation?.description || product.description}</Text>
        <Text style={styles.price}>السعر: {totalPrice.toFixed(2)} ريال</Text>

        {/* إضافات المنتج */}
        {product.specifications?.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>الإضافة المختارة:</Text>
            {product.specifications.map((spec) => {
              const arSpec = spec.translations?.find((t) => t.language === 'AR');
              const isSelected = selectedAddon?.id === spec.id;

              return (
                <TouchableOpacity
                  key={spec.id}
                  style={[
                    styles.addonButton,
                    isSelected && styles.addonButtonSelected,
                  ]}
                  onPress={() => toggleAddon(spec)}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={isSelected ? '#812732' : '#ccc'}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: isSelected ? '#812732' : '#000' }}>
                    {arSpec?.name || spec.name} (+{spec.price} ريال)
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}


        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.cartButtonText}>إضافة إلى السلة</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
          <Ionicons name={isInWishlist ? 'heart' : 'heart-outline'} size={20} color="#812732" />
          <Text style={styles.wishlistButtonText}>{isInWishlist ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#812732' },
  sub: { color: '#555', marginVertical: 8 },
  price: { fontSize: 18, fontWeight: '600', color: '#812732' },
  loading: { marginTop: 100, textAlign: 'center', fontSize: 16 },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#812732',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  wishlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  wishlistButtonText: {
    color: '#812732',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  addonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  addonButtonSelected: {
    borderColor: '#812732',
    backgroundColor: '#fbeff0',
  },
});
