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
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

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

  const uploadOnlyImage = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على التوكن');
        return;
      }
  
      if (!imageUri) {
        Alert.alert('خطأ', 'يرجى اختيار صورة أولاً');
        return;
      }
  
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
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const uploadData = await uploadResponse.json();
  
      if (uploadResponse.ok && uploadData.url) {
        // نحفظ فقط رابط الصورة الذي أرجعه السيرفر
        setProfile((prev) => ({
          ...prev,
          avatar: uploadData.url, // فقط الـ url
        }));
        setImageUri(null);
        Alert.alert('✅', 'تم رفع الصورة بنجاح');
      } else {
        console.error('❌ فشل رفع الصورة:', uploadData);
        Alert.alert('خطأ', 'فشل رفع الصورة');
      }
    } catch (error) {
      console.error('❌ خطأ أثناء رفع الصورة:', error);
      Alert.alert('خطأ', 'فشل رفع الصورة، تأكد من الاتصال');
    }
  };
  

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على التوكن');
        return;
      }

      const response = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.data;
        setProfile({
          username: user.username || '',
          email: user.email || '',
          avatar: user.avatar || '',
        });
      } else {
        Alert.alert('خطأ', data.message || 'فشل جلب البيانات');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'تأكد من الاتصال بالسيرفر');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على التوكن');
        return;
      }

      const body: any = {};

      if (profile.username.trim()) body.username = profile.username.trim();
      if (profile.email.trim()) body.email = profile.email.trim();
      if (profile.avatar.trim()) body.avatar = profile.avatar.trim();

      if (Object.keys(body).length === 0) {
        Alert.alert('خطأ', 'يرجى تعديل حقل واحد على الأقل');
        return;
      }

      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅', 'تم تحديث المعلومات');
        fetchProfile();
      } else {
        Alert.alert('خطأ', data.message || 'فشل التحديث');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل الاتصال بالسيرفر');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwords.currentPassword || !passwords.newPassword) {
        Alert.alert('خطأ', 'يرجى إدخال كلمة المرور الحالية والجديدة');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على التوكن');
        return;
      }

      const response = await fetch(`${BASE_URL}/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅', 'تم تغيير كلمة المرور');
        setPasswords({ currentPassword: '', newPassword: '' });
      } else {
        Alert.alert('خطأ', data.message || 'فشل تغيير كلمة المرور');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل الاتصال بالسيرفر');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/');
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
        {/* قسم الصورة */}
        <View style={styles.profileSection}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : profile.avatar
                ? { uri: `${BASE_URL}${profile.avatar}` } // دمج الرابط مع السيرفر
                : require('../../assets/images/avatar.png')
            }
            style={styles.avatar}
          />


          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity style={styles.uploadBtn} onPress={uploadOnlyImage}>
              <Text style={{ color: '#fff', fontSize: 12 }}>رفع الصورة</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* قسم المعلومات */}
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
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateProfile}>
          <Text style={styles.logoutText}>حفظ المعلومات</Text>
        </TouchableOpacity>

        {/* قسم تغيير كلمة المرور */}
        <View style={styles.form}>
          <Text style={styles.label}>كلمة المرور الحالية</Text>
          <TextInput
            style={styles.input}
            value={passwords.currentPassword}
            secureTextEntry
            onChangeText={(val) => setPasswords({ ...passwords, currentPassword: val })}
            textAlign="right"
          />

          <Text style={styles.label}>كلمة المرور الجديدة</Text>
          <TextInput
            style={styles.input}
            value={passwords.newPassword}
            secureTextEntry
            onChangeText={(val) => setPasswords({ ...passwords, newPassword: val })}
            textAlign="right"
          />
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={handleChangePassword}>
          <Text style={styles.logoutText}>تغيير كلمة المرور</Text>
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
  profileSection: { alignItems: 'center', marginTop: 30, marginBottom: 20, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderColor: '#ccc', borderWidth: 1 },
  editIcon: { position: 'absolute', right: 100, bottom: 0, backgroundColor: '#812732', padding: 8, borderRadius: 20 },
  uploadBtn: { position: 'absolute', bottom: -20, backgroundColor: '#812732', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  form: { marginTop: 10 },
  label: { fontWeight: '500', color: '#812732', marginBottom: 6, marginTop: 12, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: '#812732', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 4, color: '#812732' },
  updateBtn: { backgroundColor: '#812732', paddingVertical: 14, borderRadius: 20, marginTop: 30 },
  logoutBtn: { backgroundColor: '#812732', paddingVertical: 14, borderRadius: 20, marginTop: 10, marginBottom: Platform.OS === 'ios' ? 100 : 30 },
  logoutText: { textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
