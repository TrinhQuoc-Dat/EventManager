import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Button, HelperText, Menu, TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import * as ImagePicker from 'expo-image-picker';
import Apis, { endpoints } from "../../configs/Apis";
import { UploadCloudinary } from "../../service/UploadCloudinary";

const Resgister = () => {

    const info = [{
        label: 'Tên',
        field: 'first_name',
        icon: 'text',
        secureTextEntry: false
    }, {
        label: 'Họ và tên lót',
        field: 'last_name',
        icon: 'text',
        secureTextEntry: false
    }, {
        label: 'Email',
        field: 'email',
        icon: 'text',
        secureTextEntry: false
    }
        , {
        label: 'Tên đăng nhập',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
    }, {
        label: 'Mật khẩu',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'Xác nhận mật khẩu',
        field: 'confirm',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [role, setRole] = useState('participant');
    const [menuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState();
    const nav = useNavigation();

    const setState = (value, field) => {
        setUser({ ...user, [field]: value })
    }

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled)
                setState(result.assets[0], 'image');
        }
    }

    const validate = () => {
        if (Object.values(user).length == 0) {
            setMsg("Vui lòng nhập thông tin!");
            return false;
        }

        for (let i of info)
            if (user[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);
                return false;
            }

        if (user.password && user.password !== user.confirm) {
            setMsg("Mật khẩu không khớp!");
            return false;
        }

        setMsg('');
        return true;
    }

    const register = async () => {
        if (validate() === true) {
            try {
                setLoading(true);

                let form = new FormData();
                let avatarUrl = null;

                if (user.image) {
                    avatarUrl = await UploadCloudinary(user.image);
                    setState(avatarUrl, 'avatar');
                }
                for (let key in user)
                    if (key !== 'confirm') {
                        if (key !== 'image')
                            form.append(key, user[key]);
                    }
                form.append('role', role);

                let res = await Apis.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 201)
                    nav.navigate('login');

            } catch (ex) {
                console.error(ex);
                setMsg("Lỗi khi đăng ký!");
            } finally {
                setLoading(false);
            }
        }
    }


    return (

        <ScrollView contentContainerStyle={[MyStyles.container, { flexGrow: 1 }]} >
            <Text style={MyStyles.subject}>Đăng ký tài khoản</Text>

            <HelperText type="error" visible={msg}>
                {msg}
            </HelperText>

            {info.map(i => (
                <View key={i.field} style={[MyStyles.inputContainer, MyStyles.m]}>
                    <TextInput
                        label={i.label}
                        secureTextEntry={i.secureTextEntry}
                        right={<TextInput.Icon icon={i.icon} />}
                        value={user[i.field]}
                        onChangeText={t => setState(t, i.field)}
                        style={MyStyles.input}
                        mode="outlined"
                    />
                </View>
            ))}
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
                            Vai trò: {role === 'admin' ? 'Quản trị viên' : role === 'organizer' ? 'Nhà tổ chức' : 'Khách tham gia'}
                        </Button>
                    }
                >
                    <Menu.Item
                        onPress={() => { setRole("admin"); setMenuVisible(false); }}
                        title="Quản trị viên"
                        style={MyStyles.menuItem}
                        titleStyle={MyStyles.menuItemTitle}
                    />
                    <Menu.Item
                        onPress={() => { setRole("organizer"); setMenuVisible(false); }}
                        title="Nhà tổ chức sự kiện"
                        style={MyStyles.menuItem}
                        titleStyle={MyStyles.menuItemTitle}
                    />
                    <Menu.Item
                        onPress={() => { setRole("participant"); setMenuVisible(false); }}
                        title="Khách tham gia"
                        style={MyStyles.menuItem}
                        titleStyle={MyStyles.menuItemTitle}
                    />
                </Menu>
            </View>
            <View>

            </View>
            <TouchableOpacity style={MyStyles.m} onPress={picker}>
                <Text style={MyStyles.text}>Chọn ảnh đại diện...</Text>
            </TouchableOpacity>

            <View>
                {/* {user?.avatar && <Image source={{ uri: user.avatar.uri }} style={[MyStyles.avatar, MyStyles.m]} />} */}
            </View>

            <View>
                {user?.image && <Text style={{color: "blue"}}>{user.image.fileName || user.image.name}</Text>}
            </View>

            <Button
                onPress={register}
                disabled={loading}
                loading={loading}
                style={[MyStyles.m, MyStyles.button]}
                labelStyle={MyStyles.buttonText}
                mode="contained"
            >
                Đăng ký
            </Button>
            <View style={{ height: "300px", width: "100%" }} />

        </ScrollView>

    )

}

export default Resgister;