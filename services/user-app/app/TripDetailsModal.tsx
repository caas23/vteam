import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { TripDetailsProps } from './interfaces';
import TripMap from './TripMap';

const TripDetailsModal: React.FC<TripDetailsProps> = ({ data, onClose }) => {
	const [distance, setDistance] = useState<number | null>(null);
	const [animationValue] = useState(new Animated.Value(0));
	const [priceInfoVisible, setPriceInfoVisible] = useState(false);
	const totalSeconds = (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const remainingSeconds = Math.floor(totalSeconds % 60);
	const averageSpeed = distance !== null && totalSeconds > 0
		? distance / 1000 / (totalSeconds / 3600) : null;

	const priceDetails = `
Every trip has a set start fee, and a set price per minute.

If a bike is left outside a parking or charging zone, a fee is added to the total price.

If a bike is picked up outside a parking or charging zone, and then parked at one of those zones, you get a discount.

- Start fee: 10 kr
- Price per minute: 2,50 kr
- Basic fee: +5 kr
- Basic discount: -5 kr

Please note that these are general prices, your specific trip may have additional fees or discounts.

If you have questions about your specific trip, please submit an email to trips@soloscoot.com
	`;

	useEffect(() => {
		Animated.spring(animationValue, {
		toValue: 1,
		useNativeDriver: true,
		}).start();
	}, []);

	const closeModal = () => {
		Animated.spring(animationValue, {
		toValue: 0,
		useNativeDriver: true,
		}).start(() => {
		onClose();
		});
	};

	return (
		<Modal visible={true} transparent={true} onRequestClose={closeModal}>
			<TouchableWithoutFeedback onPress={closeModal}>
				<View style={styles.modalContainer}>
				<TouchableWithoutFeedback>
					<Animated.View
					style={[
						styles.modalContent,
						{ transform: [{ scale: animationValue }] },
					]}
					>
					<Text style={styles.modalTitle}>Trip {data.trip_id}</Text>
					<Text><Text style={styles.boldText}>Date: </Text>{new Date(data.start_time).toLocaleDateString()}</Text>
					<Text><Text style={styles.boldText}>Start location: </Text>{data.start_location.join(', ')}</Text>
					<Text><Text style={styles.boldText}>End location: </Text>{data.end_location.join(', ')}</Text>
					<Text><Text style={styles.boldText}>Start time: </Text>{new Date(data.start_time).toLocaleTimeString()}</Text>
					<Text><Text style={styles.boldText}>End time: </Text>{new Date(data.end_time).toLocaleTimeString()}</Text>
					<Text><Text style={styles.boldText}>Total time: </Text>{totalMinutes} min {remainingSeconds} sec</Text>
					{distance !== null && (
						<Text><Text style={styles.boldText}>Total distance: </Text>{(distance / 1000).toFixed(2)} km</Text>
					)}
					{averageSpeed !== null && (
						<Text><Text style={styles.boldText}>Average speed: </Text>{averageSpeed.toFixed(1)} km/h</Text>
					)}
					<View style={styles.priceContainer}>
						<Text><Text style={styles.boldText}>Price: </Text>{data.price} kr</Text>
						<TouchableOpacity onPress={() => setPriceInfoVisible(true)} style={styles.questionMark}><Text style={styles.questionMarkText}>?</Text></TouchableOpacity>
					</View>
					<View style={styles.mapContainer}>
						<TripMap
						startLocation={data.start_location}
						endLocation={data.end_location}
						FetchedDistance={(fetchedDistance) => setDistance(fetchedDistance)}
						/>
					</View>
					<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
						<Text style={styles.closeButtonText}>Close</Text>
					</TouchableOpacity>
					</Animated.View>
				</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
			{priceInfoVisible && (
				<Modal visible={true} transparent={true} onRequestClose={() => setPriceInfoVisible(false)}>
					<TouchableWithoutFeedback onPress={() => setPriceInfoVisible(false)}>
						<View style={styles.modalContainer}>
						<TouchableWithoutFeedback>
							<View style={styles.priceInfoModal}>
						<Text style={styles.priceInfoText}>{priceDetails}</Text>
							<TouchableOpacity style={styles.closeButton} onPress={() => setPriceInfoVisible(false)}>
								<Text style={styles.closeButtonText}>Close</Text>
							</TouchableOpacity>
							</View>
						</TouchableWithoutFeedback>
						</View>
					</TouchableWithoutFeedback>
				</Modal>
			)}
		</Modal>
	);
	};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		width: '90%',
		maxHeight: '80%',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	boldText: {
		fontWeight: 'bold',
	},
	mapContainer: {
		height: '60%',
		marginTop: 10,
		borderRadius: 10,
	},
	closeButton: {
		marginTop: 25,
		backgroundColor: '#2E6DAE',
		padding: 10,
		borderRadius: 5,
		alignItems: 'center',
	},
	closeButtonText: {
		color: '#fff',
		fontSize: 16,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	questionMark: {
		marginLeft: 5,
		backgroundColor: '#2E6DAE',
		width: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	questionMarkText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	priceInfoModal: {
		width: '85%',
		height: '75%',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
	},
	priceInfoText: {
		fontSize: 16,
		marginBottom: 20,
	},
});

export default TripDetailsModal;
