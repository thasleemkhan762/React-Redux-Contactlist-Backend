const asyncHandler = require('express-async-handler');
const contactService = require("../services/contactService");
const upload = require("../config/multer");
const multer = require("multer");
const path = require("path");


// get all contacts
// api/contacts
const getContactsEndpoint = asyncHandler(async (req, res) => {
    const searchQuery = req.query.searchQuery || '';
    const currentPage = req.query.currentPage ? parseInt(req.query.currentPage) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

    try {
        const { contacts, totalPages } = await contactService.getContacts(searchQuery, currentPage, pageSize);

        res.status(200).json({ contacts, totalPages });
    } catch (error) {
        console.error(`Error in fetching contacts: ${error.message}`);

        res.status(500).json({ error: error.message });
    }
});


// create new contact
// api/contacts
const createContact = asyncHandler(async (req, res) => {

    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {

            res.status(400).json({ message: "image upload error" });
        } else if (err) {

            res.status(500).json({ message: "Internal Server Error" });
        } else {
            console.log("The request body is :", req.body);
            const { firstName, lastName, email, phone } = req.body;
            const image = req.file ? req.file.path : null;

            if (!firstName || !lastName || !email || !phone) {

                res.status(400).json('All fields are mandatory!');
            }
            const lowercaseEmail = email.toLowerCase();
            const contact = await contactService.createContact(firstName, lastName, lowercaseEmail, phone, image);

            res.status(201).json(contact);
        }
    })
});


// get contact
// api/contacts
const getContact = asyncHandler(async (req, res) => {
    const contact = await contactService.getContact(req.params.id);
    if (!contact) {

      res.status(404);
      throw new Error('Contact not found');
    }
  
    res.status(200).json(contact);
  });


 /* update contact
    api/contacts/:id */

  const updateContact = asyncHandler(async (req, res) => {
    upload(req, res, async (error) => {
        if (error instanceof multer.MulterError) {

            return res.status(400).json({ message: 'Image upload error' });
        } else if (error) {

            return res.status(500).json({ message: 'Internal server error' });
        }

        let imagePath;

        if (req.file) {
            imagePath = path.join('uploads', req.file.filename);
        } else {
            const contact = await contactService.getContact(req.params.id);
            if (!contact) {

                res.status(400);
                throw new Error('Contact not found');
            }
            imagePath = contact.image;
        }

        const updateData = {
            ...req.body,
            ...(imagePath ? { image: imagePath } : {}),
        };

        const updatedData = await contactService.updateContact(req.params.id, updateData, imagePath);

        res.status(200).json(updatedData);
    });
  });


// delete contsct
// api/contacts/:id
const deleteContact = asyncHandler(async (req, res) => {
  const deletedContact = await contactService.deleteContact(req.params.id);

  if (!deletedContact) {

    res.status(404);
    throw new Error('Contact not found');
  }
  
  res.status(200).json(deletedContact);
});


module.exports = {
    getContactsEndpoint,
    createContact,
    getContact,
    updateContact,
    deleteContact,
};