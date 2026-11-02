const Contact = require("../models/contact.js");

// Create a new contact message
const createContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newContact = await Contact.create({
      name,
      phone,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully",
      data: newContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not send message",
      error: error.message,
    });
  }
};

// Get all contact messages (for future admin panel)
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch contact messages",
      error: error.message,
    });
  }
};

// Delete contact message
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete message",
      error: error.message,
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  deleteContact,
};
