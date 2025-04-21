import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: '', headerBackVisible: true, headerShown: false, }} />
      {/* صورة الشخصية */}
      <Image
        source={require('../../assets/images/login-icon.png')} // تأكد من وضع الصورة هنا
        style={styles.image}
        resizeMode="contain"
      />

      {/* العنوان */}
      <Text style={styles.title}>تسجيل الدخول</Text>

      {/* الحقول */}
      <TextInput placeholder="البريد الإلكتروني/الهاتف" style={styles.input} />
      <TextInput placeholder="كلمة المرور" secureTextEntry style={styles.input} />

      {/* زر تسجيل الدخول */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.replace('/(tabs)/home')}
      >
        <Text style={styles.loginText}>تسجيل الدخول</Text>
      </TouchableOpacity>

      {/* الروابط الإضافية */}
      <TouchableOpacity onPress={() => router.push('/auth/signup')}>
        <Text style={styles.signupText}>ليس لديك حساب ؟</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
        <Text style={styles.forgotText}>نسيت معلومات الدخول؟</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
