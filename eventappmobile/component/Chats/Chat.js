import React, {
  useState,
  useCallback,
  useContext,
  useLayoutEffect,
} from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { MyUserContext } from "../../configs/Context";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../configs/firebase";
import { where, or, and } from "firebase/firestore";

const Chat = ({ route }) => {
  const receiverEmail = route.params?.organizerEmail;
  const eventId = route.params?.eventId;
  const [messages, setMessages] = useState([]);
  const user = useContext(MyUserContext);
  // const receiverEmail = "admin1@gmail.com";

  // Nhận tin nhắn realtime từ Firestore
  useLayoutEffect(() => {
    const collectionRef = collection(db, "chats");
    const q = query(
      collectionRef,
      and(
        where("eventId", "==", eventId),
        or(
          and(
            where("user._id", "==", user.email),
            where("receiver", "==", receiverEmail)
          ),
          and(
            where("user._id", "==", receiverEmail),
            where("receiver", "==", user.email)
          )
        )
      ),
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
  }, [user, receiverEmail, eventId]);

  // Gửi tin nhắn lên Firestore
  const onSend = useCallback(
    (messages = []) => {
      if (!user?.email || !user?.first_name || !user?.last_name) {
        console.log(user);
        alert("Thông tin người dùng không hợp lệ!");
        return;
      }
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      const { _id, createdAt, text } = messages[0];
      addDoc(collection(db, "chats"), {
        _id,
        createdAt,
        text,
        user: {
          _id: user.email,
          name: user.first_name + " " + user.last_name,
          avatar: user.avatar || "",
        },
        receiver: receiverEmail, // <-- email của người nhận (nhà tổ chức hoặc user)
        eventId,
      })
        .then(() => console.log("Gửi thành công"))
        .catch((err) => console.log("Lỗi gửi Firestore:", err));
    },
    [user, receiverEmail, eventId]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: user.email, // id từ database của bạn
        name: user.first_name + " " + user.last_name,
        avatar: user.avatar,
      }}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      messagesContainerStyle={{
        backgroundColor: "#fff",
      }}
      textInputStyle={{
        backgroundColor: "#fff",
        borderRadius: 20,
      }}
    />
  );
};

export default Chat;
