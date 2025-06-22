import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useUserLocation from '../hooks/useUserLocation';

const BASE_URL = 'https://cam4rent.net';

export default function OrderFormScreen() {
  const [orderType] = useState('DELIVERY');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState('');
  const [deliveryLng, setDeliveryLng] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const router = useRouter();
  const { location, requestLocationPermission } = useUserLocation();

  const handleUseCurrentLocation = async () => {
    const success = await requestLocationPermission();
    if (success && location) {
      setDeliveryLat(location.latitude.toString());
      setDeliveryLng(location.longitude.toString());
      setDeliveryAddress('موقعي الحالي');
    } else {
      Alert.alert('خطأ', 'لم نتمكن من تحديد الموقع الحالي');
    }
  };

  const handleSelectFromMap = () => {
    Alert.alert('قيد التطوير', 'ميزة اختيار العنوان من الخريطة سيتم تفعيلها لاحقاً');
  };

  const handleSubmit = async () => {
    if (!deliveryAddress || !deliveryLat || !deliveryLng) {
      Alert.alert('خطأ', 'يجب تحديد عنوان التوصيل والموقع');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('رقم الجوال مطلوب', 'يرجى إدخال رقم للتواصل بخصوص طلبك');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/orders/from-cart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderType,
          notes: `${notes}\nرقم الجوال: ${phone}`,
          deliveryAddress,
          deliveryLat: parseFloat(deliveryLat),
          deliveryLng: parseFloat(deliveryLng),
          deliveryNotes,
          specialInstructions: '',
        }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        await AsyncStorage.setItem('last_order_id', data.id);
        Alert.alert('تم إنشاء الطلب', `رقم الطلب: ${data.orderNumber}`);
        router.replace('/(tabs)/orders');
      } else {
        Alert.alert('خطأ', data.message || 'فشل إنشاء الطلب');
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل الاتصال بالخادم');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>معلومات التوصيل</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.selectButton} onPress={handleUseCurrentLocation}>
          <Text style={styles.selectButtonText}>📍 التوصيل لموقعي الحالي</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.selectButton} onPress={handleSelectFromMap}>
          <Text style={styles.selectButtonText}>🗺️ اختيار عنوان من الخريطة</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="عنوان التوصيل"
        value={deliveryAddress}
        onChangeText={setDeliveryAddress}
        style={styles.input}
      />

      {/* حقل رقم الجوال مع أيقونة توضيحية */}
      <View style={styles.phoneRow}>
        <Ionicons name="call" size={20} color="#812732" style={{ marginRight: 6 }} />
        <TextInput
          placeholder=" رقم الجوال للتواصل (مطلوب) ابدأ ب 05xxxxxxxx"
          value={phone}
          onChangeText={setPhone}
          style={[styles.input, { flex: 1 }]}
          keyboardType="phone-pad"
        />
      </View>

      <TextInput
        placeholder="ملاحظات التوصيل (مثال: قرع الجرس، اتركه عند الباب)"
        value={deliveryNotes}
        onChangeText={setDeliveryNotes}
        style={styles.input}
        multiline
      />

      <TextInput
        placeholder="ملاحظات عامة على الطلب"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>تأكيد الطلب</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#812732',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#28a745',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  selectButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
});
