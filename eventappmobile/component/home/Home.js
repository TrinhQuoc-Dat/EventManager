import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Text } from "react-native-paper";

const Home = () => {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View>
                <Text>Helloword</Text>
            </View>

        </KeyboardAvoidingView>
    );
}

export default Home;