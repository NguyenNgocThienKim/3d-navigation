document.addEventListener('DOMContentLoaded', function () {
    
    // --- Get all general elements ---
    const bodyElement = document.body;
    const initialPageContent = document.getElementById('initial-page-content');
    const loadingScreen = document.getElementById('loading-screen');
    const menuPage = document.getElementById('menu-page');
    const map2DPage = document.getElementById('map-2d-page');
    const messagePopupContainer = document.getElementById('message-popup-container');
    const settingsToggleButton = document.getElementById('settingsToggleButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const darkModeCheckbox = document.getElementById('dark-mode-toggle-checkbox');
    const languageSelect = document.getElementById('languageSelect'); 
    
    const logoutButton = document.getElementById('logoutButton');
    const fontChanger = document.getElementById('fontChanger');
    const zoomSlider = document.getElementById('zoomSlider');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const soundToggleButton = document.getElementById('soundToggleButton');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const backButtonFrom2D = document.getElementById('backButtonFrom2D');
    const mapAcademicsDropdown = document.getElementById('mapAcademicsDropdown');
    const mapAcademicsBtn = document.getElementById('mapAcademicsBtn');
    const mapDropdownContent = document.getElementById('mapDropdownContent');
    const infoPopupContainer = document.getElementById('info-popup-container');
    const infoPopupCloseBtn = document.getElementById('info-popup-close-btn');
    const infoPopupIcon = document.getElementById('info-popup-icon');
    const infoPopupBody = document.getElementById('info-popup-body');
    const mapAreaWrapperEl = document.querySelector('.map-area-wrapper');
    const mapContentEl = document.getElementById('map-content-area');
    const zoomInBtn = document.getElementById('zoomInButton');
    const zoomOutBtn = document.getElementById('zoomOutButton');

    // --- Menu Buttons ---
    const welcomeButton = document.getElementById('welcomeButton');
    const aboutButton = document.getElementById('aboutButton');
    const hexagon2DButton = document.getElementById('hexagon-2d-button');
    const hexagon3dButton = document.getElementById('hexagon-3d-button');
    const eventButton = document.getElementById('eventButton');
    const announcementButton = document.getElementById('announcementButton');
    const officeButton = document.getElementById('officeButton');
    const feedbackButton = document.getElementById('feedbackButton');
    const backToLoginButton = document.getElementById('backToLoginButton');
    
    // --- Forgot Password Logic has been REMOVED ---
    
    // --- Back to Main button Logic ---
    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('userRole'); // Clear role on exit
            showPage(initialPageContent);

            const rememberedUser = localStorage.getItem('rememberedUser');
            if (rememberedUser) {
                const userData = JSON.parse(rememberedUser);
                const userTypeRadio = document.querySelector(`input[name="userType"][value="${userData.userType}"]`);
                if (userTypeRadio) {
                    userTypeRadio.checked = true;
                    userTypeRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                const usernameInput = document.getElementById('username');
                if (usernameInput) usernameInput.value = userData.username || '';

                if (userData.userType === 'student') {
                    const studentIdInput = document.getElementById('studentId');
                    if (studentIdInput) studentIdInput.value = userData.studentId || '';
                }
            }
        });
    }

    function showPage(pageElement) {
        [initialPageContent, loadingScreen, menuPage, map2DPage].forEach(page => {
            if (page) page.style.display = 'none';
        });
        if (pageElement) {
            pageElement.style.display = 'flex';
        }
    }

    function showLoadingThenPage(targetPageFunction, duration = 1500) {
        showPage(loadingScreen);
        setTimeout(() => {
            if (targetPageFunction) targetPageFunction();
        }, duration);
    }
    
    function configureMenuPageForRole() {
        const userRole = sessionStorage.getItem('userRole');
        const isVisitor = userRole === 'visitor';

        if (eventButton) eventButton.style.display = isVisitor ? 'none' : 'flex';
        if (announcementButton) announcementButton.style.display = isVisitor ? 'none' : 'flex';
        if (officeButton) officeButton.style.display = isVisitor ? 'none' : 'flex';
    }

    window.triggerTransitionToMenu = () => {
        showLoadingThenPage(() => {
            configureMenuPageForRole();
            showPage(menuPage);
        });
    };

    window.showMessage = function (type, title, text, buttonText, onButtonClick) {
        if (!messagePopupContainer) return;
        const popup = messagePopupContainer.querySelector('.message-popup');
        const titleEl = messagePopupContainer.querySelector('.message-popup-title');
        const textEl = messagePopupContainer.querySelector('.message-popup-text');
        const buttonEl = messagePopupContainer.querySelector('.message-popup-button');
        popup.className = `message-popup ${type}`;
        titleEl.textContent = title;
        textEl.innerHTML = text;
        buttonEl.textContent = buttonText;
        messagePopupContainer.style.display = 'flex';
        buttonEl.onclick = () => {
            messagePopupContainer.style.display = 'none';
            if (onButtonClick) {
                onButtonClick();
            }
        };
    };

    // --- TRANSLATIONS OBJECT ---
    window.translations = {
        en: { settingsTitle: "Settings", soundLabel: "Sound", zoomLabel: "Zoom", darkModeLabel: "Dark Mode", themeLabel: "Theme", fontLabel: "Font", languageLabel: "Language", accountLabel: "Account", logoutButton: "Logout", universityTitle: "UNIVERSITY - SAN PABLO CITY", universitySubtitle: "Integrity, Professionalism and Innovation", loginTitle: "Login", registerTitle: "Register", studentIdLabel: "Enter your Student ID", usernameLabel: "Enter your Username", passwordLabel: "Enter your Password", createPasswordLabel: "Create a Password", roleStudent: "Student", roleVisitor: "Visitor", rememberMe: "Remember me", loginButton: "Log In", registerButton: "Register", visitorButton: "Continue as Visitor", noAccount: "Don't have an account?", registerLink: "Register", hasAccount: "Already have an account?", loginLink: "Log In", logoutConfirm: "Are you sure you want to logout?", menuWelcome: "WELCOME", menuAbout: "ABOUT", menu2d: "2D", menu3d: "3D", menuEvent: "EVENT", menuAnnouncement: "ANNOUNCEMENT", menuOffice: "OFFICE<br>INFORMATION", menuFeedback: "FEEDBACK", menuAcademic: "ACADEMICS", backButton: "BACK", backToMainButton: "← Back to Main",
            popupSuccessTitle: "SUCCESS!", popupErrorTitle: "ERROR!", popupLoginSuccess: "Login successful! Entering the university...", popupRegisterSuccess: "Your account has been created!", popupContinueButton: "CONTINUE", popupOkButton: "OK", popupTryAgainButton: "TRY AGAIN", popupVisitorWelcomeTitle: "Welcome!", popupVisitorWelcomeText: "Loading university access...", popupVisitorProceedButton: "PROCEED", popupFeatureComingSoon: "This feature is coming soon!", popupNoticeTitle: "Notice"},
        fil: { settingsTitle: "Mga Setting", soundLabel: "Tunog", zoomLabel: "Laki", darkModeLabel: "Dark Mode", themeLabel: "Tema", fontLabel: "Font", languageLabel: "Wika", accountLabel: "Account", logoutButton: "Mag-logout", universityTitle: "UNIVERSITY - SAN PABLO CITY", universitySubtitle: "Integridad, Propesyonalismo at Inobasyon", loginTitle: "Mag-login", registerTitle: "Magrehistro", studentIdLabel: "Ilagay ang iyong Student ID", usernameLabel: "Ilagay ang iyong Username", passwordLabel: "Ilagay ang iyong Password", createPasswordLabel: "Gumawa ng Password", roleStudent: "Estudyante", roleVisitor: "Bisita", rememberMe: "Tandaan ako", loginButton: "Mag-login", registerButton: "Magrehistro", visitorButton: "Magpatuloy bilang Bisita", noAccount: "Wala ka pang account?", hasAccount: "May account ka na?", registerLink: "Magrehistro", loginLink: "Mag-login", logoutConfirm: "Sigurado ka bang gusto mong mag-logout?", menuWelcome: "MALIGAYANG<br>PAGDATING", menuAbout: "TUNGKOL SA", menu2d: "2D", menu3d: "3D", menuEvent: "EVENT", menuAnnouncement: "ANUNSYO", menuOffice: "IMPORMASYON<br>NG OPISINA", menuFeedback: "FEEDBACK", menuAcademic: "AKADEMIKO", backButton: "BUMALIK", backToMainButton: "← Bumalik sa Simula",
            popupSuccessTitle: "TAGUMPAY!", popupErrorTitle: "MAY MALI!", popupLoginSuccess: "Matagumpay ang pag-login! Pumapasok sa unibersidad...", popupRegisterSuccess: "Nagawa na ang iyong account!", popupContinueButton: "MAGPATULOY", popupOkButton: "OK", popupTryAgainButton: "SUBUKAN MULI", popupVisitorWelcomeTitle: "Maligayang Pagdating!", popupVisitorWelcomeText: "Inihahanda ang pag-access sa unibersidad...", popupVisitorProceedButton: "MAGPATULOY", popupFeatureComingSoon: "Malapit nang magamit ang feature na ito!", popupNoticeTitle: "Paunawa"},
        vi: { settingsTitle: "Cài đặt", soundLabel: "Âm thanh", zoomLabel: "Thu phóng", darkModeLabel: "Chế độ tối", themeLabel: "Giao diện", fontLabel: "Phông chữ", languageLabel: "Ngôn ngữ", accountLabel: "Tài khoản", logoutButton: "Đăng xuất", universityTitle: "TRƯỜNG ĐẠI HỌC - THÀNH PHỐ SAN PABLO", universitySubtitle: "Chính trực, Chuyên nghiệp và Sáng tạo", loginTitle: "Đăng nhập", registerTitle: "Đăng ký", studentIdLabel: "Nhập Mã Sinh viên", usernameLabel: "Nhập Tên người dùng", passwordLabel: "Nhập Mật khẩu", createPasswordLabel: "Tạo Mật khẩu", roleStudent: "Sinh viên", roleVisitor: "Khách", rememberMe: "Ghi nhớ tôi", loginButton: "Đăng nhập", registerButton: "Đăng ký", visitorButton: "Tiếp tục với tư cách Khách", noAccount: "Chưa có tài khoản?", registerLink: "Đăng ký", hasAccount: "Đã có tài khoản?", loginLink: "Đăng nhập", logoutConfirm: "Bạn có chắc muốn đăng xuất không?", menuWelcome: "CHÀO MỪNG", menuAbout: "GIỚI THIỆU", menu2d: "2D", menu3d: "3D", menuEvent: "SỰ KIỆN", menuAnnouncement: "THÔNG BÁO", menuOffice: "THÔNG TIN<br>VĂN PHÒNG", menuFeedback: "PHẢN HỒI", menuAcademic: "HỌC TẬP", backButton: "QUAY LẠI", backToMainButton: "← Quay lại Trang chính",
            popupSuccessTitle: "THÀNH CÔNG!", popupErrorTitle: "LỖI!", popupLoginSuccess: "Đăng nhập thành công! Đang vào trường...", popupRegisterSuccess: "Tài khoản của bạn đã được tạo!", popupContinueButton: "TIẾP TỤC", popupOkButton: "OK", popupTryAgainButton: "THỬ LẠI", popupVisitorWelcomeTitle: "Chào mừng!", popupVisitorWelcomeText: "Đang tải truy cập vào trường đại học...", popupVisitorProceedButton: "TIẾP TỤC", popupFeatureComingSoon: "Tính năng này sẽ sớm ra mắt!", popupNoticeTitle: "Thông báo"},
        ko: {settingsTitle: "설정", soundLabel: "소리", zoomLabel: "확대", darkModeLabel: "다크 모드", themeLabel: "테마", fontLabel: "글꼴", languageLabel: "언어", accountLabel: "계정", logoutButton: "로그아웃", universityTitle: "대학교 - 산파블로 시", universitySubtitle: "정직, 전문성, 혁신", loginTitle: "로그인", registerTitle: "등록", studentIdLabel: "학생 ID를 입력하세요", usernameLabel: "사용자 이름을 입력하세요", passwordLabel: "비밀번호를 입력하세요", createPasswordLabel: "비밀번호 생성", roleStudent: "학생", roleVisitor: "방문자", rememberMe: "로그인 상태 유지", loginButton: "로그인", registerButton: "등록", visitorButton: "방문자로 계속", noAccount: "계정이 없으신가요?", registerLink: "등록", hasAccount: "이미 계정이 있으신가요?", loginLink: "로그인", logoutConfirm: "정말 로그아웃하시겠습니까?", menuWelcome: "환영합니다", menuAbout: "소개", menu2d: "2D", menu3d: "3D", menuEvent: "이벤트", menuAnnouncement: "공지", menuOffice: "사무실<br>정보", menuFeedback: "피드백", menuAcademic: "학업", backButton: "뒤로", backToMainButton: "← 메인으로", popupSuccessTitle: "성공!", popupErrorTitle: "오류!", popupLoginSuccess: "로그인 성공! 대학교에 들어가는 중...", popupRegisterSuccess: "계정이 생성되었습니다!", popupContinueButton: "계속", popupOkButton: "확인", popupTryAgainButton: "다시 시도", popupVisitorWelcomeTitle: "환영합니다!", popupVisitorWelcomeText: "대학교 접속 중...", popupVisitorProceedButton: "계속", popupFeatureComingSoon: "이 기능은 곧 제공될 예정입니다!", popupNoticeTitle: "알림"},
        ja: {settingsTitle: "設定", soundLabel: "音量", zoomLabel: "ズーム", darkModeLabel: "ダークモード", themeLabel: "テーマ", fontLabel: "フォント", languageLabel: "言語", accountLabel: "アカウント", logoutButton: "ログアウト", universityTitle: "大学 - サンパブロ市", universitySubtitle: "誠実さ、専門性、革新性", loginTitle: "ログイン", registerTitle: "登録", studentIdLabel: "学生IDを入力してください", usernameLabel: "ユーザー名を入力してください", passwordLabel: "パスワードを入力してください", createPasswordLabel: "パスワードを作成", roleStudent: "学生", roleVisitor: "訪問者", rememberMe: "ログイン状態を保持", loginButton: "ログイン", registerButton: "登録", visitorButton: "訪問者として続行", noAccount: "アカウントをお持ちでないですか？", registerLink: "登録", hasAccount: "すでにアカウントをお持ちですか？", loginLink: "ログイン", logoutConfirm: "本当にログアウトしますか？", menuWelcome: "ようこそ", menuAbout: "概要", menu2d: "2D", menu3d: "3D", menuEvent: "イベント", menuAnnouncement: "お知らせ", menuOffice: "オフィス<br>情報", menuFeedback: "フィードバック", menuAcademic: "学術", backButton: "戻る", backToMainButton: "← メインに戻る", popupSuccessTitle: "成功！", popupErrorTitle: "エラー！", popupLoginSuccess: "ログインに成功しました！大学に入場しています...", popupRegisterSuccess: "アカウントが作成されました！", popupContinueButton: "続行", popupOkButton: "OK", popupTryAgainButton: "再試行", popupVisitorWelcomeTitle: "ようこそ！", popupVisitorWelcomeText: "大学へのアクセスを準備中...", popupVisitorProceedButton: "続行", popupFeatureComingSoon: "この機能は間もなく公開されます！", popupNoticeTitle: "お知らせ"},
        zh: {settingsTitle: "设置", soundLabel: "音量", zoomLabel: "缩放", darkModeLabel: "深色模式", themeLabel: "主题", fontLabel: "字体", languageLabel: "语言", accountLabel: "账户", logoutButton: "退出登录", universityTitle: "大学 - 圣巴勃罗市", universitySubtitle: "诚信、专业、创新", loginTitle: "登录", registerTitle: "注册", studentIdLabel: "请输入学生ID", usernameLabel: "请输入用户名", passwordLabel: "请输入密码", createPasswordLabel: "创建密码", roleStudent: "学生", roleVisitor: "访客", rememberMe: "记住我", loginButton: "登录", registerButton: "注册", visitorButton: "以访客身份继续", noAccount: "没有账户？", registerLink: "注册", hasAccount: "已有账户？", loginLink: "登录", logoutConfirm: "您确定要退出登录吗？", menuWelcome: "欢迎", menuAbout: "关于", menu2d: "2D", menu3d: "3D", menuEvent: "活动", menuAnnouncement: "公告", menuOffice: "办公室<br>信息", menuFeedback: "反馈", menuAcademic: "学术", backButton: "返回", backToMainButton: "← 返回主页", popupSuccessTitle: "成功！", popupErrorTitle: "错误！", popupLoginSuccess: "登录成功！正在进入大学...", popupRegisterSuccess: "您的账户已创建！", popupContinueButton: "继续", popupOkButton: "确定", popupTryAgainButton: "再试一次", popupVisitorWelcomeTitle: "欢迎！", popupVisitorWelcomeText: "正在加载大学访问权限...", popupVisitorProceedButton: "继续", popupFeatureComingSoon: "此功能即将推出！", popupNoticeTitle: "注意"},
        pt: {settingsTitle: "Configurações", soundLabel: "Som", zoomLabel: "Zoom", darkModeLabel: "Modo Escuro", themeLabel: "Tema", fontLabel: "Fonte", languageLabel: "Idioma", accountLabel: "Conta", logoutButton: "Sair", universityTitle: "UNIVERSIDADE - CIDADE DE SAN PABLO", universitySubtitle: "Integridade, Profissionalismo e Inovação", loginTitle: "Entrar", registerTitle: "Registrar", studentIdLabel: "Digite seu ID de Estudante", usernameLabel: "Digite seu Nome de Usuário", passwordLabel: "Digite sua Senha", createPasswordLabel: "Crie uma Senha", roleStudent: "Estudante", roleVisitor: "Visitante", rememberMe: "Lembrar-me", loginButton: "Entrar", registerButton: "Registrar", visitorButton: "Continuar como Visitante", noAccount: "Não tem uma conta?", registerLink: "Registrar", hasAccount: "Já tem uma conta?", loginLink: "Entrar", logoutConfirm: "Tem certeza que deseja sair?", menuWelcome: "BEM-VINDO", menuAbout: "SOBRE", menu2d: "2D", menu3d: "3D", menuEvent: "EVENTO", menuAnnouncement: "AVISOS", menuOffice: "INFORMAÇÕES<br>DO ESCRITÓRIO", menuFeedback: "FEEDBACK", menuAcademic: "ACADÊMICO", backButton: "VOLTAR", backToMainButton: "← Voltar ao Início", popupSuccessTitle: "SUCESSO!", popupErrorTitle: "ERRO!", popupLoginSuccess: "Login bem-sucedido! Entrando na universidade...", popupRegisterSuccess: "Sua conta foi criada!", popupContinueButton: "CONTINUAR", popupOkButton: "OK", popupTryAgainButton: "TENTAR NOVAMENTE", popupVisitorWelcomeTitle: "Bem-vindo!", popupVisitorWelcomeText: "Carregando acesso à universidade...", popupVisitorProceedButton: "CONTINUAR", popupFeatureComingSoon: "Este recurso estará disponível em breve!", popupNoticeTitle: "Aviso"},
        es: {settingsTitle: "Configuraciones", soundLabel: "Sonido", zoomLabel: "Zoom", darkModeLabel: "Modo Oscuro", themeLabel: "Tema", fontLabel: "Fuente", languageLabel: "Idioma", accountLabel: "Cuenta", logoutButton: "Cerrar sesión", universityTitle: "UNIVERSIDAD - CIUDAD DE SAN PABLO", universitySubtitle: "Integridad, Profesionalismo e Innovación", loginTitle: "Iniciar sesión", registerTitle: "Registrarse", studentIdLabel: "Ingrese su ID de Estudiante", usernameLabel: "Ingrese su Nombre de Usuario", passwordLabel: "Ingrese su Contraseña", createPasswordLabel: "Cree una Contraseña", roleStudent: "Estudiante", roleVisitor: "Visitante", rememberMe: "Recordarme", loginButton: "Entrar", registerButton: "Registrarse", visitorButton: "Continuar como Visitante", noAccount: "¿No tienes una cuenta?", registerLink: "Registrarse", hasAccount: "¿Ya tienes una cuenta?", loginLink: "Iniciar sesión", logoutConfirm: "¿Estás seguro de que quieres cerrar sesión?", menuWelcome: "BIENVENIDO", menuAbout: "SOBRE", menu2d: "2D", menu3d: "3D", menuEvent: "EVENTO", menuAnnouncement: "ANUNCIOS", menuOffice: "INFORMACIÓN<br>DE LA OFICINA", menuFeedback: "COMENTARIOS", menuAcademic: "ACADÉMICO", backButton: "VOLVER", backToMainButton: "← Volver al Inicio", popupSuccessTitle: "¡ÉXITO!", popupErrorTitle: "¡ERROR!", popupLoginSuccess: "¡Inicio de sesión exitoso! Entrando a la universidad...", popupRegisterSuccess: "¡Tu cuenta ha sido creada!", popupContinueButton: "CONTINUAR", popupOkButton: "OK", popupTryAgainButton: "INTENTAR DE NUEVO", popupVisitorWelcomeTitle: "¡Bienvenido!", popupVisitorWelcomeText: "Cargando acceso a la universidad...", popupVisitorProceedButton: "CONTINUAR", popupFeatureComingSoon: "¡Esta función estará disponible pronto!", popupNoticeTitle: "Aviso"}
    };
    
    const buildingInfo = {
        cas: { icon: 'fa-paint-brush', title: 'College of Arts and Sciences (CAS)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Biology (BSBio)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Psychology (BScPsych)</li></ul>' },
        cbaa: { icon: 'fa-briefcase', title: 'College of Business Administration and Accountancy (CBAA)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Office Administration (BSOA)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Business Administration (BSBA)<ol><li>Financial Management (BSBA-FM)</li><li>Marketing Management (BSBA-MM)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Accountancy (BSA)</li></ul>' },
        ccs: { icon: 'fa-laptop-code', title: 'College of Computer Studies (CCS)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Information Technology (BSInfoTech)<ol><li>Animation and Motion Graphics (BSInfoTech-AMG)</li><li>Service Management Program (BSInfoTech-SMP)</li><li>Web and Mobile Application Development (BSInfoTech-WMAD)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Computer Science (BSCS)<ol><li>Graphics and Visualization (BSCS-GV)</li><li>Intelligent Systems (BSCS-IS)</li></ol></li></ul>' },
        ccje: { icon: 'fa-balance-scale', title: 'College of Criminal Justice Education (CCJE)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Criminology (BSCrim)</li></ul>' },
        coe: { icon: 'fa-cogs', title: 'College of Engineering (COE)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Electronics Engineering (BSECE)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Electrical Engineering (BSEE)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Computer Engineering (BSCpE)</li></ul>' },
        chmt: { icon: 'fa-concierge-bell', title: 'College of Hospitality Management and Tourism (CHMT)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Hospitality Management (BSHM)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Tourism Management (BSTM)</li></ul>' },
        cit: { icon: 'fa-tools', title: 'College of Industrial Technology (CIT)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Industrial Technology (BSIT)</li></ul>' },
        cte: { icon: 'fa-chalkboard-teacher', title: 'College of Teacher Education (CTE)', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Secondary Education (BSEd):<ol><li>English (BSEd-English)</li><li>Filipino (BSEd-Filipino)</li><li>Mathematics (BSEd-Math)</li><li>Science (BSEd-Science)</li><li>Social Science (BSEd-SocSci)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Elementary Education (BEEd)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Physical Education (BPEd)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Technology and Livelihood Education (BTLEd):<ol><li>Home Economics (BTLEd-HE)</li><li>Industrial Arts (BTLEd-IA)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Technical Vocational Teacher Education (BTVTEd):<ol><li>Electrical Technology (BTVTEd-ELT)</li><li>Electronics Technology (BTVTEd-ELTS)</li><li>Food and Service Management (BTVTED-FSM)</li><li>Garments, Fashion and Design (BTVTED-GFD)</li></ol></li></ul>' }
    };

    function setLanguage(lang) {
        localStorage.setItem('language', lang);
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.dataset.langKey;
            if (window.translations[lang] && window.translations[lang][key]) {
                element.innerHTML = window.translations[lang][key];
            }
        });
        window.dispatchEvent(new CustomEvent('languageChanged'));
    }
    
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    function applyTheme(gradient) { localStorage.setItem('themeGradient', gradient); if (!bodyElement.classList.contains('dark-mode-active')) { bodyElement.style.background = gradient; } }
    function updateDarkMode(isDark) { localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled'); bodyElement.classList.toggle('dark-mode-active', isDark); if (isDark) { bodyElement.style.background = ''; } else { const savedTheme = localStorage.getItem('themeGradient') || 'linear-gradient(159deg, rgba(0,71,171,1) 0%, rgba(28,169,201,1) 100%)'; bodyElement.style.background = savedTheme; } }
    function applyFont(fontName) { document.documentElement.style.setProperty('--main-font-family', `'${fontName}', sans-serif`); localStorage.setItem('selectedFont', fontName); }
    function applyZoom(zoomValue) { document.documentElement.style.fontSize = `${zoomValue}%`; localStorage.setItem('globalZoom', zoomValue); }


    if (settingsToggleButton) {
        settingsToggleButton.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (settingsPanel) settingsPanel.classList.toggle('active'); });
        document.addEventListener('click', (e) => { if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== settingsToggleButton) { settingsPanel.classList.remove('active'); } });
    }
    if (darkModeCheckbox) { darkModeCheckbox.addEventListener('change', (e) => updateDarkMode(e.target.checked)); }
    if (colorSwatches) { colorSwatches.forEach(swatch => swatch.addEventListener('click', () => applyTheme(swatch.dataset.color))); }
    if (fontChanger) { fontChanger.addEventListener('change', e => applyFont(e.target.value)); }
    if (zoomSlider) { zoomSlider.addEventListener('input', e => applyZoom(e.target.value)); }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = localStorage.getItem('language') || 'en';
            if (confirm(window.translations[lang].logoutConfirm)) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
            }
        });
    }

    if (backgroundMusic) {
        let hasInteracted = false;
        let userWantsMusic = localStorage.getItem('userWantsMusic') === 'true';
        backgroundMusic.volume = parseFloat(localStorage.getItem('musicVolume')) || 0.5;
        const updateSoundUI = () => { if (!soundToggleButton || !volumeSlider) return; const isMuted = backgroundMusic.muted || backgroundMusic.volume === 0; const isPlaying = !backgroundMusic.paused; const icon = soundToggleButton.querySelector('i'); if (icon) { icon.className = (userWantsMusic && !isMuted && isPlaying) ? 'fas fa-volume-high' : 'fas fa-volume-mute'; } volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume; };
        const attemptToPlayMusic = async () => { if (!userWantsMusic || backgroundMusic.muted) return; try { await backgroundMusic.play(); } catch (error) { console.warn("Audio play blocked until user interaction."); } };
        const handleUserInteractionForSound = () => { if (!hasInteracted) { hasInteracted = true; attemptToPlayMusic(); } };
        document.body.addEventListener('click', handleUserInteractionForSound, { once: true });
        if (soundToggleButton) { soundToggleButton.addEventListener('click', (e) => { e.preventDefault(); userWantsMusic = !userWantsMusic; localStorage.setItem('userWantsMusic', userWantsMusic); if (userWantsMusic) { backgroundMusic.muted = false; attemptToPlayMusic(); } else { backgroundMusic.pause(); } updateSoundUI(); }); }
        if (volumeSlider) { volumeSlider.addEventListener('input', () => { backgroundMusic.volume = parseFloat(volumeSlider.value); backgroundMusic.muted = backgroundMusic.volume === 0; localStorage.setItem('musicVolume', backgroundMusic.volume); if (userWantsMusic) attemptToPlayMusic(); updateSoundUI(); }); }
        backgroundMusic.onplay = backgroundMusic.onpause = updateSoundUI;
        updateSoundUI();
    }

    if (hexagon2DButton) {
        hexagon2DButton.addEventListener('click', e => {
            e.preventDefault();
            showLoadingThenPage(() => showPage(map2DPage), 1000);
        });
    }

    // --- ABOUT BUTTON LOGIC ---
    if (aboutButton) {
        aboutButton.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutContent = `
                <h2 class="about-title">About the Project</h2>
                <p>Welcome to the 3D Navigation System of the University – San Pablo City, a pioneering digital initiative designed to enhance the way students, faculty, and visitors explore and interact with the university environment.</p>
                <p>This system was developed as part of the thesis project entitled “3D Navigation System in One State University in the Philippines.” It aims to modernize campus orientation through the integration of interactive 2D and 3D mapping technologies.</p>
                <p>By providing a visually engaging and user-friendly platform, this project supports the university’s goal of embracing digital innovation in higher education.</p>
                
                <h3>🎯 Project Objectives</h3>
                <ul>
                    <li><i class="fas fa-compass"></i><div><strong>To Simplify Campus Navigation:</strong> Assist users in efficiently locating academic buildings, offices, and departments throughout the university.</div></li>
                    <li><i class="fas fa-laptop"></i><div><strong>To Enable Virtual Campus Tours:</strong> Provide prospective students, parents, and remote users with a digital walkthrough of the campus.</div></li>
                    <li><i class="fas fa-school"></i><div><strong>To Showcase University Facilities:</strong> Highlight key infrastructure and amenities through immersive 3D representations.</div></li>
                    <li><i class="fas fa-chart-line"></i><div><strong>To Promote Institutional Digital Advancement:</strong> Contribute to the university’s vision of integrating technology into administrative and educational services.</div></li>
                </ul>

                <h3>🛠️ Key Features</h3>
                <ul>
                    <li><i class="fas fa-map-marked-alt"></i><div>Interactive 3D Campus Map with Pathfinding Capabilities</div></li>
                    <li><i class="fas fa-user-lock"></i><div>Secure Login System for Students and Visitors</div></li>
                    <li><i class="fas fa-palette"></i><div>Customizable Interface (Themes, Fonts, Dark/Light Modes)</div></li>
                    <li><i class="fas fa-language"></i><div>Multilingual Support: Available in English, Filipino, Korean, Japanese, Vietnamese, Chinese, Spanish, and Portuguese.</div></li>
                    <li><i class="fas fa-desktop"></i><div>Responsive Design compatible with both desktop and mobile devices</div></li>
                    <li><i class="fas fa-comments"></i><div>Feedback System for gathering user suggestions and comments</div></li>
                    <li><i class="fas fa-info-circle"></i><div>Dynamic Information Panels to provide detailed insights per room or building</div></li>
                </ul>

                <h3>👥 Developers</h3>
                <p>This project was conceptualized and developed by:</p>
                <ul class="developer-list">
                    <li>Alejandro John Zymon</li>
                    <li>Endrenal, Danniele Anne V.</li>
                    <li>Nguyen Kim</li>
                    <li>Sedric Dimasapit</li>
                </ul>
            `;
            if (infoPopupContainer && infoPopupIcon && infoPopupBody) {
                infoPopupIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
                infoPopupBody.className = 'info-popup-body about-section-content'; // Add class for specific styling
                infoPopupBody.innerHTML = aboutContent;
                infoPopupContainer.style.display = 'flex';
            }
        });
    }

    const placeholderButtons = [
        welcomeButton, hexagon3dButton, feedbackButton, eventButton, announcementButton, officeButton
    ];

    const handlePlaceholderClick = (e) => {
        e.preventDefault();
        const lang = localStorage.getItem('language') || 'en';
        window.showMessage('info', window.translations[lang].popupNoticeTitle, window.translations[lang].popupFeatureComingSoon, window.translations[lang].popupOkButton);
    };

    placeholderButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', handlePlaceholderClick);
        }
    });

    if (backButtonFrom2D) {
        backButtonFrom2D.addEventListener('click', e => {
            e.preventDefault();
            showPage(menuPage);
        });
    }

    function showCollegeInfoPopup(collegeKey) {
        const info = buildingInfo[collegeKey];
        if (info && infoPopupContainer) {
            if (infoPopupIcon) infoPopupIcon.innerHTML = `<i class="fas ${info.icon}"></i>`;
            if (infoPopupBody) {
                infoPopupBody.className = 'info-popup-body'; // Ensure no 'about' class
                infoPopupBody.innerHTML = `<h3>${info.title}</h3>${info.details}`;
            }
            infoPopupContainer.style.display = 'flex';
        }
    }

    if (infoPopupCloseBtn) {
        infoPopupCloseBtn.addEventListener('click', () => {
            if (infoPopupContainer) {
                infoPopupContainer.style.display = 'none';
                if (infoPopupBody) infoPopupBody.className = 'info-popup-body'; // Reset class on close
            }
        });
    }
    if (infoPopupContainer) {
        infoPopupContainer.addEventListener('click', e => {
            if (e.target === infoPopupContainer) {
                infoPopupContainer.style.display = 'none';
                if (infoPopupBody) infoPopupBody.className = 'info-popup-body'; // Reset class on close
            }
        });
    }

    if (mapAcademicsBtn && mapDropdownContent && mapAcademicsDropdown) {
        Object.keys(buildingInfo).forEach(key => {
            const collegeData = buildingInfo[key];
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = collegeData.title;
            link.dataset.collegeKey = key;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                showCollegeInfoPopup(event.currentTarget.dataset.collegeKey);
                mapAcademicsDropdown.classList.remove('active');
            });
            mapDropdownContent.appendChild(link);
        });
        mapAcademicsBtn.addEventListener('click', (e) => { e.stopPropagation(); mapAcademicsDropdown.classList.toggle('active'); });
        document.addEventListener('click', (e) => { if (mapAcademicsDropdown && !mapAcademicsDropdown.contains(e.target)) { mapAcademicsDropdown.classList.remove('active'); } });
    }

    if (mapAreaWrapperEl && mapContentEl) {
        let panScale = 1; let panPanning = false; let panStart = { x: 0, y: 0 }; let panTransform = { x: 0, y: 0 };
        const setMapTransform = () => { mapContentEl.style.transform = `translate(${panTransform.x}px, ${panTransform.y}px) scale(${panScale})`; }
        mapAreaWrapperEl.onmousedown = (e) => { e.preventDefault(); panStart = { x: e.clientX - panTransform.x, y: e.clientY - panTransform.y }; panPanning = true; };
        mapAreaWrapperEl.onmouseup = () => panPanning = false;
        mapAreaWrapperEl.onmouseleave = () => panPanning = false;
        mapAreaWrapperEl.onmousemove = (e) => { e.preventDefault(); if (!panPanning) return; panTransform.x = (e.clientX - panStart.x); panTransform.y = (e.clientY - panStart.y); setMapTransform(); };
        mapAreaWrapperEl.onwheel = (e) => { e.preventDefault(); const rect = mapAreaWrapperEl.getBoundingClientRect(); const xs = (e.clientX - rect.left - panTransform.x) / panScale; const ys = (e.clientY - rect.top - panTransform.y) / panScale; const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY); (delta > 0) ? (panScale *= 1.2) : (panScale /= 1.2); panScale = Math.min(Math.max(0.5, panScale), 4); panTransform.x = e.clientX - rect.left - xs * panScale; panTransform.y = e.clientY - rect.top - ys * panScale; setMapTransform(); };
        if (zoomInBtn) zoomInBtn.onclick = (e) => { e.preventDefault(); panScale = Math.min(panScale * 1.2, 4); setMapTransform(); };
        if (zoomOutBtn) zoomOutBtn.onclick = (e) => { e.preventDefault(); panScale = Math.max(panScale / 1.2, 0.5); setMapTransform(); };
    }
     
    function initializeApp() {
        const savedLang = localStorage.getItem('language') || 'en';
        if(languageSelect) languageSelect.value = savedLang;
        setLanguage(savedLang);

        const savedFont = localStorage.getItem('selectedFont') || 'Poppins'; 
        if (fontChanger) fontChanger.value = savedFont; 
        applyFont(savedFont);

        const savedZoom = localStorage.getItem('globalZoom') || '100'; 
        if (zoomSlider) zoomSlider.value = savedZoom; 
        applyZoom(savedZoom);

        const savedTheme = localStorage.getItem('themeGradient'); 
        applyTheme(savedTheme || 'linear-gradient(159deg, rgba(0,71,171,1) 0%, rgba(28,169,201,1) 100%)');

        const prefersDark = localStorage.getItem('darkMode') === 'enabled'; 
        if (darkModeCheckbox) darkModeCheckbox.checked = prefersDark; 
        updateDarkMode(prefersDark);
        
        showPage(initialPageContent);
        console.log("Main script is ready, firing event.");
        window.dispatchEvent(new CustomEvent('mainScriptReady'));
    }

    initializeApp();
});