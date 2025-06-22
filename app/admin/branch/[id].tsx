import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

const dayNames = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export default function BranchDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [branchData, setBranchData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [productsCount, setProductsCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [branchUsers, setBranchUsers] = useState<any[]>([]);

  const fetchBranch = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBranchData(data);
      } else {
        Alert.alert('خطأ', 'فشل تحميل بيانات الفرع');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل الاتصال بالسيرفر');
    }
  };

  const fetchWorkingHours = async (branchId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/branches/${branchId}/working-hours`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBranchData((prev: any) => ({
          ...prev,
          workingHours: data,
        }));
      }
    } catch (e) {
      console.error('فشل جلب أوقات العمل', e);
    }
  };

  const fetchProductsCount = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/products/branch/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      // تأكد من تطابق الـ id للفرع مع الحقل الموجود داخل كل منتج
      const branchProducts = data.filter(
        (product: any) => product.branch?.id === id
      );
      setProductsCount(branchProducts.length);
    } else {
      console.warn('بيانات المنتجات غير متوقعة:', data);
      setProductsCount(0);
    }
  } catch (e) {
    console.error('فشل جلب المنتجات', e);
  }
};


  const fetchOrdersCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const branchOrders = data.filter((order: any) => order.branch?.id === id);
        setOrdersCount(branchOrders.length);
        const activeOrders = branchOrders.filter(
          (order: any) => order.status !== 'REJECTED' && order.status !== 'DELIVERED'
        );
        setActiveOrdersCount(activeOrders.length);
      }
    } catch (e) {
      console.error('فشل جلب الطلبات', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const filtered = data.filter(
          (user: any) => user.branchId === id && ['BRANCH_ADMIN', 'CASHIER', 'DELIVERY'].includes(user.role)
        );
        setBranchUsers(filtered);
      }
    } catch (e) {
      console.error('فشل جلب المستخدمين', e);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUserRole(data.data.role);
      }
    } catch (e) {
      console.error('خطأ في جلب الدور', e);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchBranch().then(() => {
      if (id) fetchWorkingHours(id as string);
    });
    fetchProductsCount();
    fetchOrdersCount();
    fetchUsers();
  }, [id]);


  const handleEdit = () => {
    if (branchData) {
      router.push(`/admin/branch/edit/${id}`);
    }
  };

  const handleDelete = () => {
    Alert.alert('تأكيد المسح', `هل أنت متأكد أنك تريد حذف ${branchData?.name}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${BASE_URL}/branches/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('تم الحذف', 'تم حذف الفرع بنجاح');
            router.replace('/admin/(tabs)/branches');
          } catch {
            Alert.alert('خطأ', 'فشل في حذف الفرع');
          }
        },
      },
    ]);
  };

  if (!branchData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>جارٍ تحميل بيانات الفرع...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin/(tabs)/branches')}>
        <Ionicons name="arrow-back" size={28} color="#812732" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <Ionicons name="business-outline" size={70} color="#812732" />
      </View>

      <Text style={styles.branchName}>{branchData.name}</Text>
      <Text style={styles.branchLocation}>{branchData.address || 'بدون عنوان'}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📞 الهاتف:</Text>
        <Text style={styles.infoValue}>{branchData.phone || 'غير متوفر'}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📧 البريد الإلكتروني:</Text>
        <Text style={styles.infoValue}>{branchData.email || 'غير متوفر'}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🛒 عدد المنتجات:</Text>
        <Text style={styles.infoValue}>{productsCount} منتج</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📦 عدد الطلبات:</Text>
        <Text style={styles.infoValue}>{ordersCount} طلب</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🚚 عدد الطلبات النشطة:</Text>
        <Text style={styles.infoValue}>{activeOrdersCount} طلب</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>👥 عدد المستخدمين المرتبطين بالفرع:</Text>
        <Text style={styles.infoValue}>{branchUsers.length} مستخدم</Text>
      </View>
      {branchUsers.length > 0 && (
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { marginBottom: 10 }]}>قائمة المستخدمين:</Text>
          {branchUsers.map((user: any) => (
            <View key={user.id} style={{ marginBottom: 10 }}>
              <Text style={styles.infoValue}>👤 {user.username} - {user.role}</Text>
              <Text style={styles.infoValue}>📧 {user.email}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.infoBox}>
        <Text style={[styles.infoTitle, { marginBottom: 10 }]}>⏰ أيام وساعات العمل:</Text>
        {branchData.workingHours?.length > 0 ? (
          branchData.workingHours.map((wh: any) => (
            <Text key={wh.id} style={styles.infoValue}>
              {dayNames[wh.dayOfWeek]}: {wh.isOpen ? `${wh.openTime} - ${wh.closeTime}` : 'مغلق'}
            </Text>
          ))
        ) : (
          <Text style={styles.infoValue}>لا توجد بيانات مضافة</Text>
        )}
      </View>
      {(userRole === 'OWNER' || userRole === 'BRANCH_ADMIN') && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>تعديل الفرع</Text>
          </TouchableOpacity>
          {userRole === 'OWNER' && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>مسح الفرع</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 100,
  },
  backButton: {
    position: 'absolute', top: 40, left: 20, zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center', marginBottom: 20,
  },
  branchName: {
    fontSize: 24, fontWeight: 'bold', color: '#812732', textAlign: 'center',
  },
  branchLocation: {
    fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16, color: '#812732', fontWeight: 'bold', marginBottom: 5, textAlign: 'right',
  },
  infoValue: {
    fontSize: 16, color: '#333', textAlign: 'right',
  },
  actionsContainer: {
    marginTop: 30, gap: 15,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
