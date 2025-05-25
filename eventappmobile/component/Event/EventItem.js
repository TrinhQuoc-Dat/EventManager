import moment from 'moment';
import { Image, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import 'moment/locale/vi';
import { Text } from 'react-native-paper';

moment.locale('vi');

const formatDateTime = (dateTime) => {
    return moment(dateTime).fromNow()
}

const EventItem = ({ event }) => {
    console.log(event);
    return (
        <TouchableOpacity style={styles.eventItem}>
            {event.image && (
                <Image source={{ uri: event.image }} style={styles.eventImage} />
            )}
            <View style={styles.eventDetails}>
                <Text style={styles.eventTitle} >{event.title}</Text>
                <View style={styles.infoRow}>
                    <MaterialIcons name="event" size={16} color="#555" />
                    <Text style={styles.infoText}>
                        {formatDateTime(event.start_date_time)}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color="#555" />
                    <Text style={styles.infoText}>
                        {`${event.location_name} (${event.location})`}
                    </Text>
                </View>
                <Text style={styles.price}>
                    Giá: {event.price === 0 ? 'Miễn phí' : `${event.price.toLocaleString('vi-VN')} VNĐ`}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default EventItem;