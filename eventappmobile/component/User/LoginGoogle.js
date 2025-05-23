
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, View } from 'react-native';
import { Button } from 'react-native-paper';

const GoogleLogin = () => {
  const handleLogin = async () => {
    const oauthUrl = `https://accounts.google.com/o/oauth2/auth?` +
      `client_id=708848403876-6ooe33cah6p0f1343ll7fqj2bnt9dfin.apps.googleusercontent.com&` +
      `redirect_uri=http%3A%2F%2F10.0.2.2%3A8000%2Foauth%2Fcomplete%2Fgoogle-oauth2%2F&` +
      `response_type=code&scope=openid%20email%20profile&state=abc123`;

    let res = await Linking.openURL(oauthUrl);
    console.info(res);
  };

  return (
    <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
      <Button
        mode="contained"
        onPress={() => handleLogin()}
        icon={() => <MaterialCommunityIcons name="google" size={20} color="white" />}
        contentStyle={{ flexDirection: 'row-reverse' }}
        style={{
          backgroundColor: '#DB4437',
          borderRadius: 4,
        }}
        labelStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        Đăng nhập bằng Google
      </Button>
    </View>
  );
};

export default GoogleLogin;

