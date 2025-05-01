import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const regex = /^05\d{8}$/;
    return regex.test(phone);
  };

  const handleSignUp = async () => {
    if (!username || !phone || !email || !password) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('تنبيه', 'صيغة البريد الإلكتروني غير صحيحة');
      return;
    }

    if (!isValidPhone(phone)) {
      Alert.alert('تنبيه', 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
      return;
    }

    try {
      const response = await fetch('http://143.244.156.186:3007/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'USER',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('تم التسجيل بنجاح', 'يمكنك الآن تسجيل الدخول');
        router.replace('/auth/login');
      } else {
        Alert.alert('فشل التسجيل', data.message || 'حدث خطأ ما');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ في الاتصال');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen options={{ title: '', headerBackVisible: true, headerShown: false }} />

        <Image
          source={require('../../assets/images/login-icon.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>انشاء حساب</Text>

        <TextInput
          placeholder="الاسم"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="رقم الجوال"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          placeholder="البريد الإلكتروني"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="كلمة المرور"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>انشاء حساب</Text>
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
    paddingBottom: 100, 
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
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
  signUpButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  signUpText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
