const express = require("express");

const {
  createBooking,
  getBookings,
  deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

// POST: Create booking enquiry
// GET: Get all booking enquiries
router.route("/").post(createBooking).get(requireAdmin, getBookings);

// DELETE: Delete booking by MongoDB ID
router.route("/:id").delete(requireAdmin, deleteBooking);

module.exports = router;
