import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
          <Ionicons name="arrow-back" size={24} color="#812732" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>أوردر سابق</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#812732" />
        </TouchableOpacity>
      </View>

      {/* Free Delivery Card */}
      <View style={styles.freeDeliveryCard}>
        <Ionicons name="fast-food-outline" size={24} color="#812732" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.freeTitle}>توصيل مجاني لا محدود</Text>
          <Text style={styles.freeSub}>ابتداء من 19 ريال</Text>
        </View>
      </View>

      {/* Order item */}
      <View style={styles.orderItem}>
        <Text style={styles.itemTitle}>توصيل مجاني لا محدود</Text>
        <Text style={styles.itemSub}>ابتداء من 19 ريال</Text>
        <Image source={require('../../assets/images/food1.png')} style={styles.itemImage} />
      </View>

      {/* Delivered Illustration */}
      <Image
        source={require('../../assets/images/delivery.png')}
        style={styles.deliveryImage}
        resizeMode="contain"
      />

      <Text style={styles.deliveredText}>تم توصيل</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
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
    backgroundColor: '#fdfdfd',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#812732' },
  itemSub: { fontSize: 13, color: '#666' },
  itemImage: { width: 60, height: 60, borderRadius: 8 },

  deliveryImage: {
    width: '100%',
    height: 250,
  },
  deliveredText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
    marginTop: 10,
  },
});
