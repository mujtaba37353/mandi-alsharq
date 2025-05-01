import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// بيانات وهمية لتجربة الصفحة
const fakeProducts = {
  p1: {
    name: 'مندي دجاج',
    price: 35,
    discount: 5,
    image: require('@/assets/images/food1.png'),
    category: 'الأطباق الرئيسية',
    specifications: [
      { name: 'زيادة بهارات', price: 2 },
      { name: 'جبن إضافي', price: 3, image: require('@/assets/images/food3.png') },
    ],
  },
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const product = fakeProducts[id as string];

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
  

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* زر الرجوع */}
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/menus`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      {/* صورة المنتج */}
      <Image source={product.image} style={styles.image} />

      {/* معلومات المنتج */}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>
        {product.discount ? (
          <>
            <Text style={styles.oldPrice}>{product.price} ر.س</Text> {' '}
            <Text style={styles.discountedPrice}>
              {product.price - product.discount} ر.س
            </Text>
          </>
        ) : (
          `${product.price} ر.س`
        )}
      </Text>

      {/* التصنيف */}
      {product.category && (
        <Text style={styles.category}>التصنيف: {product.category}</Text>
      )}

      {/* المواصفات */}
      {product.specifications?.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>المواصفات</Text>
          {product.specifications.map((spec, idx) => (
            <View key={idx} style={styles.specItem}>
              {spec.image && (
                <Image source={spec.image} style={styles.specImage} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.specName}>{spec.name}</Text>
                {spec.price && <Text style={styles.specPrice}>+{spec.price} ر.س</Text>}
              </View>
            </View>
          ))}
        </>
      )}

      {/* زر تعديل المنتج */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push(`/admin/edit-product/${id}`)}
      >
        <Ionicons name="create-outline" size={22} color="#fff" />
        <Text style={styles.editText}>تعديل المنتج</Text>
      </TouchableOpacity>
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
  sectionHeader: {
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
