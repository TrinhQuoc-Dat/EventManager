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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { navigate } from "../../service/NavigationService";

const AddEventDates = ({ route }) => {
  const eventId = route.params?.eventId;
  const [eventDates, setEventDates] = useState([]);
  const [newDate, setNewDate] = useState({
    event_date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState({ field: null });
  const [loading, setLoading] = useState(false);

  // Lấy danh sách ngày đã có
  const fetchEventDates = async () => {
    try {
      const response = await Apis.get(endpoints["event"](eventId));
      setEventDates(response.data.event_dates || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngày:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách ngày.");
    }
  };

  useEffect(() => {
    fetchEventDates();
  }, [eventId]);

  const handleConfirmDate = (date, field) => {
    setNewDate((prev) => ({ ...prev, [field]: date }));
    setShowDatePicker({ field: null });
  };

  const addEventDate = async () => {
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
      const formData = new FormData();
      formData.append("event_date", event_date.toISOString().split("T")[0]);
      formData.append("start_time", start_time.toISOString().split("T")[1].slice(0, 8));
      formData.append("end_time", end_time.toISOString().split("T")[1].slice(0, 8));

      const response = await authApis(token).post(
        endpoints["add-date"](eventId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Thành công", "Ngày đã được thêm thành công!");
      setNewDate({
        event_date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
      });
      fetchEventDates(); // Cập nhật danh sách ngày
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể thêm ngày: ${error.response?.data?.detail || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const removeEventDate = async (dateId) => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    try {
      await authApis(token).delete(`/api/event/${eventId}/add-date/?date_id=${dateId}`);
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
        <Text style={styles.label}>Thêm ngày cho sự kiện</Text>

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

          <TouchableOpacity style={styles.customButton} onPress={addEventDate} disabled={loading}>
            <Text>{loading ? "Đang thêm..." : "Thêm ngày"}</Text>
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
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeEventDate(date.id)}
                disabled={loading}
              >
                <Text style={styles.removeButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => navigate("createtickettype", { eventId })}
          disabled={eventDates.length === 0 || loading}
        >
          <Text>Tiếp tục tạo loại vé</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => navigate("home")}
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
    flexDirection: "row",
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  removeButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddEventDates;