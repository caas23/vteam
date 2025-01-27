import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Image, StyleSheet, View, Text, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback, Animated, ActivityIndicator } from 'react-native';
import MapView, { Region, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';
import fetchCities from '../fetchModels/fetchCities';
import fetchCityProps from '../fetchModels/fetchCityProps';
import ShowParkingZones from '../ParkingZones';
import ShowChargingStations from '../ChargingStations';
import ShowBikes from '../Bikes';
import { City, User as UserInterface } from '../interfaces';
import { useAuth } from '../AuthCheck';
import { useNavigation, useFocusEffect } from 'expo-router';
import io from 'socket.io-client';
import fetchOneUserByGitId from '../fetchModels/fetchOneUser';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const MapTab: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const navigation = useNavigation();
	const socket = useRef<ReturnType<typeof io> | null>(null);
	const [cities, setCities] = useState<{ name: string; value: string }[]>([]);
	const [cityCenter, setCityCenter] = useState<LatLng | null>(null);
	const [availableZones, setAvailableZones] = useState<any[]>([]);
	const [availableStations, setAvailableStations] = useState<any[]>([]);
	const [bikesInCity, setBikesInCity] = useState<any[]>([]);
	const [selectedCity, setSelectedCity] = useState<string>('current');
	const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
	const [animationValue] = useState(new Animated.Value(0));
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingCities, setLoadingCities] = useState<boolean>(true);
	const [region, setRegion] = useState<Region | null>(null);
	const mapRef = useRef<MapView | null>(null);
	const [userData, setUserData] = useState< UserInterface | null | undefined >(undefined);

	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };

	const fetchUserData = async () => {
		const storedUser = await SecureStore.getItemAsync('user')
		try {
			const result = await fetchOneUserByGitId(storedUser ? JSON.parse(storedUser).id : null)
			setUserData(result[0])
		} catch {
			setUserData(null);
		}
	};

	useEffect(() => {
        if (!socket.current) {
			socket.current = io(BACKEND_URL);
		}
        
		const isBikeInViewport = (bikeLocation: [number, number], region: Region) => {
			const latMin = region.latitude - region.latitudeDelta / 2;
			const latMax = region.latitude + region.latitudeDelta / 2;
			const lonMin = region.longitude - region.longitudeDelta / 2;
			const lonMax = region.longitude + region.longitudeDelta / 2;
	
			return (
				bikeLocation[0] >= latMin &&
				bikeLocation[0] <= latMax &&
				bikeLocation[1] >= lonMin &&
				bikeLocation[1] <= lonMax
			);
		};

		// add available bikes to the map
        socket.current.on('bikeOnAppMap', (data: {
			bikeId: string;
			position: [number, number];
			battery: number;
            forceUpdate?: boolean; 
		}) => {
			// only update bikes that are in the current viewport
			// or if it is specifically stated that a bike should be updated (via forceUpdate)
			if ((region && isBikeInViewport(data.position, region)) || data.forceUpdate) {
				setBikesInCity((prevBikes) =>
					prevBikes.map((bike) =>
						bike.bike_id === data.bikeId ? {
							...bike,
							location: data.position,
							speed: 0,
							status: {
								...bike.status,
								battery_level: data.battery,
								available: true,
							}
						} : bike
					)
				);
			}
        });
        
		// remove rented bikes from the map
		socket.current.on('bikeOffAppMap', (data: {
			bikeId: string;
			position: [number, number];
			forceUpdate?: boolean;
		}) => {
			// only update bikes that are in the current viewport
			// or if it is specifically stated that a bike should be updated (via forceUpdate)
			if ((region && isBikeInViewport(data.position, region)) || data.forceUpdate) {
				setBikesInCity((prevBikes) =>
					prevBikes.map((bike) =>
						bike.bike_id === data.bikeId ? {
							...bike,
							status: {
								...bike.status,
								available: false 
							}
						} : bike
					)
				);
			}
        });

        return () => {
			socket.current?.off("bikeOnAppMap");
			socket.current?.off("bikeOffAppMap");
            socket.current?.disconnect();
        };
    }, []);

	useFocusEffect(
		useCallback(() => {
			if (!isAuthenticated) {
				navigation.navigate('index' as never);
				Alert.alert(
					'Authentication Required',
					'You need to be logged in to access this page.',
					[{ text: 'OK' }]
				);
			} else {
				fetchCitiesData();
				fetchUserData();
			}
		}, [isAuthenticated, navigation])
	);

	const handleRegionChangeComplete = (newRegion: Region) => {
		setRegion(newRegion);
	};

	const fetchCitiesData = async () => {
		try {
			let citiesData = await fetchCities();
			while (!citiesData) citiesData = await fetchCities();

			const formattedCities = citiesData.map((city: City) => ({
				name: city.display_name,
				value: city.name,
			}));
			formattedCities.push({ name: 'My current city', value: 'current' });

			setCities(formattedCities);
			setLoadingCities(false);
		} catch (error) {
			// console.error('Error fetching cities:', error);
			return [];
		}
	};

	const fetchCityCenter = async (cityName: string) => {
		if (cityName === 'current') {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
					if (status !== 'granted') {
						console.error('Permission to access location denied.');
						return;
					}
					const { coords } = await Location.getCurrentPositionAsync({});
					const newCenter: LatLng = { latitude: coords.latitude, longitude: coords.longitude };
					setCityCenter(newCenter);
					mapRef.current?.animateToRegion({
						...newCenter,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					});
			} catch (error) {
				return [];
			}
		} else {
			try {
				const response = await fetch(
				`https://nominatim.openstreetmap.org/search.php?q=${cityName}&countrycodes=se&format=json&addressdetails=1&limit=1`
				);
				const data = await response.json();
				if (data?.length) {
					const cityData = data[0];
					const newCenter: LatLng = {
					latitude: parseFloat(cityData.lat),
					longitude: parseFloat(cityData.lon)
				};
				setCityCenter(newCenter);
				mapRef.current?.animateToRegion({
					...newCenter,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				});
				}
			} catch (error) {
				return [];
			}
		}
	};

	useEffect(() => {
		const fetchCityData = async () => {
			if (selectedCity !== 'current') {
				setLoading(true);
				try {
					let parkingData = await fetchCityProps(selectedCity, 'parking');
					while (!parkingData.length) parkingData = await fetchCityProps(selectedCity, 'parking');

					let chargingData = await fetchCityProps(selectedCity, 'charging');
					while (!chargingData.length) chargingData = await fetchCityProps(selectedCity, 'charging');

					let bikeData = await fetchCityProps(selectedCity, 'bikes');
					while (!bikeData.length) bikeData = await fetchCityProps(selectedCity, 'bikes');

					setAvailableZones(parkingData);
					setAvailableStations(chargingData);
					setBikesInCity(bikeData);
				} catch (error) {
					return [];
				} finally {
					setLoading(false);
				}
			}
		};

		fetchCityCenter(selectedCity);
		fetchCityData();
	}, [selectedCity]);

	useEffect(() => {
		Animated.spring(animationValue, {
			toValue: isDropdownVisible ? 1 : 0,
			useNativeDriver: true,
		}).start();
	}, [isDropdownVisible]);

	const closeModal = () => {
		Animated.spring(animationValue, {
			toValue: 0,
			useNativeDriver: true,
		}).start(() => setDropdownVisible(false));
	};	

	if (loadingCities || loading || !cityCenter) {
		return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="large" color="#09223A" />
			<Text>Loading city data...</Text>
		</View>
		);
	}

	return (
		<View style={styles.container}>
		{userData?.payment_method == "" && (
			<View style={styles.banner}>
				<Text style={styles.bannerText}>Add a payment method to be able to rent a bike</Text>
			</View>
		)}
		{userData?.banned && (
			<View style={styles.banner}>
				<Text style={styles.bannerText}>You are not able to rent any bikes, contact account@soloscoot.com for more information.</Text>
			</View>
		)}
		<Image source={require('@/assets/images/solo-scoot-logo.png')} style={styles.soloScootLogo} />
		<MapView
			ref={mapRef}
			style={styles.map}
			region={{
				latitude: cityCenter.latitude,
				longitude: cityCenter.longitude,
				latitudeDelta: 0.0922,
				longitudeDelta: 0.0421,
			}}
			onRegionChangeComplete={handleRegionChangeComplete}
		>
			<ShowParkingZones zones={availableZones} />
			<ShowChargingStations stations={availableStations} />
			{bikesInCity.length > 0 && region && userData &&
				<ShowBikes
					bikes={bikesInCity.filter((bike) => bike.status.available)}
					region={region}
					userData={userData}
				/>}
		</MapView>
		<TouchableOpacity
			style={styles.dropdownButton}
			onPress={() => setDropdownVisible(true)}
		>
			<Text style={styles.dropdownButtonText}>Choose city</Text>
		</TouchableOpacity>
		{isDropdownVisible && (
			<Modal transparent visible animationType="fade" onRequestClose={closeModal}>
			<TouchableWithoutFeedback onPress={closeModal}>
				<View style={styles.modalOverlay}>
				<Animated.View style={[styles.dropdown, { transform: [{ scale: animationValue }] }]}>
					<FlatList
					data={cities}
					keyExtractor={(item) => item.value}
					renderItem={({ item, index }) => (
						<TouchableOpacity
						style={[
							styles.dropdownItem,
							index === cities.length - 1 && { borderBottomWidth: 0 },
						]}
						onPress={() => {
							setSelectedCity(item.value === 'current' ? item.value : item.name);
							closeModal();
						}}
						>
						<Text style={styles.dropdownItemText}>{item.name}</Text>
						</TouchableOpacity>
					)}
					/>
				</Animated.View>
				</View>
			</TouchableWithoutFeedback>
			</Modal>
		)}
		</View>
	);
};


const styles = StyleSheet.create({
	container: {
		flex: 1 
	},
	map: {
		flex: 1
	},
	banner: {
		width: '100%',
		height: '12%',
		backgroundColor: 'red',
		padding: 10,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000
	},
	bannerText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		position: 'absolute',
		bottom: 15,
		textAlign: 'center'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	soloScootLogo: {
		position: 'absolute',
		top: 50,
		left: 25,
		height: 50,
		width: 50,
		zIndex: 1 
	},
	dropdownButton: {
		position: 'absolute',
		top: 55,
		right: 20,
		padding: 10,
		backgroundColor: '#2E6DAE',
		borderRadius: 5,
		zIndex: 1
	},
	dropdownButtonText: {
		color: '#fff',
		fontSize: 16
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	dropdown: {
		width: '80%',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 10
	},
	dropdownItem: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#ddd'
	},
	dropdownItemText: {
  		fontSize: 16 
	},
});

export default MapTab;
