import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddMenuPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم التصنيف');
      return;
    }

    // هنا يتم إرسال الاسم إلى الباكند
    console.log('تم إضافة التصنيف:', name);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* زر رجوع */}
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/menus`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      {/* عنوان الصفحة */}
      <Text style={styles.header}>إضافة تصنيف جديد</Text>

      {/* إدخال الاسم */}
      <TextInput
        style={styles.input}
        placeholder="اسم التصنيف"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      {/* زر الحفظ */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Ionicons name="save-outline" size={22} color="#fff" />
        <Text style={styles.saveButtonText}>حفظ التصنيف</Text>
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
