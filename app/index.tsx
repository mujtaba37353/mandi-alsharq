// app/index.tsx
import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';


export default function HomeScreen() {
  const router = useRouter();
  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.loginText}>دخول</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  topRight: {
    position: 'absolute',
    top: 50,
    right: 30,
  },
  laterText: {
    fontSize: 16,
    color: '#812732',
    fontWeight: '500',
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
  logo: {
    width: 350,
    height: 250,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#812732',
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountText: {
    color: '#812732',
    fontSize: 14,
  },
});
