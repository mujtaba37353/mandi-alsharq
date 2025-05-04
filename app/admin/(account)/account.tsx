import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://143.244.156.186:3007';

export default function AdminAccountScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    password: '',
    avatar: '',
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert('الرجاء السماح بالوصول إلى الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.data;
        const fullAvatar = user.imageUrl
          ? user.imageUrl.startsWith('http')
            ? user.imageUrl
            : `${BASE_URL}${user.imageUrl}`
          : '';

        setProfile({
          username: user.username || '',
          email: user.email || '',
          password: '',
          avatar: fullAvatar,
        });
      } else {
        console.error('فشل جلب بيانات البروفايل', data.message);
      }
    } catch (error) {
      console.error('خطأ أثناء جلب البروفايل', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
  
      let imageUrl = null;
  
      // رفع الصورة إذا تم اختيار واحدة
      if (imageUri) {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
  
        const uploadResponse = await fetch(`${BASE_URL}/uploads/image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
  
        const uploadData = await uploadResponse.json();
  
        if (uploadResponse.ok && uploadData.url) {
          imageUrl = uploadData.url; // فقط المسار مثل: /uploads/images/xxx.jpg
        } else {
          Alert.alert('خطأ', 'فشل رفع الصورة');
          return;
        }
      }
  
      // إعداد بيانات التحديث
      const payload: any = {
        username: profile.username,
        email: profile.email,
      };
  
      if (profile.password.trim()) {
        payload.password = profile.password;
      }
  
      if (imageUrl) {
        payload.imageUrl = imageUrl;
      }
  
      // إرسال التحديث إلى السيرفر
      const updateResponse = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await updateResponse.json();
  
      if (updateResponse.ok) {
        Alert.alert('تم الحفظ', 'تم تحديث الحساب بنجاح ✅');
        router.replace('/admin/(tabs)/main');
      } else {
        console.error('فشل التحديث', result.message);
        Alert.alert('خطأ', result.message || 'حدث خطأ أثناء تحديث البيانات');
      }
    } catch (error) {
      console.error('خطأ أثناء الحفظ', error);
      Alert.alert('خطأ', 'حدث خطأ غير متوقع أثناء الحفظ');
    }
  };
  

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/auth/login');
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#812732" />
          <Text style={styles.backText}>رجوع</Text>
        </TouchableOpacity>

        <View style={styles.profileSection}>
            <Image
                source={
                  imageUri
                    ? { uri: imageUri }
                    : profile.avatar
                    ? { uri: profile.avatar.startsWith('http') ? profile.avatar : `${BASE_URL}${profile.avatar}` }
                    : require('../../../assets/images/avatar.png') // أو المسار المناسب لك للصورة الافتراضية
                }
                style={styles.avatar}
                onError={(e) => {
                  console.log('❌ فشل تحميل الصورة', e.nativeEvent.error);
                }}
              />
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(val) => setProfile({ ...profile, email: val })}
            textAlign="right"
            placeholder="أدخل البريد الإلكتروني"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>اسم المستخدم</Text>
          <TextInput
            style={styles.input}
            value={profile.username}
            onChangeText={(val) => setProfile({ ...profile, username: val })}
            textAlign="right"
            placeholder="أدخل اسم المستخدم"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>كلمة المرور الجديدة</Text>
          <TextInput
            style={styles.input}
            value={profile.password}
            onChangeText={(val) => setProfile({ ...profile, password: val })}
            textAlign="right"
            placeholder="اتركها فارغة إذا لا ترغب بتغييرها"
            placeholderTextColor="#999"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={handleSave}>
          <Text style={styles.logoutText}>حفظ التعديلات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 100 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: '#812732', marginLeft: 8 },
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  editIcon: {
    position: 'absolute',
    right: 100,
    bottom: 0,
    backgroundColor: '#812732',
    padding: 8,
    borderRadius: 20,
  },
  form: { marginTop: 10, flex: 1 },
  label: {
    fontWeight: '500',
    color: '#812732',
    marginBottom: 6,
    marginTop: 12,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 4,
    color: '#812732',
  },
  updateBtn: {
    backgroundColor: '#812732',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: '#812732',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 100 : 30,
  },
  logoutText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
