import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Modal, 
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://143.244.156.186:3007';

const roleTranslation: Record<string, string> = {
  USER: 'مستخدم',
  BRANCH_ADMIN: 'مدير فرع',
  CASHIER: 'كاشير',
  DELIVERY: 'عامل توصيل',
};

const allowedRoles = ['USER', 'BRANCH_ADMIN', 'CASHIER', 'DELIVERY'];

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [branchSort, setBranchSort] = useState('none');
  const [roleFilter, setRoleFilter] = useState('none');

  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);


  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const filteredUsers = data.filter((user: any) => user.role !== 'OWNER');
        setUsers(filteredUsers);
      } else {
        console.error('فشل جلب المستخدمين', data.message);
        Alert.alert('خطأ', 'فشل جلب قائمة المستخدمين');
      }
    } catch (error) {
      console.error('خطأ أثناء جلب المستخدمين', error);
      Alert.alert('خطأ', 'تأكد من الاتصال بالسيرفر');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    if (roleFilter !== 'none') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (branchSort === 'asc') {
      filtered.sort((a, b) => (a.branch?.name || '').localeCompare(b.branch?.name || ''));
    }

    return filtered;
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        Alert.alert('تم حذف المستخدم بنجاح');
        fetchUsers();
      } else {
        const data = await response.json();
        console.error('فشل حذف المستخدم', data.message);
        Alert.alert('خطأ', 'فشل حذف المستخدم');
      }
    } catch (error) {
      console.error('خطأ أثناء حذف المستخدم', error);
      Alert.alert('خطأ', 'فشل حذف المستخدم');
    }
  };

  const confirmDelete = (user: any) => {
    if (user.role === 'USER') {
      Alert.alert('خطأ', 'لا يمكن حذف مستخدم عادي');
      return;
    }
  
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد أنك تريد حذف هذا المستخدم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', onPress: () => handleDeleteUser(user.id), style: 'destructive' },
      ],
      { cancelable: true }
    );
  };
    

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => router.push(`/admin/user-info/${item.id}`)}
    >
      <View>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>
          الدور: {roleTranslation[item.role] || item.role}
        </Text>
        <Text style={styles.branch}>
          الفرع: {item.branch?.name || 'غير محدد'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => router.push(`/admin/edit-user/${item.id}`)}
          style={styles.actionButton}
        >
          <Ionicons name="create-outline" size={22} color="#812732" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => confirmDelete(item)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#812732" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المستخدمين</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#812732" />
        </TouchableOpacity>
      </View>

      {/* Dropdowns */}
      <View style={styles.filtersRow}>
          {/* Branch Filter */}
          <TouchableOpacity style={styles.dropdownContainer} onPress={() => setBranchModalVisible(true)}>
            <View style={styles.dropdownHeader}>
              <Ionicons name="chevron-down" size={16} color="#812732" />
              <Text style={styles.dropdownTitle}>تصفية بالفروع</Text>
            </View>
            <Text style={styles.selectedText}>
              {branchSort === 'none' ? 'بدون ترتيب' : 'ترتيب تصاعدي'}
            </Text>
          </TouchableOpacity>

          {/* Role Filter */}
          <TouchableOpacity style={styles.dropdownContainer} onPress={() => setRoleModalVisible(true)}>
            <View style={styles.dropdownHeader}>
              <Ionicons name="chevron-down" size={16} color="#812732" />
              <Text style={styles.dropdownTitle}>تصفية بالأدوار</Text>
            </View>
            <Text style={styles.selectedText}>
              {roleFilter === 'none' ? 'بدون فلترة' : roleTranslation[roleFilter]}
            </Text>
          </TouchableOpacity>
        </View>

{/* Branch Modal */}
          <Modal
            transparent
            animationType="slide"
            visible={branchModalVisible}
            onRequestClose={() => setBranchModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Pressable style={styles.modalItem} onPress={() => { setBranchSort('none'); setBranchModalVisible(false); }}>
                  <Text>بدون ترتيب</Text>
                </Pressable>
                <Pressable style={styles.modalItem} onPress={() => { setBranchSort('asc'); setBranchModalVisible(false); }}>
                  <Text>تصاعدي</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Role Modal */}
          <Modal
            transparent
            animationType="slide"
            visible={roleModalVisible}
            onRequestClose={() => setRoleModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Pressable style={styles.modalItem} onPress={() => { setRoleFilter('none'); setRoleModalVisible(false); }}>
                  <Text>بدون فلترة</Text>
                </Pressable>
                {allowedRoles.map((role) => (
                  <Pressable key={role} style={styles.modalItem} onPress={() => { setRoleFilter(role); setRoleModalVisible(false); }}>
                    <Text>{roleTranslation[role]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Modal>

      {/* Add User Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/admin/add-user')}
      >
        <Ionicons name="person-add-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>إضافة مستخدم</Text>
      </TouchableOpacity>

      <FlatList
        data={filterAndSortUsers()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#812732']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#812732' },
  filtersRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 10 },
  dropdownContainer: {
    width: '45%',
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3, // يعمل Shadow خفيف على الأندرويد
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  
  dropdownTitle: {
    marginLeft: 5,
    fontSize: 14,
    color: '#812732',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedText: {
    textAlign: 'center',
    color: '#812732',
    paddingVertical: 8,
  },
  
  list: { padding: 20 },
  userItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f8f8f8', borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  username: { fontSize: 16, fontWeight: 'bold', color: '#812732' },
  email: { fontSize: 14, color: '#666', marginTop: 2 },
  role: { fontSize: 13, color: '#999', marginTop: 2 },
  branch: { fontSize: 13, color: '#999', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { marginLeft: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#812732', padding: 12, borderRadius: 10, margin: 20, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});
