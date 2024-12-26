import React from "react";
import { Marker, Callout, Polygon } from "react-native-maps";
import { ChargingStation } from "./interfaces";
import calculateCentroid from "./Calculations";
import { Text, StyleSheet, Image } from "react-native";

const ShowChargingStations: React.FC<{ stations: ChargingStation[] }> = ({ stations }) => {
  return (
    <>
      {stations.map((station) => {
        const center = calculateCentroid(station.area);

        return (
          <React.Fragment key={station.charging_id}>
            <Polygon
              coordinates={station.area.map((point) => ({
                latitude: point[0],
                longitude: point[1],
              }))}
              fillColor='#DFF2F9'
              strokeColor='#2E6DAE'
            />
            <Marker
              coordinate={{
                latitude: center[0],
                longitude: center[1],
              }}
            >
              <Image
                source={require('@/assets/images/charging-station-blue.png')}
                style={styles.icon}
              />
              <Callout>
                <Text style={styles.calloutContainer}>{station.charging_id}</Text>
              </Callout>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    fontWeight: "bold",
    width: 75,
    padding: 5,
    textAlign: "center"
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
});

export default ShowChargingStations;
