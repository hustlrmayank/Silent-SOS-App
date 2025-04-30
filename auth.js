document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                // Here you would typically make an API call to your authentication service
                // For now, we'll just simulate a successful login
                console.log('Signing in with:', email);
                
                // Store the authentication state
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                
                // Redirect to the main page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Sign in error:', error);
                alert('Sign in failed. Please try again.');
            }
        });
    }
    
    // Check authentication status
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
        // Update UI to show user is logged in
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const userEmail = localStorage.getItem('userEmail');
            navLinks.innerHTML = `
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="contacts.html">Emergency Contacts</a>
                <a href="location.html">Live Location</a>
      <div class="profile-dropdown">
        <button class="profile-btn">
          <img id="nav-profile-pic" src="" alt="Profile" class="nav-profile-pic">
          <span id="nav-user-email" class="user-email"></span>
        </button>
        <div class="dropdown-content">
          <a href="#" id="nav-signout">Sign Out</a>
        </div>
      </div>
            `;
            
            document.getElementById('signout').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userEmail');
                window.location.href = 'index.html';
            });
        }
    }

    // Get DOM elements
    const googleSignInBtn = document.getElementById('googleSignIn');
    const errorMessage = document.getElementById('error-message');
    const signinSection = document.getElementById('signin-section');
    const profileSection = document.getElementById('profile-section');
    const profilePicture = document.getElementById('profile-picture');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const signoutBtn = document.getElementById('signout');
    const userEmailSpan = document.querySelector('.user-email');

    // Function to update profile display
    function updateProfileDisplay(user) {
        if (user) {
            // Show profile section and hide sign-in section
            signinSection.style.display = 'none';
            profileSection.style.display = 'block';
            
            // Update profile information
            profilePicture.src = user.photoURL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/default-profile.png';
            userName.textContent = user.displayName || 'User';
            userEmail.textContent = user.email;
            
            // Update navigation bar email
            if (userEmailSpan) {
                userEmailSpan.textContent = user.email;
            }
        } else {
            // Show sign-in section and hide profile section
            signinSection.style.display = 'block';
            profileSection.style.display = 'none';
            
            // Clear navigation bar email
            if (userEmailSpan) {
                userEmailSpan.textContent = '';
            }
        }
    }

    // Check if user is already signed in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, update profile display and redirect to main page
            updateProfileDisplay(user);
            window.location.href = 'index.html';
        } else {
            // User is signed out, show sign-in section
            updateProfileDisplay(null);
        }
    });

    // Handle Google Sign-In
    googleSignInBtn.addEventListener('click', () => {
        auth.signInWithPopup(provider)
            .then((result) => {
                // Successfully signed in
                const user = result.user;
                console.log('Signed in as:', user.displayName);
                
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify({
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                }));
                
                // Set authentication flag
                localStorage.setItem('isAuthenticated', 'true');
                
                // Update profile display and redirect to main page
                updateProfileDisplay(user);
                window.location.href = 'index.html';
            })
            .catch((error) => {
                // Handle errors
                console.error('Sign-in error:', error);
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            });
    });

    // Handle Sign Out
    signoutBtn.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                // Clear user data from localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                
                // Update profile display
                updateProfileDisplay(null);
                
                // Show success message
                errorMessage.textContent = 'Successfully signed out';
                errorMessage.style.display = 'block';
                errorMessage.style.color = '#28a745';
                errorMessage.style.backgroundColor = '#d4edda';
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            })
            .catch((error) => {
                // Handle errors
                console.error('Sign-out error:', error);
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            });
    });
}); 