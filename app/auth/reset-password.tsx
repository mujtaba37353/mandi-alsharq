import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
     <Stack.Screen options={{ title: '', headerBackVisible: true, headerShown: false, }} />
      {/* صورة الكرتون */}
      <Image
        source={require('../../assets/images/reset-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* الحقول */}
      <TextInput
        placeholder="Type New Password"
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#812732"
      />

      <TextInput
        placeholder="Re -Type New Password"
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#812732"
      />

      {/* زر التأكيد */}
      <TouchableOpacity 
      style={styles.confirmButton}
      onPress={() => router.replace('/tabs/home')}
      >
        <Text style={styles.confirmText}>تأكيد</Text>
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
