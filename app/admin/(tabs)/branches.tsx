import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BranchesPage() {
  const router = useRouter();

  const branches = [
    { id: '1', name: 'فرع الرياض', location: 'طريق الملك فهد' },
    { id: '2', name: 'فرع جدة', location: 'حي الروضة' },
    { id: '3', name: 'فرع الدمام', location: 'شارع الملك عبدالعزيز' },
  ];

  return (
    <View style={styles.container}>
      {/* زر إضافة فرع */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/admin/branch/add')}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>إضافة فرع جديد</Text>
      </TouchableOpacity>

      {/* قائمة الفروع */}
      <ScrollView contentContainerStyle={styles.branchList}>
        {branches.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            style={styles.branchBox}
            onPress={() => router.push(`/admin/branch/${branch.id}`)}
          >
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.branchLocation}>{branch.location}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  addButton: {
    backgroundColor: '#812732',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  branchList: {
    gap: 15,
  },
  branchBox: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812732',
  },
  branchLocation: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});
