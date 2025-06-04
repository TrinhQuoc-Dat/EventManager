import React, { useEffect, useState, useContext, useCallback } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../configs/firebase";
import { MyUserContext } from "../../configs/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import moment from "moment";

const EventRoomChat = ({ route }) => {
  const eventId = route?.params?.eventId;
  const eventDates = route?.params?.eventDates || [];
  const user = useContext(MyUserContext);
  const [messages, setMessages] = useState([]);
  const [canChat, setCanChat] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kiểm tra điều kiện được chat
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        // Kiểm tra sự kiện đã kết thúc chưa
        const now = moment();
        const ended = eventDates.every((date) => {
          const end = moment(
            `${date.event_date} ${date.end_time}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return now.isAfter(end);
        });
        if (ended) {
          setCanChat(false);
          setLoading(false);
          return;
        }
        // Kiểm tra user đã mua vé chưa
        const token = await AsyncStorage.getItem("token");
        const res = await authApis(token).get(endpoints["ticketed-events"]);
        // Dữ liệu trả về là { results: [...] }
        const hasTicket =
          Array.isArray(res.data.results) &&
          res.data.results.some(
            (ticket) => ticket.id === eventId // eventId là id của sự kiện
          );
        setCanChat(hasTicket);
      } catch (err) {
        setCanChat(false);
      } finally {
        setLoading(false);
      }
    };
    checkEligibility();
  }, [eventId, eventDates]);

  // Lấy tin nhắn phòng chat sự kiện
  useEffect(() => {
    if (!canChat) return;
    const q = query(
      collection(db, "event_rooms"),
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return unsubscribe;
  }, [canChat, eventId]);

  // Gửi tin nhắn
  const onSend = useCallback(
    async (messages = []) => {
      const { _id, createdAt, text } = messages[0];
      try {
        await addDoc(collection(db, "event_rooms"), {
          _id,
          createdAt,
          text,
          user: {
            _id: user.email,
            name: user.first_name + " " + user.last_name,
            avatar: user.avatar || "",
          },
          eventId,
        });
      } catch (err) {
        Alert.alert("Lỗi", "Không gửi được tin nhắn.");
      }
    },
    [user, eventId]
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  if (!canChat)
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          Chỉ người đã mua vé và sự kiện chưa kết thúc mới được chat trong phòng
          này.
        </Text>
      </View>
    );

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: user.email,
        name: user.first_name + " " + user.last_name,
        avatar: user.avatar,
      }}
      renderInputToolbar={(props) => <InputToolbar {...props} />}
      placeholder="Nhập tin nhắn..."
      messagesContainerStyle={{ backgroundColor: "#fff" }}
      textInputStyle={{ backgroundColor: "#fff", borderRadius: 20 }}
    />
  );
};

export default EventRoomChat;
