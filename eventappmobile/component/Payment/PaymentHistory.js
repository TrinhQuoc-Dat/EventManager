import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [qrCode, setQrCode] = useState(null);


  const fetchPayments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await authApis(token).get(endpoints['payment-history']);
      setPayments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async (payment_id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await authApis(token).get(`${endpoints['qr-code']}?payment_id=${payment_id}`);
      setQrCode(res.data.qr_code)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, [page]);


  const handelQrCode = async (payment_id) => {

  }

  const openModal = async (payment) => {
    await fetchQRCode(payment.id);
    setSelectedPayment(payment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPayment(null);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)} style={styles.itemContainer}>
            <Text style={styles.content}>{item.content}</Text>
            <Text>Số tiền: {item.amount.toLocaleString()} VND</Text>
            <Text>Phương thức: {item.payment_method}</Text>
            <Text>Trạng thái: {item.status}</Text>
            <Text>Ngày: {new Date(item.created_date).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Không có lịch sử thanh toán.</Text>}
      />

      {/* Modal hiện QR Code */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 20, fontWeight: 'bold' }}>Mã QR cho giao dịch</Text>
            {selectedPayment && (
              <QRCode
                value={qrCode}
                size={200}
              />
            )}
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={{ color: 'white' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentHistory;
