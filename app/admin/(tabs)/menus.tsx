import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';

export default function MenusPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setRole(data.data.role);
        setBranchId(data.data.branchId);
      }
    } catch (e) {
      console.error('فشل جلب بيانات المستخدم', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        if (role === 'OWNER') {
          const grouped = data.reduce((acc, product) => {
            const branchName = product.branch?.name || 'بدون اسم';
            if (!acc[branchName]) acc[branchName] = [];
            acc[branchName].push(product);
            return acc;
          }, {});
          const groupedArray = Object.entries(grouped).map(([branchName, products]) => ({
            branchName,
            products,
          }));
          setProducts(groupedArray);
        } else if (['BRANCH_ADMIN', 'CASHIER', 'DELIVERY'].includes(role)) {
          const branchProducts = data.filter((p) => p.branchId === branchId);
          setProducts([{ branchName: 'منتجات الفرع', products: branchProducts }]);
        }
      } else {
        Alert.alert('خطأ', 'فشل تحميل البيانات');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (['OWNER', 'BRANCH_ADMIN', 'CASHIER', 'DELIVERY'].includes(role)) {
      fetchProducts();
    }
  }, [role]);

  const canEdit = role === 'OWNER' || role === 'BRANCH_ADMIN';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* أزرار الإدارة فقط للمصرح لهم */}
      {canEdit && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/admin/add-category')}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>إضافة تصنيف</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewButton} onPress={() => router.push('/admin/categories')}>
            <Ionicons name="list" size={20} color="#fff" />
            <Text style={styles.buttonText}>عرض التصنيفات</Text>
          </TouchableOpacity>
        </View>
      )}

      {canEdit && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/add-menu')}
        >
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.addButtonText}>إضافة منتج</Text>
        </TouchableOpacity>
      )}

      {/* عرض المنتجات */}
      {products.map((group, idx) => (
        <View key={idx} style={styles.categoryBox}>
          <Text style={styles.categoryTitle}>{group.branchName}</Text>

          {group.products.map((product) => {
            const content = (
              <>
                <Image
                  source={{ uri: product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}` }}
                  style={styles.productImage}
                />
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
              </>
            );

            return canEdit ? (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push(`/admin/product/${product.id}`)}
              >
                {content}
              </TouchableOpacity>
            ) : (
              <View key={product.id} style={styles.productCard}>{content}</View>
            );
          })}
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
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryBox: { marginBottom: 30 },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 10,
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  viewButton: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
  },
});
