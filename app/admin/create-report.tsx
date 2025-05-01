import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://143.244.156.186:3007';

const reportTypes = [
  { label: 'تقرير فرع', value: 'branch' },
  { label: 'تقرير كل المبيعات', value: 'all' },
  { label: 'تقرير كاشير', value: 'user' },
  { label: 'تقرير منتج', value: 'product' },
];

const branches = [
  { id: '1', name: 'فرع الرياض' },
  { id: '2', name: 'فرع جدة' },
  { id: '3', name: 'فرع الدمام' },
];

export default function CreateReport() {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState(reportTypes[0]);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchModalVisible, setBranchModalVisible] = useState(false);

  const [selectedCashier, setSelectedCashier] = useState(null);
  const [cashierModalVisible, setCashierModalVisible] = useState(false);
  const [cashiers, setCashiers] = useState([]);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fetchCashiers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const filtered = data.filter((user: any) => user.role === 'CASHIER');
        setCashiers(filtered);
      } else {
        Alert.alert('خطأ', 'فشل جلب الكاشير');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'تأكد من الاتصال بالسيرفر');
    }
  };

  useEffect(() => {
    if (selectedType.value === 'user') {
      fetchCashiers();
    }
  }, [selectedType]);

  const handleCreate = () => {
    console.log('نوع التقرير:', selectedType.value);
    console.log('من:', fromDate.toDateString(), 'إلى:', toDate.toDateString());
    if (selectedType.value === 'branch') {
      console.log('الفرع:', selectedBranch);
    }
    if (selectedType.value === 'user') {
      console.log('الكاشير:', selectedCashier);
    }
    // قم بإرسال البيانات للبـاكند هنا...
    router.push('/admin/(tabs)/reports');
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/reports`)} style={{ marginBottom: 20 }}>
            <Ionicons name="arrow-back" size={24} color="#812732" />
        </TouchableOpacity>

      <Text style={styles.header}>إنشاء تقرير جديد</Text>

      {/* نوع التقرير */}
      <TouchableOpacity style={styles.dropdown} onPress={() => setTypeModalVisible(true)}>
        <Text style={styles.dropdownText}>{selectedType.label}</Text>
        <Ionicons name="chevron-down" size={20} color="#812732" />
      </TouchableOpacity>

      <Modal transparent animationType="slide" visible={typeModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {reportTypes.map((type) => (
              <Pressable
                key={type.value}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedType(type);
                  setTypeModalVisible(false);
                }}
              >
                <Text>{type.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* اختيار الفرع */}
      {selectedType.value === 'branch' && (
        <>
          <TouchableOpacity style={styles.dropdown} onPress={() => setBranchModalVisible(true)}>
            <Text style={styles.dropdownText}>
              {selectedBranch ? selectedBranch.name : 'اختر الفرع'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#812732" />
          </TouchableOpacity>

          <Modal transparent animationType="slide" visible={branchModalVisible}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                {branches.map((branch) => (
                  <Pressable
                    key={branch.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedBranch(branch);
                      setBranchModalVisible(false);
                    }}
                  >
                    <Text>{branch.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* اختيار كاشير */}
      {selectedType.value === 'user' && (
        <>
          <TouchableOpacity style={styles.dropdown} onPress={() => setCashierModalVisible(true)}>
            <Text style={styles.dropdownText}>
              {selectedCashier ? selectedCashier.username : 'اختر الكاشير'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#812732" />
          </TouchableOpacity>

          <Modal transparent animationType="slide" visible={cashierModalVisible}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                {cashiers.map((user) => (
                  <Pressable
                    key={user.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCashier(user);
                      setCashierModalVisible(false);
                    }}
                  >
                    <Text>{user.username}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* التاريخ من */}      
      <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>من: {fromDate.toDateString()}</Text>
      </TouchableOpacity>
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(_, selected) => {
            setShowFromPicker(false);
            if (selected) setFromDate(selected);
          }}
        />
      )}

      {/* التاريخ إلى */}
      <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>إلى: {toDate.toDateString()}</Text>
      </TouchableOpacity>
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(_, selected) => {
            setShowToPicker(false);
            if (selected) setToDate(selected);
          }}
        />
      )}

      {/* زر إنشاء التقرير */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Ionicons name="document-text-outline" size={22} color="#fff" />
        <Text style={styles.createButtonText}>إنشاء التقرير</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#812732',
    fontWeight: 'bold',
  },
  datePicker: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
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
});
