import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function AddBranchPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');

  const handleAddBranch = () => {
    if (!name || !address || !location) {
      alert('يرجى تعبئة جميع الحقول');
      return;
    }
    // مستقبلاً: إرسال البيانات للسيرفر هنا
    alert('تم إضافة الفرع بنجاح!');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* زر رجوع */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin/(tabs)/branches')}>
          <Ionicons name="arrow-back" size={28} color="#812732" />
        </TouchableOpacity>

        <Text style={styles.title}>إضافة فرع جديد</Text>

        <TextInput
          style={styles.input}
          placeholder="اسم الفرع"
          value={name}
          onChangeText={setName}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="العنوان"
          value={address}
          onChangeText={setAddress}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="اللوكيشن"
          value={location}
          onChangeText={setLocation}
          textAlign="right"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleAddBranch}>
          <Text style={styles.saveButtonText}>حفظ الفرع</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
