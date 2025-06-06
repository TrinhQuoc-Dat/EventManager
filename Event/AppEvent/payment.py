import json
import uuid
import requests
import hmac
import hashlib
from EventApi import settings


def create_momo_payment(amount, user_id, ticket_id, order_info, redirect_url, ipn_url):
    endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
    partnerCode = "MOMO"
    accessKey = "F8BBA842ECF85"
    secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
    orderInfo = order_info
    redirectUrl = redirect_url
    ipnUrl = ipn_url
    amount = amount
    orderId = str(uuid.uuid4())
    requestId = str(uuid.uuid4())
    requestType = "captureWallet"
    extraData = json.dumps({
        "user": user_id,
        "ticket": ticket_id
    })

    rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType

    h = hmac.new(bytes(secretKey, 'utf-8'), bytes(rawSignature, 'utf-8'), hashlib.sha256)
    signature = h.hexdigest()

    data = {
        'partnerCode': partnerCode,
        'partnerName': "Test",
        'storeId': "MomoTestStore",
        'requestId': requestId,
        'amount': amount,
        'orderId': orderId,
        'orderInfo': orderInfo,
        'redirectUrl': redirectUrl,
        'ipnUrl': ipnUrl,
        'lang': "vi",
        'extraData': extraData,
        'requestType': requestType,
        'signature': signature,
    }
    data = json.dumps(data)

    clen = len(data)
    response = requests.post(endpoint, data=data,
                             headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})

    print(response.json())
    return response.json()

if __name__ == "__main__":
    order_info = "Thanh toán sự kiện"
    redirect_url = settings.DOMAIN + "/ticket/payment-success/"
    ipn_url = settings.DOMAIN + "/ticket/payment-ipn/"

    result = create_momo_payment(
        amount="50000",
        user_id=1,
        ticket_id=6,
        order_info=order_info,
        redirect_url=redirect_url,
        ipn_url=ipn_url,
    )
    create_momo_payment()

