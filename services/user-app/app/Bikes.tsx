import React, { useEffect, useState, useRef } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, StyleSheet, Image, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Bike, User, ParkingZone, ChargingStation } from './interfaces';
import fetchRentBike from './fetchModels/fetchRentBike';
import fetchZones from './fetchModels/fetchZones';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';
import robustPointInPolygon from 'robust-point-in-polygon';

const ShowBikes: React.FC<{ bikes: Bike[]; region: any; userData: User }> = ({ bikes, region, userData }) => {
    // custom cluster as the built in variants did not work as desired
    const [clusters, setClusters] = useState<any[]>([]);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [tripStartTime, setTripStartTime] = useState<number | null>(null);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [estimatedPrice, setEstimatedPrice] = useState<number>(10);
    const [currentBatteryLevel, setCurrentBatteryLevel] = useState<number | null>();
    const [currentBike, setCurrentBike] = useState<Bike>();
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>();
    const [userId, setUserId] = useState<string>();
    const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
    const [chargingZones, setChargingZones] = useState<ChargingStation[]>([]);
    const navigation = useNavigation();
    const locationSubscription = useRef<any>(null);
    const socket = useRef<Socket | null>(null); 

	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };

    useEffect(() => {
        if (!socket.current) {
            socket.current = io(BACKEND_URL);
        }

        socket.current.on('forceStopApp', () => {
            setOverlayVisible(false);
            try {
                setTripStartTime(null);
                setTimeElapsed(0);
        
                if (locationSubscription.current) {
                    clearInterval(locationSubscription.current);
                    locationSubscription.current = null;
                }
            } catch (e) {
                alert(`An error occurred: ${e}`);
            } finally {
                Alert.alert(
                    'Trip force stopped',
`Your trip was stopped by admin, contact support for more info.
You will be redirected to your trips, 
and be able to see a summary of this trip, in just a moment...`,
                [{ text: 'Close' }]);
                setTimeout(() => {
                    navigation.navigate('account' as never);
                }, 5000);
            }
        });

        const getUserInfo = async () => {
            const location = await Location.getCurrentPositionAsync({ 
                accuracy: Location.Accuracy.High 
            });
            setUserLocation(location);
            setUserId(userData.user_id)

        }
        
        const getParkingZones = async () => {
            const parking = await fetchZones('parking');
            setParkingZones(parking)
        }
        
        const getChargingZones = async () => {
            const charging = await fetchZones('charging');
            setChargingZones(charging)
        }
        
        getParkingZones();
        getChargingZones();
        
        getUserInfo();
        return () => {
            socket.current?.disconnect();
        };

    }, []);

    const bikeInParkingZone = (position: [number, number]) => {
        for (const zone of parkingZones) {
            const result = robustPointInPolygon(zone.area, position)
            if (result != 1) return true
        }
        return false
    }
    
    const bikeInChargingZone = (position: [number, number]) => {
        for (const zone of chargingZones) {
            const result = robustPointInPolygon(zone.area, position)
            if (result != 1) return true
        }
        return false
    }

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

    function calculateBatteryDrain(speed: number) {
        if (speed <= 5) return 0.1;
        else if (speed <= 15) return 0.2;
        else if (speed <= 20) return 0.3;
        else return 0.5;
    }

    const emitBikeData = async (bike: Bike, startTime: number) => {
        if (userLocation) {
            const { latitude, longitude, speed } = userLocation.coords;
            const position = [parseFloat(latitude.toFixed(5)), parseFloat(longitude.toFixed(5))];
            const speedInKmH = speed && (speed <= 0 ? 0 : (speed * 3.6).toFixed(1));
        
            const batteryDrain = speedInKmH ? calculateBatteryDrain(parseFloat(speedInKmH)) : 0;

            setCurrentBatteryLevel((prevBatteryLevel) => {
                if (prevBatteryLevel) {
                    const newBatteryLevel = Math.max(0, prevBatteryLevel - batteryDrain);
                    socket.current?.emit('bikeInUseApp', {
                        bikeId: bike.bike_id,
                        parking: bike.status.parking,
                        startTime: new Date(startTime),
                        position,
                        speed: speedInKmH,
                        battery: newBatteryLevel.toFixed(1),
                    });
                    return newBatteryLevel;
                }
                return prevBatteryLevel;
            });
        }
    };

    const handleRent = async (bike: Bike) => {
        let message;
        if (userData.payment_method == "Monthly") {
            message = `Your chosen payment method is monthly payment, you will be charged for the trip at the end of the month.`
        } else {
            message = `Your chosen payment method is prepayment, if your current balance does not cover the cost of the trip you will instead be charged for the trip at the end of the month.`
        }
        Alert.alert(
            "Terms for bike rental",
            `${message}`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Accept", onPress: () => {
                        setOverlayVisible(true);
                        try {
                            setCurrentBatteryLevel(bike.status.battery_level);
                            setCurrentBike(bike);
                            const startTime = Date.now();
                            emitBikeData(bike, startTime);
    
                            // start interval for emitting bike data
                            locationSubscription.current = setInterval(() => {
                                emitBikeData(bike, startTime);
                            }, 1000);
    
                            setTripStartTime(startTime);
                            fetchRentBike(bike);
                        } catch (e) {
                            alert(`An error occurred: ${e}`);
                        }
                    },
                },
            ], { cancelable: false }
        );
    };

    const handleReturnBike = () => {
        Alert.alert(
            "Return bike",
            `Your chosen location for parking can affect the price of the trip, do you want to park here?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Park", onPress: () => {
                        setOverlayVisible(false);
                        try {
                            setTripStartTime(null);
                            setTimeElapsed(0);
                            const endTime = Date.now();
                    
                            if (locationSubscription.current) {
                                clearInterval(locationSubscription.current);
                                locationSubscription.current = null;
                            }
                            if (userLocation && currentBike && userId) {
                                const { latitude, longitude } = userLocation.coords;
                                const position = [latitude, longitude];
          
                                const atParking = bikeInParkingZone([latitude, longitude])
                                const atCharging = bikeInChargingZone([latitude, longitude])
                                
                                socket.current?.emit('bikeNotInUseApp', {
                                    bikeId: currentBike.bike_id,
                                    parking: atParking,
                                    charging: atCharging,
                                    endTime: new Date(endTime),
                                    position,
                                    price: estimatedPrice.toFixed(2),
                                    battery: currentBatteryLevel?.toFixed(1),
                                    userId
                                });
                            }

                            Alert.alert(
                                'Trip finished',
`You will be redirected to your trips, 
and be able to see a summary of this trip, in just a moment...`,
                            [{ text: 'Close' }]);
                            setTimeout(() => {
                                navigation.navigate('account' as never);
                            }, 5000);
                    
                        }  catch (e) {
                            alert(`An error occurred: ${e}`);
                        }
                    },
                },
            ], { cancelable: false }
        );
    };
    
    useEffect(() => {
        if (overlayVisible && tripStartTime) {
            const timer = setInterval(() => {
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - tripStartTime) / 1000);
                setTimeElapsed(elapsedSeconds);

                const price = (elapsedSeconds / 60) * 2.5 + 10;
                setEstimatedPrice(price);
            }, 200);

            return () => clearInterval(timer);
        }
    }, [overlayVisible]);

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
                        <Callout style={styles.btnCallout} onPress={() => handleRent(bike)}>
                        {userData.payment_method != "" && !userData.banned && (
                        <TouchableOpacity
                            style={styles.rentButton}
                        >
                            <Text style={styles.rentButtonText}>Rent</Text>
                        </TouchableOpacity>
                		)}
                        </Callout>
                        </View>
                    </Callout>
                    </Marker>
                );
            }
        })}
        <Modal visible={overlayVisible} transparent animationType='slide'>
            <View style={styles.overlayContainer}>
                <Text style={styles.overlayHeader}>You are renting a bike ...</Text>
                <Text style={styles.overlayItalic}>Drive safe!</Text>
                <Text style={styles.overlayText}>Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</Text>
                <Text style={styles.overlayText}>Estimated cost: {estimatedPrice.toFixed(2)} SEK</Text>
                <TouchableOpacity style={styles.returnBikeButton} onPress={handleReturnBike}>
                    <Text style={styles.returnBikeButtonText}>Return bike</Text>
                </TouchableOpacity>
            </View>
        </Modal>
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
        height: 100,
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
    btnCallout: {
        paddingTop: 28,
        width: 150
    },
    rentButton: {
        marginTop: 10,
        backgroundColor: '#2E6DAE',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    rentButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    overlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        paddingBottom: 50
    },
    overlayText: {
        color: '#fff',
        fontSize: 22,
        marginBottom: 10
    },
    overlayHeader: {
        color: '#fff',
        fontSize: 28,
        marginBottom: 5,
        position: 'absolute',
        top: 150
    },
    overlayItalic: {
        color: '#fff',
        fontSize: 20,
        fontStyle: 'italic',
        marginBottom: 5,
        position: 'absolute',
        top: 200
    },
    returnBikeButton: {
        position: 'absolute',
        bottom: 150,
        width: '90%',
        padding: 20,
        backgroundColor: '#D32F2F',
        borderRadius: 5,
    },
    returnBikeButtonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center'
    },
});

export default ShowBikes;
