const Booking = require("../models/Booking");
const SanctuarySettings = require("../models/SanctuarySettings");

// Create new hotel booking enquiry
const createBooking = async (req, res) => {
  try {
    const hotelSettings = await SanctuarySettings.findById("sanctuary").select("hotelOpen").lean();
    if (hotelSettings?.hotelOpen !== true) {
      return res.status(403).json({ success: false, message: "Accommodation booking services are temporarily unavailable." });
    }
    const {
      name,
      phone,
      email,
      checkIn,
      checkOut,
      guests,
      stayType,
      message,
    } = req.body;

    // Required fields validation
    if (
      !name ||
      !phone ||
      !email ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !stayType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required booking fields",
      });
    }

    // Date validation
    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const newBooking = await Booking.create({
      name,
      phone,
      email,
      checkIn,
      checkOut,
      guests,
      stayType,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Booking enquiry submitted successfully",
      data: newBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not submit booking enquiry",
      error: error.message,
    });
  }
};

// Get all booking enquiries - future admin use
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch bookings",
      error: error.message,
    });
  }
};

// Delete a booking - future admin use
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  deleteBooking,
};
