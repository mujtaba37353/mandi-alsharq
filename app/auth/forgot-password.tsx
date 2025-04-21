import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';


export default function ForgotPasswordScreen() {
  const router = useRouter();

    
  return (
    <View style={styles.container}>
     <Stack.Screen options={{ title: '', headerBackVisible: true, headerShown: false, }} />
      {/* صورة الشخصية */}
      <Image
        source={require('../../assets/images/forget-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* الحقل */}
      <TextInput
        placeholder="Email"
        style={styles.input}
        placeholderTextColor="#fff"
        keyboardType="email-address"
      />

      {/* زر الإرسال */}
      <TouchableOpacity 
      style={styles.resetButton}
      onPress={() => router.push('/auth/reset-password')}
      >
        <Text style={styles.resetText}>أنشيء كلمة مرور جديدة</Text>
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
    marginTop: 10,
  },
  resetText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
