import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header Avatar + Name */}
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/images/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>Alena Sabyan</Text>

        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Fields */}
      <View style={styles.form}>
        <Text style={styles.label}>Mobile</Text>
        <TextInput style={styles.input} value="+966 5586 66523" />

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Membership</Text>
          <Text style={styles.ordersText}>61 orders</Text>
        </View>
        <TextInput style={styles.input} value="Gold" editable={false} />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value="33 family mall st -el moli - gada - saudi"
          editable={false}
        />

        <Text style={styles.label}>Change location</Text>
        <TextInput
          style={styles.input}
          value="33 family mall st -el moli - gada - saudi"
        />

        <Text style={styles.label}>Change language</Text>
        <TextInput style={styles.input} value="arabic" />

        <Text style={styles.label}>Loyalty card</Text>
        <TextInput style={styles.input} value="+100" />
      </View>

      <TouchableOpacity style={styles.updateBtn} onPress={() => router.push('/tabs/home')}>
        <Text style={styles.logoutText}>update</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => {router.replace('/');}}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100 + (Platform.OS === 'ios' ? 30 : 10),
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812732',
  },
  editIcon: {
    position: 'absolute',
    right: 100,
    bottom: 0,
    backgroundColor: '#812732',
    padding: 8,
    borderRadius: 20,
  },
  form: {
    marginTop: 10,
    flex: 1,
  },
  label: {
    fontWeight: '500',
    color: '#812732',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 4,
    color: '#812732',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ordersText: {
    color: '#812732',
    fontWeight: 'bold',
  },
  updateBtn: {
    backgroundColor: '#812732',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: '#812732',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: Platform.OS === 'ios' ? 100 : 30,
  },
  logoutText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
