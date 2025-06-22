// ✅ EditProductPage.tsx — النسخة النهائية الكاملة لتعديل منتج (مع خيار رفع صورة جديدة مثل صفحة الإضافة)

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Image, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://cam4rent.net';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [specs, setSpecs] = useState([{ name: '', nameEN: '', description: '', descriptionEN: '', price: '' }]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => { fetchUserRole(); }, []);
  useEffect(() => { if (branchId) fetchCategories(branchId); }, [branchId]);
  useEffect(() => { fetchProduct(); }, [id]);

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
    if (res.ok && Array.isArray(data)) setCategories(data);
    else setCategories([]);
  };

  const fetchProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setName(data.translations?.find(t => t.language === 'AR')?.name || data.name);
        setDescription(data.translations?.find(t => t.language === 'AR')?.description || data.description);
        setNameEN(data.translations?.find(t => t.language === 'EN')?.name || '');
        setDescriptionEN(data.translations?.find(t => t.language === 'EN')?.description || '');
        setPrice(String(data.price));
        setDiscount(String(data.discount || ''));
        setImageUrl(`${BASE_URL}${data.imageUrl || ''}`);
        setBranchId(data.branchId);
        setCategoryId(data.categoryId);

        if (data.specifications?.length > 0) {
          const formattedSpecs = data.specifications.map((s) => {
            const ar = s.translations.find(t => t.language === 'AR') || {};
            const en = s.translations.find(t => t.language === 'EN') || {};
            return {
              name: ar.name || s.name,
              description: ar.description || '',
              nameEN: en.name || '',
              descriptionEN: en.description || '',
              price: String(s.price || '0'),
            };
          });
          setSpecs(formattedSpecs);
        }
      } else {
        Alert.alert('خطأ', 'فشل في تحميل بيانات المنتج');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await uploadImage(uri);
      }
    } catch (error) {
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
          'Content-Type': 'multipart/form-data',
        },
      });

      if ((res.status === 200 || res.status === 201) && res.data.url) {
        setImageUrl(`${BASE_URL}${res.data.url}`);
      } else {
        Alert.alert('خطأ', 'فشل رفع الصورة');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل رفع الصورة');
    }
  };


  const updateSpec = (index, key, value) => {
    const updated = [...specs];
    updated[index][key] = value;
    setSpecs(updated);
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

    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      Alert.alert('تم', 'تم حفظ التعديلات بنجاح');
      router.replace('/admin/(tabs)/menus');
    } else {
      const data = await res.json();
      Alert.alert('خطأ', data.message || 'فشل التعديل');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.header}>تعديل المنتج</Text>

      {/* الفروع */}
      {role === 'OWNER' && (
        <>
          <Text style={styles.label}>اختر الفرع:</Text>
          {branches.map((b) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => setBranchId(b.id)}
              style={[styles.option, branchId === b.id && styles.selectedOption]}
            >
              <Text style={{ color: branchId === b.id ? '#fff' : '#000' }}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* الفئات */}
      <Text style={styles.label}>اختر الفئة:</Text>
      {categories.length > 0 ? (
        <View style={styles.fieldContainer}>
          {categories.map((cat) => (
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

      <TextInput style={styles.input} placeholder="الاسم بالعربية" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="الوصف بالعربية" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="الاسم بالإنجليزية (اختياري)" value={nameEN} onChangeText={setNameEN} />
      <TextInput style={styles.input} placeholder="الوصف بالإنجليزية (اختياري)" value={descriptionEN} onChangeText={setDescriptionEN} />
      <TextInput style={styles.input} placeholder="السعر" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <TextInput style={styles.input} placeholder="الخصم (اختياري)" keyboardType="decimal-pad" value={discount} onChangeText={setDiscount} />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri || imageUrl ? (
          <Image source={{ uri: imageUri || imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>اختر صورة</Text>
        )}
        {(imageUri || imageUrl) && (
          <>
            <Image source={{ uri: imageUri || imageUrl }} style={styles.image} />
            <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
              <Text style={styles.changeImageText}>تغيير الصورة</Text>
            </TouchableOpacity>
          </>
        )}

      </TouchableOpacity>

      <Text style={styles.label}>الإضافات (اختياري):</Text>
      {specs.map((spec, index) => (
        <View key={index} style={styles.specRow}>
          <TextInput placeholder="الاسم بالعربية" style={[styles.input, { flex: 1 }]} value={spec.name} onChangeText={(val) => updateSpec(index, 'name', val)} />
          <TextInput placeholder="الاسم بالإنجليزية" style={[styles.input, { flex: 1 }]} value={spec.nameEN} onChangeText={(val) => updateSpec(index, 'nameEN', val)} />
          <TextInput placeholder="الوصف بالعربية" style={[styles.input, { flex: 1 }]} value={spec.description} onChangeText={(val) => updateSpec(index, 'description', val)} />
          <TextInput placeholder="الوصف بالإنجليزية" style={[styles.input, { flex: 1 }]} value={spec.descriptionEN} onChangeText={(val) => updateSpec(index, 'descriptionEN', val)} />
          <TextInput placeholder="السعر" keyboardType="decimal-pad" style={[styles.input, { width: 80, marginLeft: 10 }]} value={spec.price} onChangeText={(val) => updateSpec(index, 'price', val)} />
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={22} color="#fff" />
        <Text style={styles.saveText}>حفظ التعديلات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  backButton: { marginBottom: 10 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#812732', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 15, color: '#333' },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#812732' },
  fieldContainer: { marginVertical: 10, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  option: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8 },
  selectedOption: { backgroundColor: '#812732', borderColor: '#812732' },
  selectedText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  specRow: { marginBottom: 20 },
  saveButton: { backgroundColor: '#812732', padding: 14, borderRadius: 10, marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  imagePicker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  imageText: { color: '#888' },
  image: { width: 100, height: 100, borderRadius: 10 },
  changeImageButton: {
  marginTop: 10,
  backgroundColor: '#f0f0f0',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 8,
  alignItems: 'center',
},

changeImageText: {
  color: '#812732',
  fontWeight: 'bold',
},

});
