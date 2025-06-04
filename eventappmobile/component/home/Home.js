import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import Apis, { authApis, BASE_URL, endpoints } from "../../configs/Apis";
import { SafeAreaView } from "react-native";
import { Chip, Card, Searchbar } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { navigate } from "../../service/NavigationService";
import moment from "moment";
import "moment/locale/vi";

// Lấy chiều rộng màn hình để tính toán kích thước cột
const { width } = Dimensions.get("window");
const columnWidth = (width - 40) / 2;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState();
  const [page, setPage] = useState(1);
  const [cateId, setCateId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  const loadCates = async () => {
    try {
      let res = await Apis.get(endpoints["categories"]);
      setCategories(res.data);
    } catch (ex) {
      console.error("Error loading categories:", ex);
    }
  };

  const loadEvents = async () => {
    if (page <= 0 || !hasMore) return;

    try {
      setLoading(true);
      let url = `${endpoints["events"]}?page=${page}`;

      if (typeof q === "string" && q.trim() !== "") {
        url += `&q=${encodeURIComponent(q.trim())}`;
      }

      if (cateId) {
        url = `${url}&category_id=${cateId}`;
      }

      let res = await Apis.get(url);
      if (res.data.link.next === null) {
        setHasMore(false);
        setPage(0);
      }
      setEvents((prevEvents) => [...prevEvents, ...res.data.results]);
      
    } catch (ex) {
      console.error("Error loading events:", ex);
      if (ex.response && ex.response.status === 404) {
        setEvents([]); 
        setHasMore(false);
        setPage(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && page > 0) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const fetchSuggestion = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/event/suggestion/?kw=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestion || []);
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý:', error);
    }
  }


  const search = (value, callback) => {
    setPage(1);
    setEvents([]);
    setHasMore(true);
    callback(value);

    if (typeof q === "string" || value === "") {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    loadCates();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
     if ((typeof q !== "string") || q === "" || page > 0) {
      loadEvents();
    }
      if (typeof q === "string" && q.trim() !== "") {
        fetchSuggestion();
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [q, cateId, page]);

  const formatEventDates = (eventDates) => {
    moment.locale("vi");
    if (eventDates.length === 0) return "Chưa có ngày";
    const firstDate = moment(eventDates[0].event_date).format("DD [tháng] MM, YYYY");
    return firstDate;
  };

  const isEventFinished = (eventDates) => {
    if (!Array.isArray(eventDates) || eventDates.length === 0) return false;
    const now = moment();
    const last = eventDates[eventDates.length - 1];
    if (!last?.event_date || !last?.end_time) return false;
    const latestEventDate = moment(last.event_date).set({
      hour: moment(last.end_time, "HH:mm").hours(),
      minute: moment(last.end_time, "HH:mm").minutes(),
    });
    return now.isAfter(latestEventDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView horizontal={true}>
        <TouchableOpacity onPress={() => search(null, setCateId)}>
          <Chip icon={"label"} style={MyStyles.m}>
            Tất cả
          </Chip>
        </TouchableOpacity>

        {categories.map((c) => (
          <TouchableOpacity key={c.id} onPress={() => search(c.id, setCateId)}>
            <Chip icon={"label"} style={[MyStyles.m]}>
              {c.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Searchbar
        placeholder="Tìm kiếm sự kiện..."
        value={q}
        onChangeText={(t) => search(t, setQ)}
        style={styles.searchbar}
        inputStyle={styles.searchbarInput} // Thêm style cho input bên trong
        iconColor="#666" // Tùy chỉnh màu icon
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => navigate("eventdetail2", { eventId: item.id })}>
              <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />)}

      <FlatList
        style={styles.flatList}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator />}
        data={events}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigate("eventdetail2", { eventId: item.id })}
            style={styles.cardContainer}
          >
            <Card style={styles.card}>
              <Card.Cover
                source={{ uri: item.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Card.Content>
                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.price}>
                    Từ {item.price.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
                <Text style={styles.date}>
                  {formatEventDates(item.event_dates)}
                </Text>
                {isEventFinished(item.event_dates) && (
                  <Text style={styles.finishedLabel}>Đã diễn ra</Text>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchbar: {
    margin: 10,
    height: 40, // Giảm chiều cao của Searchbar
    borderRadius: 20, // Bo góc nhẹ
    elevation: 2, // Giảm độ đổ bóng
    backgroundColor: "#f5f5f5", // Màu nền nhẹ
  },
  searchbarInput: {
    fontSize: 14, // Giảm kích thước font chữ trong input
    paddingVertical: 0, // Giảm padding dọc để làm nhỏ hơn
  },
  flatList: {
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardContainer: {
    width: columnWidth,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 12,
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  finishedLabel: {
    color: "red",
    fontSize: 10,
    marginTop: 4,
  },
  suggestionItem: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // cho Android
  },
});

export default Home;