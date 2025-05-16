from firebase_admin import messaging


def send_push_notification(fcm_token, title, body):
    if not fcm_token:
        return False
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=fcm_token,
    )
    try:
        response = messaging.send(message)
        return True
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return False