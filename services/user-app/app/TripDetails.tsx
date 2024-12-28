import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import { TripUserDetailsProps } from './interfaces';
import TripDetailsModal from './TripDetailsModal';
import fetchOneTrip from './fetchModels/fetchOneTrip';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TripDetails({ user }: TripUserDetailsProps) {
	const [currentTrip, setCurrentTrip] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const colorScheme = useColorScheme();
	const themeColor = Colors[colorScheme ?? 'light'];

	const handleTripPress = async (trip: string) => {
		setLoading(true);
		try {
			let tripDetails = await fetchOneTrip(trip);
			while (!tripDetails) tripDetails = await fetchOneTrip(trip);
			setCurrentTrip(tripDetails[0]);
			setModalVisible(true);
		} catch (error) {
			Alert.alert('Error', 'Failed to fetch trip details');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={[styles.tripDetailsContainer, { borderColor: themeColor.border }]}>
			<Text style={[styles.detailText, { color: themeColor.text }]}>
				Total: {user.completed_trips.length}
			</Text>
			<View style={styles.tripList}>
				{user.completed_trips.map((trip, index) => (
				<View key={index} style={styles.tripItem}>
					<Text style={[styles.tripArrow, { color: themeColor.text }]}>&#8618;</Text>
					<Text style={[styles.tripText, { color: themeColor.text }]}>Trip{' '}
						<Text
							style={[styles.linkText, { color: themeColor.tint }]}
							onPress={() => handleTripPress(trip)}
						>#{trip}
						</Text>
					</Text>
				</View>
				))}
			</View>

			{loading && (
				<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={themeColor.loading} />
				<Text style={{ color: themeColor.text }}>Loading trip details...</Text>
				</View>
			)}

			{modalVisible && currentTrip && (
				<TripDetailsModal
				data={currentTrip}
				onClose={() => setModalVisible(false)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
  	tripDetailsContainer: {
		borderLeftWidth: 2,
		padding: 10,
		marginBottom: 16,
	},
  	detailText: {
		fontSize: 18,
		marginBottom: 8,
	},
  	tripList: {
		marginLeft: 16,
		marginBottom: 8,
	},
  	tripItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
  	tripArrow: {
		fontSize: 18,
		marginRight: 8,
	},
  	tripText: {
    	fontSize: 16,
	},
  	linkText: {
    	textDecorationLine: 'underline',
	},
  	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 20,
	},
});
