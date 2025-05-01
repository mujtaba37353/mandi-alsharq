import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// بيانات وهمية مبدئية
const fakeProduct = {
  name: 'مندي دجاج',
  price: 35,
  discount: 5,
  category: 'الأطباق الرئيسية',
  specifications: [
    { name: 'زيادة بهارات', price: 2 },
    { name: 'جبن إضافي', price: 3 },
  ],
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState('');
  const [specifications, setSpecifications] = useState<{ name: string; price?: string }[]>([]);

  useEffect(() => {
    // تحميل بيانات المنتج من الـ backend أو من fakeProduct
    setName(fakeProduct.name);
    setPrice(String(fakeProduct.price));
    setDiscount(String(fakeProduct.discount));
    setCategory(fakeProduct.category || '');
    setSpecifications(fakeProduct.specifications || []);
  }, [id]);

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert('تنبيه', 'يرجى تعبئة الاسم والسعر');
      return;
    }

    const productData = {
      name,
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      category,
      specifications,
    };

    console.log('📦 بيانات المنتج المعدلة:', productData);
    router.back();
  };

  const updateSpec = (index: number, key: 'name' | 'price', value: string) => {
    const updated = [...specifications];
    updated[index][key] = value;
    setSpecifications(updated);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* زر رجوع */}
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/menus`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.header}>تعديل المنتج</Text>

      <TextInput
        style={styles.input}
        placeholder="اسم المنتج"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="السعر (ريال)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        style={styles.input}
        placeholder="الخصم (اختياري)"
        keyboardType="numeric"
        value={discount}
        onChangeText={setDiscount}
      />

      <TextInput
        style={styles.input}
        placeholder="التصنيف (اختياري)"
        value={category}
        onChangeText={setCategory}
      />

      {/* المواصفات */}
      <Text style={styles.sectionTitle}>المواصفات</Text>
      {specifications.map((spec, index) => (
        <View key={index} style={styles.specRow}>
          <TextInput
            placeholder="الاسم"
            style={[styles.input, { flex: 1, marginEnd: 8 }]}
            value={spec.name}
            onChangeText={(value) => updateSpec(index, 'name', value)}
          />
          <TextInput
            placeholder="السعر"
            keyboardType="numeric"
            style={[styles.input, { width: 80 }]}
            value={spec.price || ''}
            onChangeText={(value) => updateSpec(index, 'price', value)}
          />
        </View>
      ))}

      {/* زر الحفظ */}
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
    marginTop: 20,
    marginBottom: 10,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
