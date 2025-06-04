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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";

const CreateTicketType = ({ route }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const nav = useNavigation();
  const eventId = route.params?.eventId;
  const ticketTypeId = route.params?.ticketTypeId;
  const [isEditMode, setIsEditMode] = useState(!!ticketTypeId);
  const [ticketType, setTicketType] = useState({
    name: "",
    ticket_price: "",
    so_luong: "",
    event_date_id: null,
  });
  const [discountCode, setDiscountCode] = useState({
    code: "",
    discount_percentage: "",
    max_usage: "",
    valid_until: "",
  });
  const [eventDates, setEventDates] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
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
        fetchDiscountCodes(response.data.event_dates[0].id);
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
      const response = await authApis(token).get(
        endpoints["ticket-type-of-date"](dateId)
      );
      setTicketTypes(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại vé:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách loại vé.");
    }
  };

  const fetchDiscountCodes = async (dateId) => {
    if (!dateId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await authApis(token).get(
        `${endpoints["discount-codes"]}?ticket_type__event_date=${dateId}`
      );
      setDiscountCodes(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách mã giảm giá.");
    }
  };

  const loadTicketType = async () => {
    if (!isEditMode) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await Apis.get(
        endpoints["delete-ticket-type"](ticketTypeId)
      );
      const ticketData = response.data;
      setTicketType({
        name: ticketData.name,
        ticket_price: ticketData.ticket_price.toString(),
        so_luong: ticketData.so_luong.toString(),
        event_date_id: ticketData.event_date_id,
      });
      fetchTicketTypes(ticketData.event_date_id);
      fetchDiscountCodes(ticketData.event_date_id);
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
    fetchDiscountCodes(itemValue);
  };

  const handleSubmitTicketType = async () => {
    const { name, ticket_price, so_luong, event_date_id } = ticketType;
    const token = await AsyncStorage.getItem("token");

    if (!name || !ticket_price || !so_luong || !event_date_id) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin loại vé!");
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
        ? endpoints["delete-ticket-type"](ticketTypeId)
        : endpoints["add-ticket-type"](eventId);
      const method = isEditMode ? authApis(token).patch : authApis(token).post;

      await method(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert(
        "Thành công",
        isEditMode ? "Loại vé đã được cập nhật!" : "Loại vé đã được tạo!"
      );

      setTicketType({
        name: "",
        ticket_price: "",
        so_luong: "",
        event_date_id: eventDates.length > 0 ? eventDates[0].id : null,
      });
      setIsEditMode(false);
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

  const handleSubmitDiscountCode = async (ticketTypeId) => {
    const { code, discount_percentage, max_usage, valid_until } = discountCode;
    const token = await AsyncStorage.getItem("token");

    if (
      !code ||
      !discount_percentage ||
      !max_usage ||
      !valid_until ||
      !ticketTypeId
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin mã giảm giá!");
      return;
    }

    setLoading(true);
    try {
      const response = await authApis(token).post(endpoints["discount-codes"], {
        code,
        discount_percentage: parseFloat(discount_percentage),
        max_usage: parseInt(max_usage),
        valid_from: new Date().toISOString(),
        valid_until,
        ticket_type: ticketTypeId,
      });

      Alert.alert("Thành công", "Mã giảm giá đã được tạo!");
      setDiscountCode({
        code: "",
        discount_percentage: "",
        max_usage: "",
        valid_until: "",
      });
      fetchDiscountCodes(ticketType.event_date_id);
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể tạo mã giảm giá: ${
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
      await authApis(token).delete(
        endpoints["delete-ticket-type"](ticketTypeId)
      );
      Alert.alert("Thành công", "Loại vé đã được xóa!");
      fetchTicketTypes(ticketType.event_date_id);
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

  const removeDiscountCode = async (discountCodeId) => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    try {
      await authApis(token).delete(
        `${endpoints["discount-codes"]}${discountCodeId}/`
      );
      Alert.alert("Thành công", "Mã giảm giá đã được xóa!");
      fetchDiscountCodes(ticketType.event_date_id);
    } catch (error) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      Alert.alert("Lỗi", "Không thể xóa mã giảm giá!");
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
        <TouchableOpacity
          style={styles.customButton}
          onPress={handleSubmitTicketType}
          disabled={loading}
        >
          <Text>
            {loading
              ? "Đang xử lý..."
              : isEditMode
              ? "Cập nhật loại vé"
              : "Tạo loại vé"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Tạo mã giảm giá</Text>
        <Text style={styles.label}>Mã giảm giá</Text>
        <TextInput
          style={styles.input}
          value={discountCode.code}
          onChangeText={(text) =>
            setDiscountCode((prev) => ({ ...prev, code: text }))
          }
          placeholder="Nhập mã giảm giá (ví dụ: SALE20)"
        />
        <Text style={styles.label}>Phần trăm giảm giá (%)</Text>
        <TextInput
          style={styles.input}
          value={discountCode.discount_percentage}
          onChangeText={(text) =>
            setDiscountCode((prev) => ({ ...prev, discount_percentage: text }))
          }
          placeholder="Nhập phần trăm giảm giá (0-100)"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Số lần sử dụng tối đa</Text>
        <TextInput
          style={styles.input}
          value={discountCode.max_usage}
          onChangeText={(text) =>
            setDiscountCode((prev) => ({ ...prev, max_usage: text }))
          }
          placeholder="Nhập số lần sử dụng tối đa"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Hiệu lực đến</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{discountCode.valid_until || "Chọn ngày hết hạn"}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={
            discountCode.valid_until
              ? new Date(discountCode.valid_until)
              : new Date()
          }
          onConfirm={(date) => {
            setDiscountCode((prev) => ({
              ...prev,
              valid_until: date.toISOString().split("T")[0],
            }));
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
          locale="vi-VN"
          confirmText="Xác nhận"
          cancelText="Hủy"
        />

        <Text style={styles.label}>Danh sách loại vé</Text>
        {ticketTypes.length === 0 ? (
          <Text style={styles.dateText}>Chưa có loại vé nào được thêm.</Text>
        ) : (
          ticketTypes.map((ticket) => (
            <View key={ticket.id} style={styles.ticketContainer}>
              <Text style={styles.dateText}>
                {ticket.name} - Giá: {ticket.ticket_price} - Số lượng:{" "}
                {ticket.so_luong}
              </Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    nav.navigate("create-ticket-type", {
                      eventId,
                      ticketTypeId: ticket.id,
                    });
                    setIsEditMode(true);
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

        <Text style={styles.label}>Danh sách mã giảm giá</Text>
        {discountCodes.length === 0 ? (
          <Text style={styles.dateText}>
            Chưa có mã giảm giá nào được thêm.
          </Text>
        ) : (
          discountCodes.map((code) => (
            <View key={code.id} style={styles.ticketContainer}>
              <Text style={styles.dateText}>
                Mã: {code.code} - Giảm: {code.discount_percentage}% - Sử dụng:{" "}
                {code.used_count}/{code.max_usage} - Hết hạn: {code.valid_until}
              </Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeDiscountCode(code.id)}
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
