import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BASE_URL = "https://cam4rent.net";

const statusTranslation = {
  PENDING: "قيد المراجعة",
  CONFIRMED: "تم التأكيد",
  PREPARING: "جاري التحضير",
  READY: "جاهز للتوصيل",
  OUT_FOR_DELIVERY: "خرج للتوصيل",
  DELIVERING: "قيد التوصيل",
  DELIVERED: "تم التوصيل",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};


const statusColors = {
  PENDING: "#812732",
  CONFIRMED: "#e67e22",
  PREPARING: "#3498db",
  READY: "#27ae60",
  OUT_FOR_DELIVERY: "#9b59b6",
  DELIVERING: "#2ecc71",
  DELIVERED: "#2ecc71",
  COMPLETED: "#1abc9c",
  CANCELLED: "#a00",
};


export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("none");
  const [selectedStatus, setSelectedStatus] = useState("none");
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setUser(data?.data || null);
    } catch (err) {
      console.log("فشل تحميل بيانات المستخدم", err);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setBranches(data);
    } catch (err) {
      console.log("فشل تحميل الفروع", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        let filtered = data;

        if (user?.role === "BRANCH_ADMIN" || user?.role === "CASHIER") {
          filtered = filtered.filter(
            (order) => order.branch?.id === user.branchId
          );
        }

        if (user?.role === "DELIVERY") {
          filtered = filtered.filter(
            (order) =>
              order.deliveryId === user.id &&
              ["OUT_FOR_DELIVERY", "DELIVERING"].includes(order.status)
          );
        }


        if (user?.role === "OWNER" && selectedBranch !== "none") {
          filtered = filtered.filter(
            (order) => order.branch?.id === selectedBranch
          );
        }

        if (selectedStatus !== "none") {
          filtered = filtered.filter(
            (order) => order.status === selectedStatus
          );
        }

        setOrders(filtered);
      } else {
        Alert.alert("خطأ", "فشل تحميل الطلبات");
      }
    } catch (err) {
      Alert.alert("خطأ", "تأكد من الاتصال بالإنترنت");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserProfile();
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "OWNER") fetchBranches();
      fetchOrders();
    }
  }, [user, selectedBranch, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

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
        <Text style={styles.headerTitle}>الطلبات</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Ionicons name="refresh" size={24} color="#812732" />
        </TouchableOpacity>
      </View>

      {user?.role === "OWNER" && (
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setBranchModalVisible(true)}
          >
            <Text style={styles.dropdownTitle}>تصفية بالفروع</Text>
            <Text style={styles.selectedText}>
              {selectedBranch === "none"
                ? "كل الفروع"
                : branches.find((b) => b.id === selectedBranch)?.name ||
                  "فرع غير معروف"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setStatusModalVisible(true)}
          >
            <Text style={styles.dropdownTitle}>تصفية بالحالة</Text>
            <Text style={styles.selectedText}>
              {selectedStatus === "none"
                ? "كل الحالات"
                : statusTranslation[selectedStatus]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/admin/orders/${item.id}`)}
          >
            <View>
              <Text style={styles.textBold}>رقم الطلب: {item.orderNumber}</Text>
              <Text>الفرع: {item.branch?.name || "غير معروف"}</Text>
              <Text style={{ color: statusColors[item.status] || "#000", fontWeight: "bold" }}>
                الحالة: {statusTranslation[item.status] || item.status}
              </Text>

              <Text>الإجمالي: {item.total} ر.س</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#812732" />
          </TouchableOpacity>
        )}
        contentContainerStyle={orders.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد طلبات حتى الآن</Text>
        }
      />

      {/* Branch Modal */}
      <Modal transparent animationType="slide" visible={branchModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                setSelectedBranch("none");
                setBranchModalVisible(false);
              }}
            >
              <Text>كل الفروع</Text>
            </Pressable>
            {branches.map((branch) => (
              <Pressable
                key={branch.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedBranch(branch.id);
                  setBranchModalVisible(false);
                }}
              >
                <Text>{branch.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal transparent animationType="slide" visible={statusModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                setSelectedStatus("none");
                setStatusModalVisible(false);
              }}
            >
              <Text>كل الحالات</Text>
            </Pressable>
            {Object.entries(statusTranslation).map(([key, label]) => (
              <Pressable
                key={key}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedStatus(key);
                  setStatusModalVisible(false);
                }}
              >
                <Text>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#812732",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  dropdownContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#812732",
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 14,
    color: "#812732",
    textAlign: "right",
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textBold: { fontWeight: "bold", marginBottom: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { color: "#999", fontSize: 16 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
