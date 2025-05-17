import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UploadCloudinary } from "../../service/UploadCloudinary";

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [locationName, setLocationName] = useState('');
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
        const response = await axios.get('https://trinhquocdat.pythonanywhere.com/api/categories/');
        setCategories(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
        Alert.alert('Lỗi', 'Không thể tải danh mục!');
      }
    };
    fetchCategories();
  }, []);

  // Lấy token từ AsyncStorage
  useEffect(() => {
    const retrieveToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy token. Vui lòng đăng nhập lại!');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
        Alert.alert('Lỗi', 'Không thể lấy token từ AsyncStorage!');
      }
    };
    retrieveToken();
  }, []);

  // Chọn ảnh từ thư viện
  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        setImage(response.assets[0]);
      }
    });
  };

const onChangeStart = (event, selectedDate) => {
  if (Platform.OS === 'android') {
    setShowStartPicker(false); // Luôn ẩn picker trên Android
    // Chỉ cập nhật giá trị nếu người dùng không nhấn Cancel
    if (event.type === 'set' && selectedDate) {
      setStartDateTime(selectedDate);
    }
  } else { // iOS
    setStartDateTime(selectedDate || startDateTime);
  }
};

const onChangeEnd = (event, selectedDate) => {
  if (Platform.OS === 'android') {
    setShowEndPicker(false); // Luôn ẩn picker trên Android
    // Chỉ cập nhật giá trị nếu người dùng không nhấn Cancel
    if (event.type === 'set' && selectedDate) {
      setEndDateTime(selectedDate);
    }
  } else { // iOS
    setEndDateTime(selectedDate || endDateTime);
  }
};


  // Gửi dữ liệu lên API
  const handleCreateEvent = async () => {
    if (!title || !description || !location || !locationName || !category) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!token) {
      Alert.alert('Lỗi', 'Không có token xác thực. Vui lòng đăng nhập lại!');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await UploadCloudinary(image);
      }

      const eventData = {
        title,
        description,
        start_date_time: startDateTime.toISOString(),
        end_date_time: endDateTime.toISOString(),
        location,
        location_name: locationName,
        category,
        image: imageUrl || null,
      };

      console.log('Request URL:', 'https://trinhquocdat.pythonanywhere.com/api/event/');
      console.log('Request Data:', eventData);

      const response = await axios.post('https://trinhquocdat.pythonanywhere.com/api/event/', eventData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      Alert.alert('Thành công', 'Sự kiện đã được tạo thành công!');
      console.log('Event created:', response.data);

      // Reset form
      setTitle('');
      setDescription('');
      setStartDateTime(new Date());
      setEndDateTime(new Date());
      setLocation('');
      setLocationName('');
      setCategory(null);
      setImage(null);
    } catch (error) {
      console.error('Error creating event:', error.message, error.response?.data);
      Alert.alert('Lỗi', `Không thể tạo sự kiện. Mã lỗi: ${error.response?.status} - ${error.message}`);
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
    {startDateTime.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}
  </Text>
  {showStartPicker && (
    <DateTimePicker
      testID="startDateTimePicker"
      value={startDateTime}
      mode="datetime"
      is24Hour={true}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={onChangeStart}
    />
  )}

  {/* Picker cho thời gian kết thúc */}
  <Text style={styles.label}>Thời gian kết thúc</Text>
  <Button title="Chọn thời gian kết thúc" onPress={() => setShowEndPicker(true)} />
  <Text style={styles.dateText}>
    {endDateTime.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}
  </Text>
  {showEndPicker && (
    <DateTimePicker
      testID="endDateTimePicker"
      value={endDateTime}
      mode="datetime"
      is24Hour={true}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={onChangeEnd}
    />
  )}

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
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Hình ảnh</Text>
      <Button title="Chọn hình ảnh" onPress={selectImage} />
      {image && (
        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Đang tạo...' : 'Tạo sự kiện'}
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
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  buttonContainer: {
    marginVertical: 16,
  },
});

export default CreateEvent;