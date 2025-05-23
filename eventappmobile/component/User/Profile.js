import { useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native";
import { Avatar, Button } from "react-native-paper";
import { Text, View } from "react-native";
import { styles } from "./styles";

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
        <View style={styles.container}>
            {user?.avatar ? (
                <Avatar.Image size={100} source={{ uri: user.avatar }} />
            ) : (
                <Avatar.Image size={100} source={{ uri: "https://i.pinimg.com/originals/dc/b8/3a/dcb83a971fcfc836d17e5418576cf4b6.jpg" }} />
            )}
            <Text style={styles.name}>
                {user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </Text>
            <Text style={styles.info}>Email: {user?.email}</Text>
            <Text style={styles.info}>Vai trò: {user?.role}</Text>
            <Button style={styles.logoutBtn} onPress={logout} mode="contained">
                Đăng xuất
            </Button>
        </View>
    );
}

export default Profile;