import React, { useEffect, useState } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, StyleSheet, Image, View } from 'react-native';
import { Bike } from './interfaces';

const ShowBikes: React.FC<{ bikes: Bike[]; region: any }> = ({ bikes, region }) => {
    // custom cluster då built in varianterna inte fungerade som önskat
    const [clusters, setClusters] = useState<any[]>([]);

    const getClusterThreshold = (latitudeDelta: number) => {
        if (latitudeDelta < 0.02) return 0.005;
        if (latitudeDelta < 0.04) return 0.0075;
        if (latitudeDelta < 0.06) return 0.01;
        if (latitudeDelta < 0.08) return 0.025;
        return 0.05;
    };

    useEffect(() => {
        if (!region) return;

        const threshold = getClusterThreshold(region.latitudeDelta);
        const clusteredBikes: any[] = [];
        const usedIndexes: Set<number> = new Set();

        if (threshold === 0.005) {
            setClusters(bikes.map((bike) => ({ coordinates: [bike.location[0], bike.location[1]], bikes: [bike] })));
            return;
        }

        bikes.forEach((bike, index) => {
            if (usedIndexes.has(index)) return;

            const cluster = { coordinates: [bike.location[0], bike.location[1]], bikes: [bike] };
            usedIndexes.add(index);

            bikes.forEach((otherBike, otherIndex) => {
                if (usedIndexes.has(otherIndex) || index === otherIndex) return;

                const distance =
                Math.abs(bike.location[0] - otherBike.location[0]) +
                Math.abs(bike.location[1] - otherBike.location[1]);
                if (distance <= threshold) {
                cluster.bikes.push(otherBike);
                usedIndexes.add(otherIndex);
                }
            });

            clusteredBikes.push(cluster);
        });

        setClusters(clusteredBikes);
    }, [bikes, region]);

    return (
        <>
        {clusters.map((cluster, index) => {
            const [latitude, longitude] = cluster.coordinates;
            const pointCount = cluster.bikes.length;

            if (pointCount > 1) {
                return (
                    <Marker key={index} coordinate={{ latitude, longitude }}>
                    <View style={styles.cluster}>
                        <Text style={styles.clusterText}>{pointCount}</Text>
                    </View>
                    </Marker>
                );
            } else {
                const bike = cluster.bikes[0];
                return (
                    <Marker key={index} coordinate={{ latitude, longitude }}>
                    <Image source={require('@/assets/images/scooter-pin-blue.png')} style={styles.icon} />
                    <Callout>
                        <View style={styles.calloutContainer}>
                        <Text style={styles.bold}>{bike.bike_id}</Text>
                        <Text>
                            <Text style={styles.bold}>Battery:</Text> {bike.status.battery_level}%
                        </Text>
                        <Text>
                            <Text style={styles.bold}>Status:</Text>{' '}
                            {bike.status.available ? 'Available' : 'In use'}
                        </Text>
                        </View>
                    </Callout>
                    </Marker>
                );
            }
        })}
        </>
    );
};

const styles = StyleSheet.create({
    bold: {
        fontWeight: 'bold'
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    calloutContainer: {
        width: 150,
        padding: 5
    },
    cluster: {
        width: 40,
        height: 40,
        backgroundColor: '#1A2E5A',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clusterText: {
        color: '#fff',
        fontWeight: 'bold'
    },
});

export default ShowBikes;
