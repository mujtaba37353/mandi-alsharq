// app/admin/categories.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [role, setRole] = useState('');
  const [userBranchId, setUserBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setRole(data.data.role);
      setUserBranchId(data.data.branchId);
      if (data.data.role === 'BRANCH_ADMIN') {
        setSelectedBranch(data.data.branchId);
      }
      fetchCategories(data.data.role, data.data.branchId);
      if (data.data.role === 'OWNER') fetchBranches();
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

  const fetchCategories = async (userRole: string, branchId: string) => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    const url =
      userRole === 'OWNER'
        ? `${BASE_URL}/categories/admin`
        : `${BASE_URL}/categories/branch/${branchId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setCategories(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذه الفئة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            Alert.alert('تم الحذف بنجاح');
            fetchCategories(role, selectedBranch);
          } else {
            Alert.alert('خطأ', 'فشل حذف الفئة');
          }
        },
      },
    ]);
  };

  const filtered =
    role === 'OWNER' && selectedBranch
      ? categories.filter((cat) => cat.branchId === selectedBranch)
      : categories;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/admin/(tabs)/menus')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.title}>قائمة الفئات</Text>

      {role === 'OWNER' && (
        <View style={styles.filterContainer}>
          <Text style={styles.label}>فلترة حسب الفرع:</Text>
          {branches.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.branchButton, selectedBranch === b.id && styles.selectedBranch]}
              onPress={() => setSelectedBranch(b.id)}
            >
              <Text
                style={selectedBranch === b.id ? styles.selectedText : styles.branchText}
              >
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#812732" size="large" />
      ) : (
        filtered.map((cat) => (
          <View key={cat.id} style={styles.card}>
            <Text style={styles.cardTitle}>{cat.name}</Text>
            <Text style={styles.cardSubtitle}>الفرع: {cat.branch?.name || 'غير معروف'}</Text>
            {(role === 'OWNER' || userBranchId === cat.branchId) && (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/edit-category/${cat.id}`)}
                >
                  <Text style={styles.edit}>تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(cat.id)}>
                  <Text style={styles.delete}>حذف</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  backButton: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: { marginBottom: 20 },
  label: { color: '#812732', fontWeight: 'bold', marginBottom: 10 },
  branchButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  selectedBranch: {
    backgroundColor: '#812732',
  },
  branchText: { textAlign: 'center' },
  selectedText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 18 },
  cardSubtitle: { color: '#555', marginTop: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  edit: { color: '#0066cc' },
  delete: { color: 'red' },
});
