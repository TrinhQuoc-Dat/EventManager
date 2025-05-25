import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Text } from 'react-native-paper';
import { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const ScannerTicket = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [checkin, setCheckIn] = useState(null);
  const [status, setStatus] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    const res = await requestPermission();
    if (res.granted) {
      setShowCamera(true);
    } else {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền camera.');
    }
  };

  const fetchCheckIn = async (qrCode) => {
    setScanned(true);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await authApis(token).post(endpoints['checkin'](qrCode));
      if (res.status === 201) {
        setCheckIn(res.data);
        setStatus('success');
      } else if (res.status === 200) {
        setStatus('warning');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Check-in thất bại';
      console.log("error: ", message);
      setStatus('fail');
    } finally {
      setShowCamera(false);
      setLoading(false);
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showCamera ? (
        <>
          {status === 'success' && checkin && (
            <View style={styles.messageBox}>
              <Icon name="check-circle-outline" size={28} color="green" style={{ marginBottom: 8 }} />
              <Text style={[styles.messageText, { color: 'green' }]}>{checkin.message}</Text>
              <Text style={styles.fontSize}>User: {checkin.user}</Text>
              <Text style={styles.fontSize}>Sự kiện: {checkin.event}</Text>
              <Text style={styles.fontSize}>Vé: {checkin.ticket}</Text>
            </View>
          )}
          {status === 'fail' && (
            <View style={styles.errorBox}>
              <Icon name="close-circle-outline" size={28} color="#b20000" style={{ marginBottom: 8 }} />
              <Text style={[styles.messageText, { color: '#b20000' }]}>Check-in thất bại, vui lòng thử lại</Text>
            </View>
          )}
          {status === 'warning' && (
            <View style={styles.warningBox}>
              <Icon name="alert-circle-outline" size={28} color="#996600" style={{ marginBottom: 8 }} />
              <Text style={[styles.messageText, { color: '#996600' }]}>Vé đã Check-in</Text>
            </View>
          )}
          <Button mode="contained" icon="qrcode-scan"
            onPress={handleRequest}
            style={styles.openCameraButton}
            labelStyle={styles.openCameraLabel}
          >
            Mở Camera
          </Button>
        </>
      ) : (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={({ data }) => {
              if (!scanned) {
                fetchCheckIn(data); // chỉ gọi 1 lần
              }
            }}
          />
          {loading && (
            <Text style={{ marginTop: 10, fontSize: 16 }}>Đang xử lý...</Text>
          )}
          <Button
            mode="contained"
            onPress={() => setShowCamera(false)}
            style={styles.openCameraButton}
            labelStyle={styles.openCameraLabel}
          >
            Đóng Camera
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageBox: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#e6f9f0',
    borderLeftWidth: 5,
    borderLeftColor: 'green',
  },
  warningBox: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff3cd',
    borderLeftWidth: 5,
    borderLeftColor: '#ffcc00',
  },
  errorBox: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fdecea',
    borderLeftWidth: 5,
    borderLeftColor: '#ff4d4f',
  },
  messageText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  openCameraButton: {
    backgroundColor: '#3f51b5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    marginTop: 20,
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  openCameraLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  fontSize:{
     fontSize: 16,
  }
});


export default ScannerTicket;
