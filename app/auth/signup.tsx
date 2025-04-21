import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';


export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
     <Stack.Screen options={{ title: '', headerBackVisible: true, headerShown: false, }} />
      {/* صورة الشخصية */}
      <Image
        source={require('../../assets/images/login-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* العنوان */}
      <Text style={styles.title}>انشاء حساب</Text>

      {/* الحقول */}
      <TextInput placeholder="الاسم" style={styles.input} />
      <TextInput placeholder="رقم الجوال" style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="البريد الإلكتروني/الهاتف" style={styles.input} />
      <TextInput placeholder="كلمة المرور" style={styles.input} secureTextEntry />

      {/* زر التسجيل */}
      <TouchableOpacity 
      style={styles.signUpButton}
      onPress={() => router.replace('/auth/login')}
      >
        <Text style={styles.signUpText}>انشاء حساب</Text>
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
