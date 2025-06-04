import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./component/home/Home";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useContext, useEffect, useReducer } from "react";
import Resgister from "./component/User/Register";
import Login from "./component/User/Login";
import MyUserReducer from "./reducers/MyUserReducer";
import { Icon, Provider as PaperProvider } from "react-native-paper";
import Profile from "./component/User/Profile";
import Events from "./component/Event/Events";
import EventDetail from "./component/Event/EventDetail";
import CreateEvent from "./component/Event/CreateEvent";
import { MaterialIcons } from "@expo/vector-icons";
import PaymentHistory from "./component/Payment/PaymentHistory";
import ScannerTicket from "./component/Payment/ScanerTicket";
import PaymentTicket from "./component/Payment/PaymentTicket";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { navigationRef } from "./service/NavigationService";
import CreateCategory from "./component/Event/CreateCategory";
import CreateTicketType from "./component/Event/CreateTicketType";
import AddEventDates from "./component/Event/AddEventDates";
import UserEvents from "./component/Event/UserEvents";
// import { requestPermission, setupFCM } from "./service/FCMHandler";
import Chat from "./component/Chats/Chat";
import TicketedEvents from "./component/Event/TicketedEvents";
import ContactList from "./component/Chats/ContactList";
import MapEvents from "./component/Event/MapEvents";
import EventStats from "./component/Event/EventStats";
import EventRoomChat from "./component/Chats/EventRoomChat";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator>
      {user === null ? (
        <>
          <Tab.Screen name="login" component={Login} options={{ title: "Đăng nhập", tabBarIcon: () => <Icon size={30} source="account" /> }} />
          <Tab.Screen name="register" component={Resgister} options={{ title: "Đăng Ký", tabBarIcon: () => <Icon size={30} source="account-plus-outline" /> }} />
        </>
      ) : (
        <>
          <Tab.Screen name="home" component={HometNavigator} options={{ headerShown: false ,title: "Trang chủ", tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} /> }} />
          {/* <Tab.Screen name="events" component={Events} options={{ title: "Sự kiện", tabBarIcon: ({ color, size }) => <MaterialIcons name="event" color={color} size={size} /> }} /> */}
          {/* <Tab.Screen name="eventdetail" component={EventDetail} options={{ title: "Chi tiết", tabBarIcon: ({ color, size }) => <MaterialIcons name="info" color={color} size={size} /> }} /> */}

          <Tab.Screen name="paymentHistory" component={PaymentHistory} options={{ title: "Vé thanh toán", tabBarIcon: ({ color, size }) => <MaterialIcons name="payment" color={color} size={size} /> }} />
          {user.role === 'organizer' && (
            <>
              <Tab.Screen name="createvent" component={CreateEventNavigator} options={{ title: "Tạo sự kiện", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
              {/* <Tab.Screen name="addeventdates" component={AddEventDates} options={{ title: "Tạo ngày sự kiện", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
              <Tab.Screen name="createtickettype" component={CreateTicketType} options={{ title: "Tạo loại vé", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} /> */}
              <Tab.Screen name="checkin" component={ScannerTicket} options={{ title: "Check in", tabBarIcon: ({ color, size }) => <MaterialIcons name="check" color={color} size={size} /> }} />
            </>)}
          <Tab.Screen name="profile" component={ProfiletNavigator}  options={{ headerShown: false ,title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />
          <Tab.Screen name="mapevent" component={MapNavigator}  options={{ headerShown: true ,title: "Vị trí sự kiện", tabBarIcon: () => <Icon size={30} source="map-marker" /> }} />
          {/* <Tab.Screen name="chat" component={Chat}  options={{ headerShown: false ,title: "Chat", tabBarIcon: () => <Icon size={30} source="account" /> }} /> */}
        </>
      )}
    </Tab.Navigator>
  );
};

const ProfiletNavigator = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name='profile2' component={Profile} options={{ title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='userevents' component={UserEvents} options={{ title: "Sự kiện của tôi", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='eventdetail3' component={EventDetail} options={{ title: "Chi tiết sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='create-event-2' component={CreateEventNavigator} options={{ title: "Chi tiết sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='ticketed-events' component={TicketedEvents} options={{ title: "Sự kiện đã thanh toán", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='chat' component={Chat} options={{ title: "Sự kiện đã thanh toán", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='contact-list' component={ContactList} options={{ title: "Tin nhắn", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name="mapevent2" component={MapEvents}  options={{ headerShown: false ,title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />
      <Stack.Screen name="event-stats" component={EventStats}  options={{ headerShown: false ,title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />
      <Stack.Screen name="event-room-chat" component={EventRoomChat}  options={{ headerShown: false ,title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />

    </Stack.Navigator>
  );
}

const MapNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='mapevent' component={MapEvents} options={{ title: "Bản đồ sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='eventdetail3' component={EventDetail} options={{ title: "Chi tiết sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='chat' component={Chat} options={{ title: "Sự kiện đã thanh toán", tabBarIcon: () => <Icon size={30} source="account" /> }}/>

    </Stack.Navigator>
  )}

const HometNavigator = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name='home2' component={Home} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='eventdetail2' component={EventDetail} options={{ title: "Chi tiết sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='chat' component={Chat} options={{ title: "Sự kiện đã thanh toán", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name="event-room-chat" component={EventRoomChat}  options={{ headerShown: false ,title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />

    </Stack.Navigator>
  );
}

const CreateEventNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='create-event' component={CreateEvent} options={{ title: "Tạo sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='add-event-dates' component={AddEventDates} options={{ title: "Tạo loại vé", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
      <Stack.Screen name='create-ticket-type' component={CreateTicketType} options={{ title: "Tạo ngày diễn ra sự kiện", tabBarIcon: () => <Icon size={30} source="account" /> }}/>
    </Stack.Navigator>
  );
}

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" component={TabNavigator} />
      <Stack.Screen name="paymentTicket" component={PaymentTicket} />
      <Stack.Screen name="eventdetail" component={EventDetail} />

    </Stack.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  // useEffect(() => {
  //   requestPermission();
  //   setupFCM();
  // }, []);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <PaperProvider>
          <NavigationContainer ref={navigationRef}>
            <MainStack />
          </NavigationContainer>
        </PaperProvider>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
};



export default App;
