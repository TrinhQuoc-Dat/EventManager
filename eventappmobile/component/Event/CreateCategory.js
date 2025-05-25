import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";

const CreateCategory = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy token từ AsyncStorage
  useEffect(() => {
    const retrieveToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        console.log("Retrieved token:", storedToken);
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy token. Vui lòng đăng nhập lại!");
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
        Alert.alert("Lỗi", "Không thể lấy token từ AsyncStorage!");
      }
    };
    retrieveToken();
  }, []);

  // Gửi yêu cầu POST để tạo danh mục
  const handleCreateCategory = async () => {
    if (!name) {
      Alert.alert("Lỗi", "Vui lòng nhập tên danh mục!");
      return;
    }

    if (!token) {
      Alert.alert("Lỗi", "Không có token xác thực. Vui lòng đăng nhập lại!");
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name,
      };

      console.log("Sending request to:", endpoints["categories"]);
      console.log("Category data:", categoryData);
      console.log("Token:", token);

      const response = await authApis(token).post(endpoints["categories"], categoryData, {
        timeout: 10000, // Timeout 10 giây
      });

      Alert.alert("Thành công", "Danh mục đã được tạo thành công!");
      console.log("Category created:", response.data);

      // Reset form
      setName("");
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data,
      });
      Alert.alert(
        "Lỗi",
        `Không thể tạo danh mục. Mã lỗi: ${error.response?.status || "N/A"} - ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tên danh mục</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên danh mục (ví dụ: Thể thao)"
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Đang tạo..." : "Tạo danh mục"}
          onPress={handleCreateCategory}
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
  buttonContainer: {
    marginVertical: 16,
  },
});

export default CreateCategory;