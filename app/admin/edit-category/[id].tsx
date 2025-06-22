import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function EditCategoryPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    fetchRole();
    fetchCategory();
  }, [id]);

  const fetchRole = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setRole(data.data.role);
  };

  const fetchCategory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBranchId(data.branchId || '');
        setNameAr(data.name || '');
        const en = data.translations?.find((t) => t.language === 'EN');
        setNameEn(en?.name || '');
      } else {
        Alert.alert('خطأ', 'فشل تحميل بيانات التصنيف');
      }
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
    }
  };

  const handleUpdate = async () => {
    if (!nameAr.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم التصنيف بالعربية');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        name: nameAr,
        branchId,
        translations: [
          { name: nameAr, language: 'AR' },
          { name: nameEn, language: 'EN' },
        ],
      };

      const res = await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('تم', 'تم تعديل التصنيف بنجاح');
        router.replace('/admin/(tabs)/menus');
      } else {
        const data = await res.json();
        Alert.alert('خطأ', data.message || 'فشل تعديل التصنيف');
      }
    } catch {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  if (role !== 'OWNER' && role !== 'BRANCH_ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'red' }}>
          ❌ لا تملك صلاحية لتعديل التصنيف
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.header}>تعديل التصنيف</Text>

      <TextInput
        style={styles.input}
        placeholder="اسم التصنيف بالعربية"
        placeholderTextColor="#999"
        value={nameAr}
        onChangeText={setNameAr}
      />

      <TextInput
        style={styles.input}
        placeholder="اسم التصنيف بالإنجليزية (اختياري)"
        placeholderTextColor="#999"
        value={nameEn}
        onChangeText={setNameEn}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Ionicons name="save-outline" size={22} color="#fff" />
        <Text style={styles.saveButtonText}>حفظ التعديلات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 20 },
  backButton: { marginBottom: 10 },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
