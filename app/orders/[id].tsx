import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

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

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/orders/my-orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrder(data.data);
    } catch (err) {
      console.error('فشل في جلب تفاصيل الطلب', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#812732" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>فشل تحميل الطلب</Text>
      </View>
    );
  }

  const status = getStatusDisplay(order.status);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)/orders')}
      >
        <Ionicons name="arrow-back" size={24} color="#812732" />
        <Text style={styles.backText}>رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.title}>تفاصيل الطلب</Text>

      <View style={[styles.statusBox, { backgroundColor: status.color }]}>
        <Text style={styles.statusText}>{status.label}</Text>
        </View>


      {order.deliveryStaff ? (
        <Text style={{ textAlign: 'center', marginBottom: 10, fontSize: 22 }}>
          عامل التوصيل: {order.deliveryStaff.username}
        </Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>رقم الطلب:</Text>
        <Text>{order.orderNumber}</Text>

        <Text style={styles.label}>تاريخ الإنشاء:</Text>
        <Text>{new Date(order.createdAt).toLocaleString('ar-EG')}</Text>

        <Text style={styles.label}>عنوان التوصيل:</Text>
        <Text>{order.deliveryAddress || 'غير متوفر'}</Text>

        {order.deliveryLat && order.deliveryLng && (
          <>
            <Text style={styles.label}>الموقع الجغرافي:</Text>
            
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`
                )
              }
            >
              <Ionicons name="location-outline" size={20} color="#fff" />
              <Text style={styles.mapText}>عرض على الخريطة</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.label}>ملاحظات:</Text>
        <Text>{order.notes?.trim() || 'لا توجد ملاحظات'}</Text>

        <Text style={styles.label}>الإجمالي:</Text>
        <Text>{order.total} ريال</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>المنتجات:</Text>
        {order.items?.length > 0 ? (
          order.items.map((item, index) => (
            <Text key={index}>
              • {item.product?.name || 'منتج'} - الكمية: {item.quantity}
              {item.specification?.name
                ? ` (إضافة: ${item.specification.name})`
                : ''}
            </Text>
          ))
        ) : (
          <Text>لا توجد منتجات</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: '#812732',
    marginLeft: 6,
  },
  statusBox: {
  alignSelf: 'center',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 25,
  marginBottom: 15,
},
statusText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 18,
  textAlign: 'center',
},

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 10,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#812732',
    marginTop: 10,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#812732',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mapText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
  },
});
