import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cam4rent.net';
const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const defaultWorkingHours = Array(7).fill(0).map(() => ({
  isOpen: true,
  openTime: '09:00',
  closeTime: '22:00',
}));

export default function EditBranchPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '', latitude: '', longitude: '',
  });
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [userRole, setUserRole] = useState('');
  const [userBranchId, setUserBranchId] = useState('');

  const fetchUserInfo = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setUserRole(data.data.role);
      setUserBranchId(data.data.branchId);
    }
  };

  const fetchBranch = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          latitude: String(data.latitude || ''),
          longitude: String(data.longitude || ''),
        });

        if (data.workingHours?.length === 7) {
          const wh = data.workingHours
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map((d) => ({
              isOpen: d.isOpen,
              openTime: d.openTime,
              closeTime: d.closeTime,
            }));
          setWorkingHours(wh);
        }
      } else {
        Alert.alert('خطأ', 'فشل جلب بيانات الفرع');
      }
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالسيرفر');
    }
  };

  const handleUpdate = async () => {
    if (!form.name || !form.latitude || !form.longitude) {
      Alert.alert('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const resBranch = await fetch(`${BASE_URL}/branches/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
        }),
      });

      if (!resBranch.ok) {
        const err = await resBranch.json();
        return Alert.alert('خطأ', err.message || 'فشل تعديل بيانات الفرع');
      }

      const whPayload = workingHours.map((d, index) => ({
        dayOfWeek: index,
        isOpen: d.isOpen,
        openTime: d.openTime,
        closeTime: d.closeTime,
      }));

      const resWH = await fetch(`${BASE_URL}/branches/${id}/working-hours/bulk`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workingHours: whPayload }),
      });

      if (resWH.ok) {
        Alert.alert('تم', 'تم تعديل بيانات الفرع وساعات العمل');
        router.replace('/admin/(tabs)/branches');
      } else {
        const err = await resWH.json();
        Alert.alert('خطأ', err.message || 'فشل تعديل أوقات العمل');
      }
    } catch {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  const copyDayToAll = (index: number) => {
    const selected = { ...workingHours[index] };
    const copied = Array(7).fill(0).map(() => ({ ...selected }));
    setWorkingHours(copied);
  };

  const resetWorkingHours = () => {
    setWorkingHours(defaultWorkingHours);
  };

  useEffect(() => {
    fetchUserInfo();
    fetchBranch();
  }, []);

  if (
    userRole !== 'OWNER' &&
    !(userRole === 'BRANCH_ADMIN' && userBranchId === id)
  ) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 100 }}>
          ❌ لا تملك صلاحية لتعديل هذا الفرع
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#812732" />
        </TouchableOpacity>

        <Text style={styles.title}>تعديل بيانات الفرع</Text>

        {[{ label: 'اسم الفرع', key: 'name' }, { label: 'العنوان', key: 'address' }, { label: 'البريد الإلكتروني', key: 'email' }, { label: 'رقم الهاتف', key: 'phone', keyboardType: 'phone-pad' }, { label: 'خط العرض', key: 'latitude', keyboardType: 'decimal-pad' }, { label: 'خط الطول', key: 'longitude', keyboardType: 'decimal-pad' }].map((field) => (
          <View key={field.key} style={styles.inputBox}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={form[field.key]}
              onChangeText={(val) => setForm({ ...form, [field.key]: val })}
              keyboardType={field.keyboardType}
              textAlign="right"
            />
          </View>
        ))}

        <View style={styles.workingHoursHeader}>
          <Text style={styles.title}>أيام وساعات العمل</Text>
          <TouchableOpacity onPress={resetWorkingHours}>
            <Text style={styles.resetText}>إعادة التعيين</Text>
          </TouchableOpacity>
        </View>

        {workingHours.map((day, index) => (
          <View key={index} style={styles.dayRow}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{days[index]}</Text>
              <Switch
                value={day.isOpen}
                onValueChange={(val) => {
                  const newWH = workingHours.map((d, i) =>
                    i === index ? { ...d, isOpen: val } : d
                  );
                  setWorkingHours(newWH);
                }}
              />
            </View>
            {day.isOpen && (
              <>
                <TextInput
                  style={styles.timeInput}
                  placeholder="وقت الفتح"
                  value={day.openTime}
                  onChangeText={(val) => {
                    const newWH = workingHours.map((d, i) =>
                      i === index ? { ...d, openTime: val } : d
                    );
                    setWorkingHours(newWH);
                  }}
                  textAlign="right"
                />
                <TextInput
                  style={styles.timeInput}
                  placeholder="وقت الإغلاق"
                  value={day.closeTime}
                  onChangeText={(val) => {
                    const newWH = workingHours.map((d, i) =>
                      i === index ? { ...d, closeTime: val } : d
                    );
                    setWorkingHours(newWH);
                  }}
                  textAlign="right"
                />
                <TouchableOpacity onPress={() => copyDayToAll(index)}>
                  <Text style={styles.copyText}>نسخ إلى كل الأيام</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>حفظ التعديلات</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    flexGrow: 1,
  },
  backButton: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBox: { marginBottom: 16 },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  workingHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  resetText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  dayRow: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 10,
    padding: 10,
    fontSize: 15,
    textAlign: 'right',
    color: '#333',
  },
  copyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});