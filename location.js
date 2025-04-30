// Initialize variables
let watchId = null;

// Get DOM elements
const getLocationBtn = document.getElementById('get-location');
const shareLocationBtn = document.getElementById('share-location');
const stopSharingBtn = document.getElementById('stop-sharing');
const locationStatus = document.getElementById('location-status');
const locationDetails = document.getElementById('location-details');
const latitudeElement = document.getElementById('latitude');
const longitudeElement = document.getElementById('longitude');
const accuracyElement = document.getElementById('accuracy');

// Add event listeners
getLocationBtn.addEventListener('click', getLocation);
shareLocationBtn.addEventListener('click', startSharingLocation);
stopSharingBtn.addEventListener('click', stopSharingLocation);

// Function to get current location
function getLocation() {
    if (navigator.geolocation) {
        locationStatus.textContent = 'Getting location...';
        navigator.geolocation.getCurrentPosition(
            showPosition,
            handleError,
            { enableHighAccuracy: true }
        );
    } else {
        locationStatus.textContent = 'Geolocation is not supported by your browser';
    }
}

// Function to show position
function showPosition(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    // Update status and show details
    locationStatus.textContent = 'Location found!';
    locationDetails.style.display = 'block';
    
    // Update location information
    latitudeElement.textContent = latitude.toFixed(6);
    longitudeElement.textContent = longitude.toFixed(6);
    accuracyElement.textContent = Math.round(accuracy);
    
    // Show share button
    shareLocationBtn.style.display = 'block';
}

// Function to handle errors
function handleError(error) {
    let message = 'Error getting location: ';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message += 'User denied the request for Geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            message += 'The request to get user location timed out.';
            break;
        default:
            message += 'An unknown error occurred.';
    }
    locationStatus.textContent = message;
}

// Function to start sharing location
function startSharingLocation() {
    if (navigator.geolocation) {
        locationStatus.textContent = 'Sharing location...';
        watchId = navigator.geolocation.watchPosition(
            updatePosition,
            handleError,
            { enableHighAccuracy: true }
        );
        
        // Update UI
        shareLocationBtn.style.display = 'none';
        stopSharingBtn.style.display = 'block';
        
        // Create and display share link
        createShareLink();
    }
}

// Function to create shareable link
function createShareLink() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-container';
    shareContainer.style.marginTop = '1rem';
    shareContainer.style.textAlign = 'center';
    
    const shareText = document.createElement('p');
    shareText.textContent = 'Share this link to track your location:';
    shareText.style.marginBottom = '0.5rem';
    
    const shareLink = document.createElement('a');
    const mapsUrl = `https://www.google.com/maps?q=${latitudeElement.textContent},${longitudeElement.textContent}`;
    shareLink.href = mapsUrl;
    shareLink.textContent = 'Open in Google Maps';
    shareLink.target = '_blank';
    shareLink.style.color = '#1a73e8';
    shareLink.style.textDecoration = 'none';
    shareLink.style.padding = '0.5rem 1rem';
    shareLink.style.backgroundColor = '#f8f9fa';
    shareLink.style.borderRadius = '4px';
    shareLink.style.display = 'inline-block';
    
    shareContainer.appendChild(shareText);
    shareContainer.appendChild(shareLink);
    
    // Add to location content
    const locationContent = document.querySelector('.location-content');
    locationContent.appendChild(shareContainer);
}

// Function to update position during sharing
function updatePosition(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    // Update location information
    latitudeElement.textContent = latitude.toFixed(6);
    longitudeElement.textContent = longitude.toFixed(6);
    accuracyElement.textContent = Math.round(accuracy);
    
    // Update share link if it exists
    const shareLink = document.querySelector('.share-container a');
    if (shareLink) {
        shareLink.href = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
}

// Function to stop sharing location
function stopSharingLocation() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        
        // Update UI
        locationStatus.textContent = 'Location sharing stopped';
        shareLocationBtn.style.display = 'block';
        stopSharingBtn.style.display = 'none';
        
        // Remove share link
        const shareContainer = document.querySelector('.share-container');
        if (shareContainer) {
            shareContainer.remove();
        }
    }
} 