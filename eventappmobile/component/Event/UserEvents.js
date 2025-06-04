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
  Button,
} from "react-native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { SafeAreaView } from "react-native";
import { Chip, Icon, List, Searchbar } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
// import { navigate } from "../../service/NavigationService";
import moment from "moment";
import "moment/locale/vi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { editable } from "deprecated-react-native-prop-types/DeprecatedTextInputPropTypes";
import { useNavigation } from "@react-navigation/native";

const UserEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const nav = useNavigation();
  //   const [token, setToken] = useState();

  //   const loadToken = async () => {
  //     const t = await AsyncStorage.getItem("token");
  //     setToken(t);
  //   }

  //   useEffect(() => {
  //     loadToken();
  //   }, [])

  const loadEvents = async () => {
    if (page > 0) {
      try {
        const token = await AsyncStorage.getItem("token");
        setLoading(true);
        let url = `${endpoints["event-user"]}?page=${page}`;

        let res = await authApis(token).get(url);
        setEvents([...events, ...res.data.results]);

        if (res.data.next === null) {
          setPage(0);
        }
      } catch {
        // console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };
  // console.log(events);
  const loadMore = () => {
    if (!loading && page > 0) {
      setPage((page) => page + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    setEvents([]);
    callback(value);
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      loadEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [page]);

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

  return (
    <SafeAreaView>
      <FlatList
        style={MyStyles.p}
        onEndReached={loadMore}
        ListFooterComponent={loading && <ActivityIndicator />}
        data={events}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={() => (
              <View>
                <Text>Từ {item.price.toLocaleString("vi-VN")} VNĐ</Text>
                <Text>{formatEventDates(item.event_dates)}</Text>
              </View>
            )}
            left={() => (
              <TouchableOpacity onPress={() => nav.navigate("eventdetail3", { eventId: item.id })}>
                <Image style={MyStyles.avatar} source={{ uri: item.image }} />
              </TouchableOpacity>
            )}
            right={() => (
              <TouchableOpacity onPress={() => nav.navigate("create-event-2", { screen: 'create-event' ,params: {eventId: item.id} } )}>
                <Text>Edit</Text>
              </TouchableOpacity>
            )}
          />
        )}
      />
      
    </SafeAreaView>
  );
};

export default UserEvents;
