// Function to send data to the specified URL
async function sendDataToServer(contact) {
    console.log('Making request to status URL...');
        const statusResponse = await fetch("https://tinyurl.com/233negpb/xyz");
        console.log('Status URL response:', statusResponse.status);
        alert("Data sent successfully to " + contact.name + " (" + contact.phone + ")");
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
        
        // Make request to the second URL
        console.log('Making request to status URL...');
        const statusResponse = await fetch("https://tinyurl.com/233negpb/xyz");
        console.log('Status URL response:', statusResponse.status);
        
        console.log(`Data sent successfully to ${contact.name} (${contact.phone})`);
        alert("Data sent successfully to " + contact.name + " (" + contact.phone + ")");
        return true;
    } catch (error) {
        console.error(`Error sending data to ${contact.name}:`, error);
        return false;
    }
}

// Function to handle palm detection
async function handlePalmDetection() {
    console.log('Starting palm detection handler');
    
    const currentUser = firebase.auth().currentUser;
    
    if (!currentUser) {
        console.error('User not authenticated');
        return;
    }
    
    console.log('User authenticated:', currentUser.uid);

    try {
        const contactsRef = firebase.database().ref(`users/${currentUser.uid}/contacts`);
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
            return;
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
        contacts.forEach(contact => {
            contact.locationUrl = locationUrl;
        });

        // Send data to each contact with 5-second delay between each
        for (const contact of contacts) {
            console.log(`Processing contact: ${contact.name} (${contact.phone})`);
            await sendDataToServer(contact);
            
            // Wait for 5 seconds before sending to next contact
            if (contacts.indexOf(contact) < contacts.length - 1) {
                console.log('Waiting 5 seconds before next contact...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // After all contacts are processed, wait 3 seconds before checking palm again
        console.log('All contacts processed. Waiting 3 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
        console.error('Error in palm detection handler:', error);
    }
}

// Function to check for open palm
let detected = true;
function checkForOpenPalm() {
    console.log('Checking for open palm...');
    if(document.getElementById('gesture_output').innerHTML.includes('Open_Palm') && detected){
        console.log('Open palm detected! Processing contacts...');
        handlePalmDetection();
        detected = false;
    }
    else{
        detected = true;
    }
}

// Initialize the palm detection
console.log('Initializing palm detection...');
setInterval(checkForOpenPalm, 3000); 