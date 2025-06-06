import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button, HelperText, Menu, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyDispatchContext } from "../../configs/Context";
import MyStyles from "../../styles/MyStyles";
import GoogleLogin from "./LoginGoogle";
import * as Notifications from "expo-notifications";

const Login = () => {
  const info = [
    {
      label: "Tên đăng nhập",
      field: "username",
      icon: "account",
      secureTextEntry: false,
    },
    {
      label: "Mật khẩu",
      field: "password",
      icon: "eye",
      secureTextEntry: true,
    },
  ];

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState();
  const dispatch = useContext(MyDispatchContext);
  const [role, setRole] = useState("participant");
  const [menuVisible, setMenuVisible] = useState(false);

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const validate = () => {
    if (Object.values(user).length == 0) {
      setMsg("Vui lòng nhập thông tin!");
      return false;
    }

    for (let i of info)
      if (user[i.field] === "") {
        setMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }

    setMsg("");
    return true;
  };

  const login = async () => {
    if (validate() === true) {
      try {
        setLoading(true);
        let res = await Apis.post(endpoints["login"], {
          ...user,
          role: role,
        });
        await AsyncStorage.setItem("token", res.data.access);
        console.log("Đăng nhập thành công:", res.data.access);

        let u = await authApis(res.data.access).get(endpoints["current-user"]);

        let pushToken = null;
        try {
          const { data } = await Notifications.getExpoPushTokenAsync();
          pushToken = data;
          console.log("Push Token:", pushToken);
        } catch (e) {
          console.warn("Không lấy được push token:", e);
        }

        // Gửi push token lên backend nếu lấy được
        if (pushToken) {
          try {
            await authApis(res.data.access).post(endpoints["save-push-token"], {
              fcm_token: pushToken,
            });
          } catch (e) {
            console.warn("Không gửi được push token lên server:", e);
          }
        }

        dispatch({
          type: "login",
          payload: u.data,
        });
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView>
      <HelperText type="error" visible={msg}>
        {msg}
      </HelperText>
      <View>
        {info.map((i) => (
          <TextInput
            key={i.field}
            style={[MyStyles.inputContainer, MyStyles.m]}
            label={i.label}
            secureTextEntry={i.secureTextEntry}
            right={<TextInput.Icon icon={i.icon} />}
            value={user[i.field]}
            onChangeText={(t) => setState(t, i.field)}
          />
        ))}
      </View>

      <View style={[MyStyles.m, { zIndex: 1 }]}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              style={MyStyles.menuAnchor}
              labelStyle={MyStyles.menuText}
              onPress={() => setMenuVisible(true)}
            >
              Vai trò:{" "}
              {role === "admin"
                ? "Quản trị viên"
                : role === "organizer"
                ? "Nhà tổ chức"
                : "Khách tham gia"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setRole("admin");
              setMenuVisible(false);
            }}
            title="Quản trị viên"
            style={MyStyles.menuItem}
            titleStyle={MyStyles.menuItemTitle}
          />
          <Menu.Item
            onPress={() => {
              setRole("organizer");
              setMenuVisible(false);
            }}
            title="Nhà tổ chức sự kiện"
            style={MyStyles.menuItem}
            titleStyle={MyStyles.menuItemTitle}
          />
          <Menu.Item
            onPress={() => {
              setRole("participant");
              setMenuVisible(false);
            }}
            title="Khách tham gia"
            style={MyStyles.menuItem}
            titleStyle={MyStyles.menuItemTitle}
          />
        </Menu>
      </View>

      <Button
        onPress={login}
        disabled={loading}
        loading={loading}
        style={[MyStyles.m, MyStyles.button]}
        mode="contained"
      >
        Đăng nhập
      </Button>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 10,
        }}
      />

      <Button
        onPress={login}
        disabled={loading}
        loading={loading}
        style={[MyStyles.m, MyStyles.button]}
        mode="contained"
      >
        Đăng nhập
      </Button>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 10,
        }}
      />

      <GoogleLogin />
    </ScrollView>
  );
};

export default Login;
