import { useContext, useState } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native";
import { Avatar, Button } from "react-native-paper";
import { Text, View } from "react-native";
import { styles } from "./styles";
import { navigate } from "../../service/NavigationService";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();
    const [events, setEvent] = useState(null);

    const logout = () => {
        dispatch({
            "type": "logout"
        });
    }

    const fetchEvent = () => {
        
    }

    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <Avatar.Image
                    size={90}
                    source={{
                        uri: user?.avatar || "https://i.pinimg.com/originals/dc/b8/3a/dcb83a971fcfc836d17e5418576cf4b6.jpg",
                    }}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.name}>
                        {user?.first_name || user?.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user?.username}
                    </Text>
                    <Text style={styles.info}>📧 {user?.email}</Text>
                    <Text style={styles.info}>👤 Vai trò: {user?.role}</Text>
                     <Button
                style={styles.logoutBtn}
                onPress={logout}
                mode="contained"
                labelStyle={{ fontSize: 16 }}
            >
                Đăng xuất
            </Button>
                </View>
            </View>


        </View>

    );
}

export default Profile;