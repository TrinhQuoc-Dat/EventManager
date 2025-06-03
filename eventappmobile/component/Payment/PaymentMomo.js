import React, { useEffect } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../configs/Apis';

const PaymentMomo = ({ ticketId, amount }) => {

    useEffect(() => {
        const payWithMomo = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await fetch(`${BASE_URL}/api/payment/momo/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: amount,
                        ticket_id: ticketId,
                    }),
                });

                const data = await response.json();

                if (data && data.payUrl) {
                    const result = await WebBrowser.openBrowserAsync(data.payUrl);
                    print(result);
                } else {
                    Alert.alert('Lỗi', 'Không lấy được liên kết thanh toán');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Lỗi', 'Không thể thực hiện thanh toán');
            }
        };

        payWithMomo();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
};

export default PaymentMomo;
