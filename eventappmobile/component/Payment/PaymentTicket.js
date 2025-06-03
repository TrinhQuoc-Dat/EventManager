import { Alert, Linking, View } from "react-native";
import { Button, Text, Title } from "react-native-paper";
import { authApis, BASE_URL, endpoints } from "../../configs/Apis";
import { useRoute, useNavigation } from '@react-navigation/native';
import styles from "./styles";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from "../../service/NavigationService";
import PaymentMomo from "./PaymentMomo";

const PaymentTicket = () => {

    const route = useRoute();
    const { ticket, event } = route.params;

    const [transId,] = useState('');
    const [orderId,] = useState('');

    const handlePayment = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).post(endpoints['payment'],
                {
                    ticket_id: ticket.id,
                    transId: transId,
                    orderId: orderId,
                    payment_method: 'payment',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            Alert.alert('Thanh toán thành công');
            navigate('tabs', {
                screen: 'paymentHistory',
            });
        } catch (err) {
            console.error(err.response?.data || err.message);
            Alert.alert('Lỗi', err.response?.data?.error || 'Thanh toán thất bại');
        }
    };


    const handlePaymentMOMO = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            console.log(`${BASE_URL}api/payment-ticket/payment/momo/`);

            const formData = new FormData();
            formData.append("amount", parseInt(ticket.ticket_price));
            formData.append("ticket_id", ticket.id);

            const response = await fetch(`${BASE_URL}api/payment-ticket/payment/momo/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const data = await response.json();

            if (data && data.payUrl) {
                Linking.openURL(data.payUrl);
            } else {
                Alert.alert('Lỗi', 'Không lấy được liên kết thanh toán');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể thực hiện thanh toán');
        }

    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>🎯 Xác nhận Thanh toán</Text>

                <View style={styles.row}>
                    <Icon name="event" size={20} color="#4caf50" />
                    <Text style={styles.label}> Sự kiện: {event?.title}</Text>
                </View>

                <View style={styles.row}>
                    <Icon name="confirmation-number" size={20} color="#2196f3" />
                    <Text style={styles.label}> Vé: {ticket?.name}</Text>
                </View>

                <View style={styles.row}>
                    <Icon name="attach-money" size={20} color="#e91e63" />
                    <Text style={styles.label}>
                        {' '}
                        Giá: <Text style={styles.price}> {ticket?.ticket_price.toLocaleString('vi-VN')}  VNĐ</Text>
                    </Text>
                </View>

                <Button
                    icon="credit-card"
                    mode="contained"
                    onPress={handlePayment}
                    style={styles.buttonPament}
                >
                    Thanh toán
                </Button>
                <Button
                    icon="account-balance-wallet"
                    mode="contained"
                    onPress={handlePaymentMOMO}
                    style={[styles.buttonPament, styles.momoButton]}
                >
                    Thanh toán bằng MOMO
                </Button>
            </View>
        </View>
    );
}

export default PaymentTicket;