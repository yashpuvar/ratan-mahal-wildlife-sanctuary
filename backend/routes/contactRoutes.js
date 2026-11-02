const express = require("express");

const {
  createContact,
  getContacts,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

router.route("/").post(createContact).get(requireAdmin, getContacts);

router.route("/:id").delete(requireAdmin, deleteContact);

module.exports = router;
