import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// بيانات وهمية للتجربة
const fakeCategories = {
  '1': { name: 'الأطباق الرئيسية' },
  '2': { name: 'المقبلات' },
};

export default function EditCategoryPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');

  useEffect(() => {
    // تحميل بيانات التصنيف عند فتح الصفحة
    const category = fakeCategories[id as string];
    if (category) setName(category.name);
    else Alert.alert('خطأ', 'لم يتم العثور على التصنيف');
  }, [id]);

  const handleUpdate = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم التصنيف');
      return;
    }

    // إرسال البيانات إلى الباكند هنا
    console.log('تم تعديل التصنيف:', name);
    router.back();
  };

  
  return (
    <View style={styles.container}>
      {/* زر الرجوع */}
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/menus`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      {/* عنوان الصفحة */}
      <Text style={styles.header}>تعديل التصنيف</Text>

      {/* إدخال الاسم */}
      <TextInput
        style={styles.input}
        placeholder="اسم التصنيف"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      {/* زر الحفظ */}
      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Ionicons name="save-outline" size={22} color="#fff" />
        <Text style={styles.saveButtonText}>حفظ التعديلات</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
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
