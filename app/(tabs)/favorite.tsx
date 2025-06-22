import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BASE_URL = 'https://cam4rent.net';

export default function FavoriteScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('...');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchFavorites();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setUsername(data.data.username);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setFavorites(data);
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/wishlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setFavorites(prev => prev.filter(item => item.id !== id));
      } else {
        Alert.alert('خطأ', 'فشل حذف العنصر من المفضلة');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const handleClearAll = async () => {
    Alert.alert('تأكيد', 'هل أنت متأكد من أنك تريد حذف كل المفضلة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'نعم',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/wishlist`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) setFavorites([]);
            else Alert.alert('خطأ', 'فشل حذف المفضلة');
          } catch (err) {
            Alert.alert('خطأ', 'فشل الاتصال بالخادم');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => router.push('/(tabs)/account')}
      >
        <Text style={styles.name}>{username}</Text>
        <Ionicons name="arrow-forward" size={20} color="#812732" style={styles.arrow} />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.title}>المفضلة لدي</Text>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={{ color: '#812732', fontSize: 14 }}>مسح الكل</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={{ textAlign: 'center', color: '#888' }}>جاري تحميل المفضلة...</Text>
      ) : favorites.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888' }}>لا توجد منتجات في المفضلة</Text>
      ) : (
        <View style={styles.grid}>
          {favorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/product/${item.product.id}`)}
            >
              <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
              <TouchableOpacity
                style={styles.heart}
                onPress={() => handleRemoveFavorite(item.id)}
              >
                <Ionicons name="heart" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  profileCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { fontWeight: '600', fontSize: 16, color: '#444' },
  arrow: { position: 'absolute', right: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812732',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 16,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#812732',
    padding: 5,
    borderRadius: 20,
  },
});
