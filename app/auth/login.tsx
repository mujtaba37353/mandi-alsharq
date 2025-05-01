import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('تنبيه', 'يرجى ملء البريد الإلكتروني وكلمة المرور');
      return;
    }
  
    if (!isValidEmail(email)) {
      Alert.alert('تنبيه', 'صيغة البريد الإلكتروني غير صحيحة');
      return;
    }
  
    try {
      const response = await fetch('http://143.244.156.186:3007/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.access_token) {
        await AsyncStorage.setItem('token', data.access_token);
  
        // 🛡️ جلب البروفايل باستخدام التوكن
        const profileResponse = await fetch('http://143.244.156.186:3007/users/profile', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
  
        const profileData = await profileResponse.json();
        console.log('📥 بيانات المستخدم:', profileData);
  
        if (profileResponse.ok && profileData.data && profileData.data.role) {
          const role = profileData.data.role;
          await AsyncStorage.setItem('role', role);
  
          if (role === 'USER') {
            router.replace('/home');
          } else if (role === 'ADMIN' || role === 'OWNER' || role === 'BRANCH_ADMIN' || role === 'CASHIER') {
            router.replace('/admin/(tabs)/main');
          } else {
            Alert.alert('خطأ', 'دور المستخدم غير معروف');
          }
        } else {
          console.error('❌ خطأ بجلب معلومات المستخدم:', profileData);
          Alert.alert('خطأ', 'فشل جلب معلومات الحساب');
        }
      } else {
        Alert.alert('فشل تسجيل الدخول', data.message || 'تحقق من المعلومات');
      }
    } catch (error) {
      console.error('❌ خطأ أثناء تسجيل الدخول:', error);
      Alert.alert('خطأ في الاتصال بالسيرفر');
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: '', headerBackVisible: true, headerShown: false }} />

        <Image
          source={require('../../assets/images/login-icon.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>تسجيل الدخول</Text>

        <TextInput
          placeholder="البريد الإلكتروني/الهاتف"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="كلمة المرور"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.signupText}>ليس لديك حساب ؟</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.forgotText}>نسيت معلومات الدخول؟</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#812732',
    fontSize: 14,
    marginBottom: 8,
  },
  forgotText: {
    color: '#812732',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
