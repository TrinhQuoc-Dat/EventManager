import { useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { Text, View } from "react-native";
import MyStyles from "../../styles/MyStyles";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const logout = () => {
        dispatch({
            "type": "logout"
        });

        nav.navigate("login");
    }

    return (
        <View>
            <Text style={MyStyles.subject}>Chào {user?.first_name} {user?.last_name}!</Text>
            <Button onPress={logout} mode="contained">Đăng xuất</Button>
        </View>
    );
}

export default Profile;