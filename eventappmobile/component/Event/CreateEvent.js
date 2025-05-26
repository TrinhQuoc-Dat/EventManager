import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";

const CreateEvent = () => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    start_date_time: new Date(),
    end_date_time: new Date(),
    location: "",
    location_name: "",
    category: null,
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Lấy token từ AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (error) {
        console.error("Lỗi khi lấy token:", error);
      }
    };
    loadToken();
  }, []);

  const loadCates = async () => {
    try {
      let res = await Apis.get(endpoints["categories"]);
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    loadCates();
  }, []);

  // Chọn ảnh từ thư viện
  const selectImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Quyền truy cập thư viện ảnh bị từ chối!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        setEvent((prev) => ({ ...prev, image: result.assets[0].uri }));
      }
    }
  };

  // Xử lý khi chọn ngày/giờ bắt đầu
  const handleConfirmStart = (date) => {
    setEvent((prev) => ({ ...prev, start_date_time: date }));
    setShowStartPicker(false);
  };

  // Xử lý khi chọn ngày/giờ kết thúc
  const handleConfirmEnd = (date) => {
    setEvent((prev) => ({ ...prev, end_date_time: date }));
    setShowEndPicker(false);
  };

  // Xử lý khi hủy chọn
  const handleCancel = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  // Gửi dữ liệu lên API với FormData
  const handleCreateEvent = async () => {
    const {
      title,
      description,
      location,
      location_name,
      category,
      start_date_time,
      end_date_time,
      image,
    } = event;

    // Kiểm tra dữ liệu đầu vào
    if (!title || !description || !location || !location_name || !category) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!token) {
      Alert.alert("Lỗi", "Không có token xác thực. Vui lòng đăng nhập lại!");
      return;
    }

    if (end_date_time <= start_date_time) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("start_date_time", start_date_time.toISOString());
      formData.append("end_date_time", end_date_time.toISOString());
      formData.append("location", location);
      formData.append("location_name", location_name);
      formData.append("category", category);

      // Thêm ảnh vào FormData nếu có
      if (image) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("image", {
          uri: image,
          name: `event_image.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      console.log("Dữ liệu FormData:", formData);

      // Gửi yêu cầu POST với FormData
      const response = await authApis(token).post(
        endpoints["events"],
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Thành công", "Sự kiện đã được tạo thành công!");
      console.log("Sự kiện đã tạo:", response.data);

      // Reset form
      setEvent({
        title: "",
        description: "",
        start_date_time: new Date(),
        end_date_time: new Date(),
        location: "",
        location_name: "",
        category: null,
        image: null,
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
        `Không thể tạo sự kiện. Mã lỗi: ${error.response?.status || "N/A"} - ${
          error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput
        style={styles.input}
        value={event.title}
        onChangeText={(text) => setEvent((prev) => ({ ...prev, title: text }))}
        placeholder="Nhập tiêu đề sự kiện"
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={event.description}
        onChangeText={(text) =>
          setEvent((prev) => ({ ...prev, description: text }))
        }
        placeholder="Nhập mô tả sự kiện"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Thời gian bắt đầu</Text>
      <Button
        title="Chọn thời gian bắt đầu"
        onPress={() => setShowStartPicker(true)}
      />
      <Text style={styles.dateText}>
        {event.start_date_time.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="datetime"
        date={event.start_date_time}
        onConfirm={handleConfirmStart}
        onCancel={handleCancel}
        minimumDate={new Date()}
        is24Hour={true}
        locale="vi-VN"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      <Text style={styles.label}>Thời gian kết thúc</Text>
      <Button
        title="Chọn thời gian kết thúc"
        onPress={() => setShowEndPicker(true)}
      />
      <Text style={styles.dateText}>
        {event.end_date_time.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="datetime"
        date={event.end_date_time}
        onConfirm={handleConfirmEnd}
        onCancel={handleCancel}
        minimumDate={event.start_date_time}
        is24Hour={true}
        locale="vi-VN"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      <Text style={styles.label}>Địa điểm</Text>
      <TextInput
        style={styles.input}
        value={event.location}
        onChangeText={(text) =>
          setEvent((prev) => ({ ...prev, location: text }))
        }
        placeholder="Nhập địa điểm (địa chỉ đầy đủ)"
      />

      <Text style={styles.label}>Tên địa điểm</Text>
      <TextInput
        style={styles.input}
        value={event.location_name}
        onChangeText={(text) =>
          setEvent((prev) => ({ ...prev, location_name: text }))
        }
        placeholder="Nhập tên địa điểm (ví dụ: Viettel Tower)"
      />

      <Text style={styles.label}>Danh mục</Text>
      <Picker
        selectedValue={event.category}
        onValueChange={(itemValue) =>
          setEvent((prev) => ({ ...prev, category: itemValue }))
        }
        style={styles.picker}
        enabled={categories.length > 0}
      >
        <Picker.Item label="Chọn danh mục" value={null} />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Hình ảnh</Text>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={selectImage}
        disabled={loading}
      >
        <Text style={styles.imageButtonText}>Chọn ảnh đại diện...</Text>
      </TouchableOpacity>
      {event.image && (
        <Image source={{ uri: event.image }} style={styles.imagePreview} />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Đang tạo..." : "Tạo sự kiện"}
          onPress={handleCreateEvent}
          disabled={loading || !token}
          color="#e91e63"
        />
      </View>
    </ScrollView>
  );
};

// Styles
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#555",
    marginVertical: 8,
  },
  imageButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  imageButtonText: {
    color: "#333",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  buttonContainer: {
    marginVertical: 16,
  },
});

export default CreateEvent;