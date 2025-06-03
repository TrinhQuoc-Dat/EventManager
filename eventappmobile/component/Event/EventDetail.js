import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import moment from "moment";
import "moment/locale/vi";
import { ActivityIndicator, Button, Card } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Context";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { navigate } from "../../service/NavigationService";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

// Theme constants
const theme = {
  colors: {
    primary: "#6200ee",
    text: "#333",
    subText: "#666",
    price: "#e91e63",
    background: "#f8f8f8",
    border: "#ccc",
    disabled: "#ccc",
  },
  spacing: {
    small: 8,
    medium: 12,
    large: 16,
  },
  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
    title: 22,
  },
};

// Hàm kiểm tra sự kiện đã kết thúc
const isEventEnded = (eventDates) => {
  const currentTime = moment();
  return eventDates.every((date) => {
    const endDateTime = moment(
      `${date.event_date} ${date.end_time}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    return currentTime.isAfter(endDateTime);
  });
};

// Custom hook for fetching event
const useEvent = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await Apis.get(endpoints["event"](eventId));
        setEvent(response.data);
      } catch (error) {
        setError(error);
        Alert.alert("Lỗi", "Không thể tải thông tin sự kiện.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  return { event, loading, error, setEvent };
};

// Custom hook for posting comment
const usePostComment = (eventId, setEvent) => {
  const [commentContent, setCommentContent] = useState("");
  const [commentRate, setCommentRate] = useState("");
  const [loading, setLoading] = useState(false);

  const postComment = useCallback(async () => {
    if (!commentContent.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung bình luận");
      return;
    }
    if (
      !commentRate ||
      isNaN(commentRate) ||
      commentRate < 1 ||
      commentRate > 10
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đánh giá từ 1 đến 10");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để bình luận");
        return;
      }

      const response = await authApis(token).post(
        endpoints["post-comment"](eventId),
        {
          content: commentContent,
          rate: parseInt(commentRate),
          event: eventId,
        }
      );

      setEvent((prev) => ({
        ...(prev || {}),
        comment_set: [response.data, ...(prev?.comment_set || [])],
      }));
      setCommentContent("");
      setCommentRate("");
      Alert.alert("Thành công", "Bình luận đã được đăng");
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert("Lỗi", "Không thể đăng bình luận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [commentContent, commentRate, eventId, setEvent]);

  return {
    commentContent,
    setCommentContent,
    commentRate,
    setCommentRate,
    postComment,
    loading,
  };
};

// const QRCodeItem = React.memo(({ qrCode }) => (
//   <View style={styles.qrCodeContainer}>
//     <Text style={styles.qrCodeTitle}>Mã QR để check-in</Text>
//     <QRCode value={qrCode} size={200} backgroundColor="#fff" color="#000" />
//   </View>
// ));

// Component: Event Header
const EventHeader = React.memo(({ event }) => {
  const formatDateTime = (eventDate) => {
    moment.locale("vi");
    const startTime = moment(eventDate.start_time, "HH:mm:ss").format("HH:mm");
    const endTime = moment(eventDate.end_time, "HH:mm:ss").format("HH:mm");
    const date = moment(eventDate.event_date).format("DD [tháng] MM, YYYY");
    return `${startTime} - ${endTime}, ${date}`;
  };

  return (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: event.image }} style={styles.image} />
      <Card.Title
        title={event.title}
        titleNumberOfLines={0}
        titleStyle={styles.title}
      />
      <Card.Content>
        <Text style={styles.infoText}>📍 {event.location_name}</Text>
        <Text style={styles.infoSub}>{event.location}</Text>
        {event.event_dates.map((date) => (
          <Text key={date.id} style={styles.infoText}>
            🕒 {formatDateTime(date)}
          </Text>
        ))}
      </Card.Content>
    </Card>
  );
});

// Component: Ticket Item
const TicketItem = React.memo(({ ticket, event, isEventEnded }) => (
  <View style={styles.ticketItem}>
    <View style={styles.ticketDetails}>
      <Text style={styles.ticketName}>{ticket.name}</Text>
      <Text style={styles.ticketPrice}>
        {parseFloat(ticket.ticket_price).toLocaleString("vi-VN")} VNĐ
      </Text>
      <Text style={styles.ticketQuantity}>Số lượng: {ticket.so_luong}</Text>
    </View>
    {isEventEnded ? (
      <Text style={styles.endedText}>Sự kiện đã kết thúc</Text>
    ) : (
      <Button
        mode="contained"
        buttonColor={theme.colors.primary}
        onPress={() => navigate("paymentTicket", { ticket, event })}
        style={styles.bookButton}
      >
        Đặt vé
      </Button>
    )}
  </View>
));

// Component: Comment Item
const CommentItem = React.memo(({ item }) => (
  <View style={styles.commentItem}>
    <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
    <View style={styles.commentContent}>
      <Text style={styles.commentUser}>
        {item.user.first_name} {item.user.last_name}
      </Text>
      <Text style={styles.commentText}>{item.content}</Text>
      <Text style={styles.commentDate}>
        {moment(item.created_date).format("HH:mm DD/MM/YYYY")} - Đánh giá:{" "}
        {item.rate}/10
      </Text>
    </View>
  </View>
));

// Component: Organizer Info
const OrganizerInfo = React.memo(({ organizer }) => (
  <Card style={styles.card}>
    <Card.Title title="Nhà tổ chức" />
    <Card.Content style={styles.organizerContent}>
      <Image style={styles.avatar} source={{ uri: organizer.avatar }} />
      <Text style={styles.organizerName}>{organizer.organization_name}</Text>
    </Card.Content>
  </Card>
));

// Main Component
const EventDetail = ({ route }) => {
  const user = useContext(MyUserContext);
  const eventId = route.params?.eventId;
  const { event, loading, error, setEvent } = useEvent(eventId);
  const {
    commentContent,
    setCommentContent,
    commentRate,
    setCommentRate,
    postComment,
  } = usePostComment(eventId, setEvent);

  if (loading || !event) return <ActivityIndicator style={{ marginTop: 32 }} />;

  const eventEnded = isEventEnded(event.event_dates);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <EventHeader event={event} />
        <Card style={styles.card}>
          <Card.Title title="Giới thiệu" />
          <Card.Content>
            <RenderHTML source={{ html: event.description }} />
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Thông tin vé" />
          <Card.Content>
            {event.event_dates.map((date) => (
              <View key={date.id}>
                <Text style={styles.dateHeader}>{formatDateTime(date)}</Text>
                <FlatList
                  data={event.ticket_types.filter(
                    (ticket) => ticket.event_date === date.id
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TicketItem
                      ticket={item}
                      event={event}
                      isEventEnded={eventEnded}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
        {/* <Card style={styles.card}>
          <Card.Title title="Mã QR Check-in" />
          <Card.Content>
            <QRCodeItem qrCode={'2e569469-1dd4-4988-8178-8d205982be38'} />
          </Card.Content>
        </Card> */}
        <Card style={styles.card}>
          <Card.Title title="Bình luận" />
          <Card.Content>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Nhập bình luận của bạn..."
                value={commentContent}
                onChangeText={setCommentContent}
                multiline
              />
              <View style={styles.rateInputContainer}>
                <TextInput
                  style={styles.rateInput}
                  placeholder="Đánh giá (1-10)"
                  value={commentRate}
                  onChangeText={setCommentRate}
                  keyboardType="numeric"
                />
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  onPress={postComment}
                  style={styles.commentButton}
                >
                  Đăng
                </Button>
              </View>
            </View>
            <FlatList
              data={event.comment_set}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <CommentItem item={item} />}
              scrollEnabled={false}
            />
          </Card.Content>
        </Card>
        <OrganizerInfo organizer={event.organizer} />
        {user.role === "participant" ? (
          <TouchableOpacity
            style={{ padding: theme.spacing.large, alignItems: "center" }}
            onPress={() =>
              navigate("chat", {
                organizerEmail: event.organizer.email,
                eventId: event.id,
              })
            }
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: theme.fontSizes.large,
              }}
            >
              Liên hệ với nhà tổ chức
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ padding: theme.spacing.large, alignItems: "center" }}
            // onPress={() => navigate("contact-list", { eventId: event.id })}
            onPress={() => navigate("profile", {
              screen: "contact-list",
              params: { eventId: 2 },
            })}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: theme.fontSizes.large,
              }}
            >
              Quản lý tin nhắn
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Hàm formatDateTime (được sử dụng trong EventHeader và TicketItem)
const formatDateTime = (eventDate) => {
  moment.locale("vi");
  const startTime = moment(eventDate.start_time, "HH:mm:ss").format("HH:mm");
  const endTime = moment(eventDate.end_time, "HH:mm:ss").format("HH:mm");
  const date = moment(eventDate.event_date).format("DD [tháng] MM, YYYY");
  return `${startTime} - ${endTime}, ${date}`;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  card: {
    marginBottom: theme.spacing.large,
    borderRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  infoText: {
    fontSize: theme.fontSizes.large,
    marginTop: theme.spacing.small,
    color: theme.colors.text,
  },
  infoSub: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.subText,
  },
  dateHeader: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    color: theme.colors.text,
  },
  ticketItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  ticketDetails: {
    flex: 1,
  },
  ticketName: {
    fontSize: theme.fontSizes.large,
    fontWeight: "600",
    color: theme.colors.text,
  },
  ticketPrice: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.price,
  },
  ticketQuantity: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.subText,
  },
  bookButton: {
    marginLeft: theme.spacing.medium,
  },
  endedText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.subText,
    marginLeft: theme.spacing.medium,
  },
  organizerContent: {
    alignItems: "center",
    marginTop: theme.spacing.medium,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: theme.spacing.medium,
  },
  organizerName: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.medium,
    paddingBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.medium,
  },
  commentUser: {
    fontSize: theme.fontSizes.large,
    fontWeight: "600",
    color: theme.colors.text,
  },
  commentText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.subText,
    marginVertical: theme.spacing.small,
  },
  commentDate: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.subText,
  },
  commentInputContainer: {
    marginBottom: theme.spacing.large,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    backgroundColor: "#fff",
  },
  rateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.medium,
    backgroundColor: "#fff",
  },
  commentButton: {
    flex: 0.4,
  },
});

export default EventDetail;
