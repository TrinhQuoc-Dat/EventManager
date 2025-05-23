import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Apis from '../../configs/Apis';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const eventid = 1

  // Gọi API để lấy dữ liệu sự kiện
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // const response = await axios.get('http://192.168.1.4:8000/api/event/3/');
        const response = Apis.get(endpoints.event(eventid));
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (!event) {
    return <Text style={styles.error}>Event not found!</Text>;
  }

  // Định dạng ngày giờ
  const formatDateTime = (dateTime) =>
    moment(dateTime).format('DD/MM/YYYY HH:mm');

  // Render mỗi loại vé
  const renderTicket = ({ item }) => (
    <View style={styles.ticketItem}>
      <Text style={styles.ticketName}>{item.name}</Text>
      <Text style={styles.ticketPrice}>
        {parseFloat(item.ticket_price).toLocaleString('vi-VN')} VNĐ
      </Text>
      <Text style={styles.ticketQuantity}>Số lượng: {item.so_luong}</Text>
    </View>
  );

  // Render mỗi bình luận
  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image
        source={{ uri: item.user.avatar }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>
          {item.user.first_name} {item.user.last_name}
        </Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentDate}>
          {formatDateTime(item.created_date)} - Đánh giá: {item.rate}/10
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh sự kiện */}
      {event.image && (
        <Image source={{ uri: event.image }} style={styles.eventImage} />
      )}

      {/* Tiêu đề và mô tả */}
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>

      {/* Thông tin thời gian và địa điểm */}
      <View style={styles.infoRow}>
        <Icon name="event" size={20} color="#555" />
        <Text style={styles.infoText}>
          {formatDateTime(event.start_date_time)} - {formatDateTime(event.end_date_time)}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="location-on" size={20} color="#555" />
        <Text style={styles.infoText}>
          {event.location_name} ({event.location})
        </Text>
      </View>

      {/* Thông tin nhà tổ chức */}
      <View style={styles.organizer}>
        <Text style={styles.sectionTitle}>Nhà tổ chức</Text>
        <View style={styles.organizerRow}>
          {event.organizer.avatar && (
            <Image
              source={{ uri: event.organizer.avatar }}
              style={styles.organizerAvatar}
            />
          )}
          <Text style={styles.organizerName}>{event.organizer.organization_name}</Text>
        </View>
      </View>

      {/* Danh sách vé */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loại vé</Text>
        <FlatList
          data={event.ticket_types}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Danh sách bình luận */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bình luận</Text>
        <FlatList
          data={event.comment_set}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
  organizer: {
    marginVertical: 16,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ticketItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketPrice: {
    fontSize: 14,
    color: '#e91e63',
    marginTop: 4,
  },
  ticketQuantity: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
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

export default EventDetail;