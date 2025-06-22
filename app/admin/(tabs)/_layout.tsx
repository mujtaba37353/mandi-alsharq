export const unstable_settings = {
  initialRouteName: "main", // اجبر التابات يبدأ من الرئيسية
};

import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  Text,
  Pressable,
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminTabsLayout() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleAccountPress = () => {
    setMenuVisible(false);
    router.push("/admin/(account)/account"); // المسار الصحيح
  };

  const handleLogoutPress = async () => {
    try {
      await AsyncStorage.removeItem("token"); // 🧹 حذف التوكن
      setMenuVisible(false);
      router.replace("/auth/login"); // 🔁 توجيه المستخدم
    } catch (error) {
      console.error("❌ خطأ أثناء تسجيل الخروج:", error);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerRight: () => (
            <View style={{ marginRight: 20 }}>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Ionicons name="person-outline" size={28} color="#812732" />
              </TouchableOpacity>
            </View>
          ),
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 75,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            paddingTop: 10,
            position: "absolute",
            backgroundColor: "#fff",
          },
          tabBarIcon: ({ focused }) => {
            let iconName;

            if (route.name === "users") iconName = "people-outline";
            else if (route.name === "branches") iconName = "business-outline";
            else if (route.name === "main") iconName = "home-outline";
            else if (route.name === "menus") iconName = "restaurant-outline";
            else if (route.name === "orders") iconName = "bar-chart-outline";

            return (
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={iconName}
                  size={26}
                  color={focused ? "#812732" : "#ccc"}
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="users" options={{ title: "المستخدمين" }} />
        <Tabs.Screen name="branches" options={{ title: "الفروع" }} />
        <Tabs.Screen
          name="main"
          options={{
            title: "الرئيسية",
            tabBarButton: (props) => (
              <View style={styles.centerWrapper}>
                <TouchableOpacity {...props} style={styles.centerButton}>
                  <Ionicons name="home-outline" size={34} color="#fff" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tabs.Screen name="menus" options={{ title: "القوائم" }} />
        <Tabs.Screen name="orders" options={{ title: "الطلبات" }} />
      </Tabs>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAccountPress}
            >
              <Text style={styles.menuText}>الحساب</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogoutPress}
            >
              <Text style={styles.menuText}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    marginTop: 6,
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#812732",
  },
  centerWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 15,
    alignSelf: "center",
    zIndex: 10,
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#812732",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});
