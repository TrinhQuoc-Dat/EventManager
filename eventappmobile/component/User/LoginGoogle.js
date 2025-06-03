
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import React from 'react';
// import { Linking, View } from 'react-native';
// import { Button } from 'react-native-paper';

// const GoogleLogin = () => {
//   const handleLogin = async () => {
//     const oauthUrl = `https://accounts.google.com/o/oauth2/auth?` +
//       `client_id=708848403876-6ooe33cah6p0f1343ll7fqj2bnt9dfin.apps.googleusercontent.com&` +
//       `redirect_uri=http%3A%2F%2F10.0.2.2%3A8000%2Foauth%2Fcomplete%2Fgoogle-oauth2%2F&` +
//       `response_type=code&scope=openid%20email%20profile&state=abc123`;

//     let res = await Linking.openURL(oauthUrl);
//     console.info(res);
//   };

//   return (
//     <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
//       <Button
//         mode="contained"
//         onPress={() => handleLogin()}
//         icon={() => <MaterialCommunityIcons name="google" size={20} color="white" />}
//         contentStyle={{ flexDirection: 'row-reverse' }}
//         style={{
//           backgroundColor: '#DB4437',
//           borderRadius: 4,
//         }}
//         labelStyle={{
//           color: 'white',
//           fontWeight: 'bold',
//         }}
//       >
//         Đăng nhập bằng Google
//       </Button>
//     </View>
//   );
// };

// export default GoogleLogin;



// import React, { useEffect, useState } from 'react';
// import { Button, Text, View } from 'react-native';
// import * as AuthSession from 'expo-auth-session';

// const CLIENT_ID = '708848403876-6ooe33cah6p0f1343ll7fqj2bnt9dfin.apps.googleusercontent.com';
// const REDIRECT_URI = AuthSession.makeRedirectUri({
//   // nếu dùng expo managed, để default
//   useProxy: true
// });

// console.log(REDIRECT_URI);

// export default function GoogleLogin() {
//   const [userInfo, setUserInfo] = useState(null);

//   const discovery = {
//     authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
//     tokenEndpoint: 'https://oauth2.googleapis.com/token',
//     userInfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
//   };

//   const [request, response, promptAsync] = AuthSession.useAuthRequest(
//     {
//       clientId: CLIENT_ID,
//       scopes: ['openid', 'profile', 'email'],
//       redirectUri: REDIRECT_URI,
//     },
//     discovery

    
//   );

//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { access_token } = response.params;
//       fetchUserInfo(access_token);
//     }
//   }, [response]);

//   const fetchUserInfo = async (token) => {
//     const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const user = await res.json();
//     setUserInfo(user);
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button disabled={!request} title="Login with Google" onPress={() => promptAsync()} />
//       {userInfo && (
//         <View style={{ marginTop: 20 }}>
//           <Text>Welcome {userInfo.name}</Text>
//           <Text>Email: {userInfo.email}</Text>
//         </View>
//       )}
//     </View>
//   );
// }



import * as React from 'react';
import { Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthRequest } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '708848403876-6ooe33cah6p0f1343ll7fqj2bnt9dfin.apps.googleusercontent.com',
    iosClientId: '708848403876-p3cm23cc6f8mjen9hnaro8gb7121j24s.apps.googleusercontent.com',
    androidClientId: '708848403876-4q7jfivv53uu9rdidct88t5q9388omgq.apps.googleusercontent.com',
    webClientId: '708848403876-6ooe33cah6p0f1343ll7fqj2bnt9dfin.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Access Token:', authentication.accessToken);
      // Call your backend here
    }
  }, [response]);

  return <Button disabled={!request} title="Login with Google" onPress={() => promptAsync()} />;
}
