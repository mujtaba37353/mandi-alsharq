import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const categories = [
  {
    id: '1',
    name: 'الأطباق الرئيسية',
    products: [
      {
        id: 'p1',
        name: 'مندي دجاج',
        price: 35,
        image: require('@/assets/images/food1.png'),
        discount: 5,
      },
      {
        id: 'p2',
        name: 'مضغوط لحم',
        price: 45,
        image: require('@/assets/images/food2.png'),
      },
    ],
  },
  {
    id: '2',
    name: 'المقبلات',
    products: [
      {
        id: 'p3',
        name: 'سلطة خضراء',
        price: 10,
        image: require('@/assets/images/food3.png'),
      },
    ],
  },
];

export default function MenusPage() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* زر إضافة تصنيف */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/admin/add-menu')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>إضافة تصنيف</Text>
      </TouchableOpacity>

      {/* التصنيفات والمنتجات */}
      {categories.map((category) => (
        <View key={category.id} style={styles.categoryBox}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push(`/admin/add-product?categoryId=${category.id}`)}
              >
                <Ionicons name="add-circle-outline" size={22} color="#812732" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/admin/edit-category/${category.id}`)}
              >
                <Ionicons name="create-outline" size={22} color="#812732" />
              </TouchableOpacity>
            </View>
          </View>

          {/* المنتجات داخل التصنيف */}
          {category.products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push(`/admin/product/${product.id}`)}
            >
              <Image source={product.image} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  {product.discount ? (
                    <>
                      <Text style={styles.oldPrice}>{product.price} ر.س</Text>{' '}
                      <Text style={styles.discountedPrice}>
                        {product.price - product.discount} ر.س
                      </Text>
                    </>
                  ) : (
                    `${product.price} ر.س`
                  )}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  addButton: {
    backgroundColor: '#812732',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryBox: { marginBottom: 30 },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812732',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  discountedPrice: {
    color: '#812732',
    fontWeight: 'bold',
  },
});
