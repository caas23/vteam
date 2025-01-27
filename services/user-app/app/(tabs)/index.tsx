import React, { useEffect, useState } from 'react';
import { Image, Linking, StyleSheet, TouchableOpacity, Alert, View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import fetchGitHubAccessToken from '../fetchModels/fetchGitHubToken';
import fetchOneUserByGitId from '../fetchModels/fetchOneUser';
import fetchRegisterCallback from '../fetchModels/fetchRegisterCallback';
import fetchAddUser from '../fetchModels/fetchAddUser';
import { useAuth } from '../AuthCheck';

const { GITHUB_ID } = Constants?.expoConfig?.extra as { GITHUB_ID: string };

export default function HomeTab() {
	const [buttonPressed, setButtonPressed] = useState(false);
	const [loading, setLoading] = useState(false);
	const { isAuthenticated, setIsAuthenticated } = useAuth();

	const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_ID}&scope=read:user,user:email`;

	const handleAuth = async () => {
		setLoading(true);

		try {
		if (isAuthenticated) {
			await SecureStore.deleteItemAsync('access_token');
			await SecureStore.deleteItemAsync('user');

			setIsAuthenticated(false);
			Alert.alert("Alert", "You have been logged out.");
		} else {
			await Linking.openURL(githubOAuthUrl);
		}
		} catch (error) {
			Alert.alert("Error", "Failed to open authentication URL.");
		} finally {
			setLoading(false);
		}
	};

  useEffect(() => {
	const handleOAuthCallback = async (url: string) => {
		const code = new URLSearchParams(url.split('?')[1]).get('code');
		if (!code) return;

		setLoading(true);

		try {
			const data = await fetchGitHubAccessToken(code);
			if (!data) return;

			await SecureStore.setItemAsync('access_token', data.access_token);
			await SecureStore.setItemAsync('user', JSON.stringify(data.user));
			setIsAuthenticated(true);

			const existingUser = await fetchOneUserByGitId(data.user.id);

			if (!existingUser.length) {
				const newUser = {
					git_id: data.user.id,
					name: data.user.name
				}
				const addedUser = await fetchAddUser(newUser);
				if (!addedUser) {
					Alert.alert("Failed to add user to the database.");
					return;
				}
			}


		} catch (error) {
			// console.error("Error fetching access token:", error);
		} finally {
			setLoading(false);
		}
    };

    const getInitialUrl = async () => {
		const initialUrl = await Linking.getInitialURL();
		if (initialUrl) {
			const parsedUrl = new URL(initialUrl);
			const hostname = parsedUrl.hostname;
			const urlId = hostname.split('-')[0];

			await fetchRegisterCallback(urlId);
			handleOAuthCallback(initialUrl);
		}	
    };

    getInitialUrl();

    const handleDeepLink = (event: any) => {
      	handleOAuthCallback(event.url);
    };

    Linking.addEventListener('url', handleDeepLink);

    return;
  }, [isAuthenticated, setIsAuthenticated]);

  return (
    <ParallaxScrollView
		headerBackgroundColor={{
			light: Colors.light.headerBackground,
			dark: Colors.dark.headerBackground
		}}
		headerImage={
			<Image
			source={require('@/assets/images/solo-scoot-logo.png')}
			style={styles.soloScootLogo}
			/>
		}>
		<ThemedView style={styles.titleContainer}>
			<ThemedText type="title">Ridin' solo ain't that bad!</ThemedText>
		</ThemedView>
		<ThemedView style={styles.subTextContainer}>
			<ThemedText>When you want to get from A to B without hassle, Solo Scoot has your back!</ThemedText>
		</ThemedView>
		<ThemedView style={styles.subTextContainer}>
			<ThemedText type="subsection">Enjoy some alone time while getting to your next destination safely.</ThemedText>
		</ThemedView>

		<TouchableOpacity
			style={[styles.authButton, buttonPressed ? styles.authButtonPressed : null]}
			onPressIn={() => setButtonPressed(true)}
			onPressOut={() => setButtonPressed(false)}
			onPress={handleAuth}
			disabled={loading}
		>
			{loading ? (
			<ActivityIndicator size="small" color="#fff" />
			) : (
			<ThemedText style={styles.authButtonText}>{isAuthenticated ? 'Log out' : 'Log in with GitHub'}</ThemedText>
			)}
		</TouchableOpacity>

		<ThemedView style={styles.imageContainer}>
			<Image style={styles.soloScootScooter} source={require('@/assets/images/scooter-icon-blue.png')} />
		</ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	subTextContainer: {
		gap: 8,
		marginBottom: 8,
	},
	soloScootLogo: {
		height: 50,
		width: 50,
		bottom: 0,
		left: 25,
		position: 'absolute',
	},
	imageContainer: {
		height: 500,
	},
	soloScootScooter: {
		height: 150,
		width: 150,
		top: 250,
		right: -25,
		position: 'absolute',
	},
	authButton: {
		height: 44,
		backgroundColor: '#2E6DAE',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 20,
		boxShadow: '2px 2px 3px 0 rgba(0,0,0,0.4)',
	},
	authButtonPressed: {
		backgroundColor: '#09223A',
	},
	authButtonText: {
		color: '#fff',
		fontWeight: '400',
		fontSize: 16,
	},
});
