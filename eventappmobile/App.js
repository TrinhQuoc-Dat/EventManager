import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./component/home/Home";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useContext, useReducer } from "react";
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
          <Tab.Screen name="home" component={Home} options={{ title: "Trang chủ", tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} /> }} />
          <Tab.Screen name="events" component={Events} options={{ title: "Sự kiện", tabBarIcon: ({ color, size }) => <MaterialIcons name="event" color={color} size={size} /> }} />

          <Tab.Screen name="paymentHistory" component={PaymentHistory} options={{ title: "Thanh toán", tabBarIcon: ({ color, size }) => <MaterialIcons name="payment" color={color} size={size} /> }} />
          {user.role === 'organizer' && (
            <>
              <Tab.Screen name="createvent" component={CreateEvent} options={{ title: "Tạo sự kiện", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
              <Tab.Screen name="addeventdates" component={AddEventDates} options={{ title: "Tạo ngày sự kiện", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
              <Tab.Screen name="createtickettype" component={CreateTicketType} options={{ title: "Tạo loại vé", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
              <Tab.Screen name="checkin" component={ScannerTicket} options={{ title: "Check in", tabBarIcon: ({ color, size }) => <MaterialIcons name="check" color={color} size={size} /> }} />
            </>)}
          <Tab.Screen name="profile" component={Profile} options={{ title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />
        </>
      )}
    </Tab.Navigator>
  );
};

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
