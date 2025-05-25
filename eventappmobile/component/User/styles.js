import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
        justifyContent: 'flex-start',
    },

    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },

    userInfo: {
        marginLeft: 16,
        flex: 1,
    },

    name: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 6,
        color: '#333',
    },

    info: {
        fontSize: 16,
        color: '#555',
        marginBottom: 2,
    },

    logoutBtn: {
        marginTop: 10,
        backgroundColor: '#e53935',
        paddingVertical: 3,
        borderRadius: 8,
    },


});
