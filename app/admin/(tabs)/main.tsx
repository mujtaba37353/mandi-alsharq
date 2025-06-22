import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from 'react';

const screenWidth = Dimensions.get('window').width;
const BASE_URL = "https://cam4rent.net";

export default function AdminMainPage() {
  const router = useRouter();
  const [todayDate, setTodayDate] = useState('');
  const [branches, setBranches] = useState([]);
  const [role, setRole] = useState<string | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      if (role === "CASHIER" || role === "DELIVERY") {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data.branch) {
          setBranches([data.data.branch]);
        } else {
          Alert.alert("لا تملك صلاحية عرض الفروع");
        }
        return;
      }

      const response = await fetch(`${BASE_URL}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setBranches(data);
      } else {
        Alert.alert("خطأ", data.message || "فشل جلب الفروع");
      }
    } catch (error) {
      console.error("فشل جلب الفروع", error);
      Alert.alert("خطأ", "حدث خطأ أثناء جلب الفروع");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setRole(data.data.role);
        setCurrentBranchId(data.data.branchId || null);
      }
    } catch (e) {
      console.log("خطأ جلب الدور", e);
    }
  };

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setTodayDate(formatted);
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (role) fetchBranches();
  }, [role]);

  const salesData = {
    labels: ['1', '5', '10', '15', '20', '25'],
    datasets: [
      {
        data: [500, 700, 400, 800, 600, 900],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.dateText}>{todayDate}</Text>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.sectionTitle}>مبيعات الشهر الحالي</Text>

      <LineChart
        data={salesData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(129, 39, 50, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#812732",
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <Text style={styles.sectionTitle}>الفروع</Text>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {branches.map((branch) => {
          const isClickable =
            role === "OWNER" ||
            (role === "BRANCH_ADMIN" && currentBranchId === branch.id);

          const Wrapper = isClickable ? TouchableOpacity : View;

          return (
            <Wrapper
              key={branch.id}
              style={styles.branchBoxGrid}
              {...(isClickable && {
                onPress: () => router.push(`/admin/branch/${branch.id}`),
              })}
            >
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchDetail}>📞 {branch.phone}</Text>
              <Text style={styles.branchDetail}>👥 {branch.users?.length || 0} مستخدم</Text>
            </Wrapper>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#812732',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    width: 180,
    height: 180,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#812732',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  branchBoxGrid: {
    width: "31%",
    backgroundColor: "#812732",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  branchName: {
    color: "#fff",
  },
  branchDetail: {
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
  },
});
