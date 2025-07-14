// app.js - Basic interactivity for Quick Memo and Login/Signup popups with Firebase Auth

// NUCLEAR TEST SCRIPT: This must appear in console on page load.
// If this does not appear, the problem is extremely low-level (e.g., app.js file corruption or HTML parsing issue).
console.log("APP.JS: FILE PARSED AND EXECUTING (OUTSIDE DOMContentLoaded)");
// alert("APP.JS: FILE PARSED AND EXECUTING (OUTSIDE DOMContentLoaded)"); // **배포 시에는 이 줄을 반드시 제거하세요!**

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization (from index.html) ---
    // Ensure firebaseConfig is defined in index.html BEFORE app.js is loaded
    // And firebase.initializeApp(firebaseConfig) is called there.
    // We can now get the auth and firestore instances globally.
    const auth = firebase.auth(); // Get the Firebase Auth service instance
    const db = firebase.firestore(); // Get the Firebase Firestore service instance

    // --- DOM Element References (All elements are declared once here for clarity) ---
    // HTML 파일에 아래 ID들이 정확히 부여되어 있어야 합니다.
    // Quick Memo related
    const quickMemoFab = document.getElementById('quick-memo-fab-button'); 
    const quickMemoPopupOverlay = document.querySelector('.quick-memo-popup-overlay');
    const closePopupButton = document.querySelector('.quick-memo-popup-overlay .close-popup-button'); // 특정 팝업 내 닫기 버튼
    const saveMemoButton = document.querySelector('.quick-memo-popup-overlay .save-memo-button'); // 퀵 메모 저장 버튼
    const memoInput = document.querySelector('.quick-memo-popup-overlay textarea.memo-input');
    const memoLimitInfo = document.querySelector('.memo-limit-info');
    const micButton = document.querySelector('.mic-button');
    const recordingTimer = document.querySelector('.recording-timer');

    // Auth (Login/Signup) related
    const loginButton = document.getElementById('login-button'); // **ID로 변경 권장**
    const authPopupOverlay = document.querySelector('.auth-popup-overlay');
    const closeAuthPopupButton = document.querySelector('.auth-popup-overlay .close-auth-popup-button'); // 특정 팝업 내 닫기 버튼
    const authPopupTitle = document.getElementById('auth-popup-title');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const authConfirmPasswordInput = document.getElementById('auth-confirm-password');
    const authSubmitButton = document.getElementById('auth-submit-button');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const authErrorDisplay = document.querySelector('.auth-error-message');

    // Global Message Display
    const appMessageDisplay = document.querySelector('.app-message-display');

    // Main Content Screens
    const verseOfTheDayScreen = document.getElementById('verse-of-the-day-screen');
    const sermonSelectionButtonsScreen = document.getElementById('sermon-selection-buttons-screen');
    const sermonExpositoryScreen = document.getElementById('sermon-expository-screen');
    const sermonRealLifeScreen = document.getElementById('sermon-real-life-screen');
    const sermonLinkedScreen = document.getElementById('sermon-linked-screen');

    // 햄버거 메뉴 버튼 참조 (ID로 직접 찾음)
    const menuButton = document.getElementById('main-menu-button'); 

    // Expository Sermon Screen specific elements
    const expositoryGenerateAiButton = document.getElementById('expository-generate-ai-button');
    const expositoryLoadingIndicator = document.getElementById('expository-loading-indicator');
    const expositoryScriptureInput = document.getElementById('expository-scripture-input');
    const expositoryLookupButton = document.getElementById('expository-lookup-button');
    const expositoryScriptureDisplay = document('expository-scripture-display');
    const expositoryOriginalLangButton = document.getElementById('expository-original-lang-button');
    const expositoryCommentaryButton = document.getElementById('expository-commentary-button');
    const expositoryOriginalLangDisplay = document.getElementById('expository-original-lang-display');
    const expositoryCommentaryDisplay = document.getElementById('expository-commentary-display');
    const expositoryOriginalLangLoading = document.getElementById('expository-original-lang-loading');
    const expositoryCommentaryLoading = document.getElementById('expository-commentary-loading');

    // Real-Life Application Sermon Screen specific elements
    const realLifeSermonInput = document.getElementById('real-life-sermon-input');
    const realLifeGenerateAiButton = document.getElementById('real-life-generate-ai-button');
    const realLifeLoadingIndicator = document.getElementById('real-life-loading-indicator');
    const realLifeScriptureInput = document.getElementById('real-life-scripture-input');
    const realLifeLookupButton = document.getElementById('real-life-lookup-button');
    const realLifeScriptureDisplay = document.getElementById('real-life-scripture-display');
    const realLifePrintButton = document.getElementById('real-life-print-button');
    const realLifePdfButton = document.getElementById('real-life-pdf-button');
    const realLifeSaveMemoButton = document.querySelector('#sermon-real-life-screen .save-memo-button'); // Real-Life Sermon의 저장 버튼

    // Quick Memo Linked Sermon Screen specific elements
    const linkedSermonOutput = document.getElementById('linked-sermon-output');
    const linkedGenerateAiButton = document.getElementById('linked-generate-ai-button');
    const linkedLoadingIndicator = document.getElementById('linked-loading-indicator');
    const linkedScriptureInput = document.getElementById('linked-scripture-input');
    const linkedLookupButton = document.getElementById('linked-lookup-button');
    const linkedScriptureDisplay = document.getElementById('linked-scripture-display');
    const linkedPrintButton = document.getElementById('linked-print-button');
    const linkedPdfButton = document.getElementById('linked-pdf-button');
    const linkedSaveMemoButton = document.querySelector('#sermon-linked-screen .save-memo-button'); // Linked Sermon의 저장 버튼

    // Contextual Lookup Popup related
    const contextualLookupPopup = document.getElementById('contextual-lookup-popup');
    const contextualContentArea = document.getElementById('contextual-content-area');
    const closeContextualPopupButton = contextualLookupPopup ? contextualLookupPopup.querySelector('.close-contextual-popup') : null;
    const addToSermonButton = contextualLookupPopup ? contextualLookupPopup.querySelector('.add-to-sermon-button') : null;


    // --- DEBUGGING LOGS (DOM Elements Check) ---
    console.log("DEBUG on load: quickMemoFab element:", quickMemoFab);
    console.log("DEBUG on load: loginButton element:", loginButton);
    console.log("DEBUG on load: menuButton element:", menuButton); 
    console.log("DEBUG on load: authPopupOverlay element:", authPopupOverlay);
    console.log("DEBUG on load: quickMemoPopupOverlay element:", quickMemoPopupOverlay);
    // ... (나머지 console.log는 유지)

    // --- Global Variables & Constants ---
    const MAX_FREE_MEMOS = 5;
    let isRecording = false;
    let recognition;
    let timerInterval;
    let seconds = 0;
    let isLoginMode = true; 
    let messageTimeout;
    let currentSelectedText = ''; 
    let currentSermonDraftContent = ''; // 동적으로 생성된 설교 초안 내용을 저장할 변수

    // --- Utility functions for Local Storage (Quick Memo) ---
    function loadMemosFromLocalStorage() {
        console.log("DEBUG: loadMemosFromLocalStorage called.");
        const memosJson = localStorage.getItem('quickMemos');
        console.log("DEBUG: quickMemos from localStorage (raw):", memosJson);
        if (!memosJson) {
            console.log("DEBUG: quickMemos is null or empty, returning [].");
            return [];
        }
        try {
            const memos = JSON.parse(memosJson);
            console.log("DEBUG: quickMemos parsed (array):", memos);
            console.log("DEBUG: quickMemos parsed length:", memos.length);
            return Array.isArray(memos) ? memos : [];
        } catch (e) {
            console.error("ERROR: Error parsing memos from local storage:", e);
            localStorage.removeItem('quickMemos');
            return [];
        }
    }

    function saveMemoToLocalStorage(memo) {
        console.log("DEBUG: saveMemoToLocalStorage called with memo:", memo);
        let memos = loadMemosFromLocalStorage();
        memos.unshift({
            id: Date.now(),
            content: memo,
            timestamp: new Date().toISOString()
        });

        if (memos.length > MAX_FREE_MEMOS) {
            console.log("DEBUG: Memo limit reached, removing oldest memo.");
            memos = memos.slice(0, MAX_FREE_MEMOS);
        }
        localStorage.setItem('quickMemos', JSON.stringify(memos));
        console.log("DEBUG: Memos saved to localStorage:", localStorage.getItem('quickMemos'));
        updateMemoCountDisplay();
        updateSermonLinkedMemoSlots();
    }

    function updateMemoCountDisplay() {
        console.log("DEBUG: updateMemoCountDisplay called.");
        const memos = loadMemosFromLocalStorage();
        const currentCount = memos.length;
        console.log("DEBUG: updateMemoCountDisplay currentCount:", currentCount);
        if (memoLimitInfo) {
            memoLimitInfo.textContent = `You have ${currentCount} of ${MAX_FREE_MEMOS} free memos remaining.`;
            memoLimitInfo.style.color = currentCount >= MAX_FREE_MEMOS ? '#e74c3c' : '#aaa';
            console.log(`DEBUG: Memo limit info text set to: ${memoLimitInfo.textContent}`);
        } else {
            console.warn("WARN: memoLimitInfo element not found for display update.");
        }
        const sermonLinkedMemoCountInfo = document.querySelector('#sermon-linked-screen .text-sm');
        if (sermonLinkedMemoCountInfo) {
            sermonLinkedMemoCountInfo.textContent = `You have ${currentCount} of ${MAX_FREE_MEMOS} free memo slots. Login for unlimited storage.`;
            console.log(`DEBUG: Sermon linked memo count info text set to: ${sermonLinkedMemoCountInfo.textContent}`);
        } else {
            console.warn("WARN: sermonLinkedMemoCountInfo element not found for display update.");
        }
    }

    function displayMemosInSermonLinkedScreen() {
        // 이 함수는 updateSermonLinkedMemoSlots와 기능적으로 동일하여 중복됩니다.
        // updateSermonLinkedMemoSlots 함수를 사용하는 것이 좋습니다.
        console.log("DEBUG: displayMemosInSermonLinkedScreen called - prefer updateSermonLinkedMemoSlots.");
        updateSermonLinkedMemoSlots();
    }

    function deleteMemoFromLocalStorage(indexToDelete) {
        console.log("DEBUG: deleteMemoFromLocalStorage called for index:", indexToDelete);
        let memos = loadMemosFromLocalStorage();
        if (indexToDelete >= 0 && indexToDelete < memos.length) {
            const deletedMemoContent = memos.splice(indexToDelete, 1);
            localStorage.setItem('quickMemos', JSON.stringify(memos));
            showMessage(`Memo "${deletedMemoContent[0].content.substring(0, 20)}..." deleted.`, false);
            updateSermonLinkedMemoSlots(); // 변경된 부분
            updateMemoCountDisplay();
            console.log("DEBUG: Memo successfully deleted and UI updated.");
        } else {
            console.warn("WARN: Attempted to delete memo with invalid index:", indexToDelete);
            showMessage("Could not delete memo: Invalid index.", true);
        }
    }


    // --- Global Message Display Functions ---
    function showMessage(message, isError = false) {
        if (appMessageDisplay) {
            clearTimeout(messageTimeout);
            appMessageDisplay.textContent = message;
            appMessageDisplay.classList.remove('hidden', 'error', 'show');
            appMessageDisplay.classList.add('show');
            if (isError) {
                appMessageDisplay.classList.add('error');
            }
            messageTimeout = setTimeout(() => {
                appMessageDisplay.classList.remove('show');
                // appMessageDisplay.classList.add('hidden'); // hidden 클래스 제거, transition 후 visibility:hidden으로 처리
            }, 5000);
            // CSS transition 이후에 display: none;을 적용할 수 있도록 이벤트 리스너 추가
            appMessageDisplay.addEventListener('transitionend', function handler() {
                if (!appMessageDisplay.classList.contains('show')) {
                    appMessageDisplay.classList.add('hidden');
                    appMessageDisplay.removeEventListener('transitionend', handler);
                }
            });
        } else {
            console.warn("appMessageDisplay element not found. Message:", message);
        }
    }

    function showAuthError(message) {
        if (authErrorDisplay) {
            authErrorDisplay.textContent = message;
            authErrorDisplay.classList.remove('hidden');
        }
    }

    function hideAuthError() {
        if (authErrorDisplay) {
            authErrorDisplay.classList.add('hidden');
            authErrorDisplay.textContent = '';
        }
    }


    // --- Quick Memo Popup Interactivity ---
    if (quickMemoFab) {
        quickMemoFab.addEventListener('click', () => {
            console.log("DEBUG: Quick Memo FAB clicked.");
            if (quickMemoPopupOverlay) {
                quickMemoPopupOverlay.classList.remove('hidden');
                quickMemoPopupOverlay.classList.add('show');
                if (memoInput) { 
                    memoInput.focus();
                } else {
                    console.warn("WARN: memoInput element not found when trying to focus.");
                }
                updateMemoCountDisplay();
                updateSermonLinkedMemoSlots();
            } else {
                console.error("ERROR: quickMemoPopupOverlay not found when Quick Memo FAB clicked.");
            }
        });
    } else {
        console.error("ERROR: quickMemoFab element NOT found during initial load! Please ensure id='quick-memo-fab-button' exists on the FAB button.");
    }

    // 팝업 닫기 버튼은 여러 개일 수 있으므로 querySelectorAll 사용
    document.querySelectorAll('.close-popup-button').forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                console.log("DEBUG: Quick Memo popup close button clicked.");
                if (quickMemoPopupOverlay) {
                    quickMemoPopupOverlay.classList.remove('show');
                    quickMemoPopupOverlay.classList.add('hidden');
                    if (memoInput) {
                        memoInput.value = '';
                    }
                    stopRecording();
                }
            });
        }
    });

    if (quickMemoPopupOverlay) {
        quickMemoPopupOverlay.addEventListener('click', (event) => {
            if (event.target === quickMemoPopupOverlay) {
                console.log("DEBUG: Quick Memo popup overlay clicked. Closing popup.");
                quickMemoPopupOverlay.classList.remove('show');
                quickMemoPopupOverlay.classList.add('hidden');
                if (memoInput) {
                    memoInput.value = '';
                }
                stopRecording();
            }
        });
    } else {
        console.error("ERROR: quickMemoPopupOverlay element NOT found during initial load!");
    }


    if (saveMemoButton) {
        console.log("DEBUG: Attaching listener to saveMemoButton.");
        saveMemoButton.addEventListener('click', () => {
            console.log("DEBUG: Save Memo button CLICKED.");
            const memoContent = memoInput.value.trim();
            if (memoContent) {
                console.log("DEBUG: Memo content is NOT empty:", memoContent);
                saveMemoToLocalStorage(memoContent);
                showMessage("Memo saved! (Up to 5 free memos. Login for unlimited storage)");
                if (quickMemoPopupOverlay) {
                    quickMemoPopupOverlay.classList.remove('show');
                    quickMemoPopupOverlay.classList.add('hidden');
                }
                memoInput.value = '';
                stopRecording();
            } else {
                console.log("DEBUG: Memo content IS empty (will show message).");
                showMessage("Please write something or record your voice.", true);
            }
        });
    } else {
        console.error("ERROR: saveMemoButton element NOT found during initial load! (Quick Memo Popup)");
    }

    // --- Voice Memo functionality (Web Speech API) ---
    if (micButton) {
        micButton.addEventListener('click', () => {
            console.log("DEBUG: Mic button clicked. isRecording:", isRecording);
            if (!isRecording) {
                isRecording = true;
                micButton.style.backgroundColor = '#c0392b';
                micButton.textContent = '■';
                if(recordingTimer) recordingTimer.textContent = '00:00';
                seconds = 0;
                timerInterval = setInterval(() => {
                    seconds++;
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    if(recordingTimer) recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                }, 1000);

                if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                    recognition.interimResults = true;
                    recognition.lang = 'en-US';
                    recognition.continuous = true;

                    recognition.onresult = (event) => {
                        console.log("DEBUG: Speech recognition onresult fired.");
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
                        if (memoInput) { 
                            memoInput.value = (memoInput.value ? memoInput.value + ' ' : '') + finalTranscript + interimTranscript;
                            console.log("DEBUG: Memo input updated with transcript:", memoInput.value);
                        }
                    };

                    recognition.onerror = (event) => {
                        console.error('ERROR: Speech recognition error:', event);
                        showMessage("Voice recording error. Please check microphone or try again.", true);
                        stopRecording();
                    };

                    recognition.onend = () => {
                        console.log("DEBUG: Speech recognition onend fired. isRecording:", isRecording);
                        if (isRecording) { // If still recording, restart
                            recognition.start();
                        }
                    };

                    recognition.start();
                    console.log("DEBUG: Speech recognition started.");
                } else {
                    console.warn("WARN: SpeechRecognition API not supported in this browser.");
                    showMessage("Voice recording is not supported in this browser.", true);
                    stopRecording();
                }

            } else {
                console.log("DEBUG: Stopping recording.");
                stopRecording();
            }
        });
    } else {
        console.error("ERROR: micButton element NOT found during initial load!");
    }


    function stopRecording() {
        console.log("DEBUG: stopRecording called.");
        isRecording = false;
        if (micButton) {
            micButton.style.backgroundColor = '#e74c3c'; // **CSS 원래 색상으로 복원**
            micButton.textContent = '🎤'; // **원래 아이콘으로 복원**
        }
        clearInterval(timerInterval);
        if (recordingTimer) {
            recordingTimer.textContent = '00:00';
        }
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
        console.log("DEBUG: Recording stopped and resources cleared.");
    }


    // --- Auth (Login/Signup) Popup Interactivity ---
    function showAuthPopup() {
        console.log("DEBUG: showAuthPopup called.");
        if (!authPopupOverlay) {
            console.error("ERROR: Auth popup overlay element not found.");
            return;
        }
        authPopupOverlay.classList.remove('hidden');
        authPopupOverlay.classList.add('show');
        if (authPopupTitle) authPopupTitle.textContent = 'Login';
        if (authSubmitButton) authSubmitButton.textContent = 'Login';
        if (authConfirmPasswordInput) authConfirmPasswordInput.classList.add('hidden');
        if (showSignupLink) showSignupLink.classList.remove('hidden');
        if (showLoginLink) showLoginLink.classList.add('hidden');
        hideAuthError();
        if (authEmailInput) authEmailInput.value = '';
        if (authPasswordInput) authPasswordInput.value = '';
        if (authConfirmPasswordInput) authConfirmPasswordInput.value = '';
        isLoginMode = true;
        console.log("DEBUG: Auth popup displayed in Login mode.");
    }

    document.querySelectorAll('.close-auth-popup-button').forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                console.log("DEBUG: Auth popup close button clicked.");
                if (!authPopupOverlay) return;
                authPopupOverlay.classList.remove('show');
                authPopupOverlay.classList.add('hidden');
                hideAuthError();
                console.log("DEBUG: Auth popup closed by button.");
            });
        }
    });

    if (authPopupOverlay) {
        authPopupOverlay.addEventListener('click', (event) => {
            if (event.target === authPopupOverlay) {
                console.log("DEBUG: Auth popup overlay clicked. Closing popup.");
                authPopupOverlay.classList.remove('show');
                authPopupOverlay.classList.add('hidden');
                hideAuthError();
                console.log("DEBUG: Auth popup closed by overlay click.");
            }
        });
    } else {
        console.error("ERROR: authPopupOverlay element NOT found during initial load!");
    }


    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("DEBUG: Show Signup link clicked.");
            if (authPopupTitle) authPopupTitle.textContent = 'Sign Up';
            if (authSubmitButton) authSubmitButton.textContent = 'Sign Up';
            if (authConfirmPasswordInput) authConfirmPasswordInput.classList.remove('hidden');
            if (showSignupLink) showSignupLink.classList.add('hidden');
            if (showLoginLink) showLoginLink.classList.remove('hidden');
            hideAuthError();
            if (authEmailInput) authEmailInput.value = '';
            if (authPasswordInput) authPasswordInput.value = '';
            if (authConfirmPasswordInput) authConfirmPasswordInput.value = '';
            isLoginMode = false;
            console.log("DEBUG: Auth popup switched to Signup mode.");
        });
    } else {
        console.error("ERROR: showSignupLink element NOT found during initial load!");
    }


    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("DEBUG: Show Login link clicked.");
            if (authPopupTitle) authPopupTitle.textContent = 'Login';
            if (authSubmitButton) authSubmitButton.textContent = 'Login';
            if (authConfirmPasswordInput) authConfirmPasswordInput.classList.add('hidden');
            if (showSignupLink) showSignupLink.classList.remove('hidden');
            if (showLoginLink) showLoginLink.classList.add('hidden');
            hideAuthError();
            if (authEmailInput) authEmailInput.value = '';
            if (authPasswordInput) authPasswordInput.value = '';
            if (authConfirmPasswordInput) authConfirmPasswordInput.value = '';
            isLoginMode = true;
            console.log("DEBUG: Auth popup switched to Login mode.");
        });
    } else {
        console.error("ERROR: showLoginLink element NOT found during initial load!");
    }


    // --- Firebase Auth Logic ---
    if (authSubmitButton) {
        authSubmitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            hideAuthError();

            const email = authEmailInput ? authEmailInput.value : '';
            const password = authPasswordInput ? authPasswordInput.value : '';
            const confirmPassword = authConfirmPasswordInput ? authConfirmPasswordInput.value : '';

            if (isLoginMode) {
                // Login
                try {
                    console.log("DEBUG: Attempting Firebase signInWithEmailAndPassword...");
                    await auth.signInWithEmailAndPassword(email, password);
                    console.log("DEBUG: Firebase signInWithEmailAndPassword successful!");
                    showMessage("Login successful!", false);

                    if (authPopupOverlay) {
                        console.log("DEBUG: Closing auth popup overlay from authSubmitButton success.");
                        authPopupOverlay.classList.remove('show');
                        authPopupOverlay.classList.add('hidden');
                        hideAuthError();
                    }
                } catch (error) {
                    console.error("ERROR: Login Error caught:", error.code, error.message);
                    showAuthError(error.message);
                }
            } else {
                // Signup
                if (password !== confirmPassword) {
                    showAuthError("Passwords do not match!");
                    return;
                }
                try {
                    console.log("DEBUG: Attempting Firebase createUserWithEmailAndPassword...");
                    await auth.createUserWithEmailAndPassword(email, password);
                    console.log("DEBUG: Firebase createUserWithEmailAndPassword successful!");
                    showMessage("Account created successfully! Please log in.", false);
                    isLoginMode = true;
                    showAuthPopup();
                } catch (error) {
                    console.error("ERROR: Signup Error caught:", error.code, error.message);
                    showAuthError(error.message);
                }
            }
        });
    } else {
        console.error("ERROR: authSubmitButton element NOT found during initial load!");
    }


    // --- User state change listener (Firebase Auth) ---
    auth.onAuthStateChanged(user => {
        console.log("DEBUG: Auth state changed. User:", user ? user.email : "null");

        if (loginButton) {
            loginButton.removeEventListener('click', showAuthPopup); 
            loginButton.removeEventListener('click', handleLogout); 

            if (user) {
                loginButton.textContent = 'Logout';
                loginButton.addEventListener('click', handleLogout);
                console.log("DEBUG: User is now logged in. Displaying sermon selection screen.");
                showMessage(`Welcome, ${user.email}!`, false);
                displayContentScreen('sermon-selection-buttons-screen');

                if (authPopupOverlay && authPopupOverlay.classList.contains('show')) {
                    console.log("DEBUG: onAuthStateChanged: Closing auth popup overlay as user is logged in.");
                    authPopupOverlay.classList.remove('show');
                    authPopupOverlay.classList.add('hidden');
                    hideAuthError();
                }

                // 로그인 시 무제한 메모 기능 활성화 (UI 업데이트)
                if (memoLimitInfo) {
                    memoLimitInfo.textContent = 'You have unlimited memos (Logged in).';
                    memoLimitInfo.style.color = '#4CAF50'; // Green color for unlimited
                }
                const sermonLinkedMemoCountInfo = document.querySelector('#sermon-linked-screen .text-sm');
                if (sermonLinkedMemoCountInfo) {
                    sermonLinkedMemoCountInfo.textContent = 'You have unlimited memo slots (Logged in).';
                    sermonLinkedMemoCountInfo.style.color = '#4CAF50';
                }

            } else {
                loginButton.textContent = 'Login';
                loginButton.addEventListener('click', showAuthPopup);
                console.log("DEBUG: User is now logged out. Displaying verse of the day screen.");
                showMessage("You are logged out.", false);
                displayContentScreen('verse-of-the-day-screen');

                // 로그아웃 시 메모 제한 기능 복원 (UI 업데이트)
                updateMemoCountDisplay(); 
            }
        } else {
            console.warn("WARN: loginButton element not found in onAuthStateChanged.");
        }
    });

    // Handle logout
    function handleLogout() {
        console.log("DEBUG: handleLogout called. Attempting Firebase signOut...");
        auth.signOut().then(() => {
            console.log("DEBUG: Firebase signOut successful.");
            showMessage("Logged out successfully!", false);
        }).catch((error) => {
            console.error("ERROR: Logout Error caught:", error.code, error.message);
            showMessage("Logout failed: " + error.message, true);
        });
    }

    // --- Header Menu Button Logic ---
    if (menuButton) {
        menuButton.addEventListener('click', () => {
            console.log("DEBUG: Main Menu Button (☰) clicked.");
            // 현재 로그인 상태에 따라 다른 화면으로 이동 (혹은 사이드 메뉴 토글 등)
            if (auth.currentUser) {
                // 로그인 상태면 설교 선택 화면으로 이동
                displayContentScreen('sermon-selection-buttons-screen');
            } else {
                // 로그아웃 상태면 오늘의 말씀 화면으로 이동
                displayContentScreen('verse-of-the-day-screen');
            }
            showMessage("Navigating to main menu.", false);
        });
    } else {
        console.error("ERROR: menuButton element NOT found during initial load! Please ensure id='main-menu-button' exists.");
    }


    // --- Main Content Screen Management (Existing HTML screens) ---
    const allContentScreens = [
        verseOfTheDayScreen,
        sermonSelectionButtonsScreen,
        sermonExpositoryScreen,
        sermonRealLifeScreen,
        sermonLinkedScreen
    ].filter(Boolean); // Filters out any null or undefined elements if not found in HTML

    /**
     * Shows a specific content screen and hides all others.
     * @param {string} screenIdToShow The ID of the screen to display.
     */
    function displayContentScreen(screenIdToShow) {
        console.log(`DEBUG: displayContentScreen called. Target screen to show: "${screenIdToShow}"`);

        const targetScreen = document.getElementById(screenIdToShow);
        if (!targetScreen) {
            console.error(`ERROR: displayContentScreen: Target screen element "${screenIdToShow}" not found in DOM.`);
            showMessage(`Error: Screen "${screenIdToShow}" not found.`, true);
            return;
        }

        allContentScreens.forEach(screen => {
            if (screen) {
                if (screen.id === screenIdToShow) {
                    console.log(`DEBUG: Showing screen: "${screen.id}". Removing 'hidden' class.`);
                    screen.classList.remove('hidden');
                    // CSS의 transition 효과를 위해 display/visibility/opacity는 CSS 클래스에서 관리하는 것이 좋습니다.
                    // .content-screen 에 opacity transition이 이미 있으므로, hidden 클래스만 제어합니다.
                    // CSS: .content-screen.hidden { opacity: 0; visibility: hidden; display: none; }
                    // CSS: .content-screen { opacity: 1; visibility: visible; display: flex; /* or block/grid as appropriate */ }
                } else {
                    if (!screen.classList.contains('hidden')) {
                       console.log(`DEBUG: Hiding screen: "${screen.id}". Adding 'hidden' class.`);
                    }
                    screen.classList.add('hidden');
                }
            } else {
                console.warn(`WARN: displayContentScreen: Attempted to process a null screen element in allContentScreens array.`);
            }
        });
         // Initialization logic for specific screens when shown (Only for the active screen)
        if (screenIdToShow === 'sermon-linked-screen') {
            updateSermonLinkedMemoSlots();
            console.log("DEBUG: Sermon Linked screen initialized.");
        } else if (screenIdToShow === 'sermon-expository-screen') {
            if (expositoryScriptureDisplay) expositoryScriptureDisplay.innerHTML = '';
            if (expositoryOriginalLangDisplay) expositoryOriginalLangDisplay.innerHTML = '';
            if (expositoryCommentaryDisplay) expositoryCommentaryDisplay.innerHTML = '';
            if (expositoryScriptureInput) expositoryScriptureInput.value = '';
            console.log("DEBUG: Expository screen initialized.");
        } else if (screenIdToShow === 'sermon-real-life-screen') {
            if (realLifeSermonInput) realLifeSermonInput.value = '';
            if (realLifeScriptureInput) realLifeScriptureInput.value = '';
            if (realLifeScriptureDisplay) realLifeScriptureDisplay.innerHTML = '';
            console.log("DEBUG: Real-Life screen initialized.");
        }
    }

    /**
     * Updates the memo slots in the 'Quick Memo Linked Sermon' screen.
     * Populates slots with saved memos or 'Empty' placeholders.
     */
    function updateSermonLinkedMemoSlots() {
        console.log("DEBUG: updateSermonLinkedMemoSlots called.");
        const memoListContainer = document.querySelector('#sermon-linked-screen .memo-list-placeholder');
        if (!memoListContainer) {
            console.warn("WARN: memo-list-placeholder not found in sermon-linked-screen.");
            return;
        }

        memoListContainer.innerHTML = '';

        const memos = loadMemosFromLocalStorage();
        console.log("DEBUG: Memos loaded for display:", memos);

        if (memos.length === 0) {
            memoListContainer.innerHTML = '<p class="text-gray-400">No quick memos saved yet. Use the 🎤 Quick Memo button to add one!</p>';
            console.log("DEBUG: No memos to display, showing empty message.");
            return;
        }

        memos.forEach((memo, index) => {
            const memoItem = document.createElement('div');
            memoItem.className = 'memo-item bg-gray-800 p-3 rounded-md mb-2 flex justify-between items-center';
            memoItem.innerHTML = `
                <span class="memo-content flex-grow mr-2">${escapeHtml(memo.content)}</span>
                <button class="delete-memo-button text-red-400 hover:text-red-600 focus:outline-none" data-memo-index="${index}">
                    &times;
                </button>
            `;
            memoListContainer.appendChild(memoItem);
        });

        document.querySelectorAll('.delete-memo-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToDelete = parseInt(event.target.dataset.memoIndex);
                deleteMemoFromLocalStorage(indexToDelete);
            });
        });
        console.log("DEBUG: Memos displayed and delete listeners attached.");
    }


    // --- NEW: Dynamic Sermon Drafting Screen Management ---
    let currentDraftingScreenElement = null; // To hold the dynamically created screen

    function showSermonDraftingScreen(title = "New Sermon Draft", content = "") {
        console.log("DEBUG: showSermonDraftingScreen called. Creating dynamic screen.");

        allContentScreens.forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
            }
        });

        if (currentDraftingScreenElement) {
            currentDraftingScreenElement.remove();
            currentDraftingScreenElement = null;
        }

        currentDraftingScreenElement = document.createElement('div');
        currentDraftingScreenElement.id = 'dynamic-sermon-drafting-screen'; 
        currentDraftingScreenElement.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 text-white flex flex-col p-4 z-[1000] overflow-y-auto';

        // Set the content to the global variable for access by Save, Print, PDF
        currentSermonDraftContent = content; 

        currentDraftingScreenElement.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Sermon Drafting/Editing</h2>
                <button id="dynamic-close-draft-button" class="text-white text-3xl leading-none hover:text-gray-400">&times;</button>
            </div>

            <div class="mb-4">
                <label for="dynamic-draft-sermon-title" class="block text-sm font-medium text-gray-400 mb-1">Sermon Title</label>
                <input type="text" id="dynamic-draft-sermon-title" class="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter sermon title" value="${escapeHtml(title)}">
            </div>

            <div class="flex-grow mb-4" style="min-height: 200px;">
                <label for="dynamic-draft-sermon-input" class="block text-sm font-medium text-gray-400 mb-1">Sermon Content</label>
                <textarea id="dynamic-draft-sermon-input" class="w-full h-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" placeholder="Write and edit your sermon here.">${escapeHtml(content)}</textarea>
            </div>

            <div class="flex justify-end space-x-4 mt-auto">
                <button id="dynamic-save-draft-button" class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">Save</button>
                <button id="dynamic-print-draft-button" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Print</button>
                <button id="dynamic-pdf-draft-button" class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">Save as PDF</button>
                <button id="dynamic-cancel-draft-button" class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">Cancel</button>
            </div>
        `;

        document.body.appendChild(currentDraftingScreenElement);

        document.getElementById('dynamic-close-draft-button').addEventListener('click', () => {
            hideSermonDraftingScreen();
            if (auth.currentUser) { displayContentScreen('sermon-selection-buttons-screen'); }
            else { displayContentScreen('verse-of-the-day-screen'); }
            showMessage("Sermon drafting closed.", false);
        });

        document.getElementById('dynamic-cancel-draft-button').addEventListener('click', () => {
            if (confirm("Any unsaved changes will be lost. Are you sure you want to cancel?")) {
                hideSermonDraftingScreen();
                if (auth.currentUser) { displayContentScreen('sermon-selection-buttons-screen'); }
                else { displayContentScreen('verse-of-the-day-screen'); }
                showMessage("Sermon drafting cancelled.", false);
            }
        });
        // 동적 화면의 Save 버튼은 textarea의 현재 내용을 참조해야 함
        document.getElementById('dynamic-save-draft-button').addEventListener('click', () => {
            const updatedContent = document.getElementById('dynamic-draft-sermon-input').value;
            handleDynamicSaveDraft(updatedContent);
        });
        document.getElementById('dynamic-print-draft-button').addEventListener('click', () => {
            const contentToPrint = document.getElementById('dynamic-draft-sermon-input').value;
            const titleToPrint = document.getElementById('dynamic-draft-sermon-title').value;
            handleDynamicPrintDraft(contentToPrint, titleToPrint);
        });
        document.getElementById('dynamic-pdf-draft-button').addEventListener('click', () => {
            const contentToPdf = document.getElementById('dynamic-draft-sermon-input').value;
            const titleToPdf = document.getElementById('dynamic-draft-sermon-title').value;
            handleDynamicPdfDraft(contentToPdf, titleToPdf);
        });

        setTimeout(() => {
            const dynamicDraftSermonInput = document.getElementById('dynamic-draft-sermon-input');
            if (dynamicDraftSermonInput) {
                dynamicDraftSermonInput.focus();
                console.log("DEBUG: Dynamic sermon input focused.");
            }
        }, 100);

        console.log("DEBUG: Dynamic sermon drafting screen created and shown.");
    }

    function hideSermonDraftingScreen() {
        console.log("DEBUG: hideSermonDraftingScreen called. Removing dynamic screen.");
        if (currentDraftingScreenElement) {
            currentDraftingScreenElement.remove();
            currentDraftingScreenElement = null;
            currentSermonDraftContent = ''; // Clear content when hidden
        }
    }

    // Helper functions for dynamic buttons (adapt to new dynamic IDs)
    function handleDynamicSaveDraft(sermonContent) { // content를 인자로 받도록 수정
        console.log("DEBUG: handleDynamicSaveDraft called.");
        const sermonTitle = document.getElementById('dynamic-draft-sermon-title') ? document.getElementById('dynamic-draft-sermon-title').value.trim() : 'Untitled Sermon';
        // sermonContent는 이제 인자로 받음

        const user = auth.currentUser;
        if (!user) {
            showMessage("Please log in to save your sermon.", true);
            console.error("ERROR: Attempted to save sermon without a logged-in user.");
            return;
        }

        if (!sermonContent.trim()) { // 인자로 받은 content 사용
            showMessage("Cannot save empty sermon.", true);
            return;
        }

        const sermonData = {
            title: sermonTitle,
            content: sermonContent,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('sermons').add(sermonData)
            .then((docRef) => {
                console.log("DEBUG: Sermon saved successfully with ID:", docRef.id);
                showMessage("Sermon saved successfully!", false);
                hideSermonDraftingScreen();
            })
            .catch((error) => {
                console.error("ERROR: Error saving sermon to Firestore:", error);
                showMessage("Failed to save sermon: " + error.message, true);
            });
    }

    function handleDynamicPrintDraft(sermonContent, sermonTitle) { // content와 title을 인자로 받도록 수정
        if (sermonContent) handlePrint(sermonContent, sermonTitle);
        else showMessage("No sermon content to print.", true);
    }

    function handleDynamicPdfDraft(sermonContent, sermonTitle) { // content와 title을 인자로 받도록 수정
        showMessage("Please select 'Save as PDF' in the print dialog.", false);
        if (sermonContent) handlePrint(sermonContent, sermonTitle);
        else showMessage("No sermon content to save as PDF.", true);
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // --- AI Sermon Generation Function ---
    async function generateSermonWithAI(inputContent, sermonType, loadingIndicator) {
        if (!inputContent.trim()) {
            showMessage("Please provide content to generate a sermon.", true);
            return '';
        }

        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        showMessage("Generating sermon with AI...", false);

        let prompt = "";
        switch (sermonType) {
            case 'Expository':
                prompt = `Based on the following scripture/text, generate an expository sermon outline or key points, focusing on deep biblical meaning and context. Text: "${inputContent}"`;
                break;
            case 'Real-Life':
                prompt = `Based on the following topic/text, generate a sermon that applies to real-life situations, including practical examples or illustrations. Text: "${inputContent}"`;
                break;
            case 'Linked':
                prompt = `Combine the following quick memos/notes into a cohesive sermon outline or a short sermon. Ensure smooth transitions between ideas. Memos: "${inputContent}"`;
                break;
            default:
                prompt = `Generate a sermon based on the following text: "${inputContent}"`;
        }

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            // **경고: API 키는 공개적으로 노출되지 않도록 서버 측에서 관리하는 것이 가장 좋습니다.**
            // 현재 클라이언트 측 앱이므로 여기에 유지하지만, 실제 서비스에서는 Firebase Functions 등을 고려하세요.
            const apiKey = "AIzaSyCpyS4-0Z8H7Qn2vOy9bAzsZqc12tBFYic"; // YOUR API KEY
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            console.log(`DEBUG: Calling Gemini API for ${sermonType} sermon...`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log("DEBUG: Gemini API response received:", result);

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const generatedText = result.candidates[0].content.parts[0].text;
                console.log("DEBUG: AI API successfully returned text (partial):", generatedText.substring(0, 100) + "...");
                showMessage("Sermon generated successfully!", false);
                return generatedText;
            } else {
                showMessage("AI could not generate sermon. Please try again or refine your input.", true);
                console.error("ERROR: AI generation failed: Unexpected response structure or safety settings.", result);
                if (result.promptFeedback && result.promptFeedback.blockReason) {
                    console.error("ERROR: Block Reason:", result.promptFeedback.blockReason);
                }
                return '';
            }
        } catch (error) {
            showMessage("Sermon generation error: " + error.message, true);
            console.error("ERROR: Error calling Gemini API:", error);
            return '';
        } finally {
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
        }
    }

    // --- Print and Save as PDF Functions ---
    function handlePrint(sermonContent, sermonTitle) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>${escapeHtml(sermonTitle)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    pre { white-space: pre-wrap; word-wrap: break-word; }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(sermonTitle)}</h1>
                <pre>${escapeHtml(sermonContent)}</pre>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function handleSavePdf(sermonContent, sermonTitle) {
        showMessage("Please select 'Save as PDF' in the print dialog.", false);
        handlePrint(sermonContent, sermonTitle);
    }

    // --- Bible Lookup Function ---
    async function lookupScripture(scriptureReference, displayArea, loadingIndicator) {
        console.log(`[lookupScripture] Called for reference: "${scriptureReference}"`);
        console.log(`[lookupScripture] Display area element:`, displayArea);

        if (!displayArea) {
            console.error("[lookupScripture] displayArea element is null or undefined. Cannot display scripture.");
            return;
        }

        if (!scriptureReference.trim()) {
            displayArea.innerHTML = '<p class="text-red-400">Please enter a scripture reference.</p>';
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            console.log("[lookupScripture] No scripture reference provided.");
            return;
        }

        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        displayArea.innerHTML = `<p class="text-gray-300">Looking up "${scriptureReference}" from KJV...</p>`;
        console.log(`[lookupScripture] Displaying loading message: "Looking up ${scriptureReference} from KJV..."`);

        try {
            const apiUrl = `https://bible-api.com/${encodeURIComponent(scriptureReference)}?translation=kjv`;
            console.log(`[lookupScripture] Fetching from API: ${apiUrl}`);

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok && data.text) {
                let fetchedText = data.text;
                let referenceSuffix = "";
                if (data.reference) {
                    referenceSuffix = ` (${data.reference} KJV)`;
                }

                // API에서 줄바꿈이 없는 경우를 대비하여 <br> 태그로 변환
                fetchedText = fetchedText.replace(/\n/g, '<br>');

                displayArea.innerHTML = `<p>${fetchedText}${referenceSuffix}</p>`;
                console.log(`[lookupScripture] Final scripture text set: "${fetchedText.substring(0, 100)}..."`);
                displayArea.classList.remove('text-red-400');
            } else {
                let errorMessage = data.error || `Could not find scripture for "${scriptureReference}". Please check the reference.`;
                displayArea.innerHTML = `<p class="text-red-400">${errorMessage}</p>`;
                displayArea.classList.add('text-red-400');
                console.error(`[lookupScripture] API lookup failed: ${errorMessage}`, data);
            }
        } catch (error) {
            displayArea.innerHTML = `<p class="text-red-400">Error fetching scripture: ${error.message}</p>`;
            displayArea.classList.add('text-red-400');
            console.error(`[lookupScripture] Fetch error:`, error);
        } finally {
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
        }
    }

    // --- Expository Sermon Specific Functions (Original Language & Commentary) ---
    async function loadOriginalLanguage(scriptureReference, displayArea, loadingIndicator) {
        if (!displayArea) {
            console.error("[loadOriginalLanguage] displayArea element is null or undefined. Cannot display original language.");
            return;
        }
        if (!scriptureReference.trim()) {
            displayArea.innerHTML = '<p class="text-red-400">Please enter a scripture reference.</p>';
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            return;
        }

        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        displayArea.innerHTML = `<p class="text-gray-300">Loading original language for "${scriptureReference}" (Mock Data)...</p>`;

        await new Promise(resolve => setTimeout(resolve, 1500)); 

        let originalText = "";
        const lowerCaseReference = scriptureReference.toLowerCase().trim();

        switch (lowerCaseReference) {
            case "john 3:16":
                originalText = `Original Greek (John 3:16):<br>Οὕτως γὰρ ἠγάπησεν ὁ Θεὸς τὸν κόσμον, ὥστε τὸν Υἱὸν αὐτοῦ τὸν μονογενῆ ἔδωκεν, ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν μὴ ἀπόληται ἀλλ' ἔχῃ ζωὴν αἰώνιον.`;
                break;
            case "isaiah 40:8":
                originalText = `Original Hebrew (Isaiah 40:8):<br>חָצִיר יָבֵשׁ, צִיץ נָבֵל וּדְבַר אֱלֹהֵינוּ יָקוּם לְעוֹלָם`;
                break;
            default:
                originalText = `Original language not found for "${scriptureReference}". (Mock data)`;
        }

        displayArea.innerHTML = `<p class="text-green-400">${originalText}</p>`;
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (originalText.includes("Original language not found") && !displayArea.classList.contains('text-red-400')) {
            displayArea.classList.add('text-red-400');
        } else if (!originalText.includes("Original language not found") && displayArea.classList.contains('text-red-400')) {
            displayArea.classList.remove('text-red-400');
        }
    }

    async function showCommentary(scriptureReference, displayArea, loadingIndicator) {
        if (!displayArea) {
            console.error("[showCommentary] displayArea element is null or undefined. Cannot display commentary.");
            return;
        }
        if (!scriptureReference.trim()) {
            displayArea.innerHTML = '<p class="text-red-400">Please enter a scripture reference.</p>';
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            return;
        }

        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        displayArea.innerHTML = `<p class="text-gray-300">Loading commentary for "${scriptureReference}" (Mock Data)...</p>`;

        await new Promise(resolve => setTimeout(resolve, 2000));

        let commentaryText = "";
        const lowerCaseReference = scriptureReference.toLowerCase().trim();

        switch (lowerCaseReference) {
            case "john 3:16":
                commentaryText = `Commentary (John 3:16):<br>This pivotal verse encapsulates the essence of the Gospel, highlighting God's immense love for humanity (the "world") that led Him to sacrifice His unique Son. Belief in Jesus is presented as the condition for eternal life, contrasting with perishing (spiritual destruction). It underscores divine initiative, sacrificial love, and the promise of salvation through faith.`;
                break;
            case "isaiah 40:8":
                commentaryText = `Commentary (Isaiah 40:8):<br>This verse contrasts the fleeting nature of human life and glory (grass and flower) with the eternal and enduring nature of God's Word. It emphasizes the reliability and permanence of divine truth, offering comfort and assurance. Commentators often highlight its significance in the context of God's promises to His people.`;
                break;
            default:
                commentaryText = `Commentary not found for "${scriptureReference}". (Mock data)`;
        }

        displayArea.innerHTML = `<p class="text-green-400">${commentaryText}</p>`;
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (commentaryText.includes("Commentary not found") && !displayArea.classList.contains('text-red-400')) {
            displayArea.classList.add('text-red-400');
        } else if (!commentaryText.includes("Commentary not found") && displayArea.classList.contains('text-red-400')) {
            displayArea.classList.remove('text-red-400');
        }
    }

    // --- Contextual Lookup Popup Functions ---
    async function showContextualLookupPopup(selectedText, x, y) {
        if (!contextualLookupPopup || !contextualContentArea) {
            console.error("Contextual lookup popup elements not found.");
            return;
        }

        currentSelectedText = selectedText;
        contextualContentArea.innerHTML = `<p class="text-gray-300">Looking up contextual data for "${selectedText}"...</p>`;
        contextualLookupPopup.classList.remove('hidden');
        contextualLookupPopup.classList.add('show');

        const popupWidth = 300;
        const popupHeight = 200;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let finalX = x;
        let finalY = y;

        if (x + popupWidth > viewportWidth) {
            finalX = viewportWidth - popupWidth - 10;
        }
        if (y + popupHeight > viewportHeight) {
            finalY = viewportHeight - popupHeight - 10;
        }

        contextualLookupPopup.style.left = `${Math.max(0, finalX)}px`;
        contextualLookupPopup.style.top = `${Math.max(0, finalY)}px`;

        await new Promise(resolve => setTimeout(resolve, 800));

        let originalLangSnippet = `Original: ${selectedText} (mock Hebrew/Greek)`;
        let commentarySnippet = `Commentary: This phrase "${selectedText}" suggests... (mock insight)`;

        contextualContentArea.innerHTML = `
            <div class="contextual-item">
                <span class="contextual-item-label">Original:</span>
                <p>${originalLangSnippet}</p>
                <button class="contextual-select-button" data-type="original" data-content="${escapeHtml(originalLangSnippet)}">Select</button>
            </div>
            <div class="contextual-item">
                <span class="contextual-item-label">Commentary:</span>
                <p>${commentarySnippet}</p>
                <button class="contextual-select-button" data-type="commentary" data-content="${escapeHtml(commentarySnippet)}">Select</button>
            </div>
        `;

        contextualContentArea.querySelectorAll('.contextual-select-button').forEach(button => {
            button.onclick = (event) => {
                const type = event.target.dataset.type;
                const content = event.target.dataset.content;
                showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} snippet selected. (For future use in drafting area)`, false);
                hideContextualLookupPopup();
                // 여기에 선택된 내용을 sermon drafting input으로 보낼 로직 추가 가능
                // 예: if (currentDraftingScreenElement) { document.getElementById('dynamic-draft-sermon-input').value += "\n" + content; }
            };
        });
    }

    function hideContextualLookupPopup() {
        if (contextualLookupPopup) {
            contextualLookupPopup.classList.remove('show');
            contextualLookupPopup.classList.add('hidden');
            contextualContentArea.innerHTML = '';
        }
    }

    // expository-scripture-display에서 텍스트 선택(mouseup) 이벤트 리스너
    if (expositoryScriptureDisplay) {
        expositoryScriptureDisplay.addEventListener('mouseup', (event) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText.length > 0 && expositoryScriptureDisplay.contains(selection.anchorNode)) { // anchorAnchorNode 대신 anchorNode 사용
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                const popupX = event.clientX + window.scrollX;
                const popupY = rect.bottom + window.scrollY + 5;

                showContextualLookupPopup(selectedText, popupX, popupY);
            } else {
                if (contextualLookupPopup && !contextualLookupPopup.contains(event.target)) {
                    hideContextualLookupPopup();
                }
            }
        });

        document.addEventListener('mousedown', (event) => {
            if (contextualLookupPopup && !contextualLookupPopup.contains(event.target) && !expositoryScriptureDisplay.contains(event.target)) {
                hideContextualLookupPopup();
            }
        });
    }


    // --- Sermon Type Button Event Listeners ---
    const btnExpository = document.getElementById('btn-expository');
    const btnRealLife = document.getElementById('btn-real-life');
    const btnLinked = document.getElementById('btn-linked');

    if (btnExpository) {
        btnExpository.addEventListener('click', () => {
            displayContentScreen('sermon-expository-screen');
        });
    } else {
        console.error("ERROR: btnExpository element NOT found during initial load!");
    }


    if (btnRealLife) {
        btnRealLife.addEventListener('click', () => {
            displayContentScreen('sermon-real-life-screen');
        });
    } else {
        console.error("ERROR: btnRealLife element NOT found during initial load!");
    }


    if (btnLinked) {
        btnLinked.addEventListener('click', () => {
            displayContentScreen('sermon-linked-screen');
        });
    } else {
        console.error("ERROR: btnLinked element NOT found during initial load!");
    }


    // --- Sermon Screen Specific Element Event Listeners ---

    // Expository Sermon Screen Event Listeners
    if (expositoryGenerateAiButton) {
        expositoryGenerateAiButton.addEventListener('click', async () => {
            console.log("DEBUG: Expository Generate AI Button clicked.");
            const scriptureTextForAI = expositoryScriptureDisplay ? expositoryScriptureDisplay.textContent.trim() : '';
            if (!scriptureTextForAI || scriptureTextForAI.includes('Scripture not found for') || scriptureTextForAI.includes('Please enter a scripture reference.')) {
                showMessage("Please look up a valid scripture before generating an AI sermon.", true);
                return;
            }

            const generatedContent = await generateSermonWithAI(
                scriptureTextForAI,
                'Expository',
                expositoryLoadingIndicator
            );

            console.log("DEBUG: Generated content from AI (Expository):", generatedContent ? generatedContent.substring(0, 100) + "..." : "No content generated.");

            if (generatedContent) {
                const title = `${expositoryScriptureInput ? expositoryScriptureInput.value : 'Expository'} Sermon Draft`;
                showSermonDraftingScreen(title, generatedContent);
                showMessage("AI sermon loaded into drafting screen.", false);
            } else {
                showMessage("AI failed to generate a sermon.", true);
            }
        });
    } else {
        console.error("ERROR: expositoryGenerateAiButton element NOT found during initial load!");
    }


    if (expositoryLookupButton) {
        console.log("DEBUG: Attaching listener to expositoryLookupButton.");
        expositoryLookupButton.addEventListener('click', () => {
            console.log("DEBUG: expositoryLookupButton clicked!");
            lookupScripture(
                expositoryScriptureInput ? expositoryScriptureInput.value : '',
                expositoryScriptureDisplay,
                expositoryLoadingIndicator
            );
        });
    } else {
        console.error("ERROR: expositoryLookupButton element NOT found during initial load!");
    }

    if (expositoryOriginalLangButton) {
        expositoryOriginalLangButton.addEventListener('click', () => {
            loadOriginalLanguage(
                expositoryScriptureInput ? expositoryScriptureInput.value : '',
                expositoryOriginalLangDisplay,
                expositoryOriginalLangLoading
            );
        });
    } else {
        console.error("ERROR: expositoryOriginalLangButton element NOT found during initial load!");
    }

    if (expositoryCommentaryButton) {
        expositoryCommentaryButton.addEventListener('click', () => {
            showCommentary(
                expositoryScriptureInput ? expositoryScriptureInput.value : '',
                expositoryCommentaryDisplay,
                expositoryCommentaryLoading
            );
        });
    } else {
        console.error("ERROR: expositoryCommentaryButton element NOT found during initial load!");
    }


    // Real-Life Application Sermon Screen Event Listeners
    if (realLifeGenerateAiButton) {
        realLifeGenerateAiButton.addEventListener('click', async () => {
            console.log("DEBUG: Real-Life Generate AI Button clicked.");
            const inputContent = realLifeSermonInput ? realLifeSermonInput.value.trim() : '';
            if (!inputContent) {
                showMessage("Please provide content to generate a sermon.", true);
                return;
            }

            const generatedContent = await generateSermonWithAI(
                inputContent,
                'Real-Life',
                realLifeLoadingIndicator
            );

            console.log("DEBUG: Generated content from AI (Real-Life):", generatedContent ? generatedContent.substring(0, 100) + "..." : "No content generated.");

            if (generatedContent) {
                const titleSnippet = inputContent.substring(0, Math.min(inputContent.length, 30));
                const title = `Real-Life Sermon Draft (${titleSnippet}${inputContent.length > 30 ? '...' : ''})`;
                showSermonDraftingScreen(title, generatedContent);
                showMessage("AI sermon loaded into drafting screen.", false);
            } else {
                showMessage("AI failed to generate a sermon.", true);
            }
        });
    } else {
        console.error("ERROR: realLifeGenerateAiButton element NOT found during initial load!");
    }

    if (realLifeLookupButton) {
        realLifeLookupButton.addEventListener('click', () => {
            lookupScripture(
                realLifeScriptureInput ? realLifeScriptureInput.value : '',
                realLifeScriptureDisplay,
                realLifeLoadingIndicator
            );
        });
    } else {
        console.error("ERROR: realLifeLookupButton element NOT found during initial load!");
    }

    // Real-Life Print/PDF buttons
    if (realLifePrintButton) {
        realLifePrintButton.addEventListener('click', () => {
            const content = realLifeSermonInput ? realLifeSermonInput.value.trim() : '';
            if (content) {
                handlePrint(content, "Real-Life Sermon");
            } else {
                showMessage("No content to print for Real-Life Sermon.", true);
            }
        });
    }
    if (realLifePdfButton) {
        realLifePdfButton.addEventListener('click', () => {
            const content = realLifeSermonInput ? realLifeSermonInput.value.trim() : '';
            if (content) {
                handleSavePdf(content, "Real-Life Sermon");
            } else {
                showMessage("No content to save as PDF for Real-Life Sermon.", true);
            }
        });
    }
    // Real-Life Sermon Save button (이 버튼은 AI 생성 후 동적 화면으로 넘어가므로 실제로는 사용되지 않을 수 있음)
    // 만약 이 화면에서 직접 저장을 원하면 handleDynamicSaveDraft와 유사한 로직이 필요
    if (realLifeSaveMemoButton) {
        realLifeSaveMemoButton.addEventListener('click', () => {
            showMessage("Please use 'Generate with AI' to draft your sermon, then save from the drafting screen.", false);
        });
    }


    // Quick Memo Linked Sermon Screen Event Listeners
    if (linkedGenerateAiButton) {
        linkedGenerateAiButton.addEventListener('click', async () => {
            console.log("DEBUG: Linked Generate AI Button clicked.");
            const memos = loadMemosFromLocalStorage();
            const memoContents = memos.map(memo => memo.content).join('\n\n');

            if (!memoContents.trim()) {
                showMessage("No quick memo content saved. Please create quick memos first.", true);
                return;
            }

            const generatedContent = await generateSermonWithAI(
                memoContents,
                'Linked',
                linkedLoadingIndicator
            );

            console.log("DEBUG: Generated content from AI (Linked):", generatedContent ? generatedContent.substring(0, 100) + "..." : "No content generated.");

            if (generatedContent) {
                const firstMemoSnippet = memos[0] ? memos[0].content.substring(0, Math.min(memos[0].content.length, 20)) : 'Quick Memo';
                const title = `Quick Memo Linked Sermon Draft (${firstMemoSnippet}${memos[0] && memos[0].content.length > 20 ? '...' : ''})`;
                showSermonDraftingScreen(title, generatedContent);
                showMessage("AI sermon loaded into drafting screen.", false);
            } else {
                showMessage("AI failed to generate a sermon.", true);
            }
        });
    } else {
        console.error("ERROR: linkedGenerateAiButton element NOT found during initial load!");
    }


    if (linkedLookupButton) {
        linkedLookupButton.addEventListener('click', () => {
            lookupScripture(
                linkedScriptureInput ? linkedScriptureInput.value : '',
                linkedScriptureDisplay,
                linkedLoadingIndicator
            );
        });
    } else {
        console.error("ERROR: linkedLookupButton element NOT found during initial load!");
    }

    // Linked Sermon Print/PDF buttons
    if (linkedPrintButton) {
        linkedPrintButton.addEventListener('click', () => {
            const content = linkedSermonOutput ? linkedSermonOutput.value.trim() : '';
            if (content) {
                handlePrint(content, "Linked Sermon");
            } else {
                showMessage("No content to print for Linked Sermon.", true);
            }
        });
    }
    if (linkedPdfButton) {
        linkedPdfButton.addEventListener('click', () => {
            const content = linkedSermonOutput ? linkedSermonOutput.value.trim() : '';
            if (content) {
                handleSavePdf(content, "Linked Sermon");
            } else {
                showMessage("No content to save as PDF for Linked Sermon.", true);
            }
        });
    }
    // Linked Sermon Save button (이 버튼도 AI 생성 후 동적 화면으로 넘어가므로 실제로는 사용되지 않을 수 있음)
    if (linkedSaveMemoButton) {
        linkedSaveMemoButton.addEventListener('click', () => {
            showMessage("Please use 'Generate with AI' to combine memos, then save from the drafting screen.", false);
        });
    }


    // --- Initializations on DOM Load ---
    updateMemoCountDisplay(); 

    // --- Initial Screen Bible Verse Auto-Rotation Feature (English KJV) ---
    const bibleVerses = [
        { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
        { text: "And, behold, I am with thee, and will keep thee in all places whither thou goest, and will bring thee again into this land; for I will not leave thee, until I have done that which I have spoken to thee of.", reference: "Genesis 28:15" },
        { text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", reference: "Isaiah 41:10" },
        { text: "Let not your heart be troubled: ye believe in God, believe also in me.", reference: "John 14:1" },
        { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" },
        { text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", reference: "Philippians 4:6" },
        { text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.", reference: "1 Corinthians 13:4" },
        { text: "In the beginning God created the heaven and the earth.", reference: "Genesis 1:1" },
        { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", reference: "John 3:16" },
        { text: "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the Lord, which made heaven and earth.", reference: "Psalm 121:1-2" },
        { text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", reference: "Isaiah 40:31" },
        { text: "Keep thy heart with all diligence; for out of it are the issues of life.", reference: "Proverbs 4:23" },
        { text: "Delight thyself also in the Lord: and he shall give thee the desires of thine heart.", "reference": "Psalm 37:4" },
        { text: "Jesus said unto him, If thou canst believe, all things are possible to him that believeth.", "reference": "Mark 9:23" },
        { text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", "reference": "Matthew 11:28" },
        { text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", "reference": "Matthew 6:33" },
        { text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.", "reference": "Psalm 23:4" },
        { text: "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.", "reference": "Proverbs 4:7" },
        { text: "The Lord bless thee, and keep thee.", "reference": "Numbers 6:24" },
        { text: "But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people; that ye should shew forth the praises of him who hath called you out of darkness into his marvellous light.", "reference": "1 Peter 2:9" },
        { text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", "reference": "James 1:5" },
        { text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", "reference": "Joshua 1:9" },
        { text: "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.", "reference": "Hebrews 11:6" },
        { text: "Ye are the light of the world. A city that is set on an hill cannot be hid.", "reference": "Matthew 5:14" },
        { text: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.", "reference": "1 Thessalonians 5:18" },
        { text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.", "reference": "John 14:27" },
        { text: "The Lord is nigh unto all them that call upon him, to all that call upon him in truth.", "reference": "Psalm 145:18" },
        { text: "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.", "reference": "1 John 4:7" },
        { text: "Therefore take no thought, saying, What shall we eat? or, What shall we drink? or, Wherewithal shall we be clothed?", "reference": "Matthew 6:31" },
        { text: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.", "reference": "Revelation 3:20" }
    ];

    let currentVerseIndex = 0;
    const verseDisplayElement = document.getElementById('bible-verse-display');

    function updateVerse() {
        if (!verseDisplayElement) {
            console.warn("Element with ID 'bible-verse-display' not found. Verse rotation aborted.");
            clearInterval(verseRotationInterval);
            return;
        }

        // opacity transition for smooth fade
        verseDisplayElement.style.opacity = '0';

        setTimeout(() => {
            currentVerseIndex = (currentVerseIndex + 1) % bibleVerses.length;
            const nextVerse = bibleVerses[currentVerseIndex];

            verseDisplayElement.innerHTML = `"${nextVerse.text}" - ${nextVerse.reference}`;

            verseDisplayElement.style.opacity = '1';
        }, 1000); // Wait for 1 second for fade-out, then change content and fade-in
    }

    let verseRotationInterval;

    if (verseDisplayElement) {
        // Initial display of the first verse
        verseDisplayElement.innerHTML = `"${bibleVerses[0].text}" - ${bibleVerses[0].reference}`;
        verseDisplayElement.style.opacity = '1';
        // Start rotation after initial display
        verseRotationInterval = setInterval(updateVerse, 5000);
    } else {
        console.error("HTML element with ID 'bible-verse-display' not found. Please ensure it exists in your HTML.");
    }

}); // End of DOMContentLoaded