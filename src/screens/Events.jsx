import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";
import Moment from "moment";
import { Linking } from "react-native";

const Events = () => {
  /*  const handleDireccion = (latitud,longitud) => {

    } */

  const events = useSelector((state) => state.eventsGuard);
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={{ marginBottom: 20 }}>🗓️​ EVENTOS</Text>
        {events
          .filter(
            (event) =>
              event.start.split("T")[0] >=
              Moment(new Date()).format("YYYY-MM-DD")
          )
          .map((event) => {
            return (
              <View key={event.id} style={styles.events}>
                <Text>{`🔹​${Moment(event.date).format("LL")}`}</Text>
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      `https://maps.google.com/?q=${event?.branchoffice.latitude},${event?.branchoffice.longitude}`
                    )
                  }
                >
                  
                  <Text style={{color:"blue",}}>
                    <Text style={{ fontWeight: "bold", color:"black" }}>Dirección: </Text>
                    {event.branchoffice.adress}
                  </Text>
                </Pressable>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>Comienza: </Text>
                  {`${event.start.split("T")[1].slice(0, 5)}hs`}
                </Text>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>Termina: </Text>
                  {`${event.end.split("T")[1].slice(0, 5)}hs`}
                </Text>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 40,
    marginTop: 20,
    alignItems: "center",
  },
  events: {
    marginBottom: 20,
  },
});

export default Events;
