// ✅ AddCategoryPage.tsx — بعد التعديلات لدعم الفروع + الترجمات + الصلاحيات

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function AddCategoryPage() {
  const router = useRouter();
  const [nameAR, setNameAR] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [role, setRole] = useState('');

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
      if (data.data.role === 'BRANCH_ADMIN') {
        setBranchId(data.data.branchId);
      } else {
        fetchBranches();
      }
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

  const handleSave = async () => {
    if (!nameAR || !nameEN || !branchId) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const payload = {
      name: nameAR,
      branchId,
      translations: [
        { name: nameEN, language: 'EN' },
        { name: nameAR, language: 'AR' },
      ]
    };

    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert('تم', 'تمت إضافة الفئة بنجاح');
      router.replace('/admin/(tabs)/menus');
    } else {
      Alert.alert('خطأ', data.message || 'فشل الإضافة');
    }
  };

  if (role !== 'OWNER' && role !== 'BRANCH_ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'red' }}>
          ❌ لا تملك صلاحية لإضافة فئة
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.title}>إضافة فئة جديدة</Text>

      <TextInput
        style={styles.input}
        placeholder="اسم الفئة بالعربية"
        value={nameAR}
        onChangeText={setNameAR}
      />

      <TextInput
        style={styles.input}
        placeholder="Category name in English"
        value={nameEN}
        onChangeText={setNameEN}
      />

      {role === 'OWNER' && (
        <>
          <Text style={styles.label}>اختر الفرع:</Text>
          {branches.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.branchButton,
                branchId === b.id && styles.selectedBranch,
              ]}
              onPress={() => setBranchId(b.id)}
            >
              <Text style={branchId === b.id ? styles.selectedText : styles.branchText}>
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>حفظ الفئة</Text>
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#812732',
  },
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
  branchText: {
    textAlign: 'center',
  },
  selectedText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});