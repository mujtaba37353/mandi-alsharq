import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://143.244.156.186:3007';

export default function AddUserPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userBranchId, setUserBranchId] = useState(null);
  const [loading, setLoading] = useState(true);

  const allowedRoles = ['USER', 'CASHIER', 'DELIVERY', 'BRANCH_ADMIN'];
  const roleTranslation = {
    USER: 'مستخدم',
    CASHIER: 'كاشير',
    DELIVERY: 'عامل توصيل',
    BRANCH_ADMIN: 'مدير فرع',
  };

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
      }
    } catch (error) {
      console.error('خطأ أثناء جلب الفروع', error);
    }
  };

  const getUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUserRole(data.data.role);
        setUserBranchId(data.data.branchId);
      }
    } catch (error) {
      console.error('خطأ أثناء جلب بيانات المستخدم', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!username || !email || !password || !role) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          role,
          password,
          branchId: userRole === 'OWNER' ? branchId : userBranchId,
        }),
      });

      if (response.ok) {
        Alert.alert('تم', 'تمت إضافة المستخدم بنجاح');
        router.back();
      } else {
        const data = await response.json();
        console.error('فشل إضافة المستخدم', data.message);
        Alert.alert('خطأ', 'فشل في إضافة المستخدم');
      }
    } catch (error) {
      console.error('خطأ', error);
      Alert.alert('خطأ', 'فشل في الاتصال بالسيرفر');
    }
  };

  useEffect(() => {
    getUserInfo();
    fetchBranches();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#812732" />
      </View>
    );
  }

  if (userRole !== 'OWNER' && userRole !== 'BRANCH_ADMIN') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.unauthorizedText}>ليس لديك صلاحية للوصول الى هذه الصفحة</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.title}>إضافة مستخدم جديد</Text>

      <TextInput
        placeholder="اسم المستخدم"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        textAlign="right"
      />
      <TextInput
        placeholder="البريد الإلكتروني"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textAlign="right"
      />
      <TextInput
        placeholder="كلمة المرور"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textAlign="right"
      />

      {/* اختيار الدور */}
      {allowedRoles.map((r) => (
        <TouchableOpacity
          key={r}
          style={[
            styles.roleOption,
            role === r && { backgroundColor: '#812732' },
          ]}
          onPress={() => setRole(r)}
        >
          <Text style={[styles.roleText, role === r && { color: '#fff' }]}>
            {roleTranslation[r]}
          </Text>
        </TouchableOpacity>
      ))}

      {/* اختيار الفرع - فقط للمالك */}
      {userRole === 'OWNER' && (
        <>
          <Text style={styles.sectionTitle}>اختر الفرع</Text>
          {branches.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.branchOption,
                branchId === b.id && { backgroundColor: '#812732' },
              ]}
              onPress={() => setBranchId(b.id)}
            >
              <Text style={[styles.branchText, branchId === b.id && { color: '#fff' }]}>
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleAddUser}>
        <Text style={styles.saveButtonText}>حفظ المستخدم</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unauthorizedText: { color: 'red', fontSize: 18 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#812732', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  roleOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#812732',
    marginBottom: 10,
  },
  roleText: {
    textAlign: 'center',
    color: '#812732',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
    marginTop: 20,
    marginBottom: 10,
  },
  branchOption: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#812732',
    marginBottom: 8,
  },
  branchText: { textAlign: 'center', color: '#812732' },
  saveButton: {
    backgroundColor: '#812732',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
