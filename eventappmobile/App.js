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
import { Provider as PaperProvider } from "react-native-paper";
import Events from "./component/Event/Events";
import EventDetail from "./component/Event/EventDetail";
import CreateEvent from "./component/Event/CreateEvent";
import { MaterialIcons } from "@expo/vector-icons";
import CreateCategory from "./component/Event/CreateCategory";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);
  return (
    <PaperProvider>
      <Tab.Navigator>
        {user === null ? (
          <>
            <Tab.Screen
              name="home"
              component={StackNavigator}
              options={{
                title: "Trang chủ",
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="home" color={color} size={size} />
                ),
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="profile"
              component={AuthStackNavigator}
              options={{
                title: "Tài khoản",
                tabBarIcon: () => <Icon size={30} source="account" />,
                headerShown: false
              }}
            />
            
          </>
        ) : (
          <>
            <Tab.Screen
              name="home"
              component={StackNavigator}
              options={{
                title: "Trang chủ",
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="home" color={color} size={size} />
                ),
                headerShown: false,
              }}
            />

            <Tab.Screen
              name="createvent"
              component={CreateEvent}
              options={{
                title: "Tạo sự kiện",
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons
                    name="add-circle-outline"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="creatcategory"
              component={CreateCategory}
              options={{
                title: "Tạo danh mục",
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons
                    name="add-circle-outline"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="profile"
              component={Profile}
              options={{
                title: "Tài khoản",
                tabBarIcon: () => <Icon size={30} source="account" />,
                headerShown: false
              }}
            />
          </>
        )}
      </Tab.Navigator>
    </PaperProvider>
  );
};

const AuthStackNavigator = () => {
  return (
      <Stack.Navigator>
        <Stack.Screen
              name="profile2"
              component={Profile}
              options={{
                title: "Tài khoản",
                // tabBarIcon: () => <Icon size={30} source="account" />,
              }}
            />
        <Stack.Screen
          name="login"
          component={Login}
          options={{
            title: "Đăng nhập",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="login" color={color} size={size} />
            ),
          }}
        />
        <Stack.Screen
          name="register"
          component={Resgister}
          options={{
            title: "Đăng ký",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person-add" color={color} size={size} />
            ),
          }}
        />
      </Stack.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home2"
        component={Home}
        options={{
          title: "Trang chủ",
          headerStyle: { backgroundColor: "#2196F3" },
        }}
      />
      <Stack.Screen
        name="event-detail"
        component={EventDetail}
        options={{
          title: "Trang chủ",
          headerStyle: { backgroundColor: "#2196F3" },
        }}
      />
      
    </Stack.Navigator>
  );
};

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

    // test bỏ quan màn hình login
    // <NavigationContainer>
    //   <TabNavigator />
    // </NavigationContainer>
  );
};

export default App;
