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
import { authApis, endpoints } from "../../configs/Apis";

const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authApis(token).get(endpoints["categories"]);
        setCategories(response.data.results || response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error.message);
        Alert.alert("Lỗi", "Không thể tải danh mục!");
      }
    };
    if (token) fetchCategories();
  }, [token]);

  // Lấy token từ AsyncStorage
  useEffect(() => {
    const retrieveToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        console.log("Token:", storedToken);
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy token. Vui lòng đăng nhập lại!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy token:", error);
        Alert.alert("Lỗi", "Không thể lấy token từ AsyncStorage!");
      }
    };
    retrieveToken();
  }, []);

  // Chọn ảnh từ thư viện
  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5, // Giảm chất lượng để tăng tốc tải
      });

      console.log("Chọn ảnh:", result);

      if (result.canceled) {
        console.log("Người dùng hủy chọn ảnh");
      } else if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("Ảnh đã chọn:", {
          uri: selectedImage.uri,
          type: selectedImage.type,
          fileName: selectedImage.fileName,
          fileSize: selectedImage.fileSize,
        });
        setImage(selectedImage);
      } else {
        Alert.alert("Lỗi", "Không có ảnh được chọn.");
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh: " + error.message);
    }
  };

  // Xử lý khi chọn ngày/giờ bắt đầu
  const handleConfirmStart = (date) => {
    setStartDateTime(date);
    setShowStartPicker(false);
  };

  // Xử lý khi chọn ngày/giờ kết thúc
  const handleConfirmEnd = (date) => {
    setEndDateTime(date);
    setShowEndPicker(false);
  };

  // Xử lý khi hủy chọn
  const handleCancel = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  // Gửi dữ liệu lên API
  const handleCreateEvent = async () => {
    if (!title || !description || !location || !locationName || !category) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!token) {
      Alert.alert("Lỗi", "Không có token xác thực. Vui lòng đăng nhập lại!");
      return;
    }

    if (endDateTime <= startDateTime) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("start_date_time", startDateTime.toISOString());
      formData.append("end_date_time", endDateTime.toISOString());
      formData.append("location", location);
      formData.append("location_name", locationName);
      formData.append("category", category);

      if (image) {
        formData.append("image", {
          uri: image.uri,
          type: image.type || "image/jpeg",
          name: image.fileName || `event_image_${Date.now()}.jpg`,
        });
        console.log("Gửi ảnh trong FormData:", {
          uri: image.uri,
          type: image.type || "image/jpeg",
          name: image.fileName || `event_image_${Date.now()}.jpg`,
        });
      }

      console.log("Gửi yêu cầu đến:", endpoints["create-event"]);
      console.log("Dữ liệu FormData:", formData);
      console.log("Token:", token);

      const response = await authApis(token).post(endpoints["create-event"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 15000,
      });

      Alert.alert("Thành công", "Sự kiện đã được tạo thành công!");
      console.log("Sự kiện đã tạo:", response.data);

      // Reset form
      setTitle("");
      setDescription("");
      setStartDateTime(new Date());
      setEndDateTime(new Date());
      setLocation("");
      setLocationName("");
      setCategory(null);
      setImage(null);
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể tạo sự kiện. Mã lỗi: ${error.response?.status || "N/A"} - ${error.message}`
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
        value={title}
        onChangeText={setTitle}
        placeholder="Nhập tiêu đề sự kiện"
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Nhập mô tả sự kiện"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Thời gian bắt đầu</Text>
      <Button title="Chọn thời gian bắt đầu" onPress={() => setShowStartPicker(true)} />
      <Text style={styles.dateText}>
        {startDateTime.toLocaleString("vi-VN", {
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
        date={startDateTime}
        onConfirm={handleConfirmStart}
        onCancel={handleCancel}
        minimumDate={new Date()}
        is24Hour={true}
        locale="vi-VN"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      <Text style={styles.label}>Thời gian kết thúc</Text>
      <Button title="Chọn thời gian kết thúc" onPress={() => setShowEndPicker(true)} />
      <Text style={styles.dateText}>
        {endDateTime.toLocaleString("vi-VN", {
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
        date={endDateTime}
        onConfirm={handleConfirmEnd}
        onCancel={handleCancel}
        minimumDate={startDateTime}
        is24Hour={true}
        locale="vi-VN"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      <Text style={styles.label}>Địa điểm</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Nhập địa điểm (địa chỉ đầy đủ)"
      />

      <Text style={styles.label}>Tên địa điểm</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="Nhập tên địa điểm (ví dụ: Viettel Tower)"
      />

      <Text style={styles.label}>Danh mục</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
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
      {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}

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