// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Apis, { authApis, endpoints } from "../../configs/Apis";
// import { navigate } from "../../service/NavigationService";

// const CreateTicketType = ({ route }) => {
//   const eventId = route.params?.eventId; // Nhận eventId và event từ navigation
//   const [ticketType, setTicketType] = useState({
//     name: "",
//     ticket_price: "",
//     so_luong: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleCreateTicketType = async () => {
//     const { name, ticket_price, so_luong } = ticketType;
//     const token = await AsyncStorage.getItem("token");

//     // Kiểm tra dữ liệu đầu vào
//     if (!name || !ticket_price || !so_luong) {
//       Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
//       return;
//     }

//     if (!token) {
//       Alert.alert("Lỗi", "Không có token xác thực. Vui lòng đăng nhập lại!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("ticket_price", ticket_price);
//       formData.append("so_luong", so_luong);

//       const response = await authApis(token).post(
//         endpoints["create-ticket-types"](eventId), // Giả sử bạn có endpoint để tạo ticket types
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       Alert.alert("Thành công", "Loại vé đã được tạo thành công!");
//       console.log("Loại vé đã tạo:", response.data);

//       // Reset form
//       setTicketType({
//         name: "",
//         ticket_price: "",
//         so_luong: "",
//       });
//     } catch (error) {
//       console.error("Chi tiết lỗi:", {
//         message: error.message,
//         code: error.code,
//         config: error.config,
//         response: error.response?.data,
//       });
//       Alert.alert(
//         "Lỗi",
//         `Không thể tạo loại vé. Mã lỗi: ${error.response?.status || "N/A"} - ${
//           error.message
//         }`
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Tên loại vé</Text>
//       <TextInput
//         style={styles.input}
//         value={ticketType.name}
//         onChangeText={(text) =>
//           setTicketType((prev) => ({ ...prev, name: text }))
//         }
//         placeholder="Nhập tên loại vé (ví dụ: Siêu Vip)"
//       />

//       <Text style={styles.label}>Giá vé</Text>
//       <TextInput
//         style={styles.input}
//         value={ticketType.ticket_price}
//         onChangeText={(text) =>
//           setTicketType((prev) => ({ ...prev, ticket_price: text }))
//         }
//         placeholder="Nhập giá vé (ví dụ: 5000000)"
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Số lượng</Text>
//       <TextInput
//         style={styles.input}
//         value={ticketType.so_luong}
//         onChangeText={(text) =>
//           setTicketType((prev) => ({ ...prev, so_luong: text }))
//         }
//         placeholder="Nhập số lượng vé"
//         keyboardType="numeric"
//       />

//       <Button
//         title={loading ? "Đang tạo..." : "Tạo loại vé"}
//         onPress={handleCreateTicketType}
//         disabled={loading}
//       />

//       <TouchableOpacity style={styles.customButton} onPress={() => navigate('home')}>
//                       <Text>XONG</Text>
//                     </TouchableOpacity>
      
      
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#f5f5f5",
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginVertical: 8,
//   },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   eventInfo: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 16,
//   }, customButton: {
//     flexDirection: 'row',
//     backgroundColor: '#e91e63',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     opacity: 1, // Có thể set về 0.6 nếu disabled
//     justifyContent: 'center',
//     marginTop: 15
//   }
// });

// export default CreateTicketType;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";

