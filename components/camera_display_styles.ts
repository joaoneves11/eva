import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

    container: {
        width: "100%",
        flex: 4,       
        maxHeight: 300,
        marginVertical: 20
    },

    webViewContainer: {
        flex: 1
    },

    darkCover: {
        backgroundColor: 'black',
        height: "100%",
        width: "100%",
        position: 'absolute',
    }
});