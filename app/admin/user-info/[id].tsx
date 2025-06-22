import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

const roleTranslation: Record<string, string> = {
  USER: 'مستخدم',
  OWNER: 'المالك',
  BRANCH_ADMIN: 'مدير فرع',
  CASHIER: 'كاشير',
  DELIVERY: 'عامل توصيل',
};

export default function UserInfoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const fetchCurrentUser = async () => {
    const token = await AsyncStorage.getItem('token');
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

    const response = await fetch(`${BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (response.ok) {
      setUser(data);
    } else {
      Alert.alert('خطأ', 'فشل جلب بيانات المستخدم');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !currentUser || !user) return;

      if (currentUser.role === 'BRANCH_ADMIN' && currentUser.branchId !== user.branch?.id) {
        Alert.alert('خطأ', 'لا يمكنك حذف مستخدم من فرع آخر');
        return;
      }

      if (user.role === 'OWNER') {
        Alert.alert('خطأ', 'لا يمكن حذف المالك');
        return;
      }

      const endpoint =
        currentUser.role === 'OWNER'
          ? `/users/owner/${id}`
          : `/users/branch/${id}`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        Alert.alert('تم حذف المستخدم');
        router.replace('/admin/users');
      } else {
        Alert.alert('خطأ', 'فشل حذف المستخدم');
      }
    } catch (error) {
      console.error('خطأ', error);
      Alert.alert('خطأ', 'فشل حذف المستخدم');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUser();
  }, []);

  if (!user || !currentUser) return null;

  const canView = currentUser.role === 'OWNER' || currentUser.role === 'BRANCH_ADMIN';
  const canEdit =
    currentUser.role === 'OWNER' ||
    (currentUser.role === 'BRANCH_ADMIN' && currentUser.branchId === user.branch?.id);
  const canDelete =
    currentUser.role === 'OWNER' ||
    (currentUser.role === 'BRANCH_ADMIN' &&
      currentUser.branchId === user.branch?.id &&
      user.role !== 'BRANCH_ADMIN');

  if (!canView) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>ليس لديك صلاحية لعرض هذه الصفحة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/admin/(tabs)/users`)}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
        <Text style={styles.backText}>رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{user.username}</Text>
      <Text style={styles.detail}>البريد الإلكتروني: {user.email}</Text>
      <Text style={styles.detail}>الدور: {roleTranslation[user.role]}</Text>
      <Text style={styles.detail}>الفرع: {user.branch?.name || 'غير محدد'}</Text>

      <View style={styles.buttonsContainer}>
        {canEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/admin/edit-user/${user.id}`)}
          >
            <Text style={styles.buttonText}>تعديل</Text>
          </TouchableOpacity>
        )}

        {canDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteUser}>
            <Text style={styles.buttonText}>حذف</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#812732', marginBottom: 20, textAlign: 'center' },
  detail: { fontSize: 16, marginBottom: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: '#812732', marginLeft: 8 },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  editButton: {
    backgroundColor: '#812732',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