const CreateTicketType = ({ route }) => {
  const nav = useNavigation();
  const eventId = route.params?.eventId;
  const ticketTypeId = route.params?.ticketTypeId;
  const [isEditMode, setIsEditMode] = useState(!!ticketTypeId); // Quản lý trạng thái isEditMode
  const [ticketType, setTicketType] = useState({
    name: "",
    ticket_price: "",
    so_luong: "",
    event_date_id: null,
  });
  const [eventDates, setEventDates] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEventDates = async () => {
    try {
      const response = await Apis.get(endpoints["event"](eventId));
      setEventDates(response.data.event_dates || []);
      if (response.data.event_dates.length > 0 && !isEditMode) {
        setTicketType((prev) => ({
          ...prev,
          event_date_id: response.data.event_dates[0].id,
        }));
        fetchTicketTypes(response.data.event_dates[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngày:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách ngày của sự kiện.");
    }
  };

  const fetchTicketTypes = async (dateId) => {
    if (!dateId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await authApis(token).get(endpoints["ticket-type-of-date"](dateId));
      setTicketTypes(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại vé:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách loại vé.");
    }
  };

  const loadTicketType = async () => {
    if (!isEditMode) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await Apis.get(endpoints['delete-ticket-type'](ticketTypeId));
      const ticketData = response.data;
      setTicketType({
        name: ticketData.name,
        ticket_price: ticketData.ticket_price.toString(),
        so_luong: ticketData.so_luong.toString(),
        event_date_id: ticketData.event_date_id,
      });
      fetchTicketTypes(ticketData.event_date_id);
    } catch (error) {
      console.error("Lỗi khi tải loại vé:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin loại vé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDates();
    if (isEditMode) {
      loadTicketType();
    }
  }, [eventId, ticketTypeId]);

  const handleDateChange = (itemValue) => {
    setTicketType((prev) => ({ ...prev, event_date_id: itemValue }));
    fetchTicketTypes(itemValue);
  };

  const handleSubmit = async () => {
    const { name, ticket_price, so_luong, event_date_id } = ticketType;
    const token = await AsyncStorage.getItem("token");

    if (!name || !ticket_price || !so_luong || !event_date_id) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("ticket_price", ticket_price);
      formData.append("so_luong", so_luong);
      formData.append("event_date_id", event_date_id);

      const endpoint = isEditMode
        ? endpoints['delete-ticket-type'](ticketTypeId)
        : endpoints["add-ticket-type"](eventId);
      const method = isEditMode ? authApis(token).patch : authApis(token).post;

      await method(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert(
        "Thành công",
        isEditMode ? "Loại vé đã được cập nhật!" : "Loại vé đã được tạo!"
      );

      // Đặt lại form và chế độ tạo mới
      setTicketType({
        name: "",
        ticket_price: "",
        so_luong: "",
        event_date_id: eventDates.length > 0 ? eventDates[0].id : null,
      });
      setIsEditMode(false); // Chuyển về chế độ tạo mới
      fetchTicketTypes(event_date_id);
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể ${isEditMode ? "cập nhật" : "tạo"} loại vé: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const removeTicketType = async (ticketTypeId) => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    try {
      await authApis(token).delete(endpoints["delete-ticket-type"](ticketTypeId));
      Alert.alert("Thành công", "Loại vé đã được xóa!");
      fetchTicketTypes(ticketType.event_date_id);
      // Đặt lại chế độ tạo mới sau khi xóa
      setIsEditMode(false);
      setTicketType({
        name: "",
        ticket_price: "",
        so_luong: "",
        event_date_id: eventDates.length > 0 ? eventDates[0].id : null,
      });
    } catch (error) {
      console.error("Lỗi khi xóa loại vé:", error);
      Alert.alert("Lỗi", "Không thể xóa loại vé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>
          {isEditMode ? "Chỉnh sửa loại vé" : "Tạo loại vé"}
        </Text>
        <Text style={styles.label}>Ngày sự kiện</Text>
        <Picker
          selectedValue={ticketType.event_date_id}
          onValueChange={handleDateChange}
          style={styles.picker}
          enabled={eventDates.length > 0}
        >
          <Picker.Item label="Chọn ngày" value={null} />
          {eventDates.map((date) => (
            <Picker.Item
              key={date.id}
              label={`${date.event_date} (${date.start_time} - ${date.end_time})`}
              value={date.id}
            />
          ))}
        </Picker>
        <Text style={styles.label}>Tên loại vé</Text>
        <TextInput
          style={styles.input}
          value={ticketType.name}
          onChangeText={(text) => setTicketType((prev) => ({ ...prev, name: text }))}
          placeholder="Nhập tên loại vé (ví dụ: Siêu Vip)"
        />
        <Text style={styles.label}>Giá vé</Text>
        <TextInput
          style={styles.input}
          value={ticketType.ticket_price}
          onChangeText={(text) =>
            setTicketType((prev) => ({ ...prev, ticket_price: text }))
          }
          placeholder="Nhập giá vé (ví dụ: 5000000)"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Số lượng</Text>
        <TextInput
          style={styles.input}
          value={ticketType.so_luong}
          onChangeText={(text) =>
            setTicketType((prev) => ({ ...prev, so_luong: text }))
          }
          placeholder="Nhập số lượng vé"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.customButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text>
            {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật loại vé" : "Tạo loại vé"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.label}>Danh sách loại vé</Text>
        {ticketTypes.length === 0 ? (
          <Text style={styles.dateText}>Chưa có loại vé nào được thêm.</Text>
        ) : (
          ticketTypes.map((ticket) => (
            <View key={ticket.id} style={styles.ticketContainer}>
              <Text style={styles.dateText}>
                {ticket.name} - Giá: {ticket.ticket_price} - Số lượng: {ticket.so_luong}
              </Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    nav.navigate("create-ticket-type", { eventId, ticketTypeId: ticket.id });
                    setIsEditMode(true); // Chuyển sang chế độ chỉnh sửa
                  }}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTicketType(ticket.id)}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => nav.navigate("home")}
          disabled={loading}
        >
          <Text>XONG</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
  },
  customButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  ticketContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: 14,
    color: "#555",
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

export default CreateTicketType;