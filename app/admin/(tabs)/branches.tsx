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

const BASE_URL = "http://143.244.156.186:3007";


export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [role, setRole] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

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

  const fetchRole = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRole(data.data.role);
      }
    } catch (e) {
      console.log("خطأ جلب الدور", e);
    }
  };

  useEffect(() => {
    fetchRole();
    fetchBranches();
  }, []);

  return (
    <View style={styles.container}>
      {/* زر إضافة فرع للمالك فقط */}
      {role === "OWNER" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/branch/add")}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>إضافة فرع جديد</Text>
        </TouchableOpacity>
      )}

      {/* قائمة الفروع */}
      <ScrollView contentContainerStyle={styles.branchList}>
          {branches.map((branch) => {
            const isClickable = role === "OWNER";
            const Wrapper = isClickable ? TouchableOpacity : View;

            return (
              <Wrapper
                key={branch.id}
                style={styles.branchBox}
                {...(isClickable && {
                  onPress: () => router.push(`/admin/branch/${branch.id}`),
                })}
              >
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchLocation}>رقم الهاتف: {branch.phone}</Text>
                <Text style={styles.branchLocation}>البريد الالكتروني: {branch.email}</Text>
                <Text style={styles.branchLocation}>العنوان: {branch.address}</Text>
              </Wrapper>
            );
          })}
      </ScrollView>

    </View>
  );
}

export const styles = StyleSheet.create({
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
  branchName: { fontSize: 18, fontWeight: "bold", color: "#812732" },
  branchLocation: { fontSize: 14, color: "#555", marginTop: 5 },
  hoursContainer: { marginTop: 10 },
  hoursTitle: { fontWeight: "bold", color: "#444" },
  workingHour: { fontSize: 13, color: "#666", marginTop: 2 },
});
