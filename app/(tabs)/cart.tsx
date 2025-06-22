import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BASE_URL = 'https://cam4rent.net';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(null);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCartItems((data.items || []).filter(item => item?.product));
        setTotal(data.total || null);
      } else {
        Alert.alert('خطأ', data.message || 'فشل تحميل السلة');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const updateQuantity = async (itemId, newQty, notes = '') => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQty, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchCart();
      } else {
        Alert.alert('خطأ', data.message || 'فشل تعديل الكمية');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('تم', data.ar || 'تم حذف العنصر');
        fetchCart();
      } else {
        Alert.alert('خطأ', data.message || 'فشل الحذف');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const clearCart = async () => {
    Alert.alert('تأكيد', 'هل أنت متأكد من مسح السلة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'نعم، امسح',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/cart`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              Alert.alert('تم', data.ar || 'تم مسح السلة');
              fetchCart();
            } else {
              Alert.alert('خطأ', data.message || 'فشل مسح السلة');
            }
          } catch (err) {
            Alert.alert('خطأ', 'فشل الاتصال بالخادم');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../assets/images/cart-icon.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyMessage}>سلتك فارغة</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.clearButtonText}>ارجع لتصفح المنتجات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>سلة المشتريات</Text>

      {cartItems.map((item) => {
          const addon = item.specification;
          const addonPrice = addon ? Number(addon.price || 0) : 0;
          const basePrice = Number(item.product.price);
          const totalPrice = (basePrice + addonPrice) * item.quantity;

          return (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.name}>{item.product.name}</Text>
                <Text style={styles.price}>السعر الأساسي: {basePrice.toFixed(2)} ريال</Text>

                {addon && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontWeight: 'bold', color: '#812732' }}>الإضافة:</Text>
                    <Text style={{ color: '#555', fontSize: 13 }}>
                      • {addon.name} (+{addon.price} ريال)
                    </Text>
                  </View>
                )}

                <Text style={{ marginTop: 4, color: '#000', fontWeight: 'bold' }}>
                  السعر الكلي لهذا المنتج: {totalPrice.toFixed(2)} ريال
                </Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Ionicons name="remove-circle-outline" size={24} color="#812732" />
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Ionicons name="add-circle-outline" size={24} color="#812732" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Ionicons name="trash" size={22} color="#812732" />
              </TouchableOpacity>
            </View>
          );
        })}


      {total && (
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>الإجمالي: {total.total} ريال</Text>
        </View>
      )}

      <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
        <Text style={styles.clearButtonText}>مسح السلة بالكامل</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: '#28a745' }]}
        onPress={() => router.push('/cart/order-form')}
      >
        <Text style={styles.clearButtonText}>اطلب الآن</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#812732', marginBottom: 15 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
    alignItems: 'center',
  },
  image: { width: 60, height: 60, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 14, color: '#666', marginTop: 4 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qty: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
  },
  totalBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#812732',
  },
  clearButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#812732',
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
});
