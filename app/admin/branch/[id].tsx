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

const BASE_URL = 'http://143.244.156.186:3007';

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

  useEffect(() => {
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

    fetchBranch();
  }, [id]);

  const handleEdit = () => {
    if (branchData) {
      router.push(`/admin/branch/edit/${id}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'تأكيد المسح',
      `هل أنت متأكد أنك تريد حذف ${branchData?.name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
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
      ]
    );
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

      {/* معلومات الاتصال */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📞 الهاتف:</Text>
        <Text style={styles.infoValue}>{branchData.phone || 'غير متوفر'}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📧 البريد الإلكتروني:</Text>
        <Text style={styles.infoValue}>{branchData.email || 'غير متوفر'}</Text>
      </View>

      {/* بيانات وهمية */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💰 مبيعات اليوم:</Text>
        <Text style={styles.infoValue}>٣٬٥٠٠ ريال</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📦 عدد الطلبات النشطة:</Text>
        <Text style={styles.infoValue}>١٢ طلب</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🧾 عدد الجلسات النشطة (كاشير):</Text>
        <Text style={styles.infoValue}>٤ جلسات</Text>
      </View>

      {/* المستخدمون المرتبطون */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>👥 عدد المستخدمين المرتبطين بالفرع:</Text>
        <Text style={styles.infoValue}>{branchData?.users?.length || 0} مستخدم</Text>
      </View>
      {branchData?.users?.length > 0 && (
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { marginBottom: 10 }]}>قائمة المستخدمين:</Text>
          {branchData.users.map((user: any) => (
            <View key={user.id} style={{ marginBottom: 10 }}>
              <Text style={styles.infoValue}>👤 {user.username}</Text>
              <Text style={styles.infoValue}>📧 {user.email}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ساعات العمل */}
      <View style={styles.infoBox}>
        <Text style={[styles.infoTitle, { marginBottom: 10 }]}>⏰ أيام وساعات العمل:</Text>
        {branchData.workingHours?.length > 0 ? (
          branchData.workingHours.map((wh: any) => (
            <Text key={wh.id} style={styles.infoValue}>
              {dayNames[wh.dayOfWeek]}:{" "}
              {wh.isOpen
                ? `${wh.openTime} - ${wh.closeTime}`
                : "مغلق"}
            </Text>
          ))
        ) : (
          <Text style={styles.infoValue}>لا توجد بيانات مضافة</Text>
        )}
      </View>

      {/* الإجراءات */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>تعديل الفرع</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>مسح الفرع</Text>
        </TouchableOpacity>
      </View>
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
