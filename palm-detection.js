// Import Firebase instances from firebase-config.js
import { database, auth } from './firebase-config.js';

// Function to send data to the specified URL
async function sendDataToServer(contact) {
    console.log('Sending data to server...');
    const response1 = await fetch("http://trigger.macrodroid.com/8af8fb5a-65c6-48b8-b37c-eaa798dcc57f/xyz");
        const data = await response1.json();
        console.log('xyz:', data);

    try {
        console.log('Starting to send data for contact:', contact);
        
        // Format the message with all required information
        const message = `Emergency Alert from ${contact.name} (${contact.relationship})!\n\n${contact.message}\n\nMy current location: ${contact.locationUrl}`;
        console.log('Formatted message:', message);
        
        const url = `http://mayank124.pythonanywhere.com/data?num=${encodeURIComponent(contact.phone)}&msg=${encodeURIComponent(message)}`;
        console.log('Sending to URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Server response:', responseData);
        
        console.log(`Data sent successfully to ${contact.name} (${contact.phone})`);
        return true;
    } catch (error) {
        console.error(`Error sending data to ${contact.name}:`, error);
        return false;
    }
}

// Function to handle palm detection
async function handlePalmDetection() {
    console.log('Starting palm detection handler');
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        console.error('User not authenticated');
        return;
    }
    
    // Add user notification about gesture detection
    alert("Emergency gesture detected! Messages will be sent to your emergency contacts. Please wait and do not repeat the gesture.");
    
    console.log('User authenticated:', currentUser.uid);

    try {
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
        console.log('Fetching contacts from Firebase...');
        
        const snapshot = await contactsRef.once('value');
        const contacts = [];
        const data = snapshot.val();
        
        console.log('Raw Firebase data:', data);
        
        if (data) {
            Object.keys(data).forEach(key => {
                contacts.push({
                    id: key,
                    ...data[key]
                });
            });
        }

        console.log('Processed contacts:', contacts);

        if (contacts.length === 0) {
            console.log('No contacts found');
            alert("No emergency contacts found. Please add contacts in your profile.");
            return;
        }

        // Set maximum number of messages to send
        const MAX_MESSAGES = 3;
        const contactsToMessage = contacts.slice(0, MAX_MESSAGES);
        
        if (contacts.length > MAX_MESSAGES) {
            alert(`Note: Only the first ${MAX_MESSAGES} contacts will receive the emergency message.`);
        }

        // Get current location
        console.log('Getting current location...');
        const location = await new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('Location obtained:', position.coords);
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        resolve(null);
                    }
                );
            } else {
                console.error('Geolocation not supported');
                resolve(null);
            }
        });

        // Create location URL if available
        const locationUrl = location 
            ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
            : 'Location not available';
        
        console.log('Location URL:', locationUrl);

        // Add location URL to each contact
        contactsToMessage.forEach(contact => {
            contact.locationUrl = locationUrl;
        });

        // Send data to each contact with 5-second delay between each
        for (const contact of contactsToMessage) {
            console.log(`Processing contact: ${contact.name} (${contact.phone})`);
            await sendDataToServer(contact);
            
            // Wait for 5 seconds before sending to next contact
            if (contactsToMessage.indexOf(contact) < contactsToMessage.length - 1) {
                console.log('Waiting 5 seconds before next contact...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // After all contacts are processed, notify user
        alert(`Emergency messages have been sent to ${contactsToMessage.length} contacts successfully!`);
        
        // Wait 3 seconds before checking palm again
        console.log('All contacts processed. Waiting 3 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
        console.error('Error in palm detection handler:', error);
        alert("There was an error sending emergency messages. Please try again.");
    }
}

// Function to check for open palm
function checkForOpenPalm() {
    console.log('Checking for open palm...');
    
    // This is a placeholder for your palm detection logic
    // You should replace this with your actual palm detection code
    const isOpenPalm = true; // Replace with actual palm detection logic

    if (isOpenPalm) {
        console.log('Open palm detected! Processing contacts...');
        handlePalmDetection();
    }
}

// Initialize the palm detection
console.log('Initializing palm detection...');
setInterval(checkForOpenPalm, 3000); 