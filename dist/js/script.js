import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', function () {

    // --- Get all general elements ---
    const bodyElement = document.body;
    const initialPageContent = document.getElementById('initial-page-content');
    const studentLoadingScreen = document.getElementById('student-loading-screen');
    const visitorLoadingScreen = document.getElementById('visitor-loading-screen');
    const menuPage = document.getElementById('menu-page');
    const map2DPage = document.getElementById('map-2d-page');
    const messagePopupContainer = document.getElementById('message-popup-container');
    const settingsToggleButton = document.getElementById('settingsToggleButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const darkModeCheckbox = document.getElementById('dark-mode-toggle-checkbox');
    const languageSelect = document.getElementById('languageSelect');

    const settingsBackToMainButton = document.getElementById('settingsBackToMainButton');
    const fontChanger = document.getElementById('fontChanger');
    const zoomSlider = document.getElementById('zoomSlider');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const soundToggleButton = document.getElementById('soundToggleButton');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const backButtonFrom2D = document.getElementById('backButtonFrom2D');
    const mapPageSettingsButton = document.getElementById('mapPageSettingsButton');

    const enterUniversityButton = document.getElementById('enterUniversityButton');

    // --- Info Popup (About) Elements ---
    const infoPopupContainer = document.getElementById('info-popup-container');
    const infoPopupContentWrapper = document.getElementById('info-popup-content-wrapper');
    const infoPopupCloseBtn = document.getElementById('info-popup-close-btn');
    const infoPopupNextBtn = document.getElementById('info-popup-next-btn');
    const infoPopupPrevBtn = document.getElementById('info-popup-prev-btn');
    const infoPages = document.querySelectorAll('.info-page');
    let currentInfoPageIndex = 0;

    // --- Pin Info Popup Elements ---
    const pinInfoPopupContainer = document.getElementById('pin-info-popup-container');
    const pinInfoPopupCloseBtn = document.getElementById('pin-info-popup-close-btn');
    const pinPopupIcon = document.getElementById('pin-popup-icon');
    const pinPopupTitle = document.getElementById('pin-popup-title');
    const pinPopupNextBtn = document.getElementById('pin-popup-next-btn');

    // --- College Info Popup Elements ---
    const collegeInfoPopupContainer = document.getElementById('college-info-popup-container');
    const collegeInfoPopupCloseBtn = document.getElementById('college-info-popup-close-btn');
    const collegePopupIcon = document.getElementById('college-popup-icon');
    const collegePopupTitle = document.getElementById('college-popup-title');
    const collegePopupDetails = document.getElementById('college-popup-details');

    // --- Map Pan & Zoom Elements ---
    const mapAreaWrapperEl = document.querySelector('.map-area-wrapper');
    const mapContentEl = document.getElementById('map-content-area');
    const mapImageEl = document.querySelector('.map-image-2d');

    // --- Menu Buttons ---
    const welcomeButton = document.getElementById('welcomeButton');
    const aboutButton = document.getElementById('aboutButton');
    const hexagon2DButton = document.getElementById('hexagon-2d-button');
    const hexagon3dButton = document.getElementById('hexagon-3d-button');
    const backToLoginButton = document.getElementById('backToLoginButton');

    // --- Welcome Popup Elements ---
    const welcomePopupContainer = document.getElementById('welcome-popup-container');
    const welcomePopupContentWrapper = document.getElementById('welcome-popup-content-wrapper');
    const welcomePopupCloseBtn = document.getElementById('welcome-popup-close-btn');
    const welcomePopupNextBtn = document.getElementById('welcome-popup-next-btn');
    const welcomePopupPrevBtn = document.getElementById('welcome-popup-prev-btn');
    const welcomePages = document.querySelectorAll('.welcome-page');
    let currentWelcomePageIndex = 0;

    // --- Character Selection Page Elements ---
    const characterSelectionPage = document.getElementById('character-selection-page');
    const characterCanvasContainer = document.getElementById('character-canvas-container');
    const prevCharBtn = document.getElementById('prev-char-btn');
    const nextCharBtn = document.getElementById('next-char-btn');
    const selectCharBtn = document.getElementById('select-char-btn');
    const loadMapBtn = document.getElementById('loadmap-btn');
    const charPlaceholder2 = document.getElementById('char-placeholder-2');
    const charToggleAnimationBtn = document.getElementById('char-toggle-animation-btn');
    const charFullscreenBtn = document.getElementById('char-fullscreen-btn');
    const charBackToMenuBtn = document.getElementById('char-back-to-menu-btn');
    const loadMapIcon = loadMapBtn ? loadMapBtn.querySelector('i') : null;


    // --- Main 3D Campus Page Elements ---
    const main3DCampusPage = document.getElementById('main-3d-campus-page');
    const selectedCharDisplay = document.getElementById('selected-char-display');
    const backFrom3DCampusBtn = document.getElementById('backFrom3DCampusBtn');

    let currentPinCollegeKey = null;

    // --- CHARACTER SELECTION & THREE.JS VARIABLES ---
    let threeScene, threeCamera, threeRenderer, threeControls, currentModel;
    let threeMixer, animationAction, threeClock;
    let isSceneInitialized = false;
    let currentCharacterIndex = 0;
    const characterModels = [
        'models/character/student1/girl.gltf',
        'models/character/student2/Boy.gltf', // Case-sensitive filename
        'models/character/teacher/teacher.gltf'
    ];
    let isMapView = false;
    let isAnimationPlaying = true;
    let animationRequestId;

    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(initialPageContent);
        });
    }

    if (settingsBackToMainButton) {
        settingsBackToMainButton.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = localStorage.getItem('language') || 'en';
            if (confirm(window.translations[lang].backToMainConfirm)) {
                sessionStorage.clear();
                window.location.reload();
            }
        });
    }

    function showPage(pageElement) {
        // Correctly pause the animation loop when leaving the 3D page
        if (pageElement !== characterSelectionPage && animationRequestId) {
            cancelAnimationFrame(animationRequestId);
            animationRequestId = null;
        }

        [initialPageContent, studentLoadingScreen, visitorLoadingScreen, menuPage, map2DPage, characterSelectionPage, main3DCampusPage].forEach(page => {
            if (page) page.style.display = 'none';
        });

        if (pageElement) {
            pageElement.style.display = 'flex';
        }

        // Reset map transform when showing the 2D map page
        if (pageElement === map2DPage) {
             // Use a timeout to ensure the browser has rendered the page layout
            setTimeout(() => {
                if (mapImageEl.complete) {
                    resetMapTransform();
                } else {
                    mapImageEl.onload = resetMapTransform;
                }
            }, 0);
        }

        // Correctly initialize or resume the animation when returning to the 3D page
        if (pageElement === characterSelectionPage) {
            initCharacterScene(); // This will only run once
            if (!animationRequestId) {
                animateCharacterScene(); // Resume animation loop if it was stopped
            }
        }
    }

    function showLoadingThenPage(loadingScreenElement, targetPageFunction, duration = 3000) {
        showPage(loadingScreenElement);
        setTimeout(() => {
            if (targetPageFunction) targetPageFunction();
        }, duration);
    }

    window.showMessage = function (type, title, text, buttonText, onButtonClick) {
        if (!messagePopupContainer) return;
        const popup = messagePopupContainer.querySelector('.message-popup');
        const iconCircle = popup.querySelector('.popup-icon-circle');
        const titleEl = messagePopupContainer.querySelector('.message-popup-title');
        const textEl = messagePopupContainer.querySelector('.message-popup-text');
        const buttonEl = messagePopupContainer.querySelector('.message-popup-button');

        popup.className = `message-popup ${type}`;
        iconCircle.className = `popup-icon-circle`;

        if (type === 'success') {
            iconCircle.innerHTML = '<i class="fas fa-check"></i>';
        } else {
            iconCircle.innerHTML = '<i class="fas fa-map-marker-alt location-icon"></i>';
        }

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

    window.translations = {
        en: {
            settingsTitle: "Settings", soundLabel: "Sound", zoomLabel: "Zoom", darkModeLabel: "Dark Mode", themeLabel: "Theme", fontLabel: "Font", languageLabel: "Language", accountLabel: "Account", settingsBackToMain: "Back to Main",
            universityTitle: "LAGUNA STATE POLYTECHNIC UNIVERSITY - SAN PABLO CITY", universitySubtitle: "Integrity, Professionalism and Innovation", backToMainConfirm: "Are you sure you want to return to the main page?",
            menuWelcome: "WELCOME", menuAbout: "ABOUT", menuMiniMap: "Mini Map", menu3d: "3D", backButton: "BACK", backToMainButton: "Back to Main",
            popupFeatureComingSoon: "This feature is coming soon!", popupNoticeTitle: "Notice", popupSuccessTitle: "Success", popupOkButton: "OK",
            characterSelected: "Character selected! You will now proceed to the campus.",
            welcomeTitle: "Welcome", welcomeText: "Press continue to begin the tour.", enterButton: "Continue",
            loadingTextStudent: "Enrolling you into the virtual campus...", loadingTextVisitor: "Preparing your tour...",
            loadingWelcomeStudent: "Welcome Student to LSPU Campus of San Pablo City! We hope you enjoy looking around your university! If you're lost we got your back! Look around the campus, see where the best spot to relax with your friends!",
            loadingWelcomeVisitor: "Welcome to Laguna State Polytechnic University – San Pablo City Campus! Feel free to explore and get to know our university grounds. Whether you're here for an event, a meeting, or just a quick tour, our 3D map is here to guide you every step of the way!",
            aboutIntro: "Welcome to the 3D Navigation System of the University – LSPU, San Pablo City. A pioneering digital initiative designed to enhance the way students, faculty, and visitors explore and interact with the university environment.",
            aboutObjectivesTitle: "Project Objectives", aboutObjectivesText: "This project aims to simplify campus navigation by assisting users in efficiently locating academic buildings, offices, and departments throughout the university. It also seeks to enable virtual campus tours, allowing prospective students, parents, and remote users to digitally explore the school grounds. Another key objective is to showcase university facilities by highlighting major infrastructure and amenities through immersive 3D representations. Lastly, the project contributes to the institutional goal of digital transformation by integrating modern technology into both administrative and educational services.",
            aboutFeaturesTitle: "Key Features", aboutFeaturesText: "The 3D campus navigation system includes an interactive 3D map equipped with pathfinding capabilities to help users navigate efficiently. A secure login system allows access for both students and visitors, while a customizable interface supports theme, font, and dark/light mode options to enhance user experience. The platform also offers multilingual support, currently available in English, Filipino, Korean, Japanese, Vietnamese, Chinese, Spanish, and Portuguese. Designed with a responsive layout, the system is fully functional on both desktop and mobile devices. Additional features include a feedback system for collecting user input and dynamic information panels that display detailed insights about specific rooms and buildings.",
            aboutDevsTitle: "Developers", aboutDevsIntro: "This project was conceptualized and developed by the following student researchers:",
            welcomeHistory1: "Laguna State Polytechnic University (LSPU), established in 1952, began as Baybay Provincial High School and evolved into its current university status under Republic Act No. 9402 in 2007. It is a public, non-profit institution recognized by the Commission on Higher Education (CHED) and the Accrediting Agency of Chartered Colleges and Universities (AACCUP), offering a range of undergraduate and graduate programs through its multiple campuses.",
            welcomeHistory2: "LSPU is dedicated to quality education, research, and community service, guided by its values of integrity, professionalism, and innovation. Its main campus is located in Santa Cruz, Laguna, with regular branch campuses in San Pablo City, Los Baños, and Siniloan, plus satellite campuses in Magdalena, Nagcarlan, Liliw, and Lopez.",
            welcomeHistory3: "As a center of technological innovation, LSPU promotes interdisciplinary learning and sustainable development through strong partnerships within the region. The university serves approximately 35,000 undergraduate and 2,000 graduate students, with about 300–400 faculty members.",
            welcomePopupMVTitle: "Mission & Vision", welcomePopupMissionTitle: "MISSION", welcomePopupMissionText: "LSPU, driven by progressive leadership, is a premier institution providing technology-mediated agriculture, fisheries and other related and emerging disciplines significantly contributing to the growth and development of the region and nation.", welcomePopupVisionTitle: "VISION", welcomePopupVisionText: "LSPU is a center of technological innovation that promotes interdisciplinary learning, sustainable utilization of resources, and collaboration and partnership with the community and stakeholders."
        },
        fil: {
            settingsTitle: "Mga Setting", soundLabel: "Tunog", zoomLabel: "Laki", darkModeLabel: "Dark Mode", themeLabel: "Tema", fontLabel: "Font", languageLabel: "Wika", accountLabel: "Account", settingsBackToMain: "Bumalik sa Simula",
            universityTitle: "LAGUNA STATE POLYTECHNIC UNIVERSITY - SAN PABLO CITY", universitySubtitle: "Integridad, Propesyonalismo at Inobasyon", backToMainConfirm: "Sigurado ka bang gusto mong bumalik sa pangunahing pahina?",
            menuWelcome: "MALIGAYANG<br>PAGDATING", menuAbout: "TUNGKOL SA", menuMiniMap: "Maliit na Mapa", menu3d: "3D", backButton: "BUMALIK", backToMainButton: "Bumalik sa Simula",
            popupFeatureComingSoon: "Malapit nang magamit ang feature na ito!", popupNoticeTitle: "Paunawa", popupSuccessTitle: "Tagumpay", popupOkButton: "OK",
            characterSelected: "Napili na ang karakter! Magpapatuloy ka na ngayon sa campus.",
            welcomeTitle: "Maligayang Pagdating", welcomeText: "Pindutin ang magpatuloy upang simulan ang paglilibot.", enterButton: "Magpatuloy",
            loadingTextStudent: "Inililista ka sa birtuwal na kampus...", loadingTextVisitor: "Inihahanda ang iyong paglilibot...",
            loadingWelcomeStudent: "Maligayang pagdating, Mag-aaral, sa LSPU Campus ng Lungsod ng San Pablo! Sana'y masiyahan ka sa paglilibot sa iyong unibersidad! Kung ikaw ay naliligaw, kami ang bahala sa iyo! Maglibot sa kampus, tingnan kung saan ang pinakamagandang lugar para mag-relax kasama ang iyong mga kaibigan!",
            loadingWelcomeVisitor: "Maligayang pagdating sa Laguna State Polytechnic University – San Pablo City Campus! Huwag mag-atubiling mag-explore at kilalanin ang aming unibersidad. Kung ikaw ay narito para sa isang kaganapan, pulong, o isang mabilis na paglilibot, narito ang aming 3D map para gabayan ka sa bawat hakbang!",
            aboutIntro: "Maligayang pagdating sa 3D Navigation System ng Unibersidad – LSPU, Lungsod ng San Pablo. Isang paunang digital na inisyatiba na idinisenyo upang mapabuti ang paraan ng pagtuklas at pakikipag-ugnayan ng mga mag-aaral, guro, at bisita sa kapaligiran ng unibersidad.",
            aboutObjectivesTitle: "Mga Layunin ng Proyekto", aboutObjectivesText: "Nilalayon ng proyektong ito na gawing simple ang nabigasyon sa kampus sa pamamagitan ng pagtulong sa mga gumagamit na mahanap nang mahusay ang mga gusaling pang-akademiko, opisina, at departamento sa buong unibersidad. Nilalayon din nitong paganahin ang mga virtual na paglilibot sa kampus, na nagpapahintulot sa mga prospective na mag-aaral, magulang, at mga remote user na digital na tuklasin ang mga bakuran ng paaralan. Isa pang pangunahing layunin ay ipakita ang mga pasilidad ng unibersidad sa pamamagitan ng pag-highlight sa mga pangunahing imprastraktura at kagamitan sa pamamagitan ng mga nakaka-engganyong 3D na representasyon. Panghuli, ang proyekto ay nag-aambag sa institutional na layunin ng digital transformation sa pamamagitan ng pagsasama ng modernong teknolohiya sa parehong mga serbisyong administratibo at pang-edukasyon.",
            aboutFeaturesTitle: "Mga Pangunahing Tampok", aboutFeaturesText: "Kasama sa 3D campus navigation system ang isang interactive na 3D na mapa na may mga kakayahan sa paghahanap ng landas upang matulungan ang mga gumagamit na mag-navigate nang mahusay. Ang isang secure na sistema ng pag-login ay nagbibigay-daan sa pag-access para sa parehong mga mag-aaral at bisita, habang ang isang nako-customize na interface ay sumusuporta sa mga opsyon sa tema, font, at dark/light mode upang mapahusay ang karanasan ng gumagamit. Nag-aalok din ang platform ng suporta sa maraming wika, kasalukuyang magagamit sa Ingles, Filipino, Korean, Japanese, Vietnamese, Chinese, Spanish, at Portuguese. Dinisenyo na may tumutugong layout, ang sistema ay ganap na gumagana sa parehong desktop at mobile device. Kasama sa mga karagdagang tampok ang isang feedback system para sa pagkolekta ng input ng gumagamit at mga dynamic na panel ng impormasyon na nagpapakita ng detalyadong mga insight tungkol sa mga partikular na silid at gusali.",
            aboutDevsTitle: "Mga Developer", aboutDevsIntro: "Ang proyektong ito ay binuo at nilikha ng mga sumusunod na mag-aaral na mananaliksik:",
            welcomeHistory1: "Ang Laguna State Polytechnic University (LSPU), na itinatag noong 1952, ay nagsimula bilang Baybay Provincial High School at naging unibersidad sa ilalim ng Republic Act No. 9402 noong 2007. Ito ay isang pampubliko, non-profit na institusyon na kinikilala ng Commission on Higher Education (CHED) at ng Accrediting Agency of Chartered Colleges and Universities (AACCUP), na nag-aalok ng iba't ibang programa sa undergraduate at graduate sa pamamagitan ng maraming kampus nito.",
            welcomeHistory2: "Ang LSPU ay nakatuon sa dekalidad na edukasyon, pananaliksik, at serbisyo sa komunidad, na ginagabayan ng mga halaga nito ng integridad, propesyonalismo, at inobasyon. Ang pangunahing kampus nito ay matatagpuan sa Santa Cruz, Laguna, na may mga regular na branch campus sa Lungsod ng San Pablo, Los Baños, at Siniloan, kasama ang mga satellite campus sa Magdalena, Nagcarlan, Liliw, at Lopez.",
            welcomeHistory3: "Bilang sentro ng teknolohikal na inobasyon, isinusulong ng LSPU ang interdisiplinaryong pag-aaral at napapanatiling pag-unlad sa pamamagitan ng matatag na pakikipagsosyo sa loob ng rehiyon. Naglilingkod ang unibersidad sa humigit-kumulang 35,000 undergraduate at 2,000 graduate na mag-aaral, na may mga 300–400 na miyembro ng guro.",
            welcomePopupMVTitle: "Misyon at Bisyon", welcomePopupMissionTitle: "MISYON", welcomePopupMissionText: "Ang LSPU, na pinapatakbo ng progresibong pamumuno, ay isang pangunahing institusyon na nagbibigay ng edukasyon sa agrikultura, pangingisda, at iba pang kaugnay na disiplina gamit ang teknolohiya, na malaki ang naiambag sa paglago at pag-unlad ng rehiyon at bansa.", welcomePopupVisionTitle: "BISYON", welcomePopupVisionText: "Ang LSPU ay sentro ng inobasyong teknolohikal na nagsusulong ng interdisiplinaryong pag-aaral, napapanatiling paggamit ng mga yaman, at pakikipagtulungan sa komunidad at mga stakeholder."
        },
        vi: {
            settingsTitle: "Cài đặt", soundLabel: "Âm thanh", zoomLabel: "Thu phóng", darkModeLabel: "Chế độ tối", themeLabel: "Giao diện", fontLabel: "Phông chữ", languageLabel: "Ngôn ngữ", accountLabel: "Tài khoản", settingsBackToMain: "Quay lại chính",
            universityTitle: "TRƯỜNG ĐẠI HỌC BÁCH KHOA LAGUNA - THÀNH PHỐ SAN PABLO", universitySubtitle: "Chính trực, Chuyên nghiệp và Sáng tạo", backToMainConfirm: "Bạn có chắc chắn muốn quay lại trang chính không?",
            menuWelcome: "CHÀO MỪNG", menuAbout: "GIỚI THIỆU", menuMiniMap: "Bản đồ nhỏ", menu3d: "3D", backButton: "QUAY LẠI", backToMainButton: "Quay lại Trang chính",
            popupFeatureComingSoon: "Tính năng này sẽ sớm ra mắt!", popupNoticeTitle: "Thông báo", popupSuccessTitle: "Thành công", popupOkButton: "OK",
            characterSelected: "Đã chọn nhân vật! Bây giờ bạn sẽ tiến vào khuôn viên.",
            welcomeTitle: "Chào mừng", welcomeText: "Nhấn tiếp tục để bắt đầu chuyến tham quan.", enterButton: "Tiếp tục",
            loadingTextStudent: "Đang ghi danh bạn vào khuôn viên ảo...", loadingTextVisitor: "Đang chuẩn bị chuyến tham quan của bạn...",
            loadingWelcomeStudent: "Chào mừng Sinh viên đến với Cơ sở LSPU tại Thành phố San Pablo! Chúng tôi hy vọng bạn sẽ thích thú khi dạo quanh trường đại học của mình! Nếu bạn bị lạc, chúng tôi sẽ hỗ trợ bạn! Hãy dạo quanh khuôn viên, xem đâu là nơi tuyệt vời nhất để thư giãn cùng bạn bè!",
            loadingWelcomeVisitor: "Chào mừng đến với Đại học Bách khoa Bang Laguna – Cơ sở Thành phố San Pablo! Hãy thoải mái khám phá và tìm hiểu về khuôn viên trường của chúng tôi. Dù bạn ở đây để tham dự một sự kiện, một cuộc họp hay chỉ là một chuyến tham quan nhanh, bản đồ 3D của chúng tôi luôn sẵn sàng hướng dẫn bạn trên mọi nẻo đường!",
            aboutIntro: "Chào mừng đến với Hệ thống Định vị 3D của Trường Đại học – LSPU, Thành phố San Pablo. Một sáng kiến kỹ thuật số tiên phong được thiết kế để nâng cao cách sinh viên, giảng viên và khách tham quan khám phá và tương tác với môi trường đại học.",
            aboutObjectivesTitle: "Mục tiêu của Dự án", aboutObjectivesText: "Dự án này nhằm mục đích đơn giản hóa việc điều hướng trong khuôn viên trường bằng cách hỗ trợ người dùng định vị hiệu quả các tòa nhà học thuật, văn phòng và các khoa trong toàn trường. Nó cũng tìm cách cho phép các chuyến tham quan khuôn viên ảo, cho phép sinh viên tương lai, phụ huynh và người dùng từ xa khám phá khuôn viên trường bằng kỹ thuật số. Một mục tiêu quan trọng khác là giới thiệu các cơ sở vật chất của trường đại học bằng cách làm nổi bật các cơ sở hạ tầng và tiện nghi chính thông qua các hình ảnh 3D sống động. Cuối cùng, dự án góp phần vào mục tiêu chuyển đổi số của nhà trường bằng cách tích hợp công nghệ hiện đại vào cả dịch vụ hành chính và giáo dục.",
            aboutFeaturesTitle: "Các tính năng chính", aboutFeaturesText: "Hệ thống định vị 3D trong khuôn viên trường bao gồm một bản đồ 3D tương tác được trang bị khả năng tìm đường để giúp người dùng điều hướng hiệu quả. Một hệ thống đăng nhập an toàn cho phép cả sinh viên và khách truy cập, trong khi giao diện có thể tùy chỉnh hỗ trợ các tùy chọn chủ đề, phông chữ và chế độ tối/sáng để nâng cao trải nghiệm người dùng. Nền tảng này cũng cung cấp hỗ trợ đa ngôn ngữ, hiện có sẵn bằng tiếng Anh, tiếng Filipino, tiếng Hàn, tiếng Nhật, tiếng Việt, tiếng Trung, tiếng Tây Ban Nha và tiếng Bồ Đào Nha. Được thiết kế với bố cục đáp ứng, hệ thống hoạt động đầy đủ trên cả thiết bị máy tính để bàn và di động. Các tính năng bổ sung bao gồm một hệ thống phản hồi để thu thập ý kiến người dùng và các bảng thông tin động hiển thị thông tin chi tiết về các phòng và tòa nhà cụ thể.",
            aboutDevsTitle: "Các nhà phát triển", aboutDevsIntro: "Dự án này được lên ý tưởng và phát triển bởi các nhà nghiên cứu sinh viên sau:",
            welcomeHistory1: "Đại học Bách khoa Laguna State (LSPU), được thành lập năm 1952, ban đầu là Trường Trung học Phổ thông Baybay và phát triển thành trường đại học hiện tại theo Đạo luật Cộng hòa số 9402 năm 2007. Đây là một tổ chức công lập, phi lợi nhuận được Ủy ban Giáo dục Đại học (CHED) và Cơ quan Công nhận các trường Cao đẳng và Đại học được cấp phép (AACCUP) công nhận, cung cấp nhiều chương trình đại học và sau đại học thông qua nhiều cơ sở của mình.",
            welcomeHistory2: "LSPU dành riêng cho giáo dục chất lượng, nghiên cứu và dịch vụ cộng đồng, được hướng dẫn bởi các giá trị về tính chính trực, tính chuyên nghiệp và sự đổi mới. Cơ sở chính của trường tọa lạc tại Santa Cruz, Laguna, với các cơ sở chi nhánh thường xuyên tại Thành phố San Pablo, Los Baños và Siniloan, cùng với các cơ sở vệ tinh tại Magdalena, Nagcarlan, Liliw và Lopez.",
            welcomeHistory3: "Là một trung tâm đổi mới công nghệ, LSPU thúc đẩy việc học tập liên ngành và phát triển bền vững thông qua các quan hệ đối tác chặt chẽ trong khu vực. Trường đại học này phục vụ khoảng 35.000 sinh viên đại học và 2.000 sinh viên sau đại học, với khoảng 300–400 giảng viên.",
            welcomePopupMVTitle: "Sứ mệnh & Tầm nhìn", welcomePopupMissionTitle: "SỨ MỆNH", welcomePopupMissionText: "LSPU, được dẫn dắt bởi sự lãnh đạo tiến bộ, là một cơ sở hàng đầu cung cấp các ngành nông nghiệp, thủy sản và các ngành mới nổi khác qua trung gian công nghệ, đóng góp đáng kể vào sự tăng trưởng và phát triển của khu vực và quốc gia.", welcomePopupVisionTitle: "TẦM NHÌN", welcomePopupVisionText: "LSPU là một trung tâm đổi mới công nghệ thúc đẩy học tập liên ngành, sử dụng bền vững các nguồn lực, và hợp tác và đối tác với cộng đồng và các bên liên quan."
        },
        ko: {
            settingsTitle: "설정", soundLabel: "소리", zoomLabel: "확대", darkModeLabel: "다크 모드", themeLabel: "테마", fontLabel: "글꼴", languageLabel: "언어", accountLabel: "계정", settingsBackToMain: "메인으로 돌아가기",
            universityTitle: "라구나 주립 폴리테크닉 대학교 - 산 파블로 시", universitySubtitle: "정직, 전문성, 혁신", backToMainConfirm: "메인 페이지로 돌아가시겠습니까?",
            menuWelcome: "환영합니다", menuAbout: "소개", menuMiniMap: "미니맵", menu3d: "3D", backButton: "뒤로", backToMainButton: "메인으로",
            popupFeatureComingSoon: "이 기능은 곧 제공될 예정입니다!", popupNoticeTitle: "알림", popupSuccessTitle: "성공", popupOkButton: "확인",
            characterSelected: "캐릭터가 선택되었습니다! 이제 캠퍼스로 이동합니다.",
            welcomeTitle: "환영합니다", welcomeText: "투어를 시작하려면 계속을 누르세요.", enterButton: "계속",
            loadingTextStudent: "가상 캠퍼스에 등록 중...", loadingTextVisitor: "투어를 준비 중입니다...",
            loadingWelcomeStudent: "산 파블로 시 LSPU 캠퍼스에 오신 학생 여러분을 환영합니다! 대학을 둘러보며 즐거운 시간을 보내시길 바랍니다! 길을 잃으셨다면 저희가 도와드리겠습니다! 캠퍼스를 둘러보며 친구들과 함께 휴식을 취할 최고의 장소를 찾아보세요!",
            loadingWelcomeVisitor: "라구나 주립 폴리테크닉 대학교 – 산 파블로 시 캠퍼스에 오신 것을 환영합니다! 자유롭게 둘러보며 저희 대학 부지를 알아보세요. 행사에 참석하셨든, 회의에 오셨든, 아니면 간단한 투어를 원하시든, 저희 3D 지도가 모든 단계에서 여러분을 안내해 드릴 것입니다!",
            aboutIntro: "대학교 3D 내비게이션 시스템에 오신 것을 환영합니다 – LSPU, 산파블로 시. 학생, 교수진 및 방문객이 대학 환경을 탐색하고 상호 작용하는 방식을 향상시키기 위해 설계된 선구적인 디지털 이니셔티브입니다.",
            aboutObjectivesTitle: "프로젝트 목표", aboutObjectivesText: "이 프로젝트는 사용자가 대학 전체의 학술 건물, 사무실 및 부서를 효율적으로 찾는 것을 지원하여 캠퍼스 탐색을 단순화하는 것을 목표로 합니다. 또한 가상 캠퍼스 투어를 가능하게 하여 예비 학생, 학부모 및 원격 사용자가 학교 부지를 디지털 방식으로 탐색할 수 있도록 합니다. 또 다른 주요 목표는 몰입형 3D 표현을 통해 주요 인프라 및 편의 시설을 강조하여 대학 시설을 선보이는 것입니다. 마지막으로, 이 프로젝트는 현대 기술을 행정 및 교육 서비스 모두에 통합하여 디지털 전환이라는 기관 목표에 기여합니다.",
            aboutFeaturesTitle: "주요 기능", aboutFeaturesText: "3D 캠퍼스 내비게이션 시스템에는 사용자가 효율적으로 탐색할 수 있도록 경로 찾기 기능이 탑재된 대화형 3D 지도가 포함되어 있습니다. 보안 로그인 시스템은 학생과 방문객 모두에게 접근을 허용하며, 사용자 지정 가능한 인터페이스는 사용자 경험을 향상시키기 위해 테마, 글꼴 및 다크/라이트 모드 옵션을 지원합니다. 이 플랫폼은 또한 현재 영어, 필리핀어, 한국어, 일본어, 베트남어, 중국어, 스페인어 및 포르투갈어로 제공되는 다국어 지원을 제공합니다. 반응형 레이아웃으로 설계된 이 시스템은 데스크톱 및 모바일 장치 모두에서 완벽하게 작동합니다. 추가 기능에는 사용자 입력을 수집하기 위한 피드백 시스템과 특정 방 및 건물에 대한 자세한 통찰력을 표시하는 동적 정보 패널이 포함됩니다.",
            aboutDevsTitle: "개발자", aboutDevsIntro: "이 프로젝트는 다음 학생 연구원들에 의해 구상 및 개발되었습니다.",
            welcomeHistory1: "1952년에 설립된 라구나 주립 폴리테크닉 대학교(LSPU)는 바이바이 지방 고등학교로 시작하여 2007년 공화국법 제9402호에 따라 현재의 대학 지위로 발전했습니다. 고등교육위원회(CHED)와 공인대학인증기관(AACCUP)의 인정을 받은 공립 비영리 기관으로, 여러 캠퍼스를 통해 다양한 학부 및 대학원 프로그램을 제공합니다.",
            welcomeHistory2: "LSPU는 정직, 전문성, 혁신이라는 가치를 바탕으로 양질의 교육, 연구, 지역사회 봉사에 전념하고 있습니다. 메인 캠퍼스는 라구나 주 산타크루즈에 위치하고 있으며, 산파블로 시, 로스바뇨스, 시닐로안에 정규 분교 캠퍼스가 있고 막달레나, 나그칼란, 릴리우, 로페즈에 위성 캠퍼스가 있습니다.",
            welcomeHistory3: "기술 혁신의 중심지로서 LSPU는 지역 내 강력한 파트너십을 통해 학제 간 학습과 지속 가능한 발전을 촉진합니다. 이 대학은 약 35,000명의 학부생과 2,000명의 대학원생, 그리고 약 300-400명의 교수진을 보유하고 있습니다.",
            welcomePopupMVTitle: "사명과 비전", welcomePopupMissionTitle: "사명", welcomePopupMissionText: "LSPU는 진보적인 리더십에 의해 운영되며, 기술 매개 농업, 어업 및 기타 관련 신흥 분야를 제공하는 최고의 기관으로서 지역 및 국가의 성장과 발전에 크게 기여합니다.", welcomePopupVisionTitle: "비전", welcomePopupVisionText: "LSPU는 학제 간 학습, 자원의 지속 가능한 활용, 그리고 커뮤니티 및 이해관계자와의 협력 및 파트너십을 촉진하는 기술 혁신의 중심지입니다。"
        },
        ja: {
            settingsTitle: "設定", soundLabel: "音量", zoomLabel: "ズーム", darkModeLabel: "ダークモード", themeLabel: "テーマ", fontLabel: "フォント", languageLabel: "言語", accountLabel: "アカウント", settingsBackToMain: "メインに戻る",
            universityTitle: "ラグナ州立工科大学 - サンパブロ市", universitySubtitle: "誠実さ、専門性、革新性", backToMainConfirm: "メインページに戻りますか？",
            menuWelcome: "ようこそ", menuAbout: "概要", menuMiniMap: "ミニマップ", menu3d: "3D", backButton: "戻る", backToMainButton: "メインに戻る",
            popupFeatureComingSoon: "この機能は間もなく公開されます！", popupNoticeTitle: "お知らせ", popupSuccessTitle: "成功", popupOkButton: "OK",
            characterSelected: "キャラクターが選択されました！キャンパスに進みます。",
            welcomeTitle: "ようこそ", welcomeText: "ツアーを開始するには続行を押してください。", enterButton: "続行",
            loadingTextStudent: "仮想キャンパスに登録しています...", loadingTextVisitor: "ツアーを準備しています...",
            loadingWelcomeStudent: "サンパブロ市のLSPUキャンパスへようこそ！大学内を楽しく散策してください！道に迷っても大丈夫です！キャンパスを歩き回り、友達とリラックスできる最高の場所を見つけてください！",
            loadingWelcomeVisitor: "ラグナ州立工科大学 – サンパブロ市キャンパスへようこそ！自由に探索して、私たちの大学の敷地を知ってください。イベント、会議、または簡単なツアーのためにここにいるかどうかにかかわらず、私たちの3Dマップがあなたをあらゆる段階でご案内します！",
            aboutIntro: "大学の3Dナビゲーションシステムへようこそ – LSPU、サンパブロ市。学生、教職員、訪問者が大学の環境を探索し、対話する方法を強化するために設計された先駆적인デジタルイニシアチブです。",
            aboutObjectivesTitle: "プロジェクトの目的", aboutObjectivesText: "このプロジェクトは、ユーザーが大学全体の学術棟、オフィス、学部を効率的に見つけるのを支援することにより、キャンパスのナビゲーションを簡素化することを目的としています。また、仮想キャンパスツアーを可能にし、将来の学生、保護者、リモートユーザーが学校の敷地をデジタルで探索できるようにすることも目指しています。もう1つの重要な目的は、没入型の3D表現を通じて主要なインフラストラクチャと設備を強調表示することにより、大学の施設を紹介することです。最後に、このプロジェクトは、現代技術を管理サービスと教育サービスの両方に統合することにより、デジタル変換という機関の目標に貢献します。",
            aboutFeaturesTitle: "主な機能", aboutFeaturesText: "3Dキャンパスナビゲーションシステムには、ユーザーが効率的にナビゲートするのに役立つ経路探索機能を備えたインタラクティブな3Dマップが含まれています。安全なログインシステムにより、学生と訪問者の両方がアクセスでき、カスタマイズ可能なインターフェースは、ユーザーエクスペリエンスを向上させるためにテーマ、フォント、ダーク/ライトモードのオプションをサポートしています。このプラットフォームは多言語サポートも提供しており、現在、英語、フィリピン語、韓国語、日本語、ベトナム語、中国語、スペイン語、ポルトガル語で利用できます。レスポンシブレイアウトで設計されたこのシステムは、デスクトップデバイスとモバイルデバイスの両方で完全に機能します。追加機能には、ユーザーの入力を収集するためのフィードバックシステムや、特定の部屋や建物に関する詳細な洞察を表示する動的な情報パネルが含まれます。",
            aboutDevsTitle: "開発者", aboutDevsIntro: "このプロジェクトは、以下の学生研究者によって構想および開発されました。",
            welcomeHistory1: "1952年に設立されたラグナ州立工科大学（LSPU）は、バイバイ州立高校として始まり、2007年の共和国法第9402号に基づき現在の大学の地位に発展しました。高等教育委員会（CHED）および公認大学認定機関（AACCUP）によって認められた公立の非営利機関であり、複数のキャンパスを通じて様々な学部および大学院プログラムを提供しています。",
            welcomeHistory2: "LSPUは、誠実さ、専門性、革新という価値観に導かれ、質の高い教育、研究、地域社会への奉仕に専念しています。メインキャンパスはラグナ州サンタクルスにあり、サンパブロ市、ロスバニョス、シニロアンに通常のブランチキャンパス、さらにマグダレナ、ナグカルラン、リリウ、ロペスにサテライトキャンパスがあります。",
            welcomeHistory3: "技術革新の中心として、LSPUは地域内での強力なパートナーシップを通じて学際的な学習と持続可能な開発を促進しています。大学には約35,000人の学部生と2,000人の大学院生が在籍しており、約300人から400人の教員がいます。",
            welcomePopupMVTitle: "使命とビジョン", welcomePopupMissionTitle: "使命", welcomePopupMissionText: "LSPUは、進歩的なリーダーシップによって推進され、技術を介した農業、漁業、その他の関連および新興分野を提供する最高の機関であり、地域および国家の成長と発展に大きく貢献しています。", welcomePopupVisionTitle: "ビジョン", welcomePopupVisionText: "LSPUは、学際的な学習、資源の持続可能な利用、そして地域社会や利害関係者との協力とパートナーシップを促進する技術革新の中心です。"
        },
        zh: {
            settingsTitle: "设置", soundLabel: "音量", zoomLabel: "缩放", darkModeLabel: "深色模式", themeLabel: "主题", fontLabel: "字体", languageLabel: "语言", accountLabel: "账户", settingsBackToMain: "返回主页",
            universityTitle: "拉古纳理工州立大学 - 圣巴勃罗市", universitySubtitle: "诚信、专业、创新", backToMainConfirm: "您确定要返回主页吗？",
            menuWelcome: "欢迎", menuAbout: "关于", menuMiniMap: "小地图", menu3d: "3D", backButton: "返回", backToMainButton: "返回主页",
            popupFeatureComingSoon: "此功能即将推出！", popupNoticeTitle: "注意", popupSuccessTitle: "成功", popupOkButton: "确定",
            characterSelected: "角色已选择！现在将进入校园。",
            welcomeTitle: "欢迎", welcomeText: "按继续开始游览。", enterButton: "继续",
            loadingTextStudent: "正在将您注册到虚拟校园...", loadingTextVisitor: "正在准备您的旅程...",
            loadingWelcomeStudent: "欢迎学生来到圣巴勃罗市LSPU校区！我们希望您喜欢在您的大学里四处看看！如果您迷路了，我们会支持您！在校园里四处看看，找一个和朋友们放松的最佳地点吧！",
            loadingWelcomeVisitor: "欢迎来到拉古纳理工州立大学 – 圣巴勃罗市校区！请随意探索和了解我们的大学校园。无论您是来参加活动、会议，还是只是快速游览，我们的3D地图都会为您提供每一步的指引！",
            aboutIntro: "欢迎来到大学3D导航系统 – LSPU，圣巴勃罗市。这是一个开创性的数字计划，旨在增强学生、教职员工和访客探索大学环境并与之互动的方式。",
            aboutObjectivesTitle: "项目目标", aboutObjectivesText: "该项目旨在通过协助用户高效地定位整个大学的教学楼、办公室和系部来简化校园导航。它还致力于实现虚拟校园参观，允许未来的学生、家长和远程用户以数字方式探索校园。另一个关键目标是通过沉浸式3D表现形式突出主要基础设施和便利设施，展示大学设施。最后，该项目通过将现代技术整合到行政和教育服务中，为机构的数字化转型目标做出贡献。",
            aboutFeaturesTitle: "主要特点", aboutFeaturesText: "3D校园导航系统包括一个交互式3D地图，配备了寻路功能，以帮助用户高效导航。安全的登录系统允许学生和访客访问，而可定制的界面支持主题、字体和暗/亮模式选项，以增强用户体验。该平台还提供多语言支持，目前支持英语、菲律宾语、韩语、日语、越南语、中文、西班牙语和葡萄牙语。该系统采用响应式布局设计，完全可在台式机和移动设备上运行。其他功能包括一个用于收集用户输入的反馈系统，以及显示有关特定房间和建筑物的详细见解的动态信息面板。",
            aboutDevsTitle: "开发者", aboutDevsIntro: "该项目由以下学生研究人员构思和开发：",
            welcomeHistory1: "拉古纳州立理工大学（LSPU）成立于1952年，最初是拜拜省立中学，并于2007年根据共和国法案第9402号演变为现在的大学地位。它是一所公立的非营利机构，受到高等教育委员会（CHED）和特许学院和大学认证机构（AACCUP）的认可，通过其多个校区提供一系列本科和研究生课程。",
            welcomeHistory2: "LSPU致力于优质教育、研究和社区服务，以其诚信、专业和创新的价值观为指导。其主校区位于拉古纳省圣克鲁斯，在圣巴勃罗市、洛斯巴尼奥斯和锡尼洛安设有常规分校区，并在马格达莱纳、纳格卡兰、利利乌和洛пес设有卫星校区。",
            welcomeHistory3: "作为技术创新的中心，LSPU通过与该地区内建立强大的伙伴关系，促进跨学科学习和可持续发展。该大学为大约35,000名本科生和2,000名研究生提供服务，拥有约300-400名教职员工。",
            welcomePopupMVTitle: "使命与愿景", welcomePopupMissionTitle: "使命", welcomePopupMissionText: "在进步领导力的推动下，LSPU是一所一流的机构，提供技术媒介的农业、渔业及其他相关和新兴学科，为地区和国家的发展做出了重大贡献。", welcomePopupVisionTitle: "愿景", welcomePopupVisionText: "LSPU是一个技术创新中心，促进跨学科学习、资源的可持续利用，以及与社区和利益相关者的合作与伙伴关系。"
        },
        pt: {
            settingsTitle: "Configurações", soundLabel: "Som", zoomLabel: "Zoom", darkModeLabel: "Modo Escuro", themeLabel: "Tema", fontLabel: "Fonte", languageLabel: "Idioma", accountLabel: "Conta", settingsBackToMain: "Voltar ao Início",
            universityTitle: "UNIVERSIDADE POLITÉCNICA ESTADUAL DE LAGUNA - CIDADE DE SAN PABLO", universitySubtitle: "Integridade, Profissionalismo e Inovação", backToMainConfirm: "Tem certeza que quer voltar à página principal?",
            menuWelcome: "BEM-VINDO", menuAbout: "SOBRE", menuMiniMap: "Mini Mapa", menu3d: "3D", backButton: "VOLTAR", backToMainButton: "Voltar ao Início",
            popupFeatureComingSoon: "Este recurso estará disponível em breve!", popupNoticeTitle: "Aviso", popupSuccessTitle: "Sucesso", popupOkButton: "OK",
            characterSelected: "Personagem selecionado! Você irá agora para o campus.",
            welcomeTitle: "Bem-vindo", welcomeText: "Pressione continuar para iniciar o tour.", enterButton: "Continuar",
            loadingTextStudent: "Inscrevendo você no campus virtual...", loadingTextVisitor: "Preparando seu tour...",
            loadingWelcomeStudent: "Bem-vindo, Estudante, ao Campus da LSPU na Cidade de San Pablo! Esperamos que você goste de conhecer sua universidade! Se estiver perdido, nós te ajudamos! Dê uma volta pelo campus, veja qual é o melhor lugar para relaxar com seus amigos!",
            loadingWelcomeVisitor: "Bem-vindo à Universidade Politécnica Estadual de Laguna – Campus da Cidade de San Pablo! Sinta-se à vontade para explorar e conhecer nosso campus universitário. Esteja você aqui para um evento, uma reunião ou apenas um tour rápido, nosso mapa 3D está aqui para guiá-lo em cada passo do caminho!",
            aboutIntro: "Bem-vindo ao Sistema de Navegação 3D da Universidade – LSPU, Cidade de San Pablo. Uma iniciativa digital pioneira projetada para aprimorar a forma como estudantes, professores e visitantes exploram e interagem com o ambiente universitário.",
            aboutObjectivesTitle: "Objetivos do Projeto", aboutObjectivesText: "Este projeto visa simplificar a navegação no campus, auxiliando os usuários a localizar eficientemente edifícios acadêmicos, escritórios e departamentos em toda a universidade. Também busca possibilitar passeios virtuais pelo campus, permitindo que futuros alunos, pais e usuários remotos explorem digitalmente as dependências da escola. Outro objetivo principal é mostrar as instalações da universidade, destacando as principais infraestruturas e comodidades por meio de representações 3D imersivas. Por fim, o projeto contribui para a meta institucional de transformação digital, integrando tecnologia moderna aos serviços administrativos и educacionais.",
            aboutFeaturesTitle: "Principais Características", aboutFeaturesText: "O sistema de navegação 3D do campus inclui um mapa 3D interativo equipado com capacidades de localização de caminhos para ajudar os usuários a navegar de forma eficiente. Um sistema de login seguro permite o acesso tanto para estudantes quanto para visitantes, enquanto uma interface personalizável suporta opções de tema, fonte e modo escuro/claro para aprimorar a experiência do usuário. A plataforma também oferece suporte multilíngue, atualmente disponível em inglês, filipino, coreano, japonês, vietnamita, chinês, espanhol e português. Projetado com um layout responsivo, o sistema é totalmente funcional em dispositivos de desktop e móveis. Recursos adicionais incluem um sistema de feedback para coletar a opinião do usuário e painéis de informações dinâmicos que exibem insights detalhados sobre salas e edifícios específicos.",
            aboutDevsTitle: "Desenvolvedores", aboutDevsIntro: "Este projeto foi idealizado e desenvolvido pelos seguintes estudantes pesquisadores:",
            welcomeHistory1: "A Universidade Politécnica Estadual de Laguna (LSPU), fundada em 1952, começou como Escola Secundária Provincial de Baybay e evoluiu para seu status universitário atual sob a Lei da República nº 9402 em 2007. É uma instituição pública, sem fins lucrativos, reconhecida pela Comissão de Educação Superior (CHED) e pela Agência de Credenciamento de Faculdades e Universidades (AACCUP), oferecendo uma variedade de programas de graduação e pós-graduação em seus múltiplos campi.",
            welcomeHistory2: "A LSPU dedica-se à education de qualidade, pesquisa e serviço comunitário, guiada por seus valores de integridade, profissionalismo e inovação. Seu campus principal está localizado em Santa Cruz, Laguna, com campi filiais regulares na cidade de San Pablo, Los Baños e Siniloan, além de campi satélites em Magdalena, Nagcarlan, Liliw e Lopez.",
            welcomeHistory3: "Como um centro de inovação tecnológica, a LSPU promove o aprendizado interdisciplinar e o desenvolvimento sustentável por meio de fortes parcerias na região. A universidade atende aproximadamente 35,000 estudantes de graduação e 2,000 de pós-graduação, com cerca de 300 a 400 membros do corpo docente.",
            welcomePopupMVTitle: "Missão e Visão", welcomePopupMissionTitle: "MISSÃO", welcomePopupMissionText: "A LSPU, impulsionada por uma liderança progressista, é uma instituição de primeira linha que oferece agricultura mediada por tecnologia, pesca e outras disciplinas relacionadas e emergentes, contribuindo significativamente para o crescimento e desenvolvimento da região e da nação.", welcomePopupVisionTitle: "VISÃO", welcomePopupVisionText: "A LSPU é um centro de inovação tecnológica que promove o aprendizado interdisciplinar, a utilização sustentável de recursos e a colaboração e parceria com a comunidade e as partes interessadas."
        },
        es: {
            settingsTitle: "Configuraciones", soundLabel: "Sonido", zoomLabel: "Zoom", darkModeLabel: "Modo Oscuro", themeLabel: "Tema", fontLabel: "Fuente", languageLabel: "Idioma", accountLabel: "Cuenta", settingsBackToMain: "Volver al Inicio",
            universityTitle: "UNIVERSIDAD POLITÉCNICA ESTATAL DE LAGUNA - CIUDAD DE SAN PABLO", universitySubtitle: "Integridad, Profesionalismo e Innovación", backToMainConfirm: "¿Seguro que quieres volver a la página principal?",
            menuWelcome: "BIENVENIDO", menuAbout: "SOBRE", menuMiniMap: "Mini Mapa", menu3d: "3D", backButton: "VOLVER", backToMainButton: "Volver al Inicio",
            popupFeatureComingSoon: "¡Esta función estará disponible pronto!", popupNoticeTitle: "Aviso", popupSuccessTitle: "Éxito", popupOkButton: "OK",
            characterSelected: "¡Personaje seleccionado! Ahora procederás al campus.",
            welcomeTitle: "Bienvenido", welcomeText: "Presiona continuar para comenzar el recorrido.", enterButton: "Continuar",
            loadingTextStudent: "Inscribiéndote en el campus virtual...", loadingTextVisitor: "Preparando tu recorrido...",
            loadingWelcomeStudent: "¡Bienvenido, Estudiante, al Campus de LSPU en la Ciudad de San Pablo! ¡Esperamos que disfrutes explorando tu universidad! Si te pierdes, ¡nosotros te cubrimos! ¡Recorre el campus, mira dónde está el melhor lugar para relajarte con tus amigos!",
            loadingWelcomeVisitor: "¡Bienvenido a la Universidad Politécnica Estatal de Laguna – Campus de la Ciudad de San Pablo! Siéntete libre de explorar y conocer los terrenos de nuestra universidad. Ya sea que estés aquí para un evento, una reunión o simplemente un recorrido rápido, ¡nuestro mapa 3D está aquí para guiarte en cada paso del camino!",
            aboutIntro: "Bienvenido al Sistema de Navegação 3D de la Universidad – LSPU, Ciudad de San Pablo. Una iniciativa digital pionera diseñada para mejorar la forma en que los estudiantes, el personal docente y los visitantes exploran e interactúan con el entorno universitario.",
            aboutObjectivesTitle: "Objetivos del Proyecto", aboutObjectivesText: "Este proyecto tiene como objetivo simplificar la navegación en el campus al ayudar a los usuarios a localizar de manera eficiente edificios académicos, oficinas y departamentos en toda la universidad. También busca permitir recorridos virtuales por el campus, permitiendo a los futuros estudiantes, padres y usuarios remotos explorar digitalmente las instalaciones de la escuela. Otro objetivo clave es mostrar las instalaciones universitarias destacando la infraestructura principal y las comodidades a través de representaciones 3D inmersivas. Por último, el proyecto contribuye al objetivo institucional de la transformación digital al integrar tecnología moderna tanto en los servicios administrativos como educativos.",
            aboutFeaturesTitle: "Características Clave", aboutFeaturesText: "El sistema de navegación del campus en 3D incluye un mapa 3D interactivo equipado com capacidades de búsqueda de rutas para ayudar a los usuarios a navegar de manera eficiente. Un sistema de inicio de sesión seguro permite el acceso tanto para estudiantes como para visitantes, mientras que una interfaz personalizable admite opciones de tema, fuente y modo oscuro/claro para mejorar la experiencia del usuario. La plataforma también ofrece soporte multilingüe, actualmente disponible en inglés, filipino, coreano, japonés, vietnamita, chino, español y português. Diseñado con un diseño receptivo, el sistema es totalmente funcional en dispositivos de escritorio y móviles. Las características adicionales incluyen un sistema de retroalimentación para recopilar las opiniones de los usuarios y paneles de información dinámicos que muestran información detallada sobre salas y edificios específicos.",
            aboutDevsTitle: "Desarrolladores", aboutDevsIntro: "Este proyecto fue conceptualizado y desarrollado por los siguientes estudiantes investigadores:",
            welcomeHistory1: "La Universidad Politécnica Estatal de Laguna (LSPU), establecida en 1952, comenzó como la Escuela Secundaria Provincial de Baybay y evolucionó a su estado universitario actual bajo la Ley de la República No. 9402 en 2007. Es una institución pública, sin fines de lucro, reconocida por la Comisión de Educación Superior (CHED) y la Agencia de Acreditación de Colegios y Universidades Estatales (AACCUP), que ofrece una gama de programas de pregrado y posgrado a través de sus múltiples campus.",
            welcomeHistory2: "LSPU se dedica a la educación de calidad, la investigación y el servicio comunitario, guiada por sus valores de integridad, profesionalismo e innovación. Su campus principal se encuentra en Santa Cruz, Laguna, con campus filiales regulares en la ciudad de San Pablo, Los Baños y Siniloan, además de campus satélite en Magdalena, Nagcarlan, Liliw y Lopez.",
            welcomeHistory3: "Como centro de innovación tecnológica, LSPU promueve el aprendizaje interdisciplinario y el desarrollo sostenible a través de sólidas alianzas dentro de la región. La universidad atiende a aproximadamente 35,000 estudiantes de pregrado y 2,000 de posgrado, con unos 300–400 miembros del profesorado.",
            welcomePopupMVTitle: "Misión y Visión", welcomePopupMissionTitle: "MISIÓN", welcomePopupMissionText: "LSPU, impulsada por un liderazgo progresista, es una institución de primer nivel que proporciona agricultura, pesca y otras disciplinas relacionadas y emergentes mediadas por la tecnología, contribuyendo significativamente al crecimiento y desarrollo de la región y la nación.", welcomePopupVisionTitle: "VISIÓN", welcomePopupVisionText: "LSPU es un centro de innovación tecnológica que promove o aprendizaje interdisciplinario, la utilización sostenible de los recursos, y la colaboración y asociación con la comunidad y las partes interesadas."
        }
    };

    const buildingInfo = {
        cas: { icon: 'fa-paint-brush', title: 'College of Arts and Sciences (CAS)', colorClass: 'cas-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Biology (BSBio)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Psychology (BScPsych)</li></ul>' },
        cbaa: { icon: 'fa-briefcase', title: 'College of Business Administration and Accountancy (CBAA)', colorClass: 'cbaa-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Office Administration (BSOA)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Business Administration (BSBA)<ol><li>Financial Management (BSBA-FM)</li><li>Marketing Management (BSBA-MM)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Accountancy (BSA)</li></ul>' },
        ccs: { icon: 'fa-laptop-code', title: 'College of Computer Studies (CCS)', colorClass: 'ccs-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Information Technology (BSInfoTech)<ol><li>Animation and Motion Graphics (BSInfoTech-AMG)</li><li>Service Management Program (BSInfoTech-SMP)</li><li>Web and Mobile Application Development (BSInfoTech-WMAD)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Computer Science (BSCS)<ol><li>Graphics and Visualization (BSCS-GV)</li><li>Intelligent Systems (BSCS-IS)</li></ol></li></ul>' },
        ccje: { icon: 'fa-balance-scale', title: 'College of Criminal Justice Education (CCJE)', colorClass: 'ccje-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Criminology (BSCrim)</li></ul>' },
        coe: { icon: 'fa-cogs', title: 'College of Engineering (COE)', colorClass: 'coe-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Electronics Engineering (BSECE)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Electrical Engineering (BSEE)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Computer Engineering (BSCpE)</li></ul>' },
        chmt: { icon: 'fa-concierge-bell', title: 'College of Hospitality Management and Tourism (CHMT)', colorClass: 'chmt-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Hospitality Management (BSHM)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Tourism Management (BSTM)</li></ul>' },
        cit: { icon: 'fa-tools', title: 'College of Industrial Technology (CIT)', colorClass: 'cit-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Science in Industrial Technology (BSIT)</li></ul>' },
        cte: { icon: 'fa-chalkboard-teacher', title: 'College of Teacher Education (CTE)', colorClass: 'cte-color', details: '<ul><li><i class="fas fa-arrow-right"></i>Bachelor of Secondary Education (BSEd):<ol><li>English (BSEd-English)</li><li>Filipino (BSEd-Filipino)</li><li>Mathematics (BSEd-Math)</li><li>Science (BSEd-Science)</li><li>Social Science (BSEd-SocSci)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Elementary Education (BEEd)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Physical Education (BPEd)</li><li><i class="fas fa-arrow-right"></i>Bachelor of Technology and Livelihood Education (BTLEd):<ol><li>Home Economics (BTLEd-HE)</li><li>Industrial Arts (BTLEd-IA)</li></ol></li><li><i class="fas fa-arrow-right"></i>Bachelor of Technical Vocational Teacher Education (BTVTEd):<ol><li>Electrical Technology (BTVTEd-ELT)</li><li>Electronics Technology (BTVTEd-ELTS)</li><li>Food and Service Management (BTVTED-FSM)</li><li>Garments, Fashion and Design (BTVTED-GFD)</li></ol></li></ul>' }
    };

    const pinData = [
        { id: 1, title: 'COE (College of Engineering) Building', icon: 'fa-cogs', collegeKey: 'coe' },
        { id: 2, title: 'CIT Multi-Tech Building', icon: 'fa-screwdriver-wrench', collegeKey: 'cit' },
        { id: 3, title: 'Old CCS (College of Computer Studies) Building', icon: 'fa-laptop-code', collegeKey: 'ccs' },
        { id: 4, title: 'NSTP Office', icon: 'fa-flag' },
        { id: 5, title: 'University Gymnasium', icon: 'fa-basketball' },
        { id: 6, title: 'Field', icon: 'fa-futbol' },
        { id: 7, title: 'CCJE (College of Criminal Justice Education) Building', icon: 'fa-balance-scale', collegeKey: 'ccje' },
        { id: 8, title: 'CAS (College of Arts and Sciences) Building', icon: 'fa-paint-brush', collegeKey: 'cas' },
        { id: 9, title: 'New CCS (College of Computer Studies) Building', icon: 'fa-laptop-code', collegeKey: 'ccs' },
        { id: 10, title: 'AVEC', icon: 'fa-film' },
        { id: 11, title: 'CIT (College of Industrial Technology) Building', icon: 'fa-tools', collegeKey: 'cit' },
        { id: 12, title: 'Car parking', icon: 'fa-solid fa-car' },
        { id: 13, title: 'Library', icon: 'fa-book-open' },
        { id: 14, title: 'Clinic', icon: 'fa-clinic-medical' },
        { id: 15, title: 'Canteen', icon: 'fa-utensils' },
        { id: 16, title: 'Hostel Building', icon: 'fa-bed' },
        { id: 17, title: 'CTE (College of Teacher Education) Building', icon: 'fa-chalkboard-teacher', collegeKey: 'cte' },
        { id: 18, title: 'Research Building', icon: 'fa-flask' },
        { id: 19, title: 'ALUMNI Building', icon: 'fa-graduation-cap' },
        { id: 20, title: 'DOST Building', icon: 'fa-satellite-dish' },
        { id: 21, title: 'CBAA (College of Business Administration and Accountancy) Building', icon: 'fa-briefcase', collegeKey: 'cbaa' },
        { id: 22, title: 'Amphitheater', icon: 'fa-masks-theater' },
        { id: 23, title: 'ICTs Building', icon: 'fa-network-wired' },
        { id: 24, title: 'CHMT (College of Hospitality Management and Tourism) Building', icon: 'fa-concierge-bell', collegeKey: 'chmt' },
        { id: 25, title: 'Indoor Badminton', icon: 'fa-table-tennis-paddle-ball' }
    ];

    function setLanguage(lang) {
        localStorage.setItem('language', lang);
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.dataset.langKey;
            const translation = (window.translations[lang] && window.translations[lang][key]) || (window.translations['en'] && window.translations['en'][key]);
            if (translation) {
                element.innerHTML = translation;
            }
        });
        if (languageSelect) languageSelect.value = lang;
        window.dispatchEvent(new CustomEvent('languageChanged'));
    }

    if (languageSelect) { languageSelect.addEventListener('change', (e) => setLanguage(e.target.value)); }
    function applyTheme(gradient) { localStorage.setItem('themeGradient', gradient); if (!bodyElement.classList.contains('dark-mode-active')) { bodyElement.style.background = gradient; } }
    function updateDarkMode(isDark) { localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled'); bodyElement.classList.toggle('dark-mode-active', isDark); if (isDark) { bodyElement.style.background = ''; } else { const savedTheme = localStorage.getItem('themeGradient') || 'linear-gradient(159deg, rgba(0,71,171,1) 0%, rgba(28,169,201,1) 100%)'; bodyElement.style.background = savedTheme; } }
    function applyFont(fontName) { document.documentElement.style.setProperty('--main-font-family', `'${fontName}', sans-serif`); localStorage.setItem('selectedFont', fontName); }
    function applyZoom(zoomValue) { document.documentElement.style.fontSize = `${zoomValue}%`; localStorage.setItem('globalZoom', zoomValue); }

    const toggleSettingsPanel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (settingsPanel) settingsPanel.classList.toggle('active');
    };
    
    if (settingsToggleButton) {
        settingsToggleButton.addEventListener('click', toggleSettingsPanel);
    }
    if (mapPageSettingsButton) {
        mapPageSettingsButton.addEventListener('click', toggleSettingsPanel);
    }
    
    document.addEventListener('click', (e) => {
        const isSettingsButton = e.target.closest('#settingsToggleButton') || e.target.closest('#mapPageSettingsButton');
        if (settingsPanel && !settingsPanel.contains(e.target) && !isSettingsButton) {
            settingsPanel.classList.remove('active');
        }
    });

    if (darkModeCheckbox) { darkModeCheckbox.addEventListener('change', (e) => updateDarkMode(e.target.checked)); }
    if (colorSwatches) { colorSwatches.forEach(swatch => swatch.addEventListener('click', () => applyTheme(swatch.dataset.color))); }
    if (fontChanger) { fontChanger.addEventListener('change', e => applyFont(e.target.value)); }
    if (zoomSlider) { zoomSlider.addEventListener('input', e => applyZoom(e.target.value)); }

    if (backgroundMusic) {
        let hasInteracted = false;
        let userWantsMusic = localStorage.getItem('userWantsMusic') === 'true';
        const updateSoundUI = () => { if (!soundToggleButton || !volumeSlider) return; const isMuted = backgroundMusic.muted || backgroundMusic.volume === 0; const isPlaying = !backgroundMusic.paused; const icon = soundToggleButton.querySelector('i'); if (icon) { icon.className = (userWantsMusic && !isMuted && isPlaying) ? 'fas fa-volume-high' : 'fas fa-volume-mute'; } volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume; };
        const attemptToPlayMusic = async () => { if (!userWantsMusic || backgroundMusic.muted) return; try { await backgroundMusic.play(); } catch (error) { console.warn("Audio play blocked until user interaction."); } };
        const handleUserInteractionForSound = () => { if (!hasInteracted) { hasInteracted = true; attemptToPlayMusic(); } };
        document.body.addEventListener('click', handleUserInteractionForSound, { once: true });
        if (soundToggleButton) { soundToggleButton.addEventListener('click', (e) => { e.preventDefault(); userWantsMusic = !userWantsMusic; localStorage.setItem('userWantsMusic', userWantsMusic); if (userWantsMusic) { backgroundMusic.muted = false; attemptToPlayMusic(); } else { backgroundMusic.pause(); } updateSoundUI(); }); }
        if (volumeSlider) { volumeSlider.addEventListener('input', () => { backgroundMusic.volume = parseFloat(volumeSlider.value); backgroundMusic.muted = backgroundMusic.volume === 0; localStorage.setItem('musicVolume', backgroundMusic.volume); if (userWantsMusic) attemptToPlayMusic(); updateSoundUI(); }); }
        backgroundMusic.onplay = backgroundMusic.onpause = updateSoundUI;
        updateSoundUI();
    }

    if (enterUniversityButton) {
        enterUniversityButton.addEventListener('click', (e) => {
            e.preventDefault();
            const loadingScreens = [studentLoadingScreen, visitorLoadingScreen];
            const randomScreen = loadingScreens[Math.floor(Math.random() * loadingScreens.length)];
            showLoadingThenPage(randomScreen, () => showPage(menuPage));
        });
    }

    if (hexagon2DButton) {
        hexagon2DButton.addEventListener('click', e => {
            e.preventDefault();
            showPage(map2DPage);
        });
    }

    function updateInfoPages() {
        infoPages.forEach((page, index) => {
            page.classList.toggle('active-page', index === currentInfoPageIndex);
        });
        if (infoPopupNextBtn) infoPopupNextBtn.style.display = (currentInfoPageIndex === infoPages.length - 1) ? 'none' : 'block';
        if (infoPopupPrevBtn) infoPopupPrevBtn.style.display = (currentInfoPageIndex > 0) ? 'block' : 'none';
    }

    if (aboutButton) {
        aboutButton.addEventListener('click', (e) => {
            e.preventDefault();
            currentInfoPageIndex = 0;
            updateInfoPages();
            if (infoPopupContainer) infoPopupContainer.style.display = 'flex';
        });
    }

    if (infoPopupCloseBtn) { infoPopupCloseBtn.addEventListener('click', () => { if (infoPopupContainer) infoPopupContainer.style.display = 'none'; }); }
    if (infoPopupContainer) { infoPopupContainer.addEventListener('click', (e) => { if (e.target.id === 'info-popup-container') infoPopupContainer.style.display = 'none'; }); }
    if (infoPopupNextBtn) { infoPopupNextBtn.addEventListener('click', () => { if (currentInfoPageIndex < infoPages.length - 1) { currentInfoPageIndex++; updateInfoPages(); } }); }
    if (infoPopupPrevBtn) { infoPopupPrevBtn.addEventListener('click', () => { if (currentInfoPageIndex > 0) { currentInfoPageIndex--; updateInfoPages(); } }); }

    if (backButtonFrom2D) { backButtonFrom2D.addEventListener('click', e => { e.preventDefault(); showPage(menuPage); }); }

    function showPinInfoPopup(data) {
        if (!pinInfoPopupContainer || !pinPopupIcon || !pinPopupTitle || !pinPopupNextBtn) return;

        const nextButtonWrapper = pinPopupNextBtn.parentElement;

        pinPopupIcon.className = `fas ${data.icon}`;
        pinPopupTitle.innerHTML = data.title;
        currentPinCollegeKey = data.collegeKey || null;

        if (currentPinCollegeKey) {
            nextButtonWrapper.style.display = 'flex';
        } else {
            nextButtonWrapper.style.display = 'none';
        }

        pinInfoPopupContainer.style.display = 'flex';
    }

    function showCollegeInfoPopup(collegeKey) {
        const popup = collegeInfoPopupContainer.querySelector('.pin-info-popup');
        if (!popup || !buildingInfo[collegeKey]) return;

        // Reset classes before adding the new one
        popup.className = 'pin-info-popup college-popup';

        const info = buildingInfo[collegeKey];
        collegePopupIcon.className = `fas ${info.icon}`;
        collegePopupTitle.textContent = info.title;
        collegePopupDetails.innerHTML = info.details;

        // Add the specific color class for the college
        if (info.colorClass) {
            popup.classList.add(info.colorClass);
        }

        collegeInfoPopupContainer.style.display = 'flex';
    }

    if (pinPopupNextBtn) {
        pinPopupNextBtn.addEventListener('click', () => {
            if (currentPinCollegeKey) {
                pinInfoPopupContainer.style.display = 'none';
                showCollegeInfoPopup(currentPinCollegeKey);
            }
        });
    }

    if (pinInfoPopupCloseBtn) { pinInfoPopupCloseBtn.addEventListener('click', () => { pinInfoPopupContainer.style.display = 'none'; }); }
    if (pinInfoPopupContainer) { pinInfoPopupContainer.addEventListener('click', (e) => { if (e.target === pinInfoPopupContainer) pinInfoPopupContainer.style.display = 'none'; }); }
    if (collegeInfoPopupCloseBtn) { collegeInfoPopupCloseBtn.addEventListener('click', () => { collegeInfoPopupContainer.style.display = 'none'; }); }
    if (collegeInfoPopupContainer) { collegeInfoPopupContainer.addEventListener('click', (e) => { if (e.target === collegeInfoPopupContainer) collegeInfoPopupContainer.style.display = 'none'; }); }

    function updateWelcomePages() {
        welcomePages.forEach((page, index) => {
            if (page) {
                page.classList.toggle('active-page', index === currentWelcomePageIndex);
            }
        });
        if (welcomePopupNextBtn) {
            welcomePopupNextBtn.style.display = (currentWelcomePageIndex === welcomePages.length - 1) ? 'none' : 'block';
        }
        if (welcomePopupPrevBtn) {
            welcomePopupPrevBtn.style.display = (currentWelcomePageIndex > 0) ? 'block' : 'none';
        }
    }

    if (welcomeButton) {
        welcomeButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (welcomePopupContainer) {
                currentWelcomePageIndex = 0;
                updateWelcomePages();
                welcomePopupContainer.style.display = 'flex';
            }
        });
    }

    if (welcomePopupNextBtn) {
        welcomePopupNextBtn.addEventListener('click', () => {
            if (currentWelcomePageIndex < welcomePages.length - 1) {
                currentWelcomePageIndex++;
                updateWelcomePages();
            }
        });
    }

    if (welcomePopupPrevBtn) {
        welcomePopupPrevBtn.addEventListener('click', () => {
            if (currentWelcomePageIndex > 0) {
                currentWelcomePageIndex--;
                updateWelcomePages();
            }
        });
    }

    if (welcomePopupCloseBtn) {
        welcomePopupCloseBtn.addEventListener('click', () => {
            if (welcomePopupContainer) welcomePopupContainer.style.display = 'none';
        });
    }

    if (welcomePopupContainer) {
        welcomePopupContainer.addEventListener('click', (e) => {
            if (e.target === welcomePopupContainer) {
                welcomePopupContainer.style.display = 'none';
            }
        });
    }
    
    // START: 2D MAP INTERACTION LOGIC
    let mapState = { scale: 1, transform: { x: 0, y: 0 } };

    function setTransform() {
        mapContentEl.style.transform = `translate(${mapState.transform.x}px, ${mapState.transform.y}px) scale(${mapState.scale})`;
    }

    function resetMapTransform() {
        const wrapperWidth = mapAreaWrapperEl.clientWidth;
        const wrapperHeight = mapAreaWrapperEl.clientHeight;
        const contentWidth = mapImageEl.offsetWidth;
        const contentHeight = mapImageEl.offsetHeight;

        const scaleX = wrapperWidth / contentWidth;
        const scaleY = wrapperHeight / contentHeight;
        
        mapState.scale = Math.min(scaleX, scaleY) * 0.95; // Use 0.95 for a tighter fit
        mapState.transform.x = (wrapperWidth - contentWidth * mapState.scale) / 2;
        mapState.transform.y = (wrapperHeight - contentHeight * mapState.scale) / 2;

        setTransform();
    }
    
    window.addEventListener('resize', () => {
        if(map2DPage.style.display === 'flex') {
            resetMapTransform();
        }
    });


    if (mapAreaWrapperEl && mapContentEl) {
        let isPanning = false;
        let isPinching = false;
        let start = { x: 0, y: 0 };
        let initialPinchDistance = 0;
        const activePointers = new Map();

        const getDistance = (p1, p2) => Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
        const getMidpoint = (p1, p2) => ({ x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 });

        mapAreaWrapperEl.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

            if (activePointers.size === 1) {
                isPanning = true;
                start = { x: e.clientX - mapState.transform.x, y: e.clientY - mapState.transform.y };
            } else if (activePointers.size === 2) {
                isPanning = false;
                isPinching = true;
                initialPinchDistance = getDistance(...activePointers.values());
            }
        });

        mapAreaWrapperEl.addEventListener('pointermove', (e) => {
            e.preventDefault();
            if (!activePointers.has(e.pointerId)) return;
            activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

            if (isPanning && activePointers.size === 1) {
                mapState.transform.x = e.clientX - start.x;
                mapState.transform.y = e.clientY - start.y;
                setTransform();
            } else if (isPinching && activePointers.size === 2) {
                const pointers = [...activePointers.values()];
                const newDist = getDistance(pointers[0], pointers[1]);
                const sensitivity = 0.5; // Adjust this value to make zoom less sensitive
                const scaleMultiplier = 1 + ((newDist / initialPinchDistance) - 1) * sensitivity;
                
                const midpoint = getMidpoint(pointers[0], pointers[1]);
                const rect = mapAreaWrapperEl.getBoundingClientRect();
                
                const xs = (midpoint.x - rect.left - mapState.transform.x) / mapState.scale;
                const ys = (midpoint.y - rect.top - mapState.transform.y) / mapState.scale;
                
                const newScale = Math.min(Math.max(0.2, mapState.scale * scaleMultiplier), 4);
                
                mapState.transform.x = midpoint.x - rect.left - xs * newScale;
                mapState.transform.y = midpoint.y - rect.top - ys * newScale;
                mapState.scale = newScale;

                setTransform();
                initialPinchDistance = newDist;
            }
        });

        const handlePointerEnd = (e) => {
            activePointers.delete(e.pointerId);
            if (activePointers.size < 2) {
                isPinching = false;
            }
            if (activePointers.size < 1) {
                isPanning = false;
            } else if (activePointers.size === 1) {
                 isPanning = true;
                 const pointer = [...activePointers.values()][0];
                 start = { x: pointer.clientX - mapState.transform.x, y: pointer.clientY - mapState.transform.y };
            }
        };

        mapAreaWrapperEl.addEventListener('pointerup', handlePointerEnd);
        mapAreaWrapperEl.addEventListener('pointercancel', handlePointerEnd);
        mapAreaWrapperEl.addEventListener('pointerleave', handlePointerEnd);

        mapAreaWrapperEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = mapAreaWrapperEl.getBoundingClientRect();
            const xs = (e.clientX - rect.left - mapState.transform.x) / mapState.scale;
            const ys = (e.clientY - rect.top - mapState.transform.y) / mapState.scale;
            const delta = (e.deltaY > 0) ? 0.85 : 1.15;
            const newScale = Math.min(Math.max(0.2, mapState.scale * delta), 4);
            mapState.transform.x = e.clientX - rect.left - xs * newScale;
            mapState.transform.y = e.clientY - rect.top - ys * newScale;
            mapState.scale = newScale;
            setTransform();
        });
    }
    
    // --- Mobile Pin Tap Fix ---
    pinData.forEach(data => {
        const pinElement = document.getElementById(`pin-${data.id}`);
        if (pinElement) {
            let isPinDragging = false;
            let pinPressStartTime = 0;
            
            pinElement.addEventListener('pointerdown', (e) => {
                e.stopPropagation(); // Prevent map from panning
                isPinDragging = false;
                pinPressStartTime = Date.now();
            });

            pinElement.addEventListener('pointermove', (e) => {
                isPinDragging = true;
            });

            pinElement.addEventListener('pointerup', (e) => {
                e.stopPropagation();
                const pressDuration = Date.now() - pinPressStartTime;
                if (!isPinDragging && pressDuration < 250) { // It's a tap!
                    showPinInfoPopup(data);
                }
            });
        }
    });
    // END: 2D MAP INTERACTION LOGIC

    // START: Drag-to-scroll for popups
    function enableDragToScroll(element) {
        if (!element) return;

        let isDown = false;
        let startY;
        let scrollTop;

        element.addEventListener('pointerdown', (e) => {
            // Only activate for touch and mouse left-click
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isDown = true;
            element.classList.add('content-wrapper-active-drag');
            startY = e.pageY - element.offsetTop;
            scrollTop = element.scrollTop;
            element.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
        });

        const stopDragging = () => {
            isDown = false;
            element.classList.remove('content-wrapper-active-drag');
            element.style.scrollBehavior = 'smooth'; // Re-enable after drag
        };

        element.addEventListener('pointerleave', stopDragging);
        element.addEventListener('pointerup', stopDragging);
        element.addEventListener('pointercancel', stopDragging);


        element.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const y = e.pageY - element.offsetTop;
            const walk = (y - startY);
            element.scrollTop = scrollTop - walk;
        });
    }

    enableDragToScroll(welcomePopupContentWrapper);
    enableDragToScroll(infoPopupContentWrapper);
    // END: Drag-to-scroll for popups


    // --- START: CHARACTER SELECTION LOGIC ---
    function initCharacterScene() {
        if (isSceneInitialized) return;
        threeClock = new THREE.Clock();
        threeScene = new THREE.Scene();
        const aspectRatio = characterCanvasContainer.clientWidth / characterCanvasContainer.clientHeight;
        threeCamera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000);

        threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        threeRenderer.setSize(characterCanvasContainer.clientWidth, characterCanvasContainer.clientHeight);
        threeRenderer.setPixelRatio(window.devicePixelRatio);
        threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        threeRenderer.outputColorSpace = THREE.SRGBColorSpace;
        characterCanvasContainer.appendChild(threeRenderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.5);
        hemiLight.position.set(0, 20, 0);
        threeScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 10, 10);
        threeScene.add(dirLight);

        threeControls = new OrbitControls(threeCamera, threeRenderer.domElement);

        window.addEventListener('resize', onWindowResize, false);
        isSceneInitialized = true;
    }

    function onWindowResize() {
        if (!threeRenderer || !threeCamera) return;
        threeCamera.aspect = characterCanvasContainer.clientWidth / characterCanvasContainer.clientHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(characterCanvasContainer.clientWidth, characterCanvasContainer.clientHeight);
    }

    function animateCharacterScene() {
        animationRequestId = requestAnimationFrame(animateCharacterScene);
        const delta = threeClock.getDelta();
        if (threeMixer) {
            threeMixer.update(delta);
        }
        threeControls.update();
        threeRenderer.render(threeScene, threeCamera);
    }

    function clearScene() {
        if (currentModel) {
            threeScene.remove(currentModel);
            currentModel = null;
        }
        if (threeMixer) {
            threeMixer.uncacheRoot(threeMixer.getRoot());
            threeMixer = null;
            animationAction = null;
        }
    }

    function updateSideMenuState() {
        if (isMapView) {
            if (loadMapBtn) loadMapBtn.classList.add('active');
            if (selectCharBtn) selectCharBtn.classList.remove('active');
            if (prevCharBtn) prevCharBtn.style.display = 'none';
            if (nextCharBtn) nextCharBtn.style.display = 'none';
            if (charToggleAnimationBtn) charToggleAnimationBtn.style.display = 'none'; // Hide anim button in map view
        } else {
            if (loadMapBtn) loadMapBtn.classList.remove('active');
            if (selectCharBtn) selectCharBtn.classList.add('active');
            if (prevCharBtn) prevCharBtn.style.display = 'flex';
            if (nextCharBtn) nextCharBtn.style.display = 'flex';
            if (charToggleAnimationBtn) charToggleAnimationBtn.style.display = 'block'; // Show anim button in char view
        }
    }

    function switchToCharacterView() {
        isMapView = false;
        clearScene();

        if (characterSelectionPage) {
            characterSelectionPage.classList.remove('map-view-active');
        }

        if (loadMapIcon) loadMapIcon.className = 'fas fa-map';

        threeControls.enablePan = true;
        threeControls.minDistance = 2;
        threeControls.maxDistance = 6;
        threeControls.target.set(0, 0.8, 0);
        threeCamera.position.set(0, 1, 3.5);

        updateSideMenuState();
        loadCharacter(currentCharacterIndex);
    }

    function switchToMapView() {
        if (isMapView) return;
        isMapView = true;
        clearScene();

        if (characterSelectionPage) {
            characterSelectionPage.classList.add('map-view-active');
        }

        if (loadMapIcon) loadMapIcon.className = 'fas fa-map-location-dot';

        updateSideMenuState();

        const loader = new GLTFLoader();
        loader.load('models/school/map.gltf', (gltf) => {
            currentModel = gltf.scene;

            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            currentModel.position.sub(center);
            threeScene.add(currentModel);

            const targetOffset = new THREE.Vector3(size.x * 0.15, 0, 0);

            threeControls.target.copy(targetOffset);
            threeControls.enablePan = true;
            threeControls.minDistance = 10;
            threeControls.maxDistance = 200;

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = threeCamera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

            threeCamera.position.set(
                targetOffset.x,
                size.y * 1.1,
                targetOffset.z + cameraZ * 1.25
            );

            threeControls.update();

        }, undefined, (error) => {
            console.error('An error happened while loading map:', error);
        });
    }

    function loadCharacter(index) {
        clearScene();
        const loader = new GLTFLoader();
        loader.load(characterModels[index], (gltf) => {
            currentModel = gltf.scene;
            
            // Set up animations
            if (gltf.animations && gltf.animations.length) {
                threeMixer = new THREE.AnimationMixer(currentModel);
                animationAction = threeMixer.clipAction(gltf.animations[0]); // Assuming first animation is walk
                if (isAnimationPlaying) {
                    animationAction.play();
                }
            }

            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            currentModel.position.sub(center);

            const scale = 1.8 / box.getSize(new THREE.Vector3()).y;
            currentModel.scale.set(scale, scale, scale);
            threeScene.add(currentModel);

        }, undefined, (error) => {
            console.error(`An error happened while loading character: ${characterModels[index]}`, error);
        });
        prevCharBtn.disabled = index === 0;
        nextCharBtn.disabled = index === characterModels.length - 1;
    }

    if (hexagon3dButton) {
        hexagon3dButton.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(characterSelectionPage);
            initCharacterScene();
            switchToCharacterView();
            if (!animationRequestId) {
                animateCharacterScene();
            }
        });
    }
    
    if (charToggleAnimationBtn) {
        charToggleAnimationBtn.addEventListener('click', () => {
            isAnimationPlaying = !isAnimationPlaying;
            const icon = charToggleAnimationBtn.querySelector('i');

            if (isAnimationPlaying) {
                if (animationAction) animationAction.play();
                icon.className = 'fa-regular fa-square-check';
            } else {
                if (animationAction) animationAction.stop();
                icon.className = 'fa-regular fa-square';
            }
        });
    }

    if (selectCharBtn) {
        selectCharBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchToCharacterView();
        });
    }

    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchToMapView();
        });
    }

    if (charBackToMenuBtn) {
        charBackToMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (characterSelectionPage) {
                characterSelectionPage.classList.remove('map-view-active');
            }
            showPage(menuPage);
        });
    }

    if (nextCharBtn) {
        nextCharBtn.addEventListener('click', () => {
            if (!isMapView && currentCharacterIndex < characterModels.length - 1) {
                currentCharacterIndex++;
                loadCharacter(currentCharacterIndex);
            }
        });
    }

    if (prevCharBtn) {
        prevCharBtn.addEventListener('click', () => {
            if (!isMapView && currentCharacterIndex > 0) {
                currentCharacterIndex--;
                loadCharacter(currentCharacterIndex);
            }
        });
    }
    
    if (charFullscreenBtn) {
        charFullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!document.fullscreenElement) {
                characterSelectionPage.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    document.addEventListener('fullscreenchange', () => {
        const icon = charFullscreenBtn.querySelector('i');
        if (document.fullscreenElement) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        } else {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
        }
        setTimeout(onWindowResize, 100);
    });

    if (backFrom3DCampusBtn) {
        backFrom3DCampusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(menuPage);
        });
    }

    const handlePlaceholderClick = (e) => { e.preventDefault(); const lang = localStorage.getItem('language') || 'en'; window.showMessage('info', window.translations[lang].popupNoticeTitle, window.translations[lang].popupFeatureComingSoon, window.translations[lang].popupOkButton); };
    const placeholderButtons = [charPlaceholder2];
    placeholderButtons.forEach(button => { if (button) { button.addEventListener('click', handlePlaceholderClick); } });

    // --- END: CHARACTER SELECTION LOGIC ---

    function initializeApp() {
        const savedLang = localStorage.getItem('language') || 'en';
        if (languageSelect) languageSelect.value = savedLang;
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
    }

    initializeApp();
});