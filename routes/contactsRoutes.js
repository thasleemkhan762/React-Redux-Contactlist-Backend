const express = require('express');

const router = express.Router();

const {
    getContactsEndpoint,
    createContact,
    getContact,
    updateContact,
    deleteContact,
} = require("../controller/contactController");

router.route("/").get(getContactsEndpoint);
router.route("/").post(createContact);
router.route("/:id").get(getContact);
router.route("/:id").put(updateContact);
router.route("/:id").delete(deleteContact);

module.exports = router;