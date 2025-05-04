// الكود طويل وسأقوم بإرساله في جزءين

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://143.244.156.186:3007";

const roleTranslation: Record<string, string> = {
  USER: "مستخدم",
  BRANCH_ADMIN: "مدير فرع",
  CASHIER: "كاشير",
  DELIVERY: "عامل توصيل",
};

const allowedRoles = ["USER", "BRANCH_ADMIN", "CASHIER", "DELIVERY"];

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [branchFilter, setBranchFilter] = useState("none");
  const [roleFilter, setRoleFilter] = useState("none");

  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        const filtered = data.filter((u: any) => u.role !== "OWNER");
        setUsers(filtered);
      }
    } catch (err) {
      Alert.alert("خطأ", "فشل تحميل المستخدمين");
    } finally {
      setRefreshing(false);
      setLoading(false);
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
      console.log("خطأ الفروع", err);
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
      if (res.ok) setCurrentUser(data?.data || null);
    } catch (err) {
      console.log("خطأ في جلب بيانات المستخدم", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        Alert.alert("تم الحذف");
        fetchUsers();
      } else {
        Alert.alert("فشل", "تعذر حذف المستخدم");
      }
    } catch {
      Alert.alert("خطأ", "تأكد من الاتصال");
    }
  };

  const filteredUsers = () => {
    let filtered = [...users];

    if (currentUser?.role === "BRANCH_ADMIN" || currentUser?.role === "CASHIER" || currentUser?.role === "DELIVERY") {
      filtered = filtered.filter((u) => u.branchId === currentUser?.branchId);
    }

    if (roleFilter !== "none") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (currentUser?.role === "OWNER" && branchFilter !== "none") {
      filtered = filtered.filter((u) => u.branchId === branchFilter);
    }

    return filtered;
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUsers();
    fetchBranches();
  }, []);

  const canEdit = currentUser?.role === "OWNER" || currentUser?.role === "BRANCH_ADMIN";
  const canDelete = canEdit;
  const canAdd = canEdit;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#812732" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المستخدمين</Text>
        <TouchableOpacity onPress={fetchUsers}>
          <Ionicons name="refresh" size={24} color="#812732" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {(currentUser?.role === "OWNER" || currentUser?.role === "BRANCH_ADMIN") && (
        <View style={styles.filtersRow}>
          {currentUser?.role === "OWNER" && (
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setBranchModalVisible(true)}
            >
              <View style={styles.dropdownHeader}>
                <Ionicons name="chevron-down" size={16} color="#812732" />
                <Text style={styles.dropdownTitle}>تصفية بالفروع</Text>
              </View>
              <Text style={styles.selectedText}>
                {branchFilter === "none"
                  ? "كل الفروع"
                  : branches.find((b) => b.id === branchFilter)?.name || "فرع غير معروف"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setRoleModalVisible(true)}
          >
            <View style={styles.dropdownHeader}>
              <Ionicons name="chevron-down" size={16} color="#812732" />
              <Text style={styles.dropdownTitle}>تصفية بالأدوار</Text>
            </View>
            <Text style={styles.selectedText}>
              {roleFilter === "none" ? "بدون فلترة" : roleTranslation[roleFilter]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Button */}
      {canAdd && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/add-user")}
        >
          <Ionicons name="person-add-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>إضافة مستخدم</Text>
        </TouchableOpacity>
      )}

      {/* Users List */}
      <FlatList
        data={filteredUsers()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => {
              if (canEdit) router.push(`/admin/user-info/${item.id}`);
            }}
          >
            <View>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.role}>الدور: {roleTranslation[item.role]}</Text>
              <Text style={styles.branch}>الفرع: {item.branch?.name || "غير محدد"}</Text>
            </View>
            {canEdit && (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/edit-user/${item.id}`)}
                >
                  <Ionicons name="create-outline" size={22} color="#812732" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUsers}
            colors={["#812732"]}
          />
        }
        contentContainerStyle={styles.list}
      />

      {/* Branch Modal */}
      <Modal transparent animationType="slide" visible={branchModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                setBranchFilter("none");
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
                  setBranchFilter(branch.id);
                  setBranchModalVisible(false);
                }}
              >
                <Text>{branch.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Role Modal */}
      <Modal transparent animationType="slide" visible={roleModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                setRoleFilter("none");
                setRoleModalVisible(false);
              }}
            >
              <Text>بدون فلترة</Text>
            </Pressable>
            {allowedRoles.map((role) => (
              <Pressable
                key={role}
                style={styles.modalItem}
                onPress={() => {
                  setRoleFilter(role);
                  setRoleModalVisible(false);
                }}
              >
                <Text>{roleTranslation[role]}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#812732" },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  dropdownContainer: {
    width: "45%",
    backgroundColor: "#fafafa",
    borderColor: "#ddd",
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
  },
  dropdownTitle: {
    marginLeft: 5,
    fontSize: 14,
    color: "#812732",
    fontWeight: "bold",
  },
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
  selectedText: {
    textAlign: "center",
    color: "#812732",
    paddingVertical: 8,
  },
  list: { padding: 20 },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  username: { fontSize: 16, fontWeight: "bold", color: "#812732" },
  email: { fontSize: 14, color: "#666", marginTop: 2 },
  role: { fontSize: 13, color: "#999", marginTop: 2 },
  branch: { fontSize: 13, color: "#999", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10 },
  actionButton: { marginLeft: 8 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#812732",
    padding: 12,
    borderRadius: 10,
    margin: 20,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
