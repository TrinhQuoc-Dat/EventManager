import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../configs/firebase";
import { MyUserContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native";

const ContactList = ({ route }) => {
  const user = useContext(MyUserContext); // Nhà tổ chức
  const eventId = route?.params?.eventId;
  const [contacts, setContacts] = useState([]);
  const nav = useNavigation();

  useEffect(() => {
    if (!user?.email || !eventId) return;
    // Lấy tất cả tin nhắn liên quan đến nhà tổ chức và sự kiện này
    const q = query(
      collection(db, "chats"),
      where("receiver", "==", user.email),
      where("eventId", "==", eventId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const contactEmails = new Set();
      querySnapshot.forEach((doc) => {
        const senderEmail = doc.data().user?._id;
        if (senderEmail && senderEmail !== user.email) {
          contactEmails.add(senderEmail);
        }
      });
      setContacts(Array.from(contactEmails));
    });
    return unsubscribe;
  }, [user, eventId]);

  const handleContactPress = (contactEmail) => {
    nav.navigate("chat", { organizerEmail: contactEmail, eventId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách người liên hệ</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContactPress(item)}
          >
            <Text style={styles.contactText}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có người liên hệ</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  contactItem: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  contactText: { fontSize: 16 },
  empty: { textAlign: "center", color: "#888", marginTop: 32 },
});

export default ContactList;
