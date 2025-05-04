import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const BASE_URL = 'http://143.244.156.186:3007';

export default function AccountScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar: '',
  });
  const [newPassword, setNewPassword] = useState('');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('الرجاء السماح بالوصول للصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
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
        setProfile({
          username: user.username || '',
          email: user.email || '',
          avatar: user.imageUrl || '',
        });
      } else {
        Alert.alert('خطأ', data.message || 'فشل جلب البيانات');
      }
    } catch (error) {
      Alert.alert('خطأ', 'تأكد من الاتصال بالسيرفر');
    }
  };

  const handleSaveAll = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على التوكن');
        return;
      }

      let imageUrl = profile.avatar;

      if (imageUri) {
        const formData = new FormData();
        const filename = imageUri.split('/').pop();
        const type = filename?.split('.').pop();

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: `image/${type}`,
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
          imageUrl = uploadData.url;
        } else {
          Alert.alert('خطأ', 'فشل رفع الصورة');
          return;
        }
      }

      const updatePayload: any = {
        username: profile.username,
        email: profile.email,
        imageUrl,
      };

      // ✅ تعديل كلمة المرور
      if (newPassword.trim()) {
        updatePayload.password = newPassword;
      }

      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('✅', 'تم حفظ التعديلات');
        setImageUri(null);
        setNewPassword('');
        fetchProfile();
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('خطأ', result.message || 'فشل التحديث');
      }

    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع أثناء الحفظ');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/');
  };

  const handleBack = () => {
    router.replace('/(tabs)/home');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* زر الرجوع */}
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
                : require('../../assets/images/avatar.png')
            }
            style={styles.avatar}
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
          />

          <Text style={styles.label}>اسم المستخدم</Text>
          <TextInput
            style={styles.input}
            value={profile.username}
            onChangeText={(val) => setProfile({ ...profile, username: val })}
            textAlign="right"
          />

          <Text style={styles.label}>كلمة المرور الجديدة (اختياري)</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={(val) => setNewPassword(val)}
            secureTextEntry
            textAlign="right"
            placeholder="اتركها فارغة إن لم ترغب بالتغيير"
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={handleSaveAll}>
          <Text style={styles.logoutText}>حفظ التعديلات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 100 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backText: { fontSize: 16, color: '#812732', marginLeft: 8 },
  profileSection: { alignItems: 'center', marginTop: 10, marginBottom: 20, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderColor: '#ccc', borderWidth: 1 },
  editIcon: { position: 'absolute', right: 100, bottom: 0, backgroundColor: '#812732', padding: 8, borderRadius: 20 },
  form: { marginTop: 10 },
  label: { fontWeight: '500', color: '#812732', marginBottom: 6, marginTop: 12, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: '#812732', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 4, color: '#812732' },
  updateBtn: { backgroundColor: '#812732', paddingVertical: 14, borderRadius: 20, marginTop: 30 },
  logoutBtn: { backgroundColor: '#812732', paddingVertical: 14, borderRadius: 20, marginTop: 10, marginBottom: Platform.OS === 'ios' ? 100 : 30 },
  logoutText: { textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
