# Silent SOS - Emergency Gesture Recognition

Silent SOS is a safety application designed to help users send emergency alerts using hand gestures. The app leverages advanced gesture recognition technology to detect specific hand movements and automatically notify emergency contacts with the user's location. This project is built with a combination of HTML, CSS, JavaScript, Firebase, and MediaPipe.

## Features

- **Gesture-Based Emergency Alerts**: Detects hand gestures like an open palm or closed fist to trigger emergency alerts.
- **Automatic Location Sharing**: Sends the user's live location to emergency contacts.
- **Emergency Contact Management**: Allows users to add, edit, and delete emergency contacts.
- **Discreet Operation**: Works silently in the background to ensure user safety.
- **Real-Time Gesture Recognition**: Uses MediaPipe for real-time gesture detection via webcam.
- **Firebase Integration**: Manages user authentication and stores emergency contact data securely.

---

## Project Structure

### HTML Files
- **`index.html`**: The main page for gesture recognition and emergency alerts.
- **`signin.html`**: The sign-in page for user authentication using Google.
- **`contacts.html`**: A page for managing emergency contacts.
- **`location.html`**: A page for live location sharing.
- **`about.html`**: An informational page about the app.

### CSS Files
- **`style.css`**: Contains all the styles for the application, including responsive design for mobile devices.

### JavaScript Files
- **`script.js`**: Handles gesture recognition using MediaPipe's GestureRecognizer.
- **`palm-detection.js`**: Detects palm gestures and sends emergency alerts to contacts.
- **`palm-detection-compat.js`**: A compatibility version of palm detection for older browsers.
- **`contacts.js`**: Manages emergency contacts, including adding, editing, and deleting contacts.
- **`location.js`**: Handles live location sharing and generates shareable location links.
- **`auth.js`**: Manages user authentication and profile display.
- **`firebase-config.js`**: Configures Firebase for authentication and database operations.

### Firebase Integration
- Firebase is used for:
  - User authentication (Google Sign-In).
  - Storing emergency contacts in the Firebase Realtime Database.
  - Managing user-specific data like distress messages and location.

---

## How It Works

1. **Sign In**: Users sign in using their Google account via Firebase Authentication.
2. **Gesture Recognition**:
   - Users enable their webcam and perform specific gestures (e.g., open palm or closed fist).
   - MediaPipe detects the gesture and triggers the emergency alert process.
3. **Emergency Alerts**:
   - The app retrieves the user's emergency contacts from Firebase.
   - It sends a distress message along with the user's live location to the contacts.
4. **Location Sharing**:
   - Users can manually share their live location via a Google Maps link.
5. **Contact Management**:
   - Users can add, edit, or delete emergency contacts through the `contacts.html` page.

---

## Setup Instructions

### Prerequisites
- A Firebase project with Authentication and Realtime Database enabled.
- A modern web browser with webcam support.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/silent-sos.git
   cd silent-sos

2. Replace the placeholder Firebase configuration in firebase-config.js with your Firebase project details:
 const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

3. Open index.html in a browser to start the application.

Dependencies :
MediaPipe: For gesture recognition.
Firebase: For authentication and database operations.
Material Components for the Web: For UI components and styling
