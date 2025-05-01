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

const BASE_URL = 'http://143.244.156.186:3007';

const favorites = [
  {
    id: 1,
    title: 'شاورما عربي علي الفحم',
    image: require('../../assets/images/food1.png'),
  },
  {
    id: 2,
    title: 'وجبة دجاج مشوي',
    image: require('../../assets/images/food2.png'),
  },
  {
    id: 3,
    title: 'شاورما عربي علي الفحم',
    image: require('../../assets/images/food1.png'),
  },
  {
    id: 4,
    title: 'شاورما عربي علي الفحم',
    image: require('../../assets/images/food1.png'),
  },
];

export default function FavoriteScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('...');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
        const user = data.data;
          setUsername(user.username);
        } else {
          console.log('Error fetching profile:', data.message);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchUser();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Card */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => router.push('/(tabs)/account')}
      >
        <Image
          source={require('../../assets/images/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{username}</Text>
        <Ionicons name="arrow-forward" size={20} color="#812732" style={styles.arrow} />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>المفضلة لدي</Text>
      </View>

      {/* Favorite Items */}
      <View style={styles.grid}>
        {favorites.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <TouchableOpacity style={styles.heart}>
              <Ionicons name="heart" size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
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
  seeAll: {
    color: '#888',
    fontSize: 14,
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
