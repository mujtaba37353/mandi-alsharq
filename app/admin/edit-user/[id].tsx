import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://143.244.156.186:3007';

const roleTranslation: Record<string, string> = {
  USER: 'مستخدم',
  BRANCH_ADMIN: 'مدير فرع',
  CASHIER: 'كاشير',
  DELIVERY: 'عامل توصيل',
};

const allowedRoles = ['USER', 'BRANCH_ADMIN', 'CASHIER', 'DELIVERY'];

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const isUserRole = role === 'USER';

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        setUsername(data.username);
        setRole(data.role);
      } else {
        Alert.alert('خطأ', 'فشل في تحميل بيانات المستخدم');
      }
    } catch (error) {
      console.error('خطأ', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالسيرفر');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, role }),
      });

      if (response.ok) {
        Alert.alert('تم التحديث', 'تم تعديل بيانات المستخدم');
        router.back();
      } else {
        Alert.alert('خطأ', 'فشل تعديل المستخدم');
      }
    } catch (error) {
      console.error('خطأ', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالسيرفر');
    }
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تعديل المستخدم</Text>

      {/* زر الرجوع */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
        <Text style={styles.backText}>رجوع</Text>
      </TouchableOpacity>

      {/* حقل اسم المستخدم */}
      <TextInput
        placeholder="اسم المستخدم"
        style={[styles.input, isUserRole && styles.disabledInput]}
        value={username}
        onChangeText={setUsername}
        editable={!isUserRole}
      />

      {/* اختيار الدور */}
      {!isUserRole ? (
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setRoleModalVisible(true)}>
          <Text style={styles.dropdownButtonText}>
            {role ? roleTranslation[role] : 'اختر الدور'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#812732" />
        </TouchableOpacity>
      ) : (
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={roleTranslation[role] || ''}
          editable={false}
        />
      )}

      {/* زر حفظ التعديلات */}
      {!isUserRole ? (
        <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
          <Text style={styles.buttonText}>حفظ التعديلات</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.infoText}>
          لا يمكن تعديل بيانات مستخدم عادي
        </Text>
      )}

      {/* Modal لاختيار الدور */}
      <Modal
        transparent
        animationType="slide"
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {allowedRoles.map((r) => (
              <Pressable key={r} style={styles.modalItem} onPress={() => {
                setRole(r);
                setRoleModalVisible(false);
              }}>
                <Text>{roleTranslation[r]}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setRoleModalVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#812732', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15 },
  disabledInput: { backgroundColor: '#eee', color: '#999' },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15 },
  dropdownButtonText: { color: '#812732', fontSize: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: '#812732', marginLeft: 8 },
  button: { backgroundColor: '#812732', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalCancel: { marginTop: 10, paddingVertical: 15, alignItems: 'center' },
  infoText: { textAlign: 'center', color: 'red', fontWeight: 'bold', marginTop: 20 },
});
