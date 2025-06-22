import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'https://cam4rent.net';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryUser, setDeliveryUser] = useState(null);

  const fetchOrder = async () => {
  try {
    const storedToken = await AsyncStorage.getItem('token');
    const storedRole = await AsyncStorage.getItem('role'); // <== هنا نضيف هذا السطر
    setToken(storedToken || '');
    setRole(storedRole || ''); // <== ونخزن الدور

    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    });
    const data = await res.json();
    setOrder(data);

    if (data.deliveryId) {
      fetchDeliveryUser(data.deliveryId, storedToken);
    }
  } catch (err) {
    console.error('فشل في جلب الطلب', err);
    Alert.alert('خطأ', 'فشل في تحميل الطلب');
  } finally {
    setLoading(false);
  }
};


  const fetchDeliveryUser = async (deliveryId, authToken) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${deliveryId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setDeliveryUser(data);
    } catch (err) {
      console.error('فشل في جلب بيانات عامل التوصيل');
    }
  };

  const fetchDeliveryUsers = async () => {
  try {
    const res = await fetch(`${BASE_URL}/users?role=DELIVERY`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    // ✅ فلترة حسب الفرع والدور DELIVERY فقط
    const branchUsers = data.filter(
      (u) => u.branch?.id === order.branch?.id && u.role === 'DELIVERY'
    );

    setDeliveryUsers(branchUsers);
    setModalVisible(true);
  } catch (err) {
    Alert.alert('فشل تحميل عمال التوصيل');
  }
};


  const assignDeliveryToOrder = async (deliveryId) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/assign-delivery`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryId, notes: 'تم التعيين من خلال التطبيق' }),
      });

      if (res.ok) {
        await updateOrderStatus('OUT_FOR_DELIVERY', 'تم الإرسال للتوصيل');
        setModalVisible(false);
        fetchOrder();
      } else {
        Alert.alert('فشل في تعيين عامل التوصيل');
      }
    } catch (err) {
      Alert.alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const updateOrderStatus = async (newStatus, notes = '') => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (!res.ok) throw new Error();
    } catch (err) {
      Alert.alert('فشل في تحديث حالة الطلب');
    }
  };

  const advanceOrderStatus = async () => {
    const statusFlow = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERING',
      DELIVERING: 'DELIVERED',
      DELIVERED: 'COMPLETED',
    };

    const nextStatus = statusFlow[order.status];

    if (!nextStatus) {
      Alert.alert('تنبيه', 'لا يمكن تغيير الحالة أكثر');
      return;
    }

    // إذا كانت الحالة التالية تتطلب تعيين عامل توصيل
    if (nextStatus === 'OUT_FOR_DELIVERY') {
      fetchDeliveryUsers(); // يفتح المودال
      return;
    }

    try {
      await updateOrderStatus(nextStatus, 'تم تغيير الحالة');
      Alert.alert('تم تحديث الحالة');
      fetchOrder();
    } catch (err) {
      Alert.alert('فشل في تغيير حالة الطلب');
    }
  };

  const cancelOrder = async () => {
    await updateOrderStatus('CANCELLED', 'تم إلغاء الطلب من قبل الإدارة');
    fetchOrder();
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#812732" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>لا يوجد بيانات</Text>
      </View>
    );
  }

  const deleteOrder = async () => {
  Alert.alert('تأكيد الحذف', 'هل أنت متأكد أنك تريد حذف هذا الطلب؟', [
    { text: 'إلغاء', style: 'cancel' },
    {
      text: 'حذف',
      style: 'destructive',
      onPress: async () => {
        try {
          const res = await fetch(`${BASE_URL}/orders/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            Alert.alert('تم الحذف بنجاح');
            router.replace('/admin/orders');
          } else {
            Alert.alert('فشل في حذف الطلب');
          }
        } catch (err) {
          Alert.alert('خطأ في الاتصال بالخادم');
        }
      },
    },
  ]);
};


  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/admin/orders')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
        <Text style={styles.backText}>رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.header}>تفاصيل الطلب</Text>
      <Text style={styles.status}>الحالة: {order.status}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>الفرع:</Text>
        <Text>{order.branch?.name || 'غير محدد'}</Text>

        <Text style={styles.label}>رقم الطلب:</Text>
        <Text>{order.orderNumber}</Text>

        <Text style={styles.label}>نوع الطلب:</Text>
        <Text>{order.orderType}</Text>

        <Text style={styles.label}>الإجمالي:</Text>
        <Text>{order.total} ريال</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>بيانات العميل:</Text>
        <Text>الاسم: {order.user?.username || 'غير محدد'}</Text>
        {order.user?.email && <Text>البريد الإلكتروني: {order.user.email}</Text>}
        {order.user?.phone && <Text>رقم الجوال: {order.user.phone}</Text>}

        {order.deliveryLat && order.deliveryLng && (
          <>
            <Text>الموقع: {order.deliveryLat}, {order.deliveryLng}</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`)
              }
              style={[styles.actionButton, { marginTop: 10 }]}
            >
              <Ionicons name="location-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>عرض الموقع على الخريطة</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>المنتجات المطلوبة:</Text>
        {order.items?.length > 0 ? (
          order.items.map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text>
                • {item.product?.name} - الكمية: {item.quantity}
              </Text>
            </View>
          ))
        ) : (
          <Text>لا توجد منتجات</Text>
        )}
      </View>

      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor:
                order.status === 'PENDING'
                  ? '#812732'
                  : order.status === 'CONFIRMED'
                  ? '#e67e22'
                  : order.status === 'PREPARING'
                  ? '#3498db'
                  : order.status === 'READY'
                  ? '#27ae60'
                  : order.status === 'OUT_FOR_DELIVERY'
                  ? '#9b59b6'
                  : order.status === 'DELIVERING'
                  ? '#2ecc71'
                  : '#95a5a6',
            },
          ]}
          onPress={advanceOrderStatus}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>
            {order.status === 'PENDING' && 'تأكيد الطلب'}
            {order.status === 'CONFIRMED' && 'بدء التحضير'}
            {order.status === 'PREPARING' && 'جاهز للتوصيل'}
            {order.status === 'READY' && 'إرسال للتوصيل'}
            {order.status === 'OUT_FOR_DELIVERY' && 'في التوصيل'}
            {order.status === 'DELIVERING' && 'تم التوصيل'}
            {order.status === 'DELIVERED' && 'إنهاء الطلب'}
          </Text>
        </TouchableOpacity>
      )}

      {order.status === 'OUT_FOR_DELIVERY' && deliveryUser && (
        <Text style={{ textAlign: 'center', marginBottom: 10, color: '#555' }}>
          عامل التوصيل: {deliveryUser.username}
        </Text>
      )}
    

      {(role === 'OWNER' || role === 'BRANCH_ADMIN') &&
        !['COMPLETED', 'CANCELLED', 'DELIVERED', 'DELIVERING'].includes(order.status) && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#a00' }]}
            onPress={cancelOrder}
          >
            <Ionicons name="close-circle-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>إلغاء الطلب</Text>
          </TouchableOpacity>
      )}



      {(role === 'OWNER' || role === 'BRANCH_ADMIN') && (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#555' }]} onPress={deleteOrder}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>حذف الطلب</Text>
        </TouchableOpacity>
      )}




      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.header}>اختر عامل التوصيل</Text>
          <FlatList
            data={deliveryUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deliveryCard}
                onPress={() => assignDeliveryToOrder(item.id)}
              >
                <Text>{item.username}</Text>
                <Text style={{ color: '#888' }}>{item.email}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.actionButton}>
            <Text style={styles.buttonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#812732', marginBottom: 10, textAlign: 'center' },
  status: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  section: { marginBottom: 20, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 },
  label: { fontWeight: 'bold', marginTop: 10, color: '#812732' },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#812732',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backText: { fontSize: 16, color: '#812732', marginLeft: 5 },
  deliveryCard: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
});
