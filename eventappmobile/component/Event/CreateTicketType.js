import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { navigate } from "../../service/NavigationService";

const CreateTicketType = ({ route }) => {
  const eventId = route.params?.eventId; // Nhận eventId và event từ navigation
  const [ticketType, setTicketType] = useState({
    name: "",
    ticket_price: "",
    so_luong: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreateTicketType = async () => {
    const { name, ticket_price, so_luong } = ticketType;
    const token = await AsyncStorage.getItem("token");

    // Kiểm tra dữ liệu đầu vào
    if (!name || !ticket_price || !so_luong) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!token) {
      Alert.alert("Lỗi", "Không có token xác thực. Vui lòng đăng nhập lại!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("ticket_price", ticket_price);
      formData.append("so_luong", so_luong);

      const response = await authApis(token).post(
        endpoints["create-ticket-types"](eventId), // Giả sử bạn có endpoint để tạo ticket types
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Thành công", "Loại vé đã được tạo thành công!");
      console.log("Loại vé đã tạo:", response.data);

      // Reset form
      setTicketType({
        name: "",
        ticket_price: "",
        so_luong: "",
      });
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể tạo loại vé. Mã lỗi: ${error.response?.status || "N/A"} - ${
          error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên loại vé</Text>
      <TextInput
        style={styles.input}
        value={ticketType.name}
        onChangeText={(text) =>
          setTicketType((prev) => ({ ...prev, name: text }))
        }
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

      <Button
        title={loading ? "Đang tạo..." : "Tạo loại vé"}
        onPress={handleCreateTicketType}
        disabled={loading}
      />

      <TouchableOpacity style={styles.customButton} onPress={() => navigate('home')}>
                      <Text>XONG</Text>
                    </TouchableOpacity>
      
      
    </View>
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
    marginVertical: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eventInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 16,
  }, customButton: {
    flexDirection: 'row',
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 1, // Có thể set về 0.6 nếu disabled
  }
});

export default CreateTicketType;