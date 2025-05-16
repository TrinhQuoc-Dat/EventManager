import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./component/home/Home";
import EventDetail from "./component/home/EventDetail";
import Events from "./component/home/Events";
// import Events from "./component/home/Events";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="home" component={Home}/>
      <Tab.Screen name="eventdetail" component={EventDetail}/>
      <Tab.Screen name="events" component={Events}/>
    </Tab.Navigator>
  );
}


const App = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  )
}

export default App;