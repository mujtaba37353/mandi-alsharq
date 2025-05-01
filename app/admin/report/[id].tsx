import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';

const screenWidth = Dimensions.get('window').width;

const fakeReports = {
  '1': {
    type: 'branch',
    title: 'تقرير فرع الرياض',
    dateRange: '01/04/2025 - 07/04/2025',
    chartData: [300, 450, 500, 350, 600, 800],
    summary: { totalOrders: 120, totalSales: 15500 },
  },
  '2': {
    type: 'user',
    title: 'تقرير الكاشير أحمد',
    dateRange: '01/04/2025 - 07/04/2025',
    chartData: [150, 200, 180, 300, 250, 270],
    summary: { totalOrders: 85, totalSales: 9200 },
  },
  '3': {
    type: 'product',
    title: 'تقرير منتج مندي لحم',
    dateRange: 'كل الأوقات',
    chartData: [20, 35, 28, 50, 40, 60],
    summary: { totalSold: 180, totalRevenue: 4500 },
  },
};

export default function ReportDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const report = fakeReports[id as string];

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>لم يتم العثور على التقرير</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* زر الرجوع */}
      <TouchableOpacity onPress={() => router.push(`/admin/(tabs)/reports`)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#812732" />
      </TouchableOpacity>

      {/* العنوان */}
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.dateRange}>الفترة: {report.dateRange}</Text>

      {/* الرسم البياني */}
      <Text style={styles.sectionHeader}>مخطط المبيعات</Text>
      <LineChart
        data={{
          labels: ['1', '2', '3', '4', '5', '6'],
          datasets: [{ data: report.chartData }],
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(129, 39, 50, ${opacity})`,
          labelColor: () => '#000',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#812732',
          },
        }}
        style={styles.chart}
      />

      {/* ملخص التقرير */}
      <Text style={styles.sectionHeader}>الملخص</Text>
      <View style={styles.summaryBox}>
        {report.type === 'product' ? (
          <>
            <Text style={styles.summaryText}>عدد القطع المباعة: {report.summary.totalSold}</Text>
            <Text style={styles.summaryText}>إجمالي الإيرادات: {report.summary.totalRevenue} ريال</Text>
          </>
        ) : (
          <>
            <Text style={styles.summaryText}>عدد الطلبات: {report.summary.totalOrders}</Text>
            <Text style={styles.summaryText}>إجمالي المبيعات: {report.summary.totalSales} ريال</Text>
          </>
        )}
      </View>

      {/* زر تحميل التقرير */}
      <TouchableOpacity style={styles.downloadButton}>
        <Ionicons name="download-outline" size={22} color="#fff" />
        <Text style={styles.downloadText}>تحميل التقرير</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  backButton: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#812732', textAlign: 'center' },
  dateRange: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#812732', marginTop: 20, marginBottom: 10 },
  chart: { borderRadius: 12 },
  summaryBox: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginTop: 10 },
  summaryText: { fontSize: 15, color: '#333', marginBottom: 8 },
  downloadButton: {
    backgroundColor: '#812732',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: '#812732',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
