// ✅ AddMenu.tsx — النسخة النهائية الكاملة والمحدثة مع دعم اختيار الفئة وعرض "لا توجد فئات"

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Image, Alert, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios'; // تأكد أنك ثبتت axios
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [specs, setSpecs] = useState([{ name: '', nameEN: '', description: '', descriptionEN: '', price: '' }]);
  const [role, setRole] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (branchId) {
      fetchCategories(branchId);
    }
  }, [branchId]);

  const fetchUserRole = async () => {
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

  const fetchCategories = async (selectedBranchId) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/categories/branch/${selectedBranchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setCategories(data);
    } else {
      setCategories([]);
    }
  };

  const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('خطأ', 'يجب السماح بالوصول إلى الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // أو MediaType.IMAGE حسب نسختك
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await uploadImage(uri);
    }
  } catch (error) {
    console.error('❌ فشل اختيار الصورة:', error);
    Alert.alert('خطأ', 'فشل اختيار الصورة');
  }
};



const uploadImage = async (uri) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const filename = uri.split('/').pop();
    const ext = filename?.split('.').pop();
    const type = `image/${ext}`;

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    const res = await axios.post(`${BASE_URL}/uploads/image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // هام أن يبقى هنا في axios
      },
    });

    if ((res.status === 200 || res.status === 201) && res.data.url) {
      setImageUrl(`${BASE_URL}${res.data.url}`);
    } else {
      console.log('📛 فشل رفع الصورة:', res.data);
      Alert.alert('خطأ', 'فشل رفع الصورة');
    }
  } catch (err: any) {
    console.error('❌ خطأ أثناء رفع الصورة:', err.response?.data || err.message);
    Alert.alert('خطأ', 'فشل رفع الصورة');
  }
};


  const handleAddSpec = () => {
    setSpecs([...specs, { name: '', nameEN: '', description: '', descriptionEN: '', price: '' }]);
  };

  const handleSave = async () => {
    if (!name || !description || !price || !imageUrl || !branchId || !categoryId) {
      Alert.alert('تنبيه', 'يرجى تعبئة الحقول المطلوبة');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const payload = {
      name,
      description,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      imageUrl,
      isAvailable: true,
      branchId,
      categoryId,
      translations: [
        { name, description, language: 'AR' },
        ...(nameEN || descriptionEN ? [{ name: nameEN, description: descriptionEN, language: 'EN' }] : []),
      ],
      specifications: specs.filter(s => s.name.trim()).map(s => ({
        name: s.name,
        price: parseFloat(s.price || '0'),
        translations: [
          { name: s.name, description: s.description, language: 'AR' },
          ...(s.nameEN || s.descriptionEN ? [{ name: s.nameEN, description: s.descriptionEN, language: 'EN' }] : []),
        ],
      })),
    };

    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert('تم', 'تمت إضافة المنتج بنجاح');
      router.replace('/admin/(tabs)/menus');
    } else {
      Alert.alert('خطأ', data.message || 'فشل الإضافة');
    }
  };




  if (role !== 'OWNER' && role !== 'BRANCH_ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'red' }}>
          ❌ لا تملك صلاحية لإضافة منتج
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/admin/(tabs)/menus')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
        <Text style={{ color: '#812732', marginLeft: 8 }}>الرجوع إلى القوائم</Text>
      </TouchableOpacity>

      <Text style={styles.title}>إضافة منتج جديد</Text>

      <TextInput style={styles.input} placeholder="الاسم بالعربية" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="الوصف بالعربية" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="الاسم بالإنجليزية (اختياري)" value={nameEN} onChangeText={setNameEN} />
      <TextInput style={styles.input} placeholder="الوصف بالإنجليزية (اختياري)" value={descriptionEN} onChangeText={setDescriptionEN} />
      <TextInput style={styles.input} placeholder="السعر" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <TextInput style={styles.input} placeholder="الخصم (اختياري)" keyboardType="decimal-pad" value={discount} onChangeText={setDiscount} />

      {role === 'OWNER' && (
        <>
          <Text style={styles.label}>اختر الفرع:</Text>
          {branches.map((b) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => setBranchId(b.id)}
              style={[styles.branchOption, branchId === b.id && styles.selectedOption]}
            >
              <Text style={branchId === b.id ? styles.selectedText : styles.branchText}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.label}>اختر الفئة:</Text>
      {categories.length > 0 ? (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>اختر الفئة</Text>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={[styles.option, categoryId === cat.id && styles.selectedOption]}
            >

              <Text style={{ color: categoryId === cat.id ? '#fff' : '#000' }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.label}>لا توجد فئات لهذا الفرع</Text>
      )}


      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>اختر صورة</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>الإضافات (اختياري):</Text>
      {specs.map((spec, index) => (
        <View key={index} style={styles.specRow}>
          <TextInput
            placeholder="الاسم بالعربية"
            style={[styles.input, { flex: 1 }]}
            value={spec.name}
            onChangeText={(val) => {
              const updated = [...specs];
              updated[index].name = val;
              setSpecs(updated);
            }}
          />
          <TextInput
            placeholder="الاسم بالإنجليزية"
            style={[styles.input, { flex: 1 }]}
            value={spec.nameEN}
            onChangeText={(val) => {
              const updated = [...specs];
              updated[index].nameEN = val;
              setSpecs(updated);
            }}
          />
          <TextInput
            placeholder="الوصف بالعربية"
            style={[styles.input, { flex: 1 }]}
            value={spec.description}
            onChangeText={(val) => {
              const updated = [...specs];
              updated[index].description = val;
              setSpecs(updated);
            }}
          />
          <TextInput
            placeholder="الوصف بالإنجليزية"
            style={[styles.input, { flex: 1 }]}
            value={spec.descriptionEN}
            onChangeText={(val) => {
              const updated = [...specs];
              updated[index].descriptionEN = val;
              setSpecs(updated);
            }}
          />
          <TextInput
            placeholder="السعر"
            keyboardType="decimal-pad"
            style={[styles.input, { width: 80, marginLeft: 10 }]}
            value={spec.price}
            onChangeText={(val) => {
              const updated = [...specs];
              updated[index].price = val;
              setSpecs(updated);
            }}
          />
        </View>
      ))}

      <TouchableOpacity onPress={handleAddSpec}>
        <Text style={styles.addSpecText}>+ إضافة جديدة</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>حفظ المنتج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#812732', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16, color: '#000' },
  imagePicker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  imageText: { color: '#888' },
  image: { width: 100, height: 100, borderRadius: 10 },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#812732' },
  specRow: { marginBottom: 20 },
  addSpecText: { color: '#0066cc', marginBottom: 20 },
  saveButton: { backgroundColor: '#812732', padding: 14, borderRadius: 10 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  branchOption: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  branchText: { textAlign: 'center', color: '#812732' },
  selectedOption: { backgroundColor: '#812732' },
  selectedText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  fieldContainer: {
      marginVertical: 10,
      backgroundColor: '#f9f9f9',
      padding: 12,
      borderRadius: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    option: {
      padding: 10,
      color: '#812732',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginBottom: 8,
    },
    selectedOption: {
      backgroundColor: '#812732',
      borderColor: '#812732',
    },
});
