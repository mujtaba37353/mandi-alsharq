import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const BASE_URL = "https://cam4rent.net";

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [role, setRole] = useState<string | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(true);

  const fetchBranches = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      if (role === "CASHIER" || role === "DELIVERY") {
        // ممنوع من الوصول
        setHasAccess(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const fetchUserInfo = async () => {
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
      console.log("خطأ جلب بيانات المستخدم", e);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (role) fetchBranches();
  }, [role]);

  const isBranchClickable = (branchId: string) => {
    if (role === "OWNER") return true;
    if (role === "BRANCH_ADMIN" && currentBranchId === branchId) return true;
    return false;
  };

  if (!hasAccess) {
    return (
      <View style={styles.centered}>
        <Text style={styles.forbidden}>ليس لديك صلاحية للوصول إلى هذه الصفحة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === "OWNER" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/branch/add")}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>إضافة فرع جديد</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.branchList}>
        {branches.map((branch) => {
          const clickable = isBranchClickable(branch.id);
          const Wrapper = clickable ? TouchableOpacity : View;

          return (
            <Wrapper
              key={branch.id}
              style={[
                styles.branchBox,
                !clickable && { backgroundColor: "#eee" },
              ]}
              {...(clickable && {
                onPress: () => router.push(`/admin/branch/${branch.id}`),
              })}
            >
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchLocation}>📞 {branch.phone}</Text>
              <Text style={styles.branchLocation}>📧 {branch.email}</Text>
              <Text style={styles.branchLocation}>📍 {branch.address}</Text>
            </Wrapper>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#812732",
    padding: 12,
    borderRadius: 10,
    margin: 10,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  branchList: { paddingBottom: 20 },
  branchBox: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  branchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#812732",
    marginBottom: 5,
  },
  branchLocation: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  forbidden: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
  },
});