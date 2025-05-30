// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   FlatListComponent,
//   Image,
//   ScrollView,
// } from "react-native";
// import axios from "axios";
// import Apis, { endpoints } from "../../configs/Apis";
// import { SafeAreaView } from "react-native";
// import { Chip, List, Searchbar } from "react-native-paper";
// import MyStyles from "../../styles/MyStyles";
// import { useNavigation } from "@react-navigation/native";
// import { navigate } from "../../service/NavigationService";

// const Home = () => {
//   const [categories, setCategories] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [q, setQ] = useState();
//   const [page, setPage] = useState(1);
//   const [cateId, setCateId] = useState(null);
//   const nav = useNavigation();

//   const loadCates = async () => {
//     let res = await Apis.get(endpoints["categories"]);
//     setCategories(res.data);
//   };

//   const loadEvents = async () => {
//     if (page > 0) {
//       try {
//         setLoading(true);
//         let url = `${endpoints["events"]}?page=${page}`;

//         if (q) {
//           url = `${url}&q=${q}`;
//         }

//         if (cateId) {
//           url = `${url}&category_id=${cateId}`;
//         }

//         let res = await Apis.get(url);
//         setEvents([...events, ...res.data.results]);

//         if (res.data.next === null) {
//           setPage(0);
//         }
//       } catch {
//         // console.error(ex);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const loadMore = () => {
//     if (!loading && page > 0) {
//       setPage((page) => page + 1);
//     }
//   };

//   const search = (value, callback) => {
//     setPage(1);
//     setEvents([]);
//     callback(value);
//   };

//   useEffect(() => {
//     loadCates();
//   }, []);

//   useEffect(() => {
//     let timer = setTimeout(() => {
//       loadEvents();
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [q, cateId, page]);

//   return (
//     <SafeAreaView>
//       <ScrollView horizontal={true}>
//         <TouchableOpacity onPress={() => search(null, setCateId)}>
//           <Chip icon={"label"} style={MyStyles.m}>
//             Tất cả
//           </Chip>
//         </TouchableOpacity>

//         {categories.map((c) => (
//           <TouchableOpacity key={c.id} onPress={() => search(c.id, setCateId)}>
//             <Chip icon={"label"} style={[MyStyles.m]}>
//               {c.name}
//             </Chip>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       <Searchbar
//         placeholder="Tìm kiếm sự kiện..."
//         value={q}
//         onChangeText={(t) => search(t, setQ)}
//       />

//       <FlatList
//         style={MyStyles.p}
//         onEndReached={loadMore}
//         ListFooterComponent={loading && <ActivityIndicator />}
//         data={events}
//         renderItem={({ item }) => (
//           <List.Item 
//             title={item.title}
//             description={(<View>
//               <Text>Từ {item.price} VNĐ</Text>
//               <Text>{item.start_date_time}</Text>
//             </View>)}
//             left={() => (
//               <TouchableOpacity onPress={() => navigate('eventdetail', {'eventId': item.id})}>
//                 <Image style={MyStyles.avatar} source={{ uri: item.image }} />
//               </TouchableOpacity>
//             )}

//           />
//         )}
//       />
//     </SafeAreaView>
//   );
// };

// export default Home;


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
} from "react-native";
import Apis, { endpoints } from "../../configs/Apis";
import { SafeAreaView } from "react-native";
import { Chip, List, Searchbar } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { navigate } from "../../service/NavigationService";
import moment from "moment";
import "moment/locale/vi";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState();
  const [page, setPage] = useState(1);
  const [cateId, setCateId] = useState(null);

  const loadCates = async () => {
    let res = await Apis.get(endpoints["categories"]);
    setCategories(res.data);
  };

  const loadEvents = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["events"]}?page=${page}`;

        if (q) {
          url = `${url}&q=${q}`;
        }

        if (cateId) {
          url = `${url}&category_id=${cateId}`;
        }

        let res = await Apis.get(url);
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
    loadCates();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      loadEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [q, cateId, page]);

  const formatEventDates = (eventDates) => {
    moment.locale("vi");
    if (eventDates.length === 0) return "Chưa có ngày";
    const firstDate = moment(eventDates[0].event_date).format("DD/MM/YYYY");
    if (eventDates.length === 1) return firstDate;
    const lastDate = moment(eventDates[eventDates.length - 1].event_date).format("DD/MM/YYYY");
    return `${firstDate} - ${lastDate}`;
  };

  return (
    <SafeAreaView>
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
      />

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
              <TouchableOpacity onPress={() => navigate('eventdetail', { eventId: item.id })}>
                <Image style={MyStyles.avatar} source={{ uri: item.image }} />
              </TouchableOpacity>
            )}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Home;
