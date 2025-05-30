import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, SafeAreaView, ScrollView } from "react-native";
import Apis, { endpoints } from "../../configs/Apis";
import styles from "./styles";
import EventItem from "./EventItem";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryId = 9;

  // Gọi API để lấy danh sách sự kiện của category
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Thay đổi URL nếu dùng thiết bị thật hoặc server public
        // const response = await axios.get(`http://192.168.1.4:8000/api/categories/${categoryId}/events/`);
        const response = await Apis.get(endpoints["event-list"]);
        setEvents(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error.message, error.code);
        setLoading(false);
      }
    };
    fetchEvents();
  }, [categoryId]);

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (!events || events.length === 0) {
    return <Text style={styles.error}>No events found for this category!</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView >
        <Text style={styles.categoryTitle}>Hội thảo Công nghệ</Text>{" "}
        {/* Giả định tên category */}
        {events && events.map((e) => <EventItem key={e.id} event={e} />)}
      </ScrollView>
    </SafeAreaView>
  );
};
export default Events;
