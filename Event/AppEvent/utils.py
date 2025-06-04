# from firebase_admin import messaging
import requests

def send_push_notification(tokens, title, body, data=None):
    url = "https://exp.host/--/api/v2/push/send"
    messages = []
    for token in tokens:
        messages.append({
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
            "data": data or {},
        })
    # Expo API cho phép gửi tối đa 100 notifications/lần
    response = requests.post(url, json=messages, headers={
        "Accept": "application/json",
        "Content-Type": "application/json",
    })