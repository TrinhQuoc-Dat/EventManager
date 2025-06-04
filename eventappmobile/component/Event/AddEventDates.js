import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
// import { navigate } from "../../service/NavigationService";
import { useNavigation } from "@react-navigation/native";

const AddEventDates = ({ route, navigation }) => {
  const nav = useNavigation();
  const eventId = route.params?.eventId;
  const dateId = route.params?.dateId; // Nhận dateId nếu ở chế độ chỉnh sửa
  const isEditMode = !!dateId;
  const [eventDates, setEventDates] = useState([]);
  const [newDate, setNewDate] = useState({
    event_date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState({ field: null });
  const [loading, setLoading] = useState(false);

  const fetchEventDates = async () => {
    try {
      const response = await Apis.get(endpoints["event"](eventId));
      setEventDates(response.data.event_dates || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngày:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách ngày.");
    }
  };

  const loadEventDate = async () => {
    if (!isEditMode) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await authApis(token).get(
        endpoints["delete-date"](dateId)
      );
      const dateData = response.data;
      setNewDate({
        event_date: new Date(dateData.event_date),
        start_time: new Date(`1970-01-01T${dateData.start_time}`), // giữ nguyên
        end_time: new Date(`1970-01-01T${dateData.end_time}`), // giữ nguyên
      });
    } catch (error) {
      console.error("Lỗi khi tải ngày sự kiện:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin ngày sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDates();
    loadEventDate();
  }, [eventId, dateId]);

  const handleConfirmDate = (date, field) => {
    setNewDate((prev) => ({ ...prev, [field]: date }));
    setShowDatePicker({ field: null });
  };

  const handleSubmit = async () => {
    const { event_date, start_time, end_time } = newDate;
    const token = await AsyncStorage.getItem("token");

    if (!event_date || !start_time || !end_time) {
      Alert.alert("Lỗi", "Vui lòng chọn đầy đủ ngày và thời gian!");
      return;
    }

    if (end_time <= start_time) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      const pad = (n) => n.toString().padStart(2, "0");
      const formData = new FormData();
      formData.append("event_date", event_date.toISOString().split("T")[0]);
      formData.append(
        "start_time",
        `${pad(start_time.getHours())}:${pad(start_time.getMinutes())}:${pad(
          start_time.getSeconds()
        )}`
      );
      formData.append(
        "end_time",
        `${pad(end_time.getHours())}:${pad(end_time.getMinutes())}:${pad(
          end_time.getSeconds()
        )}`
      );

      const endpoint = isEditMode
        ? endpoints["delete-date"](dateId)
        : endpoints["add-date"](eventId);
      const method = isEditMode ? authApis(token).patch : authApis(token).post;
      console.log(formData);
      await method(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert(
        "Thành công",
        isEditMode ? "Ngày đã được cập nhật!" : "Ngày đã được thêm!"
      );
      setNewDate({
        event_date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
      });
      fetchEventDates();
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể ${isEditMode ? "cập nhật" : "thêm"} ngày: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const removeEventDate = async (dateId) => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    try {
      await authApis(token).delete(`/api/event-date/${dateId}`);
      Alert.alert("Thành công", "Ngày đã được xóa!");
      fetchEventDates();
    } catch (error) {
      console.error("Lỗi khi xóa ngày:", error);
      Alert.alert("Lỗi", "Không thể xóa ngày!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>
          {isEditMode ? "Chỉnh sửa ngày sự kiện" : "Thêm ngày cho sự kiện"}
        </Text>
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Ngày</Text>
          <Button
            title="Chọn ngày"
            onPress={() => setShowDatePicker({ field: "event_date" })}
          />
          <Text style={styles.dateText}>
            {newDate.event_date.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.label}>Giờ bắt đầu</Text>
          <Button
            title="Chọn giờ bắt đầu"
            onPress={() => setShowDatePicker({ field: "start_time" })}
          />
          <Text style={styles.dateText}>
            {newDate.start_time.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.label}>Giờ kết thúc</Text>
          <Button
            title="Chọn giờ kết thúc"
            onPress={() => setShowDatePicker({ field: "end_time" })}
          />
          <Text style={styles.dateText}>
            {newDate.end_time.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text>
              {loading
                ? "Đang xử lý..."
                : isEditMode
                ? "Cập nhật ngày"
                : "Thêm ngày"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Danh sách ngày</Text>
        {eventDates.length === 0 ? (
          <Text style={styles.dateText}>Chưa có ngày nào được thêm.</Text>
        ) : (
          eventDates.map((date) => (
            <View key={date.id} style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {date.event_date} ({date.start_time} - {date.end_time})
              </Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    nav.navigate("add-event-dates", {
                      eventId,
                      dateId: date.id,
                    })
                  }
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeEventDate(date.id)}
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
          onPress={() => nav.navigate("create-ticket-type", { eventId })}
          disabled={eventDates.length === 0 || loading}
        >
          <Text>Tiếp tục tạo loại vé</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => nav.navigate("userevents")}
          disabled={loading}
        >
          <Text>XONG</Text>
        </TouchableOpacity>
      </ScrollView>
      <DateTimePickerModal
        isVisible={showDatePicker.field !== null}
        mode={showDatePicker.field === "event_date" ? "date" : "time"}
        date={newDate[showDatePicker.field] || new Date()}
        onConfirm={(date) => handleConfirmDate(date, showDatePicker.field)}
        onCancel={() => setShowDatePicker({ field: null })}
        minimumDate={new Date()}
        is24Hour={true}
        locale="vi-VN"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
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
    marginVertical: 8,
  },
  dateContainer: {
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
  customButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
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

export default AddEventDates;
