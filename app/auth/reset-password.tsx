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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const baseUrl = 'https://cam4rent.net';

  const handleConfirm = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('resetToken');
      if (!token) {
        Alert.alert('خطأ', 'رمز إعادة التعيين غير متوفر');
        return;
      }

      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('تم', 'تم تغيير كلمة المرور بنجاح');
        await AsyncStorage.removeItem('resetToken');
        router.replace('/auth/login');
      } else {
        Alert.alert('فشل العملية', data.message || 'حدث خطأ في تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
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
          source={require('../../assets/images/reset-icon.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <TextInput
          placeholder="كلمة المرور الجديدة"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#812732"
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="تأكيد كلمة المرور"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#812732"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>تأكيد</Text>
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
    width: '100%',
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    textAlign: 'left',
    color: '#812732',
  },
  confirmButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  confirmText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
