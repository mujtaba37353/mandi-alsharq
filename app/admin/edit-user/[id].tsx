import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

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

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);

  const fetchCurrentUser = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setCurrentUser(data.data);
  };

  const fetchUser = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const res = await fetch(`${BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setUsername(data.username || '');
      setEmail(data.email || '');
      setRole(data.role || '');
      setBranchId(data.branch?.id || '');
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setPhone(data.phone || '');
    }
  };

  const fetchBranches = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/branches`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setBranches(data);
  };

  const handleUpdateUser = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || !currentUser) return;

    let endpoint = '';
    let payload: any = {};

    if (currentUser.role === 'OWNER') {
      endpoint = `/users/owner/${id}`;
      payload = {
        username,
        email,
        role,
        branchId,
      };
    } else if (currentUser.role === 'BRANCH_ADMIN') {
      endpoint = `/users/branch/${id}`;
      payload = {
        email,
        firstName,
        lastName,
        phone,
      };
      if (password) payload.password = password;
    } else {
      Alert.alert('ليس لديك صلاحية');
      return;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert('تم', 'تم تعديل المستخدم');
      router.back();
    } else {
      Alert.alert('خطأ', data.message || 'فشل التعديل');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUser();
    fetchBranches();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تعديل المستخدم</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
        <Text style={styles.backText}>رجوع</Text>
      </TouchableOpacity>

      {/* الاسم */ }
      <TextInput
        placeholder="اسم المستخدم"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        editable={currentUser?.role === 'OWNER'}
      />

      <TextInput
        placeholder="البريد الإلكتروني"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      {currentUser?.role === 'BRANCH_ADMIN' && (
        <>
          <TextInput
            placeholder="الاسم الأول"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            placeholder="الاسم الأخير"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            placeholder="رقم الهاتف"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder="كلمة المرور (اختياري)"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </>
      )}

      {/* الدور */ }
      {currentUser?.role === 'OWNER' ? (
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

      {/* الفرع */ }
      {currentUser?.role === 'OWNER' && (
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setBranchModalVisible(true)}>
          <Text style={styles.dropdownButtonText}>
            {branches.find(b => b.id === branchId)?.name || 'اختر الفرع'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#812732" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
        <Text style={styles.buttonText}>حفظ التعديلات</Text>
      </TouchableOpacity>

      {/* Modal الدور */ }
      <Modal transparent animationType="slide" visible={roleModalVisible}>
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
              <Text style={{ color: 'red' }}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal الفرع */ }
      <Modal transparent animationType="slide" visible={branchModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {branches.map(branch => (
              <Pressable key={branch.id} style={styles.modalItem} onPress={() => {
                setBranchId(branch.id);
                setBranchModalVisible(false);
              }}>
                <Text>{branch.name}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setBranchModalVisible(false)}>
              <Text style={{ color: 'red' }}>إلغاء</Text>
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
  dropdownButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15
  },
  dropdownButtonText: { color: '#812732', fontSize: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: '#812732', marginLeft: 8 },
  button: { backgroundColor: '#812732', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalCancel: { marginTop: 10, paddingVertical: 15, alignItems: 'center' },
});
