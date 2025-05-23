import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./component/home/Home";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useContext, useReducer } from "react";
import Resgister from "./component/User/Register";
import Login from "./component/User/Login";
import MyUserReducer from "./reducers/MyUserReducer";
import { Icon } from "react-native-paper";
import Profile from "./component/User/Profile";
import { Provider as PaperProvider } from 'react-native-paper';
import Events from "./component/Event/Events";
import EventDetail from "./component/Event/EventDetail";
import CreateEvent from "./component/Event/CreateEvent";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);
  return (

    <PaperProvider>
      <Tab.Navigator>
        {user === null ? <>
          <Tab.Screen name="login" component={Login} options={{ title: "Đăng nhập", tabBarIcon: () => <Icon size={30} source="account" /> }} />
          <Tab.Screen name="register" component={Resgister} options={{ title: 'Đăng Ký', tabBarIcon: () => <Icon size={30} source="account-plus-outline" /> }} />

        </> : <>
          <Tab.Screen name="home" component={Home} />
          <Tab.Screen name="events" component={Events} />
          <Tab.Screen name="eventdetail" component={EventDetail} />
          <Tab.Screen name="createvent" component={CreateEvent} />
          <Tab.Screen name="login" component={Profile} options={{ title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />
        </>}
      </Tab.Navigator>
    </PaperProvider>

  );
}


const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  )
}

export default App;