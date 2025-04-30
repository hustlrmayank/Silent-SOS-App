// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the DOM elements we need to work with
    const contactForm = document.getElementById('contact-form');        // The main contact form
    const contactsTableBody = document.getElementById('contacts-table-body');  // Table body where contacts will be displayed
    const phoneInput = document.getElementById('phone');               // Phone number input field
    const distressMessage = document.getElementById('distress-message');  // Distress message textarea
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-contact-form');
    const closeModal = document.querySelector('.close-modal');
    
    // Initialize Firebase Database reference
    const database = firebase.database();
    let contacts = [];
    let currentUser = null;
    let editingContactId = null;
    let currentLocation = null;

    // Function to get current location
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        currentLocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            timestamp: new Date().toISOString()
                        };
                        resolve(currentLocation);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        resolve(null);
                    }
                );
            } else {
                resolve(null);
            }
        });
    }

    // Load contacts from Firebase when user is authenticated
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            const contactsRef = database.ref(`users/${user.uid}/contacts`);
            
            // Load contacts from Firebase
            contactsRef.on('value', (snapshot) => {
                contacts = [];
                const data = snapshot.val();
                if (data) {
                    Object.keys(data).forEach(key => {
                        contacts.push({
                            id: key,
                            ...data[key]
                        });
                    });
                }
                renderContacts();
            });

            // Load last used distress message
            const messageRef = database.ref(`users/${user.uid}/lastDistressMessage`);
            messageRef.once('value').then((snapshot) => {
                const lastMessage = snapshot.val();
                if (lastMessage) {
                    distressMessage.value = lastMessage;
                }
            });
        }
    });

    /**
     * Validates if a phone number is a valid Indian mobile number
     * @param {string} phone - The phone number to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    function validateIndianPhoneNumber(phone) {
        const indianPhoneRegex = /^[6-9][0-9]{9}$/;  // Regex for Indian mobile numbers (10 digits starting with 6-9)
        return indianPhoneRegex.test(phone);
    }

    /**
     * Event listener for phone number input
     * Ensures only numbers are entered and limits to 10 digits
     */
    phoneInput.addEventListener('input', function(e) {
        const phone = e.target.value.replace(/\D/g, '');  // Remove any non-digit characters
        if (phone.length > 10) {
            e.target.value = phone.slice(0, 10);  // Limit to 10 digits
        }
    });

    /**
     * Renders all contacts in the table
     * Creates table rows for each contact and adds delete functionality
     */
    function renderContacts() {
        contactsTableBody.innerHTML = '';  // Clear existing table content
        
        // Create a row for each contact
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            // Create row HTML with contact details and delete button
            row.innerHTML = `
                <td>${contact.name}</td>
                <td>${contact.phone}</td>
                <td>${contact.relationship}</td>
                <td>
                    <button class="edit-contact" data-id="${contact.id}">
                        Edit
                    </button>
                    <button class="delete-contact" data-id="${contact.id}">
                        Delete
                    </button>
                </td>
            `;
            contactsTableBody.appendChild(row);
        });

        // Add click event listeners to all delete buttons
        document.querySelectorAll('.delete-contact').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                deleteContact(id);
            });
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-contact').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                editContact(id);
            });
        });
    }

    /**
     * Opens the edit modal and populates it with contact data
     * @param {number} id - The ID of the contact to edit
     */
    function editContact(id) {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
            editingContactId = id;
            document.getElementById('edit-name').value = contact.name;
            document.getElementById('edit-phone').value = contact.phone;
            document.getElementById('edit-relationship').value = contact.relationship;
            document.getElementById('edit-message').value = contact.message;
            editModal.style.display = 'block';
        }
    }

    /**
     * Closes the edit modal
     */
    closeModal.addEventListener('click', () => {
        editModal.style.display = 'none';
        editingContactId = null;
    });

    /**
     * Closes the edit modal when clicking outside
     */
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
            editingContactId = null;
        }
    });

    /**
     * Handles form submission
     * Validates inputs and adds new contact
     */
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please sign in to add contacts');
            return;
        }

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.replace(/\D/g, '');
        const relationship = document.getElementById('relationship').value.trim();
        const message = distressMessage.value.trim();
        
        // Validate all fields
        if (!name || !phone || !relationship || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate Indian phone number
        if (!validateIndianPhoneNumber(phone)) {
            alert('Please enter a valid 10-digit Indian mobile number starting with 6-9');
            return;
        }
        
        // Check if phone number already exists
        if (contacts.some(contact => contact.phone === phone)) {
            alert('This phone number is already in your emergency contacts');
            return;
        }

        // Get current location
        const location = await getCurrentLocation();
        
        // Create new contact object with location
        const newContact = {
            name,
            phone,
            relationship,
            message,
            location: location || null,
            createdAt: new Date().toISOString()
        };
        
        // Add to Firebase
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
        const newContactRef = contactsRef.push();
        newContactRef.set(newContact)
            .then(() => {
                // Save distress message to Firebase
                return database.ref(`users/${currentUser.uid}/lastDistressMessage`).set(message);
            })
            .then(() => {
                // Reset form but keep the distress message
                document.getElementById('name').value = '';
                document.getElementById('phone').value = '';
                document.getElementById('relationship').value = '';
                
                // Show success message
                alert('Contact added successfully!');
            })
            .catch((error) => {
                console.error('Error adding contact:', error);
                alert('Error adding contact. Please try again.');
            });
    });

    /**
     * Handles edit form submission
     * Validates inputs and updates contact
     */
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser || !editingContactId) {
            alert('Please sign in to edit contacts');
            return;
        }

        const name = document.getElementById('edit-name').value.trim();
        const phone = document.getElementById('edit-phone').value.replace(/\D/g, '');
        const relationship = document.getElementById('edit-relationship').value.trim();
        const message = document.getElementById('edit-message').value.trim();
        
        // Validate all fields
        if (!name || !phone || !relationship || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate Indian phone number
        if (!validateIndianPhoneNumber(phone)) {
            alert('Please enter a valid 10-digit Indian mobile number starting with 6-9');
            return;
        }
        
        // Check if phone number already exists (excluding current contact)
        if (contacts.some(contact => contact.phone === phone && contact.id !== editingContactId)) {
            alert('This phone number is already in your emergency contacts');
            return;
        }
        
        // Update contact in Firebase
        const contactRef = database.ref(`users/${currentUser.uid}/contacts/${editingContactId}`);
        contactRef.update({
            name,
            phone,
            relationship,
            message
        })
        .then(() => {
            // Close modal
            editModal.style.display = 'none';
            editingContactId = null;
            
            // Show success message
            alert('Contact updated successfully!');
        })
        .catch((error) => {
            console.error('Error updating contact:', error);
            alert('Error updating contact. Please try again.');
        });
    });

    /**
     * Deletes a contact by ID
     * @param {number} id - The ID of the contact to delete
     */
    function deleteContact(id) {
        if (!currentUser) {
            alert('Please sign in to delete contacts');
            return;
        }

        if (confirm('Are you sure you want to delete this contact?')) {
            database.ref(`users/${currentUser.uid}/contacts/${id}`).remove()
                .then(() => {
                    console.log('Contact deleted successfully');
                })
                .catch((error) => {
                    console.error('Error deleting contact:', error);
                    alert('Error deleting contact. Please try again.');
                });
        }
    }

    // Initial render of contacts when page loads
    renderContacts();
    
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
        window.location.href = 'signin.html';
    }
}); 