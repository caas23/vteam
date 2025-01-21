import React, { useState, useCallback } from 'react';
import { Alert, Image, StyleSheet, View, Text } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
	const colorScheme = useColorScheme();
	const themeColor = Colors[colorScheme ?? 'light'];
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
		{userData?.payment_method == "" && (
			<View style={styles.banner}>
				<Text style={styles.bannerText}>Add a payment method to be able to rent a bike</Text>
			</View>
		)}
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
			<Text style={{ color: themeColor.text, fontStyle: 'italic' }}>To handle payments, please visit the website.</Text>
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
	banner: {
		width: '100%',
		height: '12%',
		backgroundColor: 'red',
		padding: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		position: 'absolute',
		bottom: 15,
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
	paymentMsg: {
		fontStyle: 'italic',
		
	}
});
