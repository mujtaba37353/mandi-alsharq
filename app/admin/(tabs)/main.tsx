import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const screenWidth = Dimensions.get('window').width;

export default function AdminMainPage() {
  const router = useRouter();
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setTodayDate(formatted);
  }, []);

  const salesData = {
    labels: ['1', '5', '10', '15', '20', '25'],
    datasets: [
      {
        data: [500, 700, 400, 800, 600, 900],
        strokeWidth: 2,
      },
    ],
  };

  const branches = [
    { id: '1', name: 'فرع الرياض', location: 'طريق الملك فهد' },
    { id: '2', name: 'فرع جدة', location: 'حي الروضة' },
    { id: '3', name: 'فرع الدمام', location: 'شارع الملك عبدالعزيز' },
  ];

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
          style: {
            borderRadius: 16,
          },
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

      <View style={styles.branchesContainer}>
        {branches.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            style={styles.branchBox}
            onPress={() => router.push(`/admin/branch/${branch.id}`)}
          >
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.branchLocation}>{branch.location}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  branchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 10,
  },
  branchBox: {
    width: 160,
    height: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#812732',
    textAlign: 'center',
  },
  branchLocation: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },
});
