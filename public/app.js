// app.js - Basic interactivity for Quick Memo and Login/Signup popups with Firebase Auth

// Firebase SDK v9+ modular import (These are needed for app.js)
// Note: In a full project, you'd typically import these using modules,
// but for direct HTML script tags, we use the global 'firebase' object.
// Ensure firebase-app-compat.js and firebase-auth-compat.js are loaded in index.html

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization (from index.html) ---
    // Ensure firebaseConfig is defined in index.html BEFORE app.js is loaded
    // And firebase.initializeApp(firebaseConfig) is called there.
    // We can now get the auth instance globally.
    const auth = firebase.auth(); // Get the Firebase Auth service instance


    // --- Quick Memo related DOM elements ---
    const quickMemoFab = document.querySelector('.quick-memo-fab');
    const quickMemoPopupOverlay = document.querySelector('.quick-memo-popup-overlay');
    const closePopupButton = document.querySelector('.close-popup-button');
    const saveMemoButton = document.querySelector('.save-memo-button');
    const memoInput = document.querySelector('.memo-input');
    const memoLimitInfo = document.querySelector('.memo-limit-info');
    const micButton = document.querySelector('.mic-button');
    const recordingTimer = document.querySelector('.recording-timer');

    // --- Auth (Login/Signup) related DOM elements ---
    const loginButton = document.querySelector('.login-button'); // Login button in header
    const authPopupOverlay = document.querySelector('.auth-popup-overlay');
    const closeAuthPopupButton = document.querySelector('.close-auth-popup-button');
    const authPopupTitle = document.getElementById('auth-popup-title');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const authConfirmPasswordInput = document.getElementById('auth-confirm-password');
    const authSubmitButton = document.getElementById('auth-submit-button');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const authErrorDisplay = document.querySelector('.auth-error-message');

    const MAX_FREE_MEMOS = 5; // Define the maximum number of free memos
    let isRecording = false; // For voice memo
    let recognition; // For Web Speech API
    let timerInterval;
    let seconds = 0;
    let isLoginMode = true; // State to track if currently in Login or Signup mode

    // --- Utility functions for Local Storage (Quick Memo) ---
    function loadMemosFromLocalStorage() {
        const memosJson = localStorage.getItem('quickMemos');
        if (!memosJson) {
            return [];
        }
        try {
            const memos = JSON.parse(memosJson);
            return Array.isArray(memos) ? memos : [];
        } catch (e) {
            console.error("Error parsing memos from local storage:", e);
            localStorage.removeItem('quickMemos');
            return [];
        }
    }

    function saveMemoToLocalStorage(memo) {
        let memos = loadMemosFromLocalStorage();
        memos.unshift({
            id: Date.now(),
            content: memo,
            timestamp: new Date().toISOString()
        });

        if (memos.length > MAX_FREE_MEMOS) {
            memos = memos.slice(0, MAX_FREE_MEMOS);
        }
        localStorage.setItem('quickMemos', JSON.stringify(memos));
        updateMemoCountDisplay();
    }

    function updateMemoCountDisplay() {
        const memos = loadMemosFromLocalStorage();
        const currentCount = memos.length;
        memoLimitInfo.textContent = `You have ${currentCount} of ${MAX_FREE_MEMOS} free memos remaining.`;
        if (currentCount >= MAX_FREE_MEMOS) {
            memoLimitInfo.style.color = '#e74c3c';
        } else {
            memoLimitInfo.style.color = '#aaa';
        }
    }

    // --- Quick Memo Popup Interactivity ---
    if (quickMemoFab) {
        quickMemoFab.addEventListener('click', () => {
            quickMemoPopupOverlay.classList.remove('hidden');
            memoInput.focus();
            updateMemoCountDisplay();
        });
    }

    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            quickMemoPopupOverlay.classList.add('hidden');
            memoInput.value = '';
            stopRecording();
        });
    }

    if (quickMemoPopupOverlay) {
        quickMemoPopupOverlay.addEventListener('click', (event) => {
            if (event.target === quickMemoPopupOverlay) {
                quickMemoPopupOverlay.classList.add('hidden');
                memoInput.value = '';
                stopRecording();
            }
        });
    }

    if (saveMemoButton) {
        saveMemoButton.addEventListener('click', () => {
            const memoContent = memoInput.value.trim();
            if (memoContent) {
                saveMemoToLocalStorage(memoContent);
                console.log("Memo saved to local storage:", memoContent);
                alert("Memo saved! (Up to 5 free memos. Login for unlimited storage)");
                quickMemoPopupOverlay.classList.add('hidden');
                memoInput.value = '';
                stopRecording();
            } else {
                alert("Please write something or record your voice.");
            }
        });
    }

    // --- Voice Memo functionality (Web Speech API) ---
    if (micButton) {
        micButton.addEventListener('click', () => {
            if (!isRecording) {
                // Start recording
                isRecording = true;
                micButton.style.backgroundColor = '#c0392b';
                micButton.textContent = '■';
                recordingTimer.textContent = '00:00';
                seconds = 0;
                timerInterval = setInterval(() => {
                    seconds++;
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    recordingTimer.textContent =
                        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                }, 1000);

                if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                    recognition.interimResults = true;
                    recognition.lang = 'en-US';
                    recognition.continuous = true;

                    recognition.onresult = (event) => {
                        let interimTranscript = '';
                        let finalTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                            const transcript = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                finalTranscript += transcript;
                            } else {
                                interimTranscript += transcript;
                            }
                        }
                        memoInput.value = (memoInput.value ? memoInput.value + ' ' : '') + finalTranscript + interimTranscript;
                    };

                    recognition.onerror = (event) => {
                        console.error('Speech recognition error:', event);
                        alert("Voice recording error. Please check microphone or try again.");
                        stopRecording();
                    };

                    recognition.onend = () => {
                         if (isRecording) {
                            recognition.start();
                         }
                    };

                    recognition.start();
                } else {
                    alert("Voice recording is not supported in this browser.");
                    stopRecording();
                }

            } else {
                // Stop recording
                stopRecording();
            }
        });
    }

    function stopRecording() {
        isRecording = false;
        micButton.style.backgroundColor = '#e74c3c';
        micButton.textContent = '🎤';
        clearInterval(timerInterval);
        recordingTimer.textContent = '00:00';
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }

    // App load: initial memo count display
    updateMemoCountDisplay();


    // --- Auth (Login/Signup) Popup Interactivity ---

    // Show auth popup when Login button is clicked
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            authPopupOverlay.classList.remove('hidden');
            authPopupTitle.textContent = 'Login'; // Default to Login
            authSubmitButton.textContent = 'Login';
            authConfirmPasswordInput.classList.add('hidden'); // Hide confirm password for login
            showSignupLink.classList.remove('hidden'); // Show "Don't have account?"
            showLoginLink.classList.add('hidden'); // Hide "Already have account?"
            authErrorDisplay.classList.add('hidden'); // Hide any previous errors
            authEmailInput.value = ''; // Clear inputs
            authPasswordInput.value = '';
            authConfirmPasswordInput.value = '';
            isLoginMode = true; // Set mode to Login
        });
    }

    // Hide auth popup when close button is clicked
    if (closeAuthPopupButton) {
        closeAuthPopupButton.addEventListener('click', () => {
            authPopupOverlay.classList.add('hidden');
            authErrorDisplay.classList.add('hidden'); // Hide errors on close
        });
    }

    // Hide auth popup when clicking outside the popup content (on the overlay)
    if (authPopupOverlay) {
        authPopupOverlay.addEventListener('click', (event) => {
            if (event.target === authPopupOverlay) {
                authPopupOverlay.classList.add('hidden');
                authErrorDisplay.classList.add('hidden'); // Hide errors on close
            }
        });
    }

    // Toggle to Signup mode
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            authPopupTitle.textContent = 'Sign Up';
            authSubmitButton.textContent = 'Sign Up';
            authConfirmPasswordInput.classList.remove('hidden'); // Show confirm password for signup
            showSignupLink.classList.add('hidden'); // Hide "Don't have account?"
            showLoginLink.classList.remove('hidden'); // Show "Already have account?"
            authErrorDisplay.classList.add('hidden'); // Hide any previous errors
            authEmailInput.value = ''; // Clear inputs
            authPasswordInput.value = '';
            authConfirmPasswordInput.value = '';
            isLoginMode = false; // Set mode to Signup
        });
    }

    // Toggle to Login mode
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            authPopupTitle.textContent = 'Login';
            authSubmitButton.textContent = 'Login';
            authConfirmPasswordInput.classList.add('hidden'); // Hide confirm password for login
            showSignupLink.classList.remove('hidden'); // Hide "Don't have account?"
            showLoginLink.classList.add('hidden'); // Show "Already have account?"
            authErrorDisplay.classList.add('hidden'); // Hide any previous errors
            authEmailInput.value = ''; // Clear inputs
            authPasswordInput.value = '';
            authConfirmPasswordInput.value = '';
            isLoginMode = true; // Set mode to Login
        });
    }

    // Handle Login/Signup button click (Firebase Auth Integration)
    if (authSubmitButton) {
        authSubmitButton.addEventListener('click', async () => { // Added 'async' keyword
            const email = authEmailInput.value.trim();
            const password = authPasswordInput.value.trim();
            const confirmPassword = authConfirmPasswordInput.value.trim();

            authErrorDisplay.classList.add('hidden'); // Hide previous errors
            authErrorDisplay.textContent = ''; // Clear previous error text

            if (!email || !password) {
                authErrorDisplay.textContent = 'Email and password cannot be empty.';
                authErrorDisplay.classList.remove('hidden');
                return;
            }

            if (isLoginMode) {
                // --- Firebase Login ---
                try {
                    await auth.signInWithEmailAndPassword(email, password);
                    alert('Login successful!'); // Use alert temporarily
                    authPopupOverlay.classList.add('hidden'); // Hide popup on success
                    console.log('User logged in:', auth.currentUser.email);
                    // TODO: Redirect user or update UI for logged-in state
                } catch (error) {
                    console.error('Login error:', error);
                    let errorMessage = 'An unknown error occurred during login.';
                    if (error.code) {
                        switch (error.code) {
                            case 'auth/invalid-email':
                                errorMessage = 'Invalid email address format.';
                                break;
                            case 'auth/user-disabled':
                                errorMessage = 'This user account has been disabled.';
                                break;
                            case 'auth/user-not-found':
                            case 'auth/wrong-password':
                                errorMessage = 'Incorrect email or password.';
                                break;
                            default:
                                errorMessage = error.message;
                        }
                    }
                    authErrorDisplay.textContent = errorMessage;
                    authErrorDisplay.classList.remove('hidden');
                }
            } else {
                // --- Firebase Signup ---
                if (password !== confirmPassword) {
                    authErrorDisplay.textContent = 'Passwords do not match.';
                    authErrorDisplay.classList.remove('hidden');
                    return;
                }
                if (password.length < 6) {
                    authErrorDisplay.textContent = 'Password must be at least 6 characters long.';
                    authErrorDisplay.classList.remove('hidden');
                    return;
                }

                try {
                    await auth.createUserWithEmailAndPassword(email, password);
                    alert('Signup successful! Please log in.'); // Use alert temporarily
                    authPopupOverlay.classList.add('hidden'); // Hide popup on success
                    console.log('User signed up:', auth.currentUser.email);
                    // TODO: Optionally, automatically log in the user or redirect
                } catch (error) {
                    console.error('Signup error:', error);
                    let errorMessage = 'An unknown error occurred during signup.';
                    if (error.code) {
                        switch (error.code) {
                            case 'auth/email-already-in-use':
                                errorMessage = 'This email address is already in use.';
                                break;
                            case 'auth/invalid-email':
                                errorMessage = 'Invalid email address format.';
                                break;
                            case 'auth/operation-not-allowed':
                                errorMessage = 'Email/password sign-in is not enabled. (Check Firebase console)';
                                break;
                            case 'auth/weak-password':
                                errorMessage = 'Password is too weak. Please use a stronger password.';
                                break;
                            default:
                                errorMessage = error.message;
                        }
                    }
                    authErrorDisplay.textContent = errorMessage;
                    authErrorDisplay.classList.remove('hidden');
                }
            }
        });
    }

    // --- Firebase Authentication State Listener (Optional, for UI updates) ---
    // This will run whenever the user's login state changes
    auth.onAuthStateChanged((user) => {
        const headerLoginButton = document.querySelector('.login-button');
        if (user) {
            // User is signed in.
            console.log('User is logged in:', user.email);
            if (headerLoginButton) {
                headerLoginButton.textContent = 'Logout'; // Change button to Logout
                headerLoginButton.removeEventListener('click', showAuthPopup); // Remove old listener
                headerLoginButton.addEventListener('click', handleLogout); // Add logout listener
            }
            // TODO: Update other UI elements for logged-in state (e.g., show user's name, hide login prompt in quick memo)
        } else {
            // User is signed out.
            console.log('User is logged out.');
            if (headerLoginButton) {
                headerLoginButton.textContent = 'Login'; // Change button back to Login
                headerLoginButton.removeEventListener('click', handleLogout); // Remove logout listener
                headerLoginButton.addEventListener('click', showAuthPopup); // Add back login listener
            }
            // TODO: Update other UI elements for logged-out state
        }
    });

    // Helper function to show auth popup (to be used by loginButton)
    function showAuthPopup() {
        authPopupOverlay.classList.remove('hidden');
        authPopupTitle.textContent = 'Login';
        authSubmitButton.textContent = 'Login';
        authConfirmPasswordInput.classList.add('hidden');
        showSignupLink.classList.remove('hidden');
        showLoginLink.classList.add('hidden');
        authErrorDisplay.classList.add('hidden');
        authEmailInput.value = '';
        authPasswordInput.value = '';
        authConfirmPasswordInput.value = '';
        isLoginMode = true;
    }

    // Helper function to handle logout
    async function handleLogout() {
        try {
            await auth.signOut();
            alert('Logged out successfully!');
            console.log('User logged out.');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout: ' + error.message);
        }
    }

    // Re-attach login button listener after initial setup, as it might be removed/added by onAuthStateChanged
    if (loginButton) {
        // Ensure only one listener is active at any time
        loginButton.removeEventListener('click', showAuthPopup); // Remove any potential duplicate
        loginButton.removeEventListener('click', handleLogout); // Remove any potential duplicate
        // Attach the correct listener based on current auth state (handled by onAuthStateChanged)
        // For initial load, it will attach showAuthPopup if not logged in.
        // If already logged in (e.g., after refresh), onAuthStateChanged will set it to Logout.
        auth.onAuthStateChanged(user => {
            if (!user) { // If not logged in initially
                loginButton.addEventListener('click', showAuthPopup);
            }
        });
    }

});
