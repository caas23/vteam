import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import MapView, { Polyline, Marker, LatLng, Region } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import Constants from 'expo-constants';
import { TripMapProps } from './interfaces';


const TripMap: React.FC<TripMapProps> = ({ data, startLocation, endLocation, FetchedDistance }) => {
	const [route, setRoute] = useState<LatLng[]>([]);
	const [region, setRegion] = useState<Region | null>(null);
	const [loading, setLoading] = useState(true);
	const mapRef = useRef<MapView | null>(null);
	
	useEffect(() => {
		// if the route is not in the database, get via openrouteservice
		if (!data.route && !(startLocation[0] == endLocation[0]) && !(startLocation[1] == endLocation[1])) {
			const { API_KEY } = Constants?.expoConfig?.extra as { API_KEY: string };
			
			const fetchRoute = async () => {
				try {
					const coordinates = [
						[startLocation[1], startLocation[0]],
						[endLocation[1], endLocation[0]],
					];
		
					const response = await fetch(
					'https://api.openrouteservice.org/v2/directions/cycling-electric',
						{
							method: 'POST',
							headers: {
							'Content-Type': 'application/json',
							Authorization: API_KEY,
							},
							body: JSON.stringify({ coordinates }),
						}
					);
		
					if (!response.ok) {
						throw new Error('Failed to fetch route.');
					}
		
					const data = await response.json();

					if (data.routes && data.routes[0]?.geometry) {
						const encodedRoute = data.routes[0].geometry;
						const decodedRoute = polyline.decode(encodedRoute).map(([lat, lon]) => ({
							latitude: lat,
							longitude: lon,
						}));
						setRoute(decodedRoute);
				
						FetchedDistance && FetchedDistance(data.routes[0].summary.distance);
					}
				} catch (error) {
					console.error('Error fetching route:', error);
				} finally {
					setLoading(false);
				}
			}
			fetchRoute();
		// if route is in database, use that data
		} else {
			try {
				if (data.route) {
					const decodedRoute = data.route.map(([lat, lon]) => ({
						latitude: lat,
						longitude: lon,
					}));
					
					setRoute(decodedRoute);
				} else {
					setRoute([{ latitude: startLocation[0], longitude: startLocation[1] }])
				}
				FetchedDistance && FetchedDistance(data.distance || 0);
	
			} catch (error) {
				console.error('Error fetching route:', error);
			} finally {
				setLoading(false);
			}
		}
		const newRegion: Region = {
			latitude: (startLocation[0] + endLocation[0]) / 2,
			longitude: (startLocation[1] + endLocation[1]) / 2,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		};

		setRegion(newRegion);
		mapRef.current?.animateToRegion(newRegion, 1000);
	}, [startLocation, endLocation, FetchedDistance]);

	if (loading || !region) {
		return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="large" color="#2E6DAE" />
			<Text>Loading map...</Text>
		</View>
		);
	}

	return (
	<View style={styles.container}>
		<MapView
			ref={mapRef}
			style={styles.map}
			initialRegion={region}
			onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
		>
			{route.length > 2 && <Polyline coordinates={route} strokeColor="#2E6DAE" strokeWidth={4} />}
			<Marker coordinate={{
				latitude: startLocation[0],
				longitude: startLocation[1] 
				}}>
				<Image
					source={require('@/assets/images/start-location.png')}
					style={styles.icon}
				/>
			</Marker>
			<Marker coordinate={{
				latitude: endLocation[0],
				longitude: endLocation[1]
				}}>
				<Image
					source={require('@/assets/images/end-location.png')}
					style={styles.icon}
				/>
			</Marker>
		</MapView>
	</View>
	);
};

const styles = StyleSheet.create({
	container: { 
		flex: 1 
	},
	map: {
		flex: 1,
		marginTop: 15,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	icon: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
    },
});

export default TripMap;
