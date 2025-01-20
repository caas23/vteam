import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { UserDetailsProps } from './interfaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import fetchUpdateUser from './fetchModels/fetchUpdatePayment';

export default function UserDetails({ user, fetchUserData }: UserDetailsProps) {
	const colorScheme = useColorScheme();
	const themeColor = Colors[colorScheme ?? 'light'];
	const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
	const [updatedName, setUpdatedName] = useState(user.name);
	const [updatedPaymentMethod, setUpdatedPaymentMethod] = useState(user.payment_method);
	const [isDropdownVisible, setDropdownVisible] = useState(false);
	const paymentMethods = ['Prepaid', 'Monthly'];

	const handleSaveUpdates = async () => {
		const updateUser = {
			user_id: user.user_id,
			name: updatedName,
			method: updatedPaymentMethod
		}
		try {
			const respone = await fetchUpdateUser(updateUser);
			if (respone) {
				setUpdateModalVisible(false);
				Alert.alert(
					'Account Updated',
					`Your account have been updated.`
			)} else {
				Alert.alert(
					'Update failed',
					`Your account could not be updated.`
			)};
			await fetchUserData();
		} catch (error) {
			setUpdateModalVisible(false);
			return [];
		}
	};

  	const handleCancelUpdates = () => {
		setUpdatedPaymentMethod(user.payment_method);
		setDropdownVisible(false);
		setUpdateModalVisible(false);
	};

	return (
	<View style={[styles.userDetailsContainer, { borderColor: themeColor.border }]}>
		<Text style={[styles.detailText, { color: themeColor.text }]}>
			Name: {updatedName || user.name}
		</Text>
		<Text style={[styles.detailText, { color: themeColor.text }]}>
			{user.payment_method === 'Prepaid' || updatedPaymentMethod === 'Prepaid'}
			Payment method: {updatedPaymentMethod || user.payment_method}
		</Text>
		<Text style={[styles.detailText, { color: themeColor.text }]}>
			{user.payment_method === 'Prepaid' || updatedPaymentMethod === 'Prepaid' ? `Balance: ${user.balance.toFixed(2)} kr` : ""}
		</Text>
		<View style={styles.buttonContainer}>
			<TouchableOpacity
			style={[styles.button, { flex: 0 }]}
			onPress={() => setUpdateModalVisible(true)}
			>
			<ThemedText style={styles.buttonText}>Update Account</ThemedText>
			</TouchableOpacity>
		</View>

		<Modal
			transparent
			visible={isUpdateModalVisible}
			animationType="fade"
			onRequestClose={() => setUpdateModalVisible(false)}
		>
			<TouchableWithoutFeedback onPress={handleCancelUpdates}>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: themeColor.background }]}>
						<Text style={[styles.modalTitle, { color: themeColor.text }]}>
							Update details
						</Text>
						<TextInput
							style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
							value={updatedName}
							onChangeText={setUpdatedName}
							placeholder="Enter new name"
							placeholderTextColor={themeColor.border}
						/>
						<View style={styles.dropdownContainer}>
							<TouchableOpacity style={styles.input} onPress={() => setDropdownVisible((prev) => !prev)}>
								<Text style={{ color: themeColor.text }}>{updatedPaymentMethod || 'Select payment method'}</Text>
							</TouchableOpacity>
							{isDropdownVisible && (
								<View style={styles.dropdown}>
									{paymentMethods.map((method) => (
									<TouchableOpacity
										key={method}
										style={styles.dropdownItem}
										onPress={() => {
										setUpdatedPaymentMethod(method);
										setDropdownVisible(false);
										}}
									>
										<Text style={styles.dropdownItemText}>{method}</Text>
									</TouchableOpacity>
									))}
								</View>
							)}
						</View>
						<Text style={[styles.infoText, { color: themeColor.text }]}>
							To further handle payments, please visit the website.
						</Text>
						<Text style={[styles.infoText2, { color: themeColor.text }]}>
							If you wish to delete your account, please submit a request to account@soloscoot.com.
							We will handle your request as soon as possible, and get back to you if there 
							are any issues or anything stopping a deletion (such as unpaid invoices, etc).
						</Text>
						<View style={styles.modalButtonContainer}>
							<TouchableOpacity style={[styles.button, { backgroundColor: '#A3A6B1' }]} onPress={handleCancelUpdates}>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.button, { backgroundColor: '#2E6DAE' }]} onPress={handleSaveUpdates}>
								<Text style={styles.buttonText}>Save</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	</View>
	);
}

const styles = StyleSheet.create({
	userDetailsContainer: {
		borderLeftWidth: 2,
		padding: 10,
		marginBottom: 16,
	},
	detailText: {
		fontSize: 16,
		marginBottom: 8,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	button: {
		backgroundColor: '#2E6DAE',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '400',
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '80%',
		height: '42%',
		padding: 20,
		borderRadius: 10,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	input: {
		width: '100%',
		height: 40,
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		marginBottom: 10,
		justifyContent: 'center',
		borderColor: '#2E6DAE',
	},
	dropdownContainer: {
		position: 'relative',
		width: '100%',
	},
	dropdown: {
		position: 'absolute',
		top: 40,
		left: 0,
		right: 0,
		backgroundColor: '#DFF2F9',
		borderWidth: 1,
		borderColor: '#8FBFE6',
		borderRadius: 5,
		zIndex: 1000,
	},
	dropdownItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#8FBFE6',
	},
	dropdownItemText: {
		fontSize: 16,
	},
	modalButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
		marginTop: 5,
	},
	infoText: {
		fontSize: 14,
		fontStyle: 'italic',
	},
	infoText2: {
		fontSize: 14,
		marginTop: 10,
	},
});
