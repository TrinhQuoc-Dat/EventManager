import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Apis, { endpoints } from '../../configs/Apis';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryId = 1

  // Gọi API để lấy danh sách sự kiện của category
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Thay đổi URL nếu dùng thiết bị thật hoặc server public
        // const response = await axios.get(`http://192.168.1.4:8000/api/categories/${categoryId}/events/`);
        const response = Apis.get(endpoints.events(categoryId));
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error.message, error.code);
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

  // Định dạng ngày giờ
  const formatDateTime = (dateTime) =>
    moment(dateTime).format('DD/MM/YYYY HH:mm');

  // Render mỗi sự kiện
  const renderEvent = ({ item }) => (
    <TouchableOpacity style={styles.eventItem}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.eventImage} />
      )}
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.infoRow}>
          <Icon name="event" size={16} color="#555" />
          <Text style={styles.infoText}>
            {formatDateTime(item.start_date_time)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color="#555" />
          <Text style={styles.infoText}>
            {item.location_name} ({item.location})
          </Text>
        </View>
        <Text style={styles.price}>
          Giá: {item.price === 0 ? 'Miễn phí' : `${item.price.toLocaleString('vi-VN')} VNĐ`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>Hội thảo Công nghệ</Text> {/* Giả định tên category */}
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flexShrink: 1,
  },
  price: {
    fontSize: 14,
    color: '#e91e63',
    marginTop: 4,
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
});

export default Events;