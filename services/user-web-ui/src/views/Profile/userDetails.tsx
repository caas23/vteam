import React, { useState } from "react";
import { UserDetailsProps } from "./interfaces";
import AlertMessage from "../../components/AlertMessage";
import { fetchUpdateBalance } from "../../fetchModels/fetchUpdateBalance";
import { fetchUpdatePayment } from "../../fetchModels/fetchUpdatePayment";

const UserDetails: React.FC<UserDetailsProps> = ({ data }) => {
    const [refillMode, setRefillMode] = useState(false);
    const [paymentMode, setPaymentMode] = useState(false);
    const [refillAmount, setRefillAmount] = useState(0);
    const [newPaymentMethod, setNewPaymentMethod] = useState(data.payment_method);
    const [newBalance, setNewBalance] = useState<number | undefined>(undefined);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertBox, setAlertBox] = useState(false);

    const handleRefillClick = () => setRefillMode(true);

    const handleRefillCancel = () => {
        setRefillMode(false);
        setRefillAmount(0);
    };

    const handleRefillSubmit = async () => {
        const updatedBalance = data.balance + refillAmount 
        setNewBalance(updatedBalance);
        try {
            await fetchUpdateBalance(data.user_id, updatedBalance);
            setAlertMessage("Balance updated successfully!");
        } catch (error) {
            console.error("Error updating balance:", error);
            setAlertMessage("Error updating balance. Please try again.");
        } finally {
            setRefillMode(false);
            setRefillAmount(0);
            setAlertBox(true);
        }
    };

    const handlePaymentModeClick = () => setPaymentMode(true);
    const handlePaymentModeCancel = () => setPaymentMode(false);

    const handlePaymentModeSubmit = async () => {
        try {
            await fetchUpdatePayment(data.user_id, data.name, newPaymentMethod);
            setAlertMessage("Payment method updated successfully!");
        } catch (error) {
            console.error("Error updating payment method:", error);
            setAlertMessage("Error updating payment method. Please try again.");
        } finally {
            setPaymentMode(false);
            setAlertBox(true);
        }
      };
    return (
        <div>
            <div className="user-details">
                <span>Name: {data.name}</span>
                <span>Payment method: {newPaymentMethod ? newPaymentMethod : data.payment_method}</span>
                <span>{(newPaymentMethod && newPaymentMethod.toLowerCase() == 'prepaid' || data.payment_method.toLowerCase() == 'prepaid') ? `Balance: ${newBalance ? newBalance : data.balance} kr` : ""}</span>

                {(newPaymentMethod && newPaymentMethod.toLowerCase() == 'prepaid' || data.payment_method.toLowerCase() == 'prepaid') && (
                    <button className="edit-btn blue" onClick={handleRefillClick}>
                        Refill balance
                    </button>
                )}

                {refillMode && (
                    <div className="popup">
                        <div className="popup-content">
                            <p>Refill balance</p>
                            <input
                                type="number"
                                value={refillAmount}
                                onChange={(e) => setRefillAmount(Number(e.target.value))}
                            />
                            <div>
                            <button className="edit-btn blue" onClick={handleRefillSubmit}>Submit</button>
                            <button className="edit-btn gray" onClick={handleRefillCancel}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

            <button className="edit-btn blue" onClick={handlePaymentModeClick}>
                Update payment method
            </button>
            {paymentMode && (
                <div className="popup">
                    <div className="popup-content">
                    <p>Update payment method</p>
                    <select
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                    >
                        <option value="Prepaid">Prepaid</option>
                        <option value="Monthly">Monthly</option>
                    </select>
                    <div>
                        <button className="edit-btn blue" onClick={handlePaymentModeSubmit}>Submit</button>
                        <button className="edit-btn gray" onClick={handlePaymentModeCancel}>Cancel</button>
                    </div>
                    </div>
                </div>
                )}
            
            <div>
                <span className="delete-message">
                    If you wish to delete your account, please submit a request to <i>account@soloscoot.com</i>.
                    We will handle your request as soon as possible, and get back to you if there 
                    are any issues or anything stopping a deletion (such as unpaid invoices, etc).
                </span>
            </div>
        </div>
        <span className="banned-user">{data.banned ? "You are currently banned, contact account@soloscoot.com if you have any questions. " : ""}</span>

        <AlertMessage
            boxOpen={alertBox}
            onClose={() => setAlertBox(false)}
            message={alertMessage} 
        />
        </div>
    );
};

export default UserDetails;
