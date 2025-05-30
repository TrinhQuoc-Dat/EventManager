// import { useEffect, useState } from 'react';
// import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
// import moment from 'moment';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Apis, { authApis, endpoints } from '../../configs/Apis';
// import { navigate } from '../../service/NavigationService';
// import { ActivityIndicator, Button, Card, Divider } from "react-native-paper";
// import "moment/locale/vi";
// import RenderHTML from "react-native-render-html";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const EventDetail = ({ route }) => {
//   const eventId = route.params?.eventId;
//   const [event, setEvent] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [commentContent, setCommentContent] = useState('');
//   const [commentRate, setCommentRate] = useState('');
  
//   // Gọi API để lấy dữ liệu sự kiện
//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         const response = await Apis.get(endpoints['event'](eventId));
//         setEvent(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching event:', error);
//         setLoading(false);
//       }
//     }

//     fetchEvent();
//   }, [eventId]);

//   const formatDateTime = (start, end) => {
//     moment.locale("vi");
//     const startTime = moment(start).format("HH:mm");
//     const endTime = moment(end).format("HH:mm");
//     const date = moment(start).format("DD [tháng] MM, YYYY");
//     return `${startTime} - ${endTime}, ${date}`;
//   };

//   // Hàm gửi bình luận
//   const postComment = async () => {
//     if (!commentContent.trim()) {
//       Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
//       return;
//     }
//     if (!commentRate || isNaN(commentRate) || commentRate < 1 || commentRate > 10) {
//       Alert.alert('Lỗi', 'Vui lòng nhập đánh giá từ 1 đến 10');
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('Lỗi', 'Vui lòng đăng nhập để bình luận');
//         return;
//       }

//       const response = await authApis(token).post(endpoints['post-comment'](eventId), {
//         content: commentContent,
//         rate: parseInt(commentRate),
//         event: eventId
//       });

//       // Cập nhật danh sách bình luận
//       setEvent(prev => ({
//         ...prev,
//         comment_set: [response.data, ...prev.comment_set]
//       }));
//       setCommentContent('');
//       setCommentRate('');
//       Alert.alert('Thành công', 'Bình luận đã được đăng');
//     } catch (error) {
//       console.error('Error posting comment:', error);
//       Alert.alert('Lỗi', 'Không thể đăng bình luận. Vui lòng thử lại.');
//     }
//   };

//   // Render mỗi loại vé
//   const renderTicket = ({ item }) => (
//     <TouchableOpacity
//       style={styles.ticketItem}
//       onPress={() => {
//         navigate('paymentTicket', { ticket: item, event: event });
//       }}
//     >
//       <View style={styles.ticketItem}>
//         <Text style={styles.ticketName}>{item.name}</Text>
//         <Text style={styles.ticketPrice}>
//           {parseFloat(item.ticket_price).toLocaleString('vi-VN')} VNĐ
//         </Text>
//         <Text style={styles.ticketQuantity}>Số lượng: {item.so_luong}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   // Render mỗi bình luận
//   const renderComment = ({ item }) => (
//     <View style={styles.commentItem}>
//       <Image
//         source={{ uri: item.user.avatar }}
//         style={styles.commentAvatar}
//       />
//       <View style={styles.commentContent}>
//         <Text style={styles.commentUser}>
//           {item.user.first_name} {item.user.last_name}
//         </Text>
//         <Text style={styles.commentText}>{item.content}</Text>
//         <Text style={styles.commentDate}>
//           {formatDateTime(item.created_date)} - Đánh giá: {item.rate}/10
//         </Text>
//       </View>
//     </View>
//   );

//   if (!event) return <ActivityIndicator style={{ marginTop: 32 }} />;

//   return (
//     <ScrollView style={styles.container}>
//       <Card style={styles.card}>
//         <Card.Cover source={{ uri: event.image }} style={styles.image} />
//         <Card.Title
//           title={event.title}
//           titleNumberOfLines={0}
//           titleStyle={styles.title}
//         />
//         <Card.Content>
//           <Text style={styles.infoText}>
//             🕒 {formatDateTime(event.start_date_time, event.end_date_time)}
//           </Text>
//           <Text style={styles.infoText}>📍 {event.location_name}</Text>
//           <Text style={styles.infoSub}>{event.location}</Text>
//         </Card.Content>
//       </Card>

