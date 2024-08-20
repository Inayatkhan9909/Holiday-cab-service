import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import CircularProgress from '@mui/material/CircularProgress'; 
import { redirect } from 'next/navigation'

const PackageBookingComponent = ({ formData }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleBookandContactoffice = async () => {
    setLoading(true);
    try {

        const response = await fetch('/api/cab/packages/BookPackage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const responseData = await response.json();

        if (response.ok) {

          setSuccess(true);
          setTimeout(() => {
              redirect('/allpackages');
          }, 2000); 
        } else {
          
          console.error('Server responded with:', response.status, responseData);
          setResponseMessage(response.message);
        }
     
    } catch (error) {
      setResponseMessage("Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handlePayNow = async () => {
    setLoading(true);
    try {
      setResponseMessage("Payment option is currently not avaliable");
    } catch (error) {
      setResponseMessage("Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center w-2/4 ">
            <CircularProgress />
        </div>
    );
}

if (success) {
    return (
        <div className="flex justify-center items-center h-1/2">
            <h2 className="text-2xl text-green-500 font-semibold">Booking confirmed and payment successful!</h2>
        </div>
    );
}

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Confirm Your Booking</h2>
        <div className="mb-4">
          <p>
            <strong>Name:</strong> {formData.customername}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Contact No:</strong> {formData.contact}
          </p>
          <p>
            <strong>Pickup Full Address:</strong> {formData.pickupfulladdress}
          </p>
          <p>
            <strong>Date:</strong> {formData.pickupdate}
          </p>
          <p>
            <strong>Time:</strong> {formData.pickuptime}
          </p>
          <p>
            <strong>Cab Type:</strong> {formData.cabtype}
          </p>
        </div>
        {responseMessage && (
          <div
            className={`mt-4 p-2 text-center ${responseMessage.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
              }`}
          >
            {responseMessage}
          </div>
        )}
        <p className="mb-6 text-gray-600">
          Note: Your booking will be confirmed within 5 minutes.
        </p>
        <div className="flex justify-between gap-2">
          <button
            onClick={handlePayNow}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Pay Now
          </button>
          <button
            onClick={handleBookandContactoffice}
            className="md:px-6 md:py-3 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Book & Pay later
          </button>
        </div>
      </div>
    </>
  );
};

export default PackageBookingComponent;
