import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Dimensions, SafeAreaView, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Apis, { endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const MapEvents = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigation();

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Quyền truy cập vị trí bị từ chối!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error("Lỗi khi lấy vị trí:", error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại!");
    }
  };

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await Apis.get(endpoints["events"]);
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else if (Array.isArray(response.data.results)) {
        setEvents(response.data.results);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sự kiện!");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
    fetchEvents();
  }, []);

  const mapRegion = userLocation || {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <MapView
          style={styles.map}
          region={mapRegion}
          provider="google"
          customMapStyle={[]}
          mapType="standard"
          showsMyLocationButton={true}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {events.map(
            (event) =>
              event.vi_do &&
              event.kinh_do &&
              event.image && (
                <Marker
                  key={event.id}
                  coordinate={{
                    latitude: event.vi_do,
                    longitude: event.kinh_do,
                  }}
                  title={event.title}
                  description={event.location_name}
                  onPress={() => nav.navigate("eventdetail3", { eventId: event.id })}
                >
                  <View style={styles.markerContainer}>
                    <Image
                      source={{ uri: event.image }}
                      style={styles.markerImage}
                      resizeMode="cover"
                    />
                    <View  />
                  </View>
                </Marker>
              )
          )}
        </MapView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  map: {
    width: width,
    height: height,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40, // Kích thước tổng thể của marker
    height: 50, // Chiều cao bao gồm cả đầu nhọn
  },
  markerImage: {
    width: 36, // Kích thước hình ảnh
    height: 36,
    borderRadius: 18, // Làm tròn để giống marker mặc định
    borderWidth: 2,
    borderColor: "#ff0000", // Viền trắng giống marker mặc định
    backgroundColor: "#ff0000", // Màu nền đỏ giống marker mặc định
  },
  markerTip: {
    width: 10,
    height: 10,
    backgroundColor: "#ff0000", // Màu đỏ giống marker mặc định
    transform: [{ rotate: "45deg" }], // Xoay để tạo hình tam giác
    position: "absolute",
    bottom: 0,
  },
});

export default MapEvents;