import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://143.244.156.186:3007';

const daysOfWeek = [
  { day: 0, label: 'الأحد' },
  { day: 1, label: 'الإثنين' },
  { day: 2, label: 'الثلاثاء' },
  { day: 3, label: 'الأربعاء' },
  { day: 4, label: 'الخميس' },
  { day: 5, label: 'الجمعة' },
  { day: 6, label: 'السبت' },
];

export default function AddBranchPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [workingHours, setWorkingHours] = useState(
    daysOfWeek.map(day => ({
      dayOfWeek: day.day,
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
    }))
  );

  const handleWorkingHourChange = (index, field, value) => {
    const updated = [...workingHours];
    updated[index][field] = value;
    setWorkingHours(updated);
  };

  const handleAddBranch = async () => {
    if (!name || !address || !latitude || !longitude || !phone || !email) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('خطأ', 'لم يتم العثور على التوكن');

      const payload = {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        phone,
        email,
        workingHours,
      };

      const response = await fetch(`${BASE_URL}/branches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅', 'تم إضافة الفرع بنجاح');
        router.replace('/admin/(tabs)/branches');
      } else {
        console.error('❌ خطأ في إضافة الفرع:', data);
        Alert.alert('خطأ', data.message || 'فشل في إضافة الفرع');
      }
    } catch (error) {
      console.error('❌ استثناء:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin/(tabs)/branches')}>
          <Ionicons name="arrow-back" size={28} color="#812732" />
        </TouchableOpacity>

        <Text style={styles.title}>إضافة فرع جديد</Text>

        <TextInput style={styles.input} placeholder="اسم الفرع" value={name} onChangeText={setName} textAlign="right" />
        <TextInput style={styles.input} placeholder="العنوان" value={address} onChangeText={setAddress} textAlign="right" />
        <TextInput style={styles.input} placeholder="خط العرض (Latitude)" value={latitude} onChangeText={setLatitude} keyboardType="numeric" textAlign="right" />
        <TextInput style={styles.input} placeholder="خط الطول (Longitude)" value={longitude} onChangeText={setLongitude} keyboardType="numeric" textAlign="right" />
        <TextInput style={styles.input} placeholder="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textAlign="right" />
        <TextInput style={styles.input} placeholder="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" textAlign="right" />

        <Text style={styles.sectionTitle}>أيام وساعات العمل</Text>
        {workingHours.map((day, index) => (
          <View key={day.dayOfWeek} style={styles.dayBox}>
            <Text style={styles.dayLabel}>{daysOfWeek[index].label}</Text>
            <View style={styles.switchRow}>
              <Text>مفتوح</Text>
              <Switch
                value={day.isOpen}
                onValueChange={(value) => handleWorkingHourChange(index, 'isOpen', value)}
              />
            </View>
            {day.isOpen && (
              <View style={styles.timeInputs}>
                <TextInput
                  style={styles.timeInput}
                  value={day.openTime}
                  placeholder="وقت الفتح (مثال: 09:00)"
                  onChangeText={(text) => handleWorkingHourChange(index, 'openTime', text)}
                />
                <TextInput
                  style={styles.timeInput}
                  value={day.closeTime}
                  placeholder="وقت الإغلاق (مثال: 22:00)"
                  onChangeText={(text) => handleWorkingHourChange(index, 'closeTime', text)}
                />
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleAddBranch}>
          <Text style={styles.saveButtonText}>حفظ الفرع</Text>
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
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#812732',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 10,
    marginTop: 20,
  },
  dayBox: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 5,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
