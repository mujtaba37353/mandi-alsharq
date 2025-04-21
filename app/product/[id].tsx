import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* صورة المنتج */}
      <View>
        <Image
          source={require('../../assets/images/food1.png')}
          style={styles.image}
        />

        {/* زر الرجوع */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/home')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* العنوان والوصف */}
      <View style={styles.content}>
        <Text style={styles.title}>شاورما عربي علي الفحم</Text>
        <Text style={styles.sub}>بطاطس - ثومية - خبز</Text>
        <Text style={styles.price}>25 ريال</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#812732' },
  sub: { color: '#555', marginVertical: 8 },
  price: { fontSize: 18, fontWeight: '600', color: '#812732' },
});
