import React, { useState, useCallback } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../AuthCheck';
import { useNavigation, useFocusEffect } from 'expo-router';
import { User as UserInterface } from '../interfaces';
import fetchOneUserByGitId from '../fetchModels/fetchOneUser';
import * as SecureStore from 'expo-secure-store';
import UserDetails from '../UserDetails';
import TripDetails from '../TripDetails';

export default function AccountTab() {
	const { isAuthenticated } = useAuth();
	const navigation = useNavigation();
	const [userData, setUserData] = useState< UserInterface | null | undefined >(undefined);

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
			fetchUserData();
		}
		}, [isAuthenticated, navigation])
	);

	const fetchUserData = async () => {
		const storedUser = await SecureStore.getItemAsync('user')
		try {
			const result = await fetchOneUserByGitId(storedUser ? JSON.parse(storedUser).id : null)
			setUserData(result[0])
		} catch {
			setUserData(null);
		}
	};

	return (
		<View style={styles.container}>
		<ParallaxScrollView
			headerBackgroundColor={{
			light: Colors.light.headerBackground,
			dark: Colors.dark.headerBackground,
			}}
			headerImage={
			<Image
				source={require('@/assets/images/solo-scoot-logo.png')}
				style={styles.soloScootLogo}
			/>
			}>
			<ThemedView style={styles.titleContainer}>
			<ThemedText type="title">Account</ThemedText>
			</ThemedView>
			<Collapsible title="Trips">
			{userData ? (
				<TripDetails user={userData} />
			) : (
				<ThemedText>Loading trip data...</ThemedText>
			)}
			</Collapsible>
			<Collapsible title="User">
			{userData ? (
				<UserDetails user={userData} fetchUserData={fetchUserData}/>
			) : (
				<ThemedText>Loading user data...</ThemedText>
			)}
			</Collapsible>
		</ParallaxScrollView>

		<View style={styles.scooterContainer}>
			<Image
			style={styles.soloScootScooter}
			source={require('@/assets/images/scooter-icon-blue.png')}
			/>
		</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	soloScootLogo: {
		height: 50,
		width: 50,
		bottom: 0,
		left: 25,
		position: 'absolute',
	},
	scooterContainer: {
		position: 'absolute',
		bottom: 87.5,
		right: 7,
	},
	soloScootScooter: {
		height: 150,
		width: 150,
	},
});
