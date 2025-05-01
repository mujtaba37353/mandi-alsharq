import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

export default function BranchDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [branchData, setBranchData] = useState<{ name: string; location: string } | null>(null);

  useEffect(() => {
    const fakeBranches = {
      '1': { name: 'فرع الرياض', location: 'طريق الملك فهد' },
      '2': { name: 'فرع جدة', location: 'حي الروضة' },
      '3': { name: 'فرع الدمام', location: 'شارع الملك عبدالعزيز' },
    };

    const branch = fakeBranches[id as string];
    if (branch) {
      setBranchData(branch);
    } else {
      setBranchData({ name: 'فرع غير معروف', location: 'غير متوفر' });
    }
  }, [id]);

  const handleEdit = () => {
    Alert.alert('تعديل الفرع', `ستقوم بتعديل بيانات ${branchData?.name}`);
    // مستقبلاً توديه لصفحة تعديل الفرع
    // router.push(`/admin/branch/edit/${id}`);
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
          onPress: () => {
            // هنا مستقبلاً تضيف مسح الفرع من السيرفر
            Alert.alert('تم حذف الفرع بنجاح');
            router.back();
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
    <View style={styles.container}>
      {/* زر الرجوع */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin/(tabs)/branches')}>
        <Ionicons name="arrow-back" size={28} color="#812732" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <Ionicons name="business-outline" size={70} color="#812732" />
      </View>

      <Text style={styles.branchName}>{branchData.name}</Text>
      <Text style={styles.branchLocation}>{branchData.location}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>مبيعات اليوم:</Text>
        <Text style={styles.infoValue}>٣٬٥٠٠ ريال</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>عدد الطلبات النشطة:</Text>
        <Text style={styles.infoValue}>١٢ طلب</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>عدد الجلسات النشطة (كاشير):</Text>
        <Text style={styles.infoValue}>٤ جلسات</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>عدد المستخدمين في الفرع:</Text>
        <Text style={styles.infoValue}>٥ مستخدمين</Text>
      </View>

      {/* أزرار التعديل والحذف */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>تعديل الفرع</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>مسح الفرع</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  branchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
  },
  branchLocation: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    color: '#812732',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: 30,
    gap: 15,
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
