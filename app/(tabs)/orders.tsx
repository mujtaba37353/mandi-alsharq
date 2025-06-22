import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

// ترجمة الحالة + اللون
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { label: 'قيد المراجعة', color: '#812732' };
    case 'CONFIRMED':
      return { label: 'تم التأكيد', color: '#e67e22' };
    case 'PREPARING':
      return { label: 'قيد التحضير', color: '#3498db' };
    case 'READY':
      return { label: 'جاهز', color: '#27ae60' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'خرج للتوصيل', color: '#9b59b6' };
    case 'DELIVERING':
      return { label: 'قيد التوصيل', color: '#2ecc71' };
    case 'DELIVERED':
    case 'COMPLETED':
      return { label: 'تم التوصيل', color: '#95a5a6' };
    case 'CANCELLED':
      return { label: 'ملغي', color: '#999' };
    default:
      return { label: 'غير معروف', color: '#666' };
  }
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('فشل تحميل الطلبات', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#812732" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#888' }}>لا توجد طلبات حالياً</Text>
      </View>
    );
  }

  const renderOrder = ({ item: order }) => {
    const status = getStatusDisplay(order.status);

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          ['CANCELLED', 'DELIVERED', 'COMPLETED'].includes(order.status)
            ? { backgroundColor: '#eee' } // أو استخدم status.color إن أحببت
            : null,
        ]}
        onPress={() => router.push(`/orders/${order.id}`)}
      >

        <Image
          source={{
            uri:
              order.items?.[0]?.product?.imageUrl ||
              'https://via.placeholder.com/60',
          }}
          style={styles.image}
        />
        <View style={styles.orderInfo}>
          <Text
            style={[
              styles.orderNumber,
              ['CANCELLED', 'DELIVERED', 'COMPLETED'].includes(order.status)
                ? { color: '#666' }
                : null,
            ]}
          >
            #{order.orderNumber}
          </Text>
          <Text style={[styles.status, { color: status.color }]}>
            الحالة: {status.label}
          </Text>
          <Text
            style={[
              styles.total,
              ['CANCELLED', 'DELIVERED', 'COMPLETED'].includes(order.status)
                ? { color: '#666' }
                : null,
            ]}
          >
            الإجمالي: {order.total} ريال
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#888" />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrder}
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#812732',
    fontSize: 16,
  },
  status: {
    fontSize: 14,
    marginTop: 4,
  },
  total: {
    fontSize: 15,
    color: '#000',
    marginTop: 4,
  },
});
