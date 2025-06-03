// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { authApis, endpoints } from "../configs/Apis";

// const saveFCMToken = async () => {
//   try {
//     const token = await messaging().getToken();
//     const authToken = await AsyncStorage.getItem('token');
//     if (authToken) {
//       await authApis(authToken).post(endpoints['fcm-token'], { fcm_token: token });
//       console.log('FCM token saved:', token);
//     }
//   } catch (error) {
//     console.error('Error saving FCM token:', error);
//   }
// };

// const requestPermission = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log('Authorization status:', authStatus);
//     await saveFCMToken();
//   }
// };

// const setupFCM = () => {
//   messaging().onTokenRefresh(saveFCMToken);
//   messaging().onMessage(async (remoteMessage) => {
//     console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
//     // Xử lý thông báo khi ứng dụng đang chạy
//     Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
//   });
// };

// export { requestPermission, setupFCM };