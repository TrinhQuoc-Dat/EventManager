import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 10,
        paddingBottom: 200,
    },
    subject: {
        fontSize: 30,
        fontWeight: "bold",
        color: "blue",
        textAlign: "center",
        marginVertical: 20
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    }, ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
    wrap: {
        flexWrap: "wrap"
    },
    m: {
        margin: 8
    },
    p: {
        padding: 8
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "blue",
        alignSelf: "flex-start"
    },
    text: {
        fontSize: 16,
        color: "#333"
    },
    label: {
        fontWeight: "bold",
        marginBottom: 4,
        color: "#444"
    },
    button: {
        backgroundColor: "blue"
    },
    buttonText: {
        color: "#fff"
    },
    inputContainer: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3
            },
            android: {
                elevation: 3
            }
        })
    },
    input: {
        borderRadius: 10
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5
            },
            android: {
                elevation: 4
            }
        })
    },
    menuAnchor: {
        borderColor: "blue",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "#e6f0ff"
    },
    menuText: {
        color: "blue",
        fontWeight: "bold"
    },
    menuItem: {
        backgroundColor: "#f5faff"
    },
    menuItemTitle: {
        color: "#003399",
        fontSize: 16
    }
})