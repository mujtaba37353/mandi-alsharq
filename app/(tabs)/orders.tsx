import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


const orders = [
  {
    id: 1,
    title: 'توصيل مجاني  ',
    price: 'ابتداء من 19 ريال',
    image: require('../../assets/images/food1.png'),
    quantity: 2,
  },
  {
    id: 2,
    title: 'توصيل مجاني  ',
    price: 'ابتداء من 19 ريال',
    image: require('../../assets/images/food2.png'),
    quantity: 2,
  },
  {
    id: 3,
    title: 'توصيل مجاني  ',
    price: 'ابتداء من 19 ريال',
    image: require('../../assets/images/food1.png'),
    quantity: 2,
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#812732" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>طلبات</Text>
      </View>

      {/* Free Delivery Card */}
      <View style={styles.freeDeliveryCard}>
        <Ionicons name="fast-food-outline" size={24} color="#812732" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.freeTitle}>توصيل مجاني لا محدود</Text>
          <Text style={styles.freeSub}>اطلب الان واترك التوصيل علينا</Text>
        </View>
      </View>

      {/* Orders List */}
      {orders.map((item) => (
        <TouchableOpacity key={item.id} style={styles.orderItem} onPress={() => router.push('/orders/[id]')}>
          <View style={styles.qtyBox}>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Ionicons name="add" size={16} color="#812732" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.orderTitle}>{item.title}</Text>
            <Text style={styles.orderPrice}>{item.price}</Text>
          </View>
          <Image source={item.image} style={styles.orderImage} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#812732' },

  freeDeliveryCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  freeTitle: { fontSize: 16, fontWeight: 'bold', color: '#812732' },
  freeSub: { color: '#666', fontSize: 13 },

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyText: {
    fontSize: 14,
    color: '#812732',
    marginRight: 6,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#812732',
  },
  orderPrice: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});
