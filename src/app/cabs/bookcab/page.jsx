"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ConfirmBooking from "@/app/components/ConfirmBooking";
import Contact from "@/app/components/Contact";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUser,
  selectUser,
  selectLoading,
  selectError,
} from "../../features/user/userSlice";

const BookCab = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [confirmbookDialoge, setconfirmbookDialoge] = useState(false);
  const [contactDialoge, setcontactDialoge] = useState(false);
  const [searchParams, setSearchParams] = useState({
    pickup: "",
    drop: "",
    triptype: "",
  });
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    cabtype: "",
    persons: "",
    contact: "",
    traveldate: "",
    traveltime: "",
    pickupfulladdress: "",
    price: "",
    pickup: "",
    drop: "",
    triptype: "",
    email: "",
    customername: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && user.firstname && user.lastname && user.email) {
      console.log("Setting fullname and email");
      setFullname(user.firstname + " " + user.lastname);
      setEmail(user.email);
    } else {
      console.log("User data not complete");
    }
  }, [user]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      customername: fullname,
      email: email,
    }));
  }, [fullname, email]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pickup = params.get("pickup") || "";
    const drop = params.get("drop") || "";
    const triptype = params.get("triptype") || "";

    setSearchParams({ pickup, drop, triptype });
    setFormData((prevData) => ({ ...prevData, pickup, drop, triptype }));
    fetchPrice(pickup, drop, formData.cabtype, triptype);
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    fetchPrice(
      formData.pickup,
      formData.drop,
      formData.cabtype,
      formData.triptype
    );
  }, [formData.pickup, formData.drop, formData.cabtype, formData.triptype]);

  const fetchPrice = async (pickup, drop, cabtype, triptype) => {
    try {
      const response = await fetch("/api/admin/pickdropfare/Getpickdropfare");
      const data = await response.json();
      const priceObj = data.find(
        (item) =>
          item.pickup === pickup &&
          item.drop === drop &&
          item.cabtype === cabtype
      );
      let newprice = 0;
      if (priceObj && triptype === "Oneway") {
        newprice = priceObj.onewayfair;
      }
      if (priceObj && triptype === "Roundtrip") {
        newprice = priceObj.roundtripfair;
      }

      setFormData((prevData) => ({
        ...prevData,
        price: newprice ? newprice : 0,
      }));
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setSearchParams((prevParams) => ({ ...prevParams, [name]: value }));
  };

  const validatecontact = (contact) => {
    const contactRegex = /^\d{10}$/;
    return contactRegex.test(contact);
  };

  const validateDateTime = (traveldate, traveltime) => {
    const selectedDateTime = new Date(`${traveldate}T${traveltime}`);
    const now = new Date();
    const tenHoursLater = new Date(now.getTime() + 10 * 60 * 60 * 1000);
    return selectedDateTime > now && selectedDateTime >= tenHoursLater;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== "price") {
        newErrors[key] = "This field is required";
      }
    });
    if (formData.pickup === formData.drop) {
      newErrors.pickup = "Pickup and drop locations cannot be the same";
      newErrors.drop = "Pickup and drop locations cannot be the same";
    }

    if (!validatecontact(formData.contact)) {
      newErrors.contact = "Invalid contact number";
    }

    if (!validateDateTime(formData.traveldate, formData.traveltime)) {
      newErrors.date =
        "Date and time must be in the future and at least 10 hours from now";
      newErrors.time =
        "Date and time must be in the future and at least 10 hours from now";
    }
    

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      console.log("Form Data:", formData);
      setErrors({});
      setconfirmbookDialoge(true);
    }
  };

  const handleContact = () => {
    setcontactDialoge(true);
  };

  const handledialogClose = (event, reason) => {
    if ((reason && reason === "backdropClick") || "escapeKeyDown") {
      console.log("backdropClicked. Not closing dialog.");
      return;
    }
    console.log("reason empty");
    setconfirmbookDialoge(false);
    setcontactDialoge(false);
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
        );
        const data = await response.json();
        const address = data.results[0]?.formatted_address;
        setFormData((prevData) => ({
          ...prevData,
          pickupfulladdress: address || "",
        }));
        if (address === "" || address === undefined) {
          alert("Unable to fetch address");
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto p-6 my-10 bg-white rounded-lg shadow-md border border-black">
          <form onSubmit={handleSubmit} className="">
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Book a Cab
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6  mb-6 ">
              <div className="form-control">
                <label
                  htmlFor="pickup"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pickup
                </label>
                <select
                  id="pickup"
                  name="pickup"
                  value={formData.pickup}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Pickup Location</option>
                  <option value="Srinagar">Srinagar</option>
                  <option value="Jammu">Jammu</option>
                  <option value="Pahlagam">Pahlagam</option>
                  <option value="Gulmarg">Gulmarg</option>
                  <option value="Sonamarg">Sonamarg</option>
                  {/* <option value="Doodhpathri">Doodhpathri</option>
                  <option value="Kargil">Kargil</option> */}
                </select>
                {errors.pickup && (
                  <p className="mt-2 text-sm text-red-600">{errors.pickup}</p>
                )}
              </div>
              <div className="form-control">
                <label
                  htmlFor="drop"
                  className="block text-sm font-medium text-gray-700"
                >
                  Drop
                </label>
                <select
                  id="drop"
                  name="drop"
                  value={formData.drop}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Drop Location</option>
                  <option value="Srinagar">Srinagar</option>
                  <option value="Jammu">Jammu</option>
                  <option value="Pahlagam">Pahlagam</option>
                  <option value="Gulmarg">Gulmarg</option>
                  <option value="Sonamarg">Sonamarg</option>
                  {/* <option value="Doodhpathri">Doodhpathri</option>
                  <option value="Kargil">Kargil</option> */}
                </select>
                {errors.drop && (
                  <p className="mt-2 text-sm text-red-600">{errors.drop}</p>
                )}
              </div>
              <div className="form-control">
                <label
                  htmlFor="triptype"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trip Type
                </label>
                <select
                  id="triptype"
                  name="triptype"
                  value={formData.triptype}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Trip Type</option>
                  <option value="Oneway">One way</option>
                  <option value="Roundtrip">Round trip</option>
                </select>
                {errors.triptype && (
                  <p className="mt-2 text-sm text-red-600">{errors.triptype}</p>
                )}
              </div>
            </div>
            {searchParams.triptype === "Round trip" && (
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  Note: This round trip will include popular tourist points at
                  the destination.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-control">
                <label
                  htmlFor="cabType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cab Type
                </label>
                <select
                  id="cabtype"
                  name="cabtype"
                  value={formData.cabtype}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Cab Type</option>
                  <option value="Swift dzire">Swift dzire</option>
                  {/* <option value="Honda Amaze">Honda Amaze</option> */}
                  <option value="Crysta">Crysta</option>
                  <option value="Innova">Innova</option>
                  {/* <option value="Traveler">Traveler</option> */}
                </select>
                {errors.cabtype && (
                  <p className="mt-2 text-sm text-red-600">{errors.cabtype}</p>
                )}
              </div>
              <div className="form-control">
                <label
                  htmlFor="persons"
                  className="block text-sm font-medium text-gray-700"
                >
                  Persons
                </label>
                <select
                  id="persons"
                  name="persons"
                  value={formData.persons}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Number of Persons</option>
                  {Array.from({ length: 15 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                {errors.persons && (
                  <p className="mt-2 text-sm text-red-600">{errors.persons}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-control">
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Number
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  value={formData.contact}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.contact && (
                  <p className="mt-2 text-sm text-red-600">{errors.contact}</p>
                )}
              </div>
              <div className="form-control">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <input
                  id="date"
                  name="traveldate"
                  type="date"
                  value={formData.traveldate}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.traveldate && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.traveldate}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-control">
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time
                </label>
                <input
                  id="time"
                  name="traveltime"
                  type="time"
                  value={formData.traveltime}
                  onChange={handleChange}
                  className="mt-1 block w-4/5 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.traveltime && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.traveltime}
                  </p>
                )}
              </div>
              <div className="form-control relative ">
                <label
                  htmlFor="pickupfulladdress"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  Full Address
                </label>
                <div className="flex items-center w-4/5">
                  <input
                    id="pickupfulladdress"
                    name="pickupfulladdress"
                    type="text"
                    value={formData.pickupfulladdress}
                    onChange={handleChange}
                    className="flex-grow mt-1 rounded-md border-2 p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <IconButton
                    aria-label="fetch location"
                    className="ml-2"
                    onClick={fetchCurrentLocation}
                  >
                    <MyLocationIcon />
                  </IconButton>
                </div>
                {errors.pickupfulladdress && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pickupfulladdress}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-6 text-center">
              <p className="text-xl font-semibold">
                Price: Rs {formData.price}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <button
                type="submit"
                className="px-6 py-3 mb-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Book Cab
              </button>
            </div>
          </form>
          <div className="flex flex-col items-center">
            <button
              onClick={handleContact}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Contact Us
            </button>
          </div>
        </div>

        <Dialog open={confirmbookDialoge} onClose={handledialogClose}>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogContent>
            <ConfirmBooking formData={formData} />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setconfirmbookDialoge(false)}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={contactDialoge} onClose={handledialogClose}>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogContent>
            <Contact />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setcontactDialoge(false)} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default BookCab;
