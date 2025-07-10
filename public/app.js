// app.js - Basic interactivity for Quick Memo popup

document.addEventListener('DOMContentLoaded', () => {
    const quickMemoFab = document.querySelector('.quick-memo-fab');
    const quickMemoPopupOverlay = document.querySelector('.quick-memo-popup-overlay');
    const closePopupButton = document.querySelector('.close-popup-button');
    const saveMemoButton = document.querySelector('.save-memo-button');
    const memoInput = document.querySelector('.memo-input');

    // Show popup when FAB is clicked
    if (quickMemoFab) {
        quickMemoFab.addEventListener('click', () => {
            quickMemoPopupOverlay.classList.remove('hidden');
            memoInput.focus(); // Focus on textarea when opened
        });
    }

    // Hide popup when close button is clicked
    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            quickMemoPopupOverlay.classList.add('hidden');
            memoInput.value = ''; // Clear input on close
        });
    }

    // Hide popup when clicking outside the popup content (on the overlay)
    if (quickMemoPopupOverlay) {
        quickMemoPopupOverlay.addEventListener('click', (event) => {
            if (event.target === quickMemoPopupOverlay) {
                quickMemoPopupOverlay.classList.add('hidden');
                memoInput.value = ''; // Clear input on close
            }
        });
    }

    // Basic save button logic (will be expanded later)
    if (saveMemoButton) {
        saveMemoButton.addEventListener('click', () => {
            const memoContent = memoInput.value.trim();
            if (memoContent) {
                console.log("Memo saved:", memoContent); // For testing
                alert("Memo saved! (Functionality to be fully implemented)");
                quickMemoPopupOverlay.classList.add('hidden');
                memoInput.value = ''; // Clear input after saving
            } else {
                alert("Please write something or record your voice.");
            }
        });
    }

    // --- Voice Memo functionality (Placeholder - complex implementation) ---
    const micButton = document.querySelector('.mic-button');
    const recordingTimer = document.querySelector('.recording-timer');
    let isRecording = false;
    let recognition; // For Web Speech API
    let timerInterval;
    let seconds = 0;

    if (micButton) {
        micButton.addEventListener('click', () => {
            if (!isRecording) {
                // Start recording
                isRecording = true;
                micButton.style.backgroundColor = '#c0392b'; // Darker red
                micButton.textContent = '■'; // Stop icon
                recordingTimer.textContent = '00:00';
                seconds = 0;
                timerInterval = setInterval(() => {
                    seconds++;
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    recordingTimer.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                }, 1000);

                // Placeholder for actual voice recognition (Web Speech API)
                if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                    recognition.interimResults = true; // Show results while speaking
                    recognition.lang = 'en-US'; // Set language to English

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
                        // Append to existing memo content
                        memoInput.value = (memoInput.value ? memoInput.value + ' ' : '') + finalTranscript + interimTranscript;
                    };

                    recognition.onerror = (event) => {
                        console.error('Speech recognition error', event);
                        alert("Voice recording error. Please check microphone or try again.");
                        stopRecording();
                    };

                    recognition.onend = () => {
                         if (isRecording) { // If it ended unexpectedly (e.g., pause in speech)
                            recognition.start(); // Restart for continuous recording
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
        micButton.style.backgroundColor = '#e74c3c'; // Original red
        micButton.textContent = '🎤'; // Original mic icon
        clearInterval(timerInterval);
        recordingTimer.textContent = '00:00';
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }
});