//       <Card style={styles.card}>
//         <Card.Title title="Giới thiệu" />
//         <Card.Content>
//           <RenderHTML source={{ html: event.description }} />
//         </Card.Content>
//       </Card>

//       <Card style={styles.card}>
//         <Card.Title title="Thông tin vé" />
//         <Card.Content>
//           {event.ticket_types.map((t) => (
//             <View key={t.id} style={styles.ticketItem}>
//               <Text style={styles.ticketName}>{t.name}</Text>
//               <Text style={styles.ticketPrice}>
//                 {parseFloat(t.ticket_price).toLocaleString("vi-VN")} VNĐ
//               </Text>
//               <Card.Actions style={styles.ticketActions}>
//                 <Button mode="contained" buttonColor="#6200ee" onPress={() => {
//                   navigate('paymentTicket', { ticket: t, event: event });
//                 }}>
//                   Đặt vé
//                 </Button>
//               </Card.Actions>
//             </View>
//           ))}
//         </Card.Content>
//       </Card>

//       <Card style={styles.card}>
//         <Card.Title title="Bình luận" />
//         <Card.Content>
//           <View style={styles.commentInputContainer}>
//             <TextInput
//               style={styles.commentInput}
//               placeholder="Nhập bình luận của bạn..."
//               value={commentContent}
//               onChangeText={setCommentContent}
//               multiline
//             />
//             <View style={styles.rateInputContainer}>
//               <TextInput
//                 style={styles.rateInput}
//                 placeholder="Đánh giá (1-10)"
//                 value={commentRate}
//                 onChangeText={setCommentRate}
//                 keyboardType="numeric"
//               />
//               <Button
//                 mode="contained"
//                 buttonColor="#6200ee"
//                 onPress={postComment}
//                 style={styles.commentButton}
//               >
//                 Đăng
//               </Button>
//             </View>
//           </View>
//           <FlatList
//             data={event.comment_set}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.commentItem}>
//                 <Image
//                   source={{ uri: item.user.avatar }}
//                   style={styles.commentAvatar}
//                 />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.commentUser}>
//                     {item.user.first_name} {item.user.last_name}
//                   </Text>
//                   <Text style={styles.commentContent}>{item.content}</Text>
//                   <Text style={styles.commentDate}>
//                     {moment(item.created_date).format("HH:mm DD/MM/YYYY")} -
//                     Đánh giá: {item.rate}/10
//                   </Text>
//                 </View>
//               </View>
//             )}
//             scrollEnabled={false}
//           />
//         </Card.Content>
//       </Card>

