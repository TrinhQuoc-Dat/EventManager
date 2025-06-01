import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, List } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import moment from "moment";
import { navigate } from "../../service/NavigationService";

const TicketedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const nav = useNavigation();

  const loadEvents = async () => {
    const token = await AsyncStorage.getItem("token");
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["ticketed-events"]}?page=${page}`;

        let res = await authApis(token).get(url);
        console.log(res.data);
        setEvents([...events, ...res.data.results]);
        console.log(events);

        if (res.data.link.next === null) {
          setPage(0);
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  const loadMore = () => {
    if (!loading && page > 0) {
      setPage((page) => page + 1);
    }
  };

  const formatEventDates = (eventDates) => {
    moment.locale("vi");
    if (eventDates.length === 0) return "Chưa có ngày";
    const firstDate = moment(eventDates[0].event_date).format("DD/MM/YYYY");
    if (eventDates.length === 1) return firstDate;
    const lastDate = moment(
      eventDates[eventDates.length - 1].event_date
    ).format("DD/MM/YYYY");
    return `${firstDate} - ${lastDate}`;
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      loadEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [page]);

  return (
    <SafeAreaView>
      <FlatList
        style={MyStyles.p}
        onEndReached={loadMore}
        ListFooterComponent={loading && <ActivityIndicator />}
        data={events}
        renderItem={({ item }) => (
          console.log(item),
          <List.Item
            title={item.title}
            description={() => (
              <View>
                <Text>Từ {item.price.toLocaleString("vi-VN")} VNĐ</Text>
                <Text>{formatEventDates(item.event_dates)}</Text>
              </View>
            )}
            left={() => (
              <TouchableOpacity
                onPress={() => navigate("eventdetail3", { eventId: item.id })}
              >
                <Image style={MyStyles.avatar} source={{ uri: item.image }} />
              </TouchableOpacity>
            )}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default TicketedEvents;
