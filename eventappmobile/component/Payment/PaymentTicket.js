
import { Alert, Linking, View } from "react-native";
import { Button, Text, TextInput, Title } from "react-native-paper";
import { authApis, BASE_URL, endpoints } from "../../configs/Apis";
import { useRoute, useNavigation } from '@react-navigation/native';
import styles from "./styles";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from "../../service/NavigationService";
import { MyUserContext } from "../../configs/Context";

const PaymentTicket = () => {

    const route = useRoute();
    const { ticket, event } = route.params;

    const [transId,] = useState('');
    const [orderId,] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const user = useContext(MyUserContext);

    useEffect(() => {
        const handleUrl = (event) => {
            const openedAt = Date.now();
            const url = event.url;
            const params = new URLSearchParams(url.split('?')[1]);
            const resultCode = params.get('resultCode');
            const message = params.get('message') || '';

            const now = Date.now();
            const delay = now - openedAt;
            if (delay > 1000)
                if (resultCode === '0') {
                    handlePayment();
                    navigate('tabs', { screen: 'paymentHistory' });
                } else {
                    Alert.alert('❌ Thất bại', message || 'Thanh toán MoMo thất bại');
                }
        };

        const listener = Linking.addEventListener('url', handleUrl);

        Linking.getInitialURL().then((url) => {
            if (url) handleUrl({ url });
        });

        return () => {
            listener.remove();
        };
    }, []);

    const handlePayment = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).post(endpoints['payment'],
                {
                    ticket_id: ticket.id,
                    transId: transId,
                    orderId: orderId,
                    payment_method: 'payment',
                    discount_code: discountCode.trim(),
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
            if (err.response && err.response.status === 400) {
                const errors = err.response.data;
                for (let key in errors) {
                    Alert.alert(`${key}: ${errors[key][0]}`);
                }
            } else {
                Alert.alert('Lỗi', err.response?.data?.error || 'Thanh toán thất bại');
            }
            console.error(err.response?.data || err.message);
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
                <View style={styles.discountContainer}>
                    <TextInput
                        style={styles.discountInput}
                        value={discountCode}
                        onChangeText={setDiscountCode}
                        placeholder="Nhập mã giảm giá"
                        autoCapitalize="characters"
                    />
                </View>
                {user && user.role === "ADMIN" && (
                    <Button
                        icon="credit-card"
                        mode="contained"
                        onPress={handlePayment}
                        style={styles.buttonPament}
                    >
                        Thanh toán
                    </Button>)}

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