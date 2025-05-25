
import { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Apis, { endpoints } from '../../configs/Apis';
import { navigate } from '../../service/NavigationService';
import { ActivityIndicator, Button, Card, Divider } from "react-native-paper";
import "moment/locale/vi";
import RenderHTML from "react-native-render-html";


const EventDetail = ({ route }) => {
  const eventId = route.params?.eventId;
  const [event, setEvent] = useState(null);


  // Gọi API để lấy dữ liệu sự kiện
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // const response = await axios.get('http://192.168.1.4:8000/api/event/3/');
        const response = await Apis.get(endpoints['event'](eventId));
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  const formatDateTime = (start, end) => {
    moment.locale("vi");
    const startTime = moment(start).format("HH:mm");
    const endTime = moment(end).format("HH:mm");
    const date = moment(start).format("DD [tháng] MM, YYYY");
    return `${startTime} - ${endTime}, ${date}`;
  };

  // Render mỗi loại vé
  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => {
        navigate('paymentTicket', { ticket: item, event: event, });
      }}
    >
      <View style={styles.ticketItem}>
        <Text style={styles.ticketName}>{item.name}</Text>
        <Text style={styles.ticketPrice}>
          {parseFloat(item.ticket_price).toLocaleString('vi-VN')} VNĐ
        </Text>
        <Text style={styles.ticketQuantity}>Số lượng: {item.so_luong}</Text>
      </View>
    </TouchableOpacity>

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

  if (!event) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: event.image }} style={styles.image} />
        <Card.Title
          title={event.title}
          titleNumberOfLines={0}
          titleStyle={styles.title}
        />
        <Card.Content>
          <Text style={styles.infoText}>
            🕒 {formatDateTime(event.start_date_time, event.end_date_time)}
          </Text>
          <Text style={styles.infoText}>📍 {event.location_name}</Text>
          <Text style={styles.infoSub}>{event.location}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Giới thiệu" />
        <Card.Content>
          <RenderHTML source={{ html: event.description }} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Thông tin vé" />
        <Card.Content>
          {event.ticket_types.map((t) => (
            <View key={t.id} style={styles.ticketItem}>
              <Text style={styles.ticketName}>{t.name}</Text>
              <Text style={styles.ticketPrice}>
                {parseFloat(t.ticket_price).toLocaleString("vi-VN")} VNĐ
              </Text>
              <Card.Actions style={styles.ticketActions}>
                <Button mode="contained" buttonColor="#6200ee" onPress={() => {
                  navigate('paymentTicket', { ticket: t, event: event, });
                }}>
                  Đặt vé
                </Button>
              </Card.Actions>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Bình luận" />
        <Card.Content>
          <FlatList
            data={event.comment_set}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Image
                  source={{ uri: item.user.avatar }}
                  style={styles.commentAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentUser}>
                    {item.user.first_name} {item.user.last_name}
                  </Text>
                  <Text style={styles.commentContent}>{item.content}</Text>
                  <Text style={styles.commentDate}>
                    {moment(item.created_date).format("HH:mm DD/MM/YYYY")} -
                    Đánh giá: {item.rate}/10
                  </Text>
                </View>
              </View>
            )}
            scrollEnabled={false} // giữ cho bình luận cuộn chung với trang
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Nhà tổ chức" />
        <Card.Content style={styles.organizerContent}>
          <Image
            style={styles.avatar}
            source={{ uri: event.organizer.avatar }}
          />
          <Text style={styles.organizerName}>
            {event.organizer.organization_name}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#f8f8f8",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    marginTop: 4,
    color: "#444",
  },
  infoSub: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
    lineHeight: 22,
  },
  ticketItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  ticketName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ticketPrice: {
    fontSize: 14,
    color: "#e91e63",
  },
  ticketActions: {
    justifyContent: "flex-end",
    padding: 8,
  },
  organizerContent: {
    alignItems: "center",
    marginTop: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  commentContent: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
  },
});

export default EventDetail;
