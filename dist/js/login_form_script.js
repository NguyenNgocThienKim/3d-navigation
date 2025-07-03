// --- START OF FILE: js/login_form_script.js (FINAL, FULL VERSION) ---
const initializeLoginForm = () => {
    
    const authForm = document.getElementById('authForm');
    if (!authForm) return;

    // Get all form elements
    const formTitle = document.getElementById('formTitle');
    const studentIdContainer = document.getElementById('studentIdContainer');
    const studentIdInput = document.getElementById('studentId');
    const usernameContainer = document.getElementById('usernameContainer');
    const usernameInput = document.getElementById('username');
    const passwordContainer = document.getElementById('passwordContainer');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const submitButton = document.getElementById('submitButton');
    const toggleMessageParagraph = document.getElementById('toggleMessageParagraph');
    const toggleAuthLink = document.getElementById('toggleAuthLink');
    const toggleLinkContainer = document.getElementById('toggleLinkContainer');
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const authMessagesDiv = document.getElementById('authMessages');
    const rememberMeContainer = document.getElementById('rememberMeContainer');
    const rememberMeCheckbox = document.getElementById('remember');

    let currentMode = 'login'; // Can be 'login' or 'register'

    function prefillFormFromMemory() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            const userData = JSON.parse(rememberedUser);
            if(usernameInput) usernameInput.value = userData.username || '';
            const userTypeRadio = document.querySelector(`input[name="userType"][value="${userData.userType}"]`);
            if(userTypeRadio) userTypeRadio.checked = true;
            if (userData.userType === 'student' && userData.studentId && studentIdInput) {
                studentIdInput.value = userData.studentId;
            }
            if(rememberMeCheckbox) rememberMeCheckbox.checked = true;
        }
    }

    function updateFormUI() {
        const lang = localStorage.getItem('language') || 'en';
        const trans = window.translations[lang];
        if (!trans) return;

        const selectedUserType = document.querySelector('input[name="userType"]:checked').value;
        const isStudent = selectedUserType === 'student';

        // Toggle visibility of fields based on user type
        studentIdContainer.style.display = isStudent ? 'block' : 'none';
        usernameContainer.style.display = isStudent ? 'block' : 'none';
        passwordContainer.style.display = isStudent ? 'block' : 'none';
        rememberMeContainer.style.display = isStudent && currentMode === 'login' ? 'flex' : 'none';
        toggleLinkContainer.style.display = isStudent ? 'block' : 'none';
        
        studentIdInput.required = isStudent;
        usernameInput.required = isStudent;
        passwordInput.required = isStudent;
        
        const passwordLabel = document.querySelector('label[for="password"]');

        if (isStudent) {
            if (currentMode === 'login') {
                formTitle.textContent = trans.loginTitle;
                submitButton.textContent = trans.loginButton;
                if (passwordLabel) passwordLabel.textContent = trans.passwordLabel;
                if (toggleMessageParagraph) {
                    toggleMessageParagraph.querySelector('span').textContent = trans.noAccount;
                    toggleAuthLink.textContent = trans.registerLink;
                }
            } else { // register mode
                formTitle.textContent = trans.registerTitle;
                submitButton.textContent = trans.registerButton;
                if (passwordLabel) passwordLabel.textContent = trans.createPasswordLabel;
                if (toggleMessageParagraph) {
                    toggleMessageParagraph.querySelector('span').textContent = trans.hasAccount;
                    toggleAuthLink.textContent = trans.loginLink;
                }
            }
        } else { // visitor mode
            formTitle.textContent = trans.roleVisitor;
            submitButton.textContent = trans.visitorButton;
        }
    }

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    function toggleAuthMode(e) {
        e.preventDefault();
        currentMode = (currentMode === 'login') ? 'register' : 'login';
        authForm.reset();
        document.getElementById('roleStudent').checked = true;
        if(authMessagesDiv) authMessagesDiv.style.display = 'none';
        updateFormUI();
    }

    if (toggleAuthLink) {
        toggleAuthLink.addEventListener('click', toggleAuthMode);
    }
    
    if (userTypeRadios) {
        userTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateFormUI);
        });
    }

    authForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if(authMessagesDiv) authMessagesDiv.style.display = 'none';

        const selectedUserType = document.querySelector('input[name="userType"]:checked').value;
        const lang = localStorage.getItem('language') || 'en';
        const trans = window.translations[lang];
        
        // --- Visitor Flow ---
        if (selectedUserType === 'visitor') {
            sessionStorage.setItem('userRole', 'visitor'); // Set role for menu page
            window.showMessage(
                'success', 
                trans.popupVisitorWelcomeTitle, 
                trans.popupVisitorWelcomeText, 
                trans.popupVisitorProceedButton, 
                () => {
                    if (typeof window.triggerTransitionToMenu === 'function') {
                        window.triggerTransitionToMenu();
                    }
                }
            );
            return; // Exit here for visitors
        }

        // --- Student Flow (Login/Register) ---
        const formData = new FormData(authForm);
        const scriptUrl = (currentMode === 'login') ? 'api/login.php' : 'api/register.php';
        
        if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Processing...'; }

        fetch(scriptUrl, { method: 'POST', body: formData })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            const responseClone = response.clone();
            return response.json().catch(() => {
                responseClone.text().then(text => {
                    console.error("Failed to parse JSON. Server response:", text);
                });
                throw new Error("Invalid JSON response from server.");
            });
        })
        .then(data => {
            if (data.status === 'success') {
                if (currentMode === 'login') {
                    sessionStorage.setItem('userRole', 'student'); 
                     if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                        localStorage.setItem('rememberedUser', JSON.stringify(data.userData));
                    } else {
                        localStorage.removeItem('rememberedUser');
                    }
                    // FIX: Use translated messages
                    window.showMessage('success', trans.popupSuccessTitle, trans.popupLoginSuccess, trans.popupContinueButton, () => {
                        if(typeof window.triggerTransitionToMenu === 'function') {
                            window.triggerTransitionToMenu();
                        }
                    });
                } else { // Registration success
                    // FIX: Use translated messages
                    window.showMessage('success', trans.popupSuccessTitle, trans.popupRegisterSuccess, trans.popupOkButton, () => {
                        toggleAuthMode({ preventDefault: () => {} }); // Switch to login form
                    });
                }
            } else {
                // FIX: Use translated messages for error
                window.showMessage('error', trans.popupErrorTitle, data.message || 'An unknown error occurred.', trans.popupTryAgainButton);
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            // FIX: Use translated messages for fetch error
            window.showMessage('error', trans.popupErrorTitle, 'Operation failed. Please check your network connection and try again.', trans.popupTryAgainButton);
        })
        .finally(() => {
            if (submitButton) { submitButton.disabled = false; updateFormUI(); }
        });
    });
    
    prefillFormFromMemory();
    updateFormUI();
    window.addEventListener('languageChanged', updateFormUI);
};

// Wait for the main script to be ready before initializing the form
window.addEventListener('mainScriptReady', initializeLoginForm);