// useUserLocation.ts
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const permissionStored = await AsyncStorage.getItem('location_permission');
      const { status } = await Location.getForegroundPermissionsAsync();

      if (permissionStored === 'granted' && status === 'granted') {
        setGranted(true);
        getCurrentLocation();
      } else {
        setGranted(false);
        setLoading(false);
      }
    })();
  }, []);

  const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('تنبيه', 'يجب السماح بالوصول إلى الموقع لاستخدام هذه الميزة');
      setGranted(false);
      setLoading(false);
      return false; // ✅ أضف هذا
    }

    await AsyncStorage.setItem('location_permission', 'granted');
    setGranted(true);
    await getCurrentLocation();
    return true; // ✅ أضف هذا
  } catch (err) {
    Alert.alert('خطأ', 'فشل طلب إذن الموقع');
    setLoading(false);
    return false; // ✅ أضف هذا
  }
};


  const getCurrentLocation = async () => {
  try {
    const loc = await Location.getCurrentPositionAsync({});
    if (loc && loc.coords) {
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
  } catch (err) {
    Alert.alert('خطأ', 'فشل في تحديد الموقع الحالي');
  } finally {
    setLoading(false);
  }
};


  return {
    location,
    loading,
    granted,
    requestLocationPermission,
  };
}
