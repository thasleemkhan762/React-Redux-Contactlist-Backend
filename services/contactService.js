const Contact = require('../model/contactModel');
const fs = require('fs').promises;

// get all contacts
const getContacts = async (searchQuery, currentPage, pageSize) => {
    const matchStage = {};

    if (searchQuery) {
        matchStage.$or = [
            { firstName: { $regex: searchQuery, $options: 'i' } },
            { lastName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { phone: { $regex: searchQuery, $options: 'i' } },
        ];
    }
    const aggregationPipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                contacts: [
                    { $project: { _id: 1, firstName: 1, image: 1, lastName: 1, email: 1, phone: 1, createdAt: 1 } },
                    { $skip: (currentPage - 1) * pageSize },
                    { $limit: pageSize },
                ],

                totalPages: [
                    { $count: 'count' }
                ],
            }
        },
        {
            $project: {
                contacts: 1,
                totalPages: { $ifNull: [{ $arrayElemAt: ['$totalPages.count', 0] }, 0] },
            }
        }
    ];
    const result = await Contact.aggregate(aggregationPipeline);

    return result[0];
};


// create new contact
const createContact = async (firstName, lastName, email, phone, image) => {
    try {

        const lowercaseEmail = email.toLowerCase();
        const newContact = await Contact.create({ firstName, lastName, email: lowercaseEmail, phone, image });
        
        return newContact;

    } catch (error) {

        throw error;

    }
};


// get contact
const getContact = async (id) => {
    
    return await Contact.findById(id);
};


// update contact 
const updateContact = async (id, updateData, newImagePath) => {
    const contact = await Contact.findById(id);

    if (!contact) {
        console.log('Contact not found');

        return null;
    }
    if (newImagePath && newImagePath !== contact.image) {
        if (contact.image) {
            try {
                await fs.unlink(contact.image);
            } catch (error) {
                console.error('Error detecting old image file:', error);
            }
        }
        updateData.image = newImagePath;
    }
    if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
    }

    const editedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true });

    return editedContact;
};


// delete contact
const deleteContact = async (id) => {
    const contact = await Contact.findById(id);

    if ( !contact ) {
        console.log('Contact not found');
        return null;
    }
    if (contact.image) {
        try {
            await fs.unlink(contact.image);
        } catch (error) {
            console.error('Error deleting image file:', error);
        }
    }
    const deletedContact = await Contact.findByIdAndDelete(id);

    return deletedContact;
};


module.exports = {
    getContacts,
    createContact,
    getContact,
    updateContact,
    deleteContact,
};
