import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 75,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          position: 'absolute',
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === 'account') iconName = 'person-outline';
          else if (route.name === 'orders') iconName = 'receipt-outline';
          else if (route.name === 'home') iconName = 'fast-food-outline';
          else if (route.name === 'favorite') iconName = 'heart-outline';
          else if (route.name === 'cart') iconName = 'cart-outline';

          return (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={iconName}
                size={26}
                color={focused ? '#812732' : '#ccc'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
    >
    
      <Tabs.Screen name="account" options={{ title: 'الحساب' }} />
      <Tabs.Screen name="orders" options={{ title: 'الطلبات' }} />
      <Tabs.Screen
          name="home"
          options={{
            title: 'الرئيسية',
            tabBarButton: (props) => (
              <View style={styles.centerWrapper}>
                <TouchableOpacity {...props} style={styles.centerButton}>
                  <Image
                    source={require('../../assets/images/sheep-icon.png')}
                    style={styles.iconImageHome}
                  />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

      <Tabs.Screen name="favorite" options={{ title: 'المفضلة' }} />
      <Tabs.Screen name="cart" options={{ title: 'السلة' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    marginTop: 6,
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#812732',
  },
  centerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 15,
    alignSelf: 'center',
    zIndex: 10,
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#812732',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  iconImageHome: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    tintColor: '#fff',
  },  
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  iconImageFocused: {
    tintColor: '#812732',
  },
  
  
});
