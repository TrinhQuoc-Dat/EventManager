import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { MyUserContext } from "../../configs/Context";
import Apis, {  authApis, endpoints, } from "../../configs/Apis";
import { styles as profileStyles } from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EventStats = () => {
  const user = useContext(MyUserContext);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState(null);

  // Lấy danh sách sự kiện của nhà tổ chức
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await authApis(token).get(endpoints["event-user"]);
        setEvents(response.data.results || response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sự kiện:", error);
      }
    };
    if (user.role !== "participant") {
      fetchEvents();
    }
  }, [user]);

  // Lấy thống kê cho sự kiện được chọn
  const fetchEventStats = async (eventId) => {
    try {
        const token = await AsyncStorage.getItem("token");
      const response = await authApis(token).get(endpoints["event-stats"](eventId));
      setStats(response.data);
      setSelectedEvent(eventId);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
    }
  };

  // Dữ liệu biểu đồ
  const chartData = stats
    ? {
        labels: stats.ticket_types_stats.map((item) => item.ticket_type),
        datasets: [
          {
            data: stats.ticket_types_stats.map((item) => item.tickets_sold),
          },
        ],
      }
    : null;

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => fetchEventStats(item.id)}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thống kê và báo cáo</Text>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.eventList}
      />
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Thống kê sự kiện: {stats.event_title}</Text>
          <Text style={styles.statsText}>
            Tổng số vé bán ra: {stats.total_tickets_sold}
          </Text>
          <Text style={styles.statsText}>
            Tổng doanh thu: {stats.total_revenue.toLocaleString()} VNĐ
          </Text>
          {chartData && (
            <BarChart
              data={chartData}
              width={Dimensions.get("window").width - 40}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  eventList: {
    marginBottom: 20,
  },
  eventItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default EventStats;