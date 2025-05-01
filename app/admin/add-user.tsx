import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://143.244.156.186:3007';

export default function AddUserScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);

  const roles = [
    { value: 'BRANCH_ADMIN', label: 'مدير فرع' },
    { value: 'CASHIER', label: 'كاشير' },
    { value: 'DELIVERY', label: 'عامل توصيل' },
  ];

  const fetchBranches = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setBranches(data);
      } else {
        console.error('فشل جلب الفروع', data.message);
      }
    } catch (error) {
      console.error('خطأ أثناء جلب الفروع', error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const validateForm = () => {
    if (!username || !email || !role) {
      Alert.alert('خطأ', 'جميع الحقول مطلوبة');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('خطأ', 'البريد الإلكتروني غير صالح');
      return false;
    }
    return true;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, role, password, branchId: branchId || null }),
      });

      if (response.ok) {
        Alert.alert('نجاح', 'تم إضافة المستخدم');
        router.back();
      } else {
        const data = await response.json();
        console.error('خطأ إضافة المستخدم', data.message);
        Alert.alert('خطأ', 'فشل في إضافة المستخدم');
      }
    } catch (error) {
      console.error('خطأ', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالسيرفر');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* زر رجوع */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/admin/(tabs)/users`)}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.title}>إضافة مستخدم جديد</Text>

      <TextInput
        placeholder="اسم المستخدم"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="البريد الإلكتروني"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder=" كلمة المرور"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* اختيار الدور */}
      <TouchableOpacity style={styles.selectButton} onPress={() => setRoleModalVisible(true)}>
        <Text style={styles.selectButtonText}>
          {role ? roles.find((r) => r.value === role)?.label : 'اختر الدور'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#812732" />
      </TouchableOpacity>

      {/* اختيار الفرع */}
      <TouchableOpacity style={styles.selectButton} onPress={() => setBranchModalVisible(true)}>
        <Text style={styles.selectButtonText}>
          {branchId
            ? branches.find((b: any) => b.id === branchId)?.name
            : 'اختر الفرع (اختياري)'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#812732" />
      </TouchableOpacity>

      {/* زر الإضافة */}
      <TouchableOpacity style={styles.button} onPress={handleAddUser}>
        <Text style={styles.buttonText}>إضافة</Text>
      </TouchableOpacity>

      {/* Modal لاختيار الدور */}
      <Modal
        transparent
        animationType="slide"
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {roles.map((r) => (
              <Pressable
                key={r.value}
                style={styles.modalItem}
                onPress={() => {
                  setRole(r.value);
                  setRoleModalVisible(false);
                }}
              >
                <Text>{r.label}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setRoleModalVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal لاختيار الفرع */}
      <Modal
        transparent
        animationType="slide"
        visible={branchModalVisible}
        onRequestClose={() => setBranchModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {branches.map((branch: any) => (
              <Pressable
                key={branch.id}
                style={styles.modalItem}
                onPress={() => {
                  setBranchId(branch.id);
                  setBranchModalVisible(false);
                }}
              >
                <Text>{branch.name}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setBranchModalVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#812732',
  },
  button: {
    backgroundColor: '#812732',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
});
