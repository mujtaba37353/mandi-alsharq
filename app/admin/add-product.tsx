import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const images = [
  { label: 'صورة 1', file: require('@/assets/images/food1.png') },
  { label: 'صورة 2', file: require('@/assets/images/food2.png') },
  { label: 'صورة 3', file: require('@/assets/images/food3.png') },
];

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState('');
  const [specifications, setSpecifications] = useState([{ name: '', price: '' }]);
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const handleSave = () => {
    if (!name || !price || !selectedImage) {
      Alert.alert('تنبيه', 'يرجى تعبئة الاسم والسعر واختيار صورة');
      return;
    }

    const productData = {
      name,
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      category,
      image: selectedImage.label,
      specifications: specifications.filter((s) => s.name.trim()),
    };

    console.log('📦 المنتج الجديد:', productData);
    router.back();
  };

  const updateSpec = (index: number, key: 'name' | 'price', value: string) => {
    const updated = [...specifications];
    updated[index][key] = value;
    setSpecifications(updated);
  };

  const addSpec = () => {
    setSpecifications([...specifications, { name: '', price: '' }]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* زر الرجوع */}
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/menus`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      <Text style={styles.header}>إضافة منتج جديد</Text>

      {/* إدخالات المنتج */}
      <TextInput style={styles.input} placeholder="اسم المنتج" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="السعر (ريال)" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TextInput style={styles.input} placeholder="الخصم (اختياري)" keyboardType="numeric" value={discount} onChangeText={setDiscount} />
      <TextInput style={styles.input} placeholder="التصنيف (اختياري)" value={category} onChangeText={setCategory} />

      {/* اختيار صورة */}
      <Text style={styles.sectionTitle}>اختر صورة:</Text>
      <View style={styles.imageRow}>
        {images.map((img) => (
          <TouchableOpacity key={img.label} onPress={() => setSelectedImage(img)}>
            <Image
              source={img.file}
              style={[
                styles.imagePreview,
                selectedImage.label === img.label && styles.selectedImage,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* المواصفات */}
      <Text style={styles.sectionTitle}>المواصفات:</Text>
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
            value={spec.price}
            onChangeText={(value) => updateSpec(index, 'price', value)}
          />
        </View>
      ))}

      {/* زر إضافة مواصفة */}
      <TouchableOpacity style={styles.addSpecButton} onPress={addSpec}>
        <Ionicons name="add" size={20} color="#812732" />
        <Text style={styles.addSpecText}>إضافة مواصفة</Text>
      </TouchableOpacity>

      {/* زر حفظ */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={22} color="#fff" />
        <Text style={styles.saveText}>حفظ المنتج</Text>
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
    marginBottom: 10,
    marginTop: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedImage: {
    borderColor: '#812732',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addSpecButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  addSpecText: {
    color: '#812732',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
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
