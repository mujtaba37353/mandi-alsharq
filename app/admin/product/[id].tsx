import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchProduct();
    getRole();
  }, [id]);

  const getRole = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    if (storedRole) setRole(storedRole);
  };

  const fetchProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProduct(data);
    } catch (err) {
      console.error('فشل جلب المنتج', err);
    }
  };

  const handleDelete = async () => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد أنك تريد حذف هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/products/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              router.replace('/admin/(tabs)/menus');
            } else {
              Alert.alert('فشل الحذف', 'حدث خطأ أثناء حذف المنتج');
            }
          } catch (err) {
            console.error('خطأ في الحذف', err);
            Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
          }
        },
      },
    ]);
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/admin/(tabs)/menus')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#812732" />
        </TouchableOpacity>
        <Text style={styles.errorText}>لم يتم العثور على المنتج</Text>
      </View>
    );
  }

  const arabic = product.translations?.find(t => t.language === 'AR');
  const english = product.translations?.find(t => t.language === 'EN');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/menus`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      {product.imageUrl && (
        <Image
          source={{
            uri: product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}`,
          }}
          style={styles.image}
        />

      )}

      <Text style={styles.name}>{arabic?.name || product.name}</Text>
      <Text style={styles.description}>{arabic?.description || product.description}</Text>

      {english && (
        <>
          <Text style={styles.sectionTitle}>الاسم بالإنجليزية</Text>
          <Text style={styles.name}>{english.name}</Text>
          <Text style={styles.description}>{english.description}</Text>
        </>
      )}

      <Text style={styles.price}>{product.discount ? (
        <>
          <Text style={styles.oldPrice}>{product.price} ر.س</Text>{' '}
          <Text style={styles.discountedPrice}>{product.price - product.discount} ر.س</Text>
        </>
      ) : `${product.price} ر.س`}</Text>

      {product.category?.name && (
        <Text style={styles.category}>التصنيف: {product.category.name}</Text>
      )}

      {product.specifications?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>المواصفات</Text>
          {product.specifications.map((spec, index) => {
            const ar = spec.translations?.find(t => t.language === 'AR');
            const en = spec.translations?.find(t => t.language === 'EN');
            return (
              <View key={index} style={styles.specItem}>
                {spec.imageUrl && (
                  <Image source={{ uri: `${BASE_URL}${spec.imageUrl}` }} style={styles.specImage} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.specName}>{ar?.name || spec.name}</Text>
                  <Text style={styles.specDesc}>{ar?.description}</Text>
                  {en && (
                    <>
                      <Text style={styles.specEN}>EN: {en.name}</Text>
                      <Text style={styles.specEN}>{en.description}</Text>
                    </>
                  )}
                  {spec.price && <Text style={styles.specPrice}>+{spec.price} ر.س</Text>}
                </View>
              </View>
            );
          })}
        </>
      )}

      {(role === 'OWNER' || role === 'BRANCH_ADMIN') && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/admin/edit-product/${id}`)}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
          <Text style={styles.editText}>تعديل المنتج</Text>
        </TouchableOpacity>
      )}

      {role === 'BRANCH_ADMIN' && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.editText}>حذف المنتج</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  backButton: { marginBottom: 10 },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  discountedPrice: {
    color: '#812732',
    fontWeight: 'bold',
  },
  category: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
    marginTop: 20,
    marginBottom: 10,
  },
  specItem: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  specImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  specName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  specDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  specEN: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  specPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    color: '#812732',
    fontSize: 16,
  },
});
