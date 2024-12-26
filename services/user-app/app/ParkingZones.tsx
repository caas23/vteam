import React from "react";
import { Marker, Callout, Polygon } from "react-native-maps";
import { ParkingZone } from "./interfaces";
import calculateCentroid from "./Calculations";
import { Text, StyleSheet, Image } from "react-native";

const ShowParkingZones: React.FC<{ zones: ParkingZone[] }> = ({ zones }) => {
  return (
    <>
      {zones.map((zone) => {
        const center = calculateCentroid(zone.area);

        return (
          <React.Fragment key={zone.parking_id}>
            <Polygon
              coordinates={zone.area.map((point) => ({
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
                source={require('@/assets/images/parking-spot-blue.png')}
                style={styles.icon}
              />
              <Callout>
                <Text style={styles.calloutContainer}>{zone.parking_id}</Text>
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

export default ShowParkingZones;