//       <Card style={styles.card}>
//         <Card.Title title="Nhà tổ chức" />
//         <Card.Content style={styles.organizerContent}>
//           <Image
//             style={styles.avatar}
//             source={{ uri: event.organizer.avatar }}
//           />
//           <Text style={styles.organizerName}>
//             {event.organizer.organization_name}
//           </Text>
//         </Card.Content>
//       </Card>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 12,
//     backgroundColor: "#f8f8f8",
//   },
//   card: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 3,
//     overflow: "hidden",
//   },
//   image: {
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   infoText: {
//     fontSize: 16,
//     marginTop: 4,
//     color: "#444",
//   },
//   infoSub: {
//     fontSize: 14,
//     color: "#666",
//   },
//   description: {
//     fontSize: 15,
//     color: "#555",
//     marginTop: 4,
//     lineHeight: 22,
//   },
//   ticketItem: {
//     paddingVertical: 10,
//     borderBottomWidth: 0.5,
//     borderColor: "#ccc",
//   },
//   ticketName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   ticketPrice: {
//     fontSize: 14,
//     color: "#e91e63",
//   },
//   ticketActions: {
//     justifyContent: "flex-end",
//     padding: 8,
//   },
//   organizerContent: {
//     alignItems: "center",
//     marginTop: 8,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginBottom: 8,
//   },
//   organizerName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#444",
//   },
//   commentItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   commentAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   commentUser: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   commentContent: {
//     fontSize: 14,
//     color: "#555",
//     marginVertical: 4,
//   },
//   commentDate: {
//     fontSize: 12,
//     color: "#888",
//   },
//   commentInputContainer: {
//     marginBottom: 16,
//   },
//   commentInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 8,
//     backgroundColor: "#fff",
//   },
//   rateInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   rateInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     fontSize: 14,
//     color: "#333",
//     flex: 1,
//     marginRight: 8,
//     backgroundColor: "#fff",
//   },
//   commentButton: {
//     flex: 0.4,
//   },
// });

// export default EventDetail;



import { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import { navigate } from '../../service/NavigationService';
import { ActivityIndicator, Button, Card, Divider } from "react-native-paper";
import "moment/locale/vi";
import RenderHTML from "react-native-render-html";
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventDetail = ({ route }) => {
  const eventId = route.params?.eventId;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentRate, setCommentRate] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await Apis.get(endpoints['event'](eventId));
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin sự kiện.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatDateTime = (eventDate) => {
    moment.locale("vi");
    const startTime = moment(eventDate.start_time, "HH:mm:ss").format("HH:mm");
    const endTime = moment(eventDate.end_time, "HH:mm:ss").format("HH:mm");
    const date = moment(eventDate.event_date).format("DD [tháng] MM, YYYY");
    return `${startTime} - ${endTime}, ${date}`;
  };

  const postComment = async () => {
    if (!commentContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }
    if (!commentRate || isNaN(commentRate) || commentRate < 1 || commentRate > 10) {
      Alert.alert('Lỗi', 'Vui lòng nhập đánh giá từ 1 đến 10');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để bình luận');
        return;
      }

      const response = await authApis(token).post(endpoints['post-comment'](eventId), {
        content: commentContent,
        rate: parseInt(commentRate),
        event: eventId,
      });

      setEvent((prev) => ({
        ...prev,
        comment_set: [response.data, ...prev.comment_set],
      }));
      setCommentContent('');
      setCommentRate('');
      Alert.alert('Thành công', 'Bình luận đã được đăng');
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Lỗi', 'Không thể đăng bình luận. Vui lòng thử lại.');
    }
  };

  const renderTicket = ({ item }) => (
    <View style={styles.ticketItem}>
      <View style={styles.ticketDetails}>
        <Text style={styles.ticketName}>{item.name}</Text>
        <Text style={styles.ticketPrice}>
          {parseFloat(item.ticket_price).toLocaleString('vi-VN')} VNĐ
        </Text>
        <Text style={styles.ticketQuantity}>Số lượng: {item.so_luong}</Text>
      </View>
      <Button
        mode="contained"
        buttonColor="#6200ee"
        onPress={() => navigate('paymentTicket', { ticket: item, event: event })}
        style={styles.bookButton}
      >
        Đặt vé
      </Button>
    </View>
  );

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>
          {item.user.first_name} {item.user.last_name}
        </Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentDate}>
          {moment(item.created_date).format("HH:mm DD/MM/YYYY")} - Đánh giá: {item.rate}/10
        </Text>
      </View>
    </View>
  );

  if (loading || !event) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: event.image }} style={styles.image} />
        <Card.Title title={event.title} titleNumberOfLines={0} titleStyle={styles.title} />
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
                data={event.ticket_types.filter((ticket) => ticket.event_date === date.id)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTicket}
                scrollEnabled={false}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

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
                buttonColor="#6200ee"
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
            renderItem={renderComment}
            scrollEnabled={false}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Nhà tổ chức" />
        <Card.Content style={styles.organizerContent}>
          <Image style={styles.avatar} source={{ uri: event.organizer.avatar }} />
          <Text style={styles.organizerName}>{event.organizer.organization_name}</Text>
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
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#333",
  },
  ticketItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  ticketDetails: {
    flex: 1,
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
  ticketQuantity: {
    fontSize: 14,
    color: "#555",
  },
  bookButton: {
    marginLeft: 16,
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
  commentText: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
  },
  commentInputContainer: {
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  rateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  commentButton: {
    flex: 0.4,
  },
});

export default EventDetail;