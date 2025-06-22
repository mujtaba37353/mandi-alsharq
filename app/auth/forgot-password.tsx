import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const baseUrl = 'https://cam4rent.net';

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('تنبيه', 'صيغة البريد الإلكتروني غير صحيحة');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/forget-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.resetToken) {
          await AsyncStorage.setItem('resetToken', data.resetToken);
          Alert.alert('تم', 'أدخل كلمة المرور الجديدة');
          router.push('/auth/reset-password');
        } 
      } else {
        Alert.alert('خطأ', data.message || 'البريد غير صحيح أو غير مسجل');
      }
    } catch (error) {
      console.error('حدث خطأ:', error);
      Alert.alert('خطأ في الاتصال', 'تأكد من أنك متصل بنفس الشبكة');
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
          source={require('../../assets/images/forget-icon.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <TextInput
          placeholder="البريد الإلكتروني"
          style={styles.input}
          placeholderTextColor="#fff"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.resetButton} onPress={handleResetRequest}>
          <Text style={styles.resetText}>أنشيء كلمة مرور جديدة</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
    paddingBottom: 100, 
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
  },
  input: {
    borderRadius: 10,
    backgroundColor: '#812732',
    color: '#fff',
    padding: 14,
    width: '100%',
    marginBottom: 20,
    textAlign: 'left',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#812732',
  },
  resetText: {
    color: '#812732',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
