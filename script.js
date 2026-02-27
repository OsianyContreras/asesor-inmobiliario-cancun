// Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const typingIndicator = document.getElementById('typingIndicator');
const leadModal = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');
const successMessage = document.getElementById('successMessage');

// Chat State
let currentUserState = 'START';
// States: START, DIAGNOSIS, VALUE_PROP, CAPTURE

// Helper to scroll to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

// Hide typing indicator
function hideTyping() {
    typingIndicator.classList.add('hidden');
}

// Add a message to the chat
function addMessage(text, sender, isHTML = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    if (isHTML) {
        msgDiv.innerHTML = text;
    } else {
        msgDiv.textContent = text;
    }

    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

// Add interactive options
function addOptions(options) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.classList.add('options-wrapper');

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        if (opt.primary) btn.classList.add('cta-primary');

        btn.innerHTML = `<span>${opt.text}</span> <i class='bx bx-chevron-right'></i>`;
        btn.onclick = () => {
            handleUserSelection(opt.text, opt.action);
            // Disable buttons after click
            wrapperDiv.style.pointerEvents = 'none';
            wrapperDiv.style.opacity = '0.5';
        };
        wrapperDiv.appendChild(btn);
    });

    chatMessages.appendChild(wrapperDiv);
    scrollToBottom();
}

// Config data populated via config.json loaded on DOMContentLoaded
// Config data populated via config.json loaded on DOMContentLoaded
let knowledgeBaseES = [];
let knowledgeBaseEN = [];
let translations = {};
let propertyDataBilingual = {};
let currentLang = 'es';

// =========================================
// CRITICAL CORE FUNCTIONS (TOP PRIORITY)
// =========================================

function loadAppConfig() {
    console.log("Core: Cargando AppConfig...");
    try {
        if (typeof AppConfig !== 'undefined') {
            knowledgeBaseES = AppConfig.knowledgeBaseES || [];
            knowledgeBaseEN = AppConfig.knowledgeBaseEN || [];
            translations = AppConfig.translations || {};
            propertyDataBilingual = AppConfig.propertyDataBilingual || {};
            console.log("Core: AppConfig cargado con éxito.");
        } else {
            console.warn("Core: AppConfig no detectado aún.");
        }
    } catch (e) {
        console.error("Core: Error en loadAppConfig", e);
    }
}

// Carga inmediata si ya está disponible
if (typeof AppConfig !== 'undefined') loadAppConfig();

// =========================================
// SHOW PROPERTY MODAL (ULTRA-SIMPLE, SIN DEPENDENCIAS)
// Llamada directamente desde el HTML con datos hardcodeados
// =========================================
function showPropertyModal(title, badge, price, beds, baths, amenity, desc, img, model) {
    const pmModal = document.getElementById('propertyModal');
    if (!pmModal) { alert('Error: modal no encontrado'); return; }

    // Imagen de fondo
    const pmMainImg = document.getElementById('pmMainImg');
    if (pmMainImg) { pmMainImg.src = img; pmMainImg.alt = title; }

    // Modelo 3D (si hay internet)
    const pmMainModel = document.getElementById('pmMainModel');
    if (pmMainModel && model) {
        pmMainModel.setAttribute('src', model);
    }

    // Textos del modal
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val || ''; };
    set('pmBadge', badge);
    set('pmTitle', title);
    set('pmPrice', price);
    set('pmBeds', beds);
    set('pmBaths', baths);
    set('pmAmenity', amenity);
    set('pmDesc', desc);

    // Abrir modal
    pmModal.classList.add('active');

    // Cerrar al clickar fuera
    pmModal.onclick = function (e) { if (e.target === pmModal) closePropertyModal(); };
}

function openPropertyModal(id) {
    console.log("Modal: Abriendo categoría ->", id);

    // Asegurar carga de datos antes de abrir
    if (Object.keys(propertyDataBilingual).length === 0) {
        loadAppConfig();
    }

    const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'es';
    const categoryToKey = {
        'cancun': 'cancun',
        'merida': 'merida',
        'alberca': 'alberca',
        'mar': 'mar',
        'inversion': 'inversion'
    };

    const key = categoryToKey[id] || id;
    const data = propertyDataBilingual[activeLang] ? propertyDataBilingual[activeLang][key] : null;

    if (!data) {
        console.error("Modal: No hay datos para", activeLang, key);
        // Fallback visual
        alert("Lo sentimos, los detalles de esta propiedad no están disponibles en este momento.");
        return;
    }

    const pmModal = document.getElementById('propertyModal');
    if (!pmModal) return;

    // Actualizar imagen de fondo (fallback siempre visible)
    const pmMainImg = document.getElementById('pmMainImg');
    if (pmMainImg) {
        pmMainImg.src = data.image || '';
        pmMainImg.alt = data.title || 'Propiedad';
    }

    // Actualizar Modelo 3D (se muestra encima si hay internet)
    const pmMainModel = document.getElementById('pmMainModel');
    if (pmMainModel && data.model) {
        pmMainModel.setAttribute('src', data.model);
        pmMainModel.setAttribute('camera-orbit', '0deg 75deg 105%');
    }

    // Actualizar Textos (usando 'elId' para no colisionar con el parámetro 'id' de la función padre)
    const setT = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    setT('pmBadge', data.badge);
    setT('pmTitle', data.title);
    setT('pmPrice', data.price);
    setT('pmBeds', data.beds);
    setT('pmBaths', data.baths);
    setT('pmAmenity', data.amenity);
    setT('pmDesc', data.desc);

    pmModal.classList.add('active');

    // Close modal when clicking the overlay (outside modal content)
    pmModal.onclick = function (e) {
        if (e.target === pmModal) closePropertyModal();
    };
}

function closePropertyModal() {
    const pmModal = document.getElementById('propertyModal');
    if (pmModal) {
        pmModal.classList.remove('active');
        // Reset model src to stop loading
        const pmMainModel = document.getElementById('pmMainModel');
        if (pmMainModel) pmMainModel.src = '';
    }
}

// Bot Logic & Flow
async function botResponse(userMessage, action = null) {
    showTyping();
    chatForm.querySelector('button').disabled = true;

    // Simulate thinking delay (1-2 seconds)
    const delay = Math.random() * 800 + 800;

    setTimeout(() => {
        hideTyping();
        chatForm.querySelector('button').disabled = false;
        userInput.focus();

        let responseHTML = "";
        let options = [];

        // 1. Handle explicit button actions first
        if (action) {
            handleAction(action);
            return;
        }

        // 2. Analyze user text against our knowledge base (Simulated NLP)
        const lowerMsg = userMessage.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[.,!?¿¡]/g, ""); // remove punctuation

        let matchedIntent = null;

        // Iterate through knowledge base to find keyword matches
        const activeKB = (typeof currentLang !== 'undefined' && currentLang === 'en') ? knowledgeBaseEN : knowledgeBaseES;

        for (const kb of activeKB) {
            if (kb.keywords.some(kw => lowerMsg.includes(kw))) {
                matchedIntent = kb;
                break; // Stop at first strong match
            }
        }

        if (matchedIntent) {
            responseHTML = matchedIntent.response;
            options = matchedIntent.options || [];
        } else {
            // Fallback for unknown questions
            if (lowerMsg.length < 4) return; // Ignore very short random texts

            if ((typeof currentLang !== 'undefined' && currentLang === 'en')) {
                responseHTML = `Oops! I'd love to help with that, but my specialty is turning your dream of owning a home or investing into reality. 🏠🌊 <br><br>Would you like to ask me about prices, requirements, times, or how your credit points work?`;
                options = [
                    { text: "Let's talk about buying a home", action: "BUY" },
                    { text: "What are the requirements?", action: "EXPLAIN_POINTS" }
                ];
            } else {
                responseHTML = `¡Uy! Me encantaría ayudarte con eso, pero mi especialidad es cumplir tu sueño de tener casa propia o invertir en propiedades. 🏠🌊 <br><br>¿Te gustaría preguntarme sobre precios, requisitos, tiempos, o sobre cómo funcionan tus puntos de crédito?`;
                options = [
                    { text: "Hablemos de comprar casa", action: "BUY" },
                    { text: "¿Cuáles son los requisitos?", action: "EXPLAIN_POINTS" }
                ];
            }
        }

        addMessage(responseHTML, 'bot', true);
        if (options.length > 0) addOptions(options);

    }, delay);
}

// Handle specific button actions
function handleAction(action) {
    let responseHTML = "";
    let options = [];

    const activeKB = (typeof currentLang !== 'undefined' && currentLang === 'en') ? knowledgeBaseEN : knowledgeBaseES;

    switch (action) {
        case "BUY":
            responseHTML = activeKB.find(kb => kb.intent === "comprar").response;
            options = activeKB.find(kb => kb.intent === "comprar").options;
            break;

        case "SELL":
            responseHTML = activeKB.find(kb => kb.intent === "vender").response;
            options = activeKB.find(kb => kb.intent === "vender").options;
            break;

        case "EXPLAIN_POINTS":
            responseHTML = activeKB.find(kb => kb.intent === "puntos").response;
            options = activeKB.find(kb => kb.intent === "puntos").options;
            break;

        case "UNAMOS":
            responseHTML = activeKB.find(kb => kb.intent === "unir").response;
            options = activeKB.find(kb => kb.intent === "unir").options;
            break;

        case "KNOW_POINTS":
        case "VALUE_PROP_JUMP":
            if ((typeof currentLang !== 'undefined' && currentLang === 'en')) {
                responseHTML = `Perfect! You're one step ahead. Remember that with us everything is easier. In Cancun and nationwide, <strong>we speed up the appraisals and paperwork</strong>. We guide you all the way to the Title Deeds without any headaches. 🧠✨`;
                options = [
                    { text: "I'm interested, schedule a call", action: "LEAD", primary: true }
                ];
            } else {
                responseHTML = `¡Perfecto! Vas un paso adelante. Recuerda que con nosotros todo es más fácil. En Cancún y a nivel nacional, <strong>nosotros agilizamos los avalúos y el papeleo</strong>. Te guiamos hasta la Escrituración sin que te duela la cabeza. 🧠✨`;
                options = [
                    { text: "Me interesa, agendar llamada", action: "LEAD", primary: true }
                ];
            }
            break;

        case "LEAD":
            if ((typeof currentLang !== 'undefined' && currentLang === 'en')) {
                responseHTML = `Excellent decision! 🚀 To give you the exact amount and the best personalized attention, would you like to leave us your details so we can contact you today via WhatsApp? <br><br><em>(Don't worry, we won't ask for your Social Security Number here, that is reviewed later in a super secure way).</em>`;
                options = [
                    { text: "📝 Open secure form", action: "OPEN_MODAL", primary: true }
                ];
            } else {
                responseHTML = `¡Excelente decisión! 🚀 Para darte el monto exacto y la mejor atención personalizada, ¿te gustaría dejarnos tus datos y nos comunicamos contigo hoy mismo por WhatsApp? <br><br><em>(Tranquilo, no pediremos tu NSS por aquí, eso se revisa después de manera súper segura).</em>`;
                options = [
                    { text: "📝 Abrir formulario seguro", action: "OPEN_MODAL", primary: true }
                ];
            }
            break;

        case "OPEN_MODAL":
            openLeadModal();
            return; // Don't add a message
    }

    addMessage(responseHTML, 'bot', true);
    if (options.length > 0) addOptions(options);
}

// Handle User clicking an option
function handleUserSelection(text, action) {
    addMessage(text, 'user');
    botResponse("", action);
}

// Handle User typing a message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';
    botResponse(text);
});

// Handled dynamically in loadAppConfig instead
// 3. Property Filters
// Code moved.

// 4. FOMO Alerts (Social Proof)
const fomoMessagesES = [
    "🔥 Carlos de MTY acaba de agendar una asesoría",
    "✨ Último depto. con alberca en Residencial Aqua",
    "🤝 Sofía y Roberto acaban de unir sus créditos hoy",
    "⚡ Alguien de CDMX está revisando opciones en Tulum",
    "🏠 Nueva oportunidad de inversión añadida hace 1 hora"
];

const fomoMessagesEN = [
    "🔥 Charles from TX just scheduled a consultation",
    "✨ Last pool apartment available in Aqua Residential",
    "🤝 Sophia and Robert just combined their credits today",
    "⚡ Someone from NY is reviewing options in Tulum",
    "🏠 New investment opportunity added 1 hour ago"
];

function showFomoAlert() {
    const container = document.getElementById('fomo-container');
    if (!container) return;

    const activeFomo = (typeof currentLang !== 'undefined' && currentLang === 'en') ? fomoMessagesEN : fomoMessagesES;
    const msg = activeFomo[Math.floor(Math.random() * activeFomo.length)];
    const alertBody = document.createElement('div');
    alertBody.className = 'fomo-alert';
    alertBody.innerHTML = `<i class='bx bxs-bell-ring'></i> <p>${msg}</p>`;

    container.appendChild(alertBody);

    setTimeout(() => {
        alertBody.classList.add('show');
    }, 100);

    // Fade out and remove after 6 seconds
    setTimeout(() => {
        alertBody.classList.remove('show');
        setTimeout(() => alertBody.remove(), 500);
    }, 6000);
}

function startFomoLoop() {
    // Show alert every 12 to 25 seconds randomly
    setTimeout(() => {
        showFomoAlert();
        startFomoLoop();
    }, Math.random() * 13000 + 12000);
}

// Start FOMO soon after load
setTimeout(startFomoLoop, 5000);

// Init Chat
function initChat() {
    chatMessages.innerHTML = '';
    currentUserState = 'START';

    // Phase 9: URL Personalization
    const urlParams = new URLSearchParams(window.location.search);
    let userName = urlParams.get('nombre');

    let isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
    let heroGreeting = isEn ? "Your ideal home," : "Tu hogar ideal,";
    let chatGreeting = isEn
        ? "Hello! 👋 I'm <strong>Your Expert Friend</strong>, your trusted real estate advisor. <br><br>I'm here to make the paperwork simple. What dream do we want to fulfill today?"
        : "¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario de confianza. <br><br>Estoy aquí para hacer que los trámites sean sencillos. ¿Qué sueño queremos cumplir hoy?";

    if (userName) {
        // Capitalize first letter
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        heroGreeting = isEn ? `Hello ${userName}!<br> Your ideal home,` : `¡Hola ${userName}!<br> Tu hogar ideal,`;
        chatGreeting = isEn
            ? `Hello <strong>${userName}</strong>! 👋 I'm so glad you opened my link. I am <strong>Juan, Your Expert Friend</strong>.<br><br>I have excellent options set aside for you. What dream will we fulfill today?`
            : `¡Hola <strong>${userName}</strong>! 👋 Me alegra mucho que abrieras mi enlace. Soy <strong>Juan, Tu Amigo Experto</strong>.<br><br>Tengo excelentes opciones separadas para ti. ¿Qué sueño cumpliremos hoy?`;

        // Update Hero Title
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle) {
            heroTitle.innerHTML = `${heroGreeting} <br><span class="highlight">${isEn ? "without stress or complications" : "sin estrés ni complicaciones"}</span>`;
        }
    }

    // Small delay for natural feel
    setTimeout(() => {
        addMessage(chatGreeting, 'bot', true);

        setTimeout(() => {
            if (isEn) {
                addOptions([
                    { text: "I want to buy a house", action: "BUY" },
                    { text: "I want to combine credits", action: "UNAMOS" },
                    { text: "Know about my points", action: "EXPLAIN_POINTS" }
                ]);
            } else {
                addOptions([
                    { text: "Quiero comprar una casa", action: "BUY" },
                    { text: "Quiero unir mis puntos", action: "UNAMOS" },
                    { text: "Saber de mis puntos", action: "EXPLAIN_POINTS" }
                ]);
            }
        }, 500);
    }, 500);
}

// Modal Logic
function openLeadModal() {
    if (leadModal) leadModal.classList.add('active');
    if (successMessage) successMessage.classList.add('hidden');
    if (leadForm) {
        leadForm.style.display = 'block';
        leadForm.reset();

        // Reset subimt btn text
        const submitBtn = leadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = "<i class='bx bxl-whatsapp'></i> Hablar por WhatsApp";
            submitBtn.disabled = false;
        }
    }
}

function closeLeadModal() {
    if (leadModal) leadModal.classList.remove('active');
}

function submitLead(e) {
    if (e) e.preventDefault();

    // Cambiar texto del botón a "Enviando..."
    const submitBtn = leadForm ? leadForm.querySelector('button[type="submit"]') : null;
    let originalText = "Hablar por WhatsApp";
    if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Conectando...";
        submitBtn.disabled = true;
    }

    // Obtener los datos del formulario (safeguarded)
    const nameEl = document.getElementById('name');
    const phoneEl = document.getElementById('phone');
    const interestSelect = document.getElementById('interest');
    const dateEl = document.getElementById('date');
    const timeEl = document.getElementById('time');

    if (!nameEl || !phoneEl || !interestSelect || !dateEl || !timeEl) {
        console.warn("Form fields not found.");
        // Restore button state if form fields are missing
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        return;
    }

    const name = nameEl.value;
    const phone = phoneEl.value;
    const interestText = interestSelect.options[interestSelect.selectedIndex].text;
    const date = dateEl.value;
    const time = timeEl.value;

    // Formatear fecha para el mensaje (de AAAA-MM-DD a DD/MM/AAAA)
    let formattedDate = date;
    if (date) {
        const parts = date.split('-');
        if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Número al que llegará el mensaje
    const whatsappNumber = "529983008729";

    // Crear el mensaje pre-llenado
    const message = `¡Hola Tu Amigo Experto! 👋\n\nSoy *${name}* y me gustaría agendar una asesoría gratuita.\n\n📱 Mi número de contacto es: ${phone}\n🎯 Me interesa: *${interestText}*.\n📅 Día agendado: *${formattedDate}*\n⏰ Hora: *${time}*\n\n¡Espero tu confirmación!`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    // Mostrar mensaje de éxito en la web
    if (leadForm) leadForm.style.display = 'none';
    if (successMessage) successMessage.classList.remove('hidden');

    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
        closeLeadModal();
        addMessage(`¡Te he redirigido a WhatsApp, ${name}! 🎉 En cuanto le des a "Enviar" en tu aplicación, nos llegará tu mensaje para empezar a analizar tu plan.`, "bot");
    }, 2000);
}

// =========================================
// PHASE 3 LOGIC
// =========================================

// 1. Points Simulator
function calculatePoints() {
    const ageInput = document.getElementById('sim-age').value;
    const salaryInput = document.getElementById('sim-salary').value;
    const resultDiv = document.getElementById('sim-result');

    const age = parseInt(ageInput);
    const salary = parseFloat(salaryInput);

    if (!age || !salary || age < 18 || salary < 5000) {
        alert("Por favor ingresa datos válidos (mayor de 18 años y sueldo mayor a $5,000).");
        return;
    }

    // Rough estimation formula (just for engagement purposes)
    let potential = salary * 35;

    // Penalize if older than 40
    if (age > 40) {
        potential = potential * (1 - ((age - 40) * 0.02));
    }

    // Format to MXN
    const formattedAmount = potential.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

    resultDiv.innerHTML = `
        <h3>¡Tu perfil tiene potencial! 🚀</h3>
        <p>Basado en tus datos, Infonavit te podría prestar hasta:</p>
        <span class="amount">${formattedAmount}</span>
        <p>¿Quieres verificar tus 1,080 puntos reales y ver cuánto dinero tienes ahorrado en tu Subcuenta?</p>
        <button class="submit-btn" style="margin-top:10px" onclick="openLeadModal()">Verificar mis puntos gratis</button>
    `;

    resultDiv.classList.remove('hidden');
}

// 2. FAQ Accordion Logic
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const answer = button.nextElementSibling;
        const isActive = faqItem.classList.contains('active');

        // Close all others
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Toggle current
        if (!isActive) {
            faqItem.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});

// Reset Chat manually
function resetChat() {
    initChat();
}

// =========================================
// PHASE 7 LOGIC: Conversion & Retention
// =========================================

// 1. Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        themeToggle.innerHTML = isLight ? "<i class='bx bx-moon'></i>" : "<i class='bx bx-sun'></i>";
    });
}

// 2. Advanced WhatsApp Widget
const waBubble = document.getElementById('waBubble');

function toggleWaBubble() {
    if (waBubble.classList.contains('hidden')) {
        waBubble.classList.remove('hidden');
    } else {
        waBubble.classList.add('hidden');
    }
}

function closeWaBubble(e) {
    e.stopPropagation();
    waBubble.classList.add('hidden');
}

// Auto-open WA Widget after 10 seconds
setTimeout(() => {
    if (waBubble && waBubble.classList.contains('hidden')) {
        waBubble.classList.remove('hidden');
    }
}, 10000);

// 3. Exit-Intent Popup
const exitModal = document.getElementById('exitModal');
let exitIntentShown = false;

document.addEventListener('mouseleave', (e) => {
    // Detect mouse leaving the top of the viewport
    if (e.clientY < 50 && !exitIntentShown) {
        if (!sessionStorage.getItem('exitIntentShown')) {
            exitModal.classList.add('active');
            exitIntentShown = true;
            sessionStorage.setItem('exitIntentShown', 'true');
        }
    }
});

function closeExitModal() {
    exitModal.classList.remove('active');
}

function submitExitLead(e) {
    e.preventDefault();
    const name = document.getElementById('exitName').value;
    const phone = document.getElementById('exitPhone').value;

    const whatsappNumber = "529983008729";
    const message = `¡Hola Tu Amigo Experto! 👋\n\nSoy *${name}* y me gustaría recibir la Guía Gratuita "5 Errores al Comprar con Infonavit".\n\nMi número es: ${phone}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    closeExitModal();
    window.open(whatsappUrl, '_blank');
}

// Parallax Effect for Background Orbs
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xPos = (window.innerWidth / 2 - e.pageX) / speed;
        const yPos = (window.innerHeight / 2 - e.pageY) / speed;
        orb.style.transform = `translate(${xPos}px, ${yPos}px)`;
    });
});

// =========================================
// PHASE 8 LOGIC: Immersive & Bilingual
// =========================================

// 1. Audio Welcome Bubble (Web Speech API)
const playAudioBtn = document.getElementById('playAudioBtn');

function playWelcomeAudio() {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        let msg = new SpeechSynthesisUtterance();
        msg.text = "Hola. Soy Juan, Tu Amigo Experto. Bienvenido a nuestra plataforma, estoy listo para estructurar tu crédito y encontrar tu hogar ideal.";
        msg.lang = 'es-MX';
        msg.rate = 1.0;

        if (currentLang === 'en') {
            msg.text = "Hello. I am Juan, Your Expert Friend. Welcome to our platform, I am ready to structure your credit and find your ideal home.";
            msg.lang = 'en-US';
        }

        // Add visual cues
        playAudioBtn.classList.add('playing');
        playAudioBtn.innerHTML = "<i class='bx bx-pause-circle'></i>";

        msg.onend = function () {
            playAudioBtn.classList.remove('playing');
            playAudioBtn.innerHTML = "<i class='bx bx-play-circle'></i>";
        };

        window.speechSynthesis.speak(msg);
    } else {
        alert("Lo siento, tu navegador no soporta sintetizador de voz.");
    }
}

// 2. Bilingual Dictionary & Toggle
const langToggle = document.getElementById('langToggle');

function toggleLanguage(lang) {
    if (!translations[lang]) return;

    currentLang = lang;
    if (langToggle) langToggle.textContent = translations[currentLang].langBtn;
    const t = translations[currentLang];

    // Safe DOM updater helpers
    const safeHTML = (selector, html) => {
        const el = document.querySelector(selector);
        if (el && html) el.innerHTML = html;
    };
    const safeText = (selector, text) => {
        const el = document.querySelector(selector);
        if (el && text) el.textContent = text;
    };

    // Header & Nav
    safeHTML('.urgency-banner', t.urgency);
    safeText('.nav-cta', t.ctaNav);
    safeText('.hero-info .badge', t.heroBadge);
    safeHTML('.hero-info h1', t.heroTitle);
    safeText('.hero-info .subtitle', t.heroSubtitle);
    safeText('.trust-logos p', t.trustTitle);

    // Section Titles
    safeHTML('.myths-section .section-title', t.mythsTitle);
    safeHTML('.simulator-header h2', t.simulatorTitle);
    safeHTML('.value-prop-section .section-title', t.whyTitle);
    safeHTML('.properties-section .section-title', t.propTitle);
    safeHTML('.testimonial-section .section-title', t.testTitle);
    safeHTML('.faq-section .section-title', t.faqTitle);

    // Chat Header
    safeHTML('.agent-info h2', `${t.chatHeaderName} <button id="playAudioBtn" class="audio-btn" title="Escuchar Mensaje" onclick="playWelcomeAudio()"><i class='bx bx-play-circle'></i></button>`);
    safeText('.agent-info .status-text', t.chatHeaderRole);

    const userInput = document.getElementById('userInput');
    if (userInput) userInput.placeholder = t.chatInputPlaceholder;
    safeHTML('#typingIndicator', `${t.chatTyping}<span>.</span><span>.</span><span>.</span>`);

    // Property Filters & Cards
    const filterBtns = document.querySelectorAll('.property-filters .filter-btn');
    if (filterBtns.length >= 4 && t.filters) {
        filterBtns[0].textContent = t.filters[0];
        filterBtns[1].textContent = t.filters[1];
        filterBtns[2].textContent = t.filters[2];
        filterBtns[3].textContent = t.filters[3];
    }

    const propCards = document.querySelectorAll('.prop-card');
    propCards.forEach(card => {
        const id = card.dataset.category;
        const data = propertyDataBilingual[lang][id];
        if (data) {
            const h4 = card.querySelector('h4');
            const p = card.querySelector('p');
            const badge = card.querySelector('.prop-badge');
            const img = card.querySelector('img');
            const btn = card.querySelector('.view-details-btn');

            if (h4) h4.textContent = data.title;
            if (p) p.textContent = data.price;
            if (badge) badge.textContent = data.badge;
            if (img) img.src = data.image;
            if (btn) btn.innerHTML = `<i class='bx bx-expand-alt'></i> ${t.viewDetails || 'Ver Detalles'}`;
        }
    });

    // Modals & Floating Widgets
    safeText('.video-tooltip', t.videoTooltip);
    safeText('.video-expanded-header h3', t.videoHeader);
    safeText('.video-expanded-body p', t.videoBody);
    safeText('.video-expanded-body .submit-btn', t.videoBtn);

    // Exit Intent Modal
    safeText('#exitModal .modal-header h3', t.exitTitle);
    safeHTML('#exitModal p', t.exitDesc);
    const exitName = document.getElementById('exitName');
    const exitPhone = document.getElementById('exitPhone');
    if (exitName) exitName.placeholder = t.exitName;
    if (exitPhone) exitPhone.placeholder = t.exitPhone;
    safeHTML('#exitModal .submit-btn', t.exitBtn);
    safeText('#exitModal .text-link-btn', t.exitCancel);

    // Footer
    safeText('.footer-brand p', t.footerDesc);
    safeText('.footer-links h4', t.footerLinksTitle);
    const fLinks = document.querySelectorAll('.footer-links ul li a');
    if (fLinks.length >= 3 && t.footerLink1) {
        fLinks[0].textContent = t.footerLink1;
        fLinks[1].textContent = t.footerLink2;
        fLinks[2].textContent = t.footerLink3;
    }
    safeText('.footer-contact h4', t.footerContactTitle);
    safeHTML('.footer-bottom p', t.footerRights);

    // Lead Modal
    safeText('#leadModal .modal-header h3', t.leadTitle);
    safeText('#leadModal .modal-header p', t.leadDesc);
    const leadLabels = document.querySelectorAll('#leadForm label');
    if (leadLabels.length >= 3 && t.leadName) {
        leadLabels[0].textContent = t.leadName;
        leadLabels[1].textContent = t.leadPhone;
        leadLabels[2].textContent = t.leadSelectLabel;
    }
    const leadNameInput = document.getElementById('name');
    if (leadNameInput && t.leadName) leadNameInput.placeholder = `Ej. ${t.leadName.split(" ")[0]}...`;

    const leadOptionsDom = document.querySelectorAll('#interest option');
    if (leadOptionsDom.length >= 5 && t.leadOptions) {
        for (let i = 0; i < 5; i++) leadOptionsDom[i].textContent = t.leadOptions[i];
    }

    // WhatsApp Bubble
    safeText('.wa-bubble-header span', t.waStatus);
    safeText('.wa-bubble-body p', t.waMsg);
    safeHTML('.wa-bubble-btn', t.waBtn);

    // Property View Detail Button
    safeText('.pm-cta', t.pmCTA);
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.innerHTML = t.viewDetails;
    });

    // Myths
    document.querySelectorAll('.myth-card').forEach((card, i) => {
        if (t.myths && t.myths[i]) {
            card.querySelector('.myth-front h3').textContent = t.myths[i].t1;
            card.querySelector('.myth-front p').innerHTML = t.myths[i].p1;
            card.querySelector('.myth-back h3').textContent = t.myths[i].t2;
            card.querySelector('.myth-back p').innerHTML = t.myths[i].p2;
        }
    });

    // Simulator
    const simLabels = document.querySelectorAll('.simulator-body label');
    if (simLabels.length > 1 && t.sim) {
        simLabels[0].textContent = t.sim.label1;
        simLabels[1].textContent = t.sim.label2;
        safeText('.simulator-body .submit-btn', t.sim.btn);
    }

    // Features
    document.querySelectorAll('.feature-card').forEach((card, i) => {
        if (t.features && t.features[i]) {
            card.querySelector('h3').textContent = t.features[i].t;
            card.querySelector('p').textContent = t.features[i].p;
        }
    });

    // FAQs
    document.querySelectorAll('.faq-item').forEach((item, i) => {
        if (t.faqs && t.faqs[i]) {
            item.querySelector('.faq-question span').textContent = t.faqs[i].q;
            item.querySelector('.faq-answer p').innerHTML = t.faqs[i].a;
        }
    });

    // Restart chat
    initChat();
}

if (langToggle) {
    langToggle.addEventListener('click', () => {
        const nextLang = currentLang === 'es' ? 'en' : 'es';
        toggleLanguage(nextLang);
    });
}

// Init AOS Animation Library and Base Data
document.addEventListener('DOMContentLoaded', () => {
    loadAppConfig();

    // 1. Initialize Property Filter Listeners
    const filterBtns = document.querySelectorAll('.filter-btn');
    const propCards = document.querySelectorAll('.prop-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            propCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'none';
                    card.offsetHeight; /* trigger reflow */
                    card.style.animation = 'bounceIn 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 2. Init Animations
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    if (window.innerWidth > 768 && typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".myth-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });

        VanillaTilt.init(document.querySelectorAll(".feature-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
        });
    }

    // 3. Kickstart initial UI translation (toggleLanguage ya llama initChat internamente)
    if (translations[currentLang]) {
        toggleLanguage(currentLang);
    } else {
        // Si no hay traducciones cargadas aún, inicia el chat directamente
        initChat();
    }
});

// =========================================

// =========================================
// PHASE 9 LOGIC: Data & Advanced Dynamics
// =========================================

// 1. Floating Video Widget - ELIMINADO
// Ocultar y destruir el widget de video si existe en el DOM
(function () {
    var ids = ['videoWidget', 'miniVideo', 'mainVideo', 'videoExpanded', 'waBubble', 'wa-bubble'];
    ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    // También ocultar por clase
    ['video-widget', 'wa-bubble', 'whatsapp-bubble', 'play-overlay'].forEach(function (cls) {
        document.querySelectorAll('.' + cls).forEach(function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    });
})();

function toggleVideoWidget() { }
function closeVideoWidget() { }

// 2. HTML5 Canvas Interactive Particles
const canvas = document.getElementById('bgCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    // Get mouse position
    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 80) * (canvas.width / 80)
    };

    window.addEventListener('mousemove',
        function (event) {
            mouse.x = event.x;
            mouse.y = event.y;
        }
    );

    // Create particle
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        // Method to draw individual particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#06b6d4'; // Cyan base
            ctx.fill();
        }
        // Check particle position, check mouse position, move the particle, draw the particle
        update() {
            // Check if particle is still within canvas
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Check collision detection - mouse position / particle position
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 2;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 2;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 2;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 2;
                }
            }
            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            // Draw particle
            this.draw();
        }
    }

    // Create particle array
    function initCanvas() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 3) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;
            let color = '#06b6d4';

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Check if particles are close enough to draw line between them
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                    + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 15) * (canvas.height / 15)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(6, 182, 212,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    // Resize event
    window.addEventListener('resize',
        function () {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            mouse.radius = ((canvas.height / 80) * (canvas.height / 80));
            initCanvas();
        }
    );

    // Mouse out event
    window.addEventListener('mouseout',
        function () {
            mouse.x = undefined;
            mouse.y = undefined;
        }
    );

    initCanvas();
    animate();
}

// =============================================
// NUEVAS FUNCIONALIDADES - JAVASCRIPT
// =============================================

// 1. COMPARADOR DE PROPIEDADES
function updateComparador() {
    var a = parseInt(document.getElementById('cmp-a').value);
    var b = parseInt(document.getElementById('cmp-b').value);
    var grid = document.getElementById('comparadorGrid');
    if (!grid) return;
    if (typeof CARDS === 'undefined') return;

    var rows = [
        { label: 'Precio / Mensualidad', key: 'price' },
        { label: 'Recámaras', key: 'beds' },
        { label: 'Baños', key: 'baths' },
        { label: 'Amenidad Principal', key: 'amenity' },
        { label: 'Descripción', key: 'desc' }
    ];

    function buildCard(n) {
        var d = CARDS[n];
        var imgs = { 1: 'img_cancun.png', 2: 'img_merida.png', 3: 'img_tulum.png' };
        var rowsHtml = rows.map(function (r) {
            return '<div class="comp-row"><span class="comp-label">' + r.label + '</span><span class="comp-value">' + d[r.key] + '</span></div>';
        }).join('');
        return '<div class="comp-card"><img src="' + imgs[n] + '" alt="' + d.title + '"><div class="comp-body"><h3>' + d.title + '</h3><span style="display:inline-block;background:rgba(99,102,241,0.2);color:#a78bfa;padding:3px 10px;border-radius:50px;font-size:0.8rem;margin-bottom:1rem;">' + d.badge + '</span>' + rowsHtml + '<button class="submit-btn comp-btn" onclick="showCard(' + n + ')">Ver Detalles</button></div></div>';
    }

    grid.innerHTML = buildCard(a) + buildCard(b);
}

// 2. SIMULADOR DE PLUSVALÍA
function calcPlusvalia() {
    var precio = parseFloat(document.getElementById('pv-precio').value) || 0;
    var tasa = parseFloat(document.getElementById('pv-zona').value) / 100;
    var years = parseInt(document.getElementById('pv-years').value) || 5;
    var chart = document.getElementById('pvChart');
    var summary = document.getElementById('pvSummary');
    if (!chart || !summary) return;

    if (!precio || precio < 1000) {
        summary.innerHTML = '<p style="color:var(--text-muted);">Introduce el precio de tu propiedad para ver la proyección</p>';
        chart.innerHTML = '';
        return;
    }

    // Generar datos por año
    var data = [];
    var maxVal = 0;
    for (var i = 1; i <= years; i++) {
        var val = precio * Math.pow(1 + tasa, i);
        data.push({ year: 'Año ' + i, val: val });
        if (val > maxVal) maxVal = val;
    }

    // Generar barras
    chart.innerHTML = data.map(function (d) {
        var pct = (d.val / maxVal) * 100;
        var fmt = d.val >= 1000000 ? (d.val / 1000000).toFixed(2) + 'M' : (d.val / 1000).toFixed(0) + 'K';
        return '<div class="pv-bar-wrap"><div class="pv-bar" style="height:' + pct + '%;"></div><div class="pv-bar-label">' + d.year + '<br>$' + fmt + '</div></div>';
    }).join('');

    var finalVal = data[data.length - 1].val;
    var ganancia = finalVal - precio;
    var formatMXN = function (n) { return '$' + Math.round(n).toLocaleString('es-MX'); };
    summary.innerHTML = '<span class="pv-highlight">' + formatMXN(finalVal) + '</span><span class="pv-sub">Valor proyectado en ' + years + ' año(s)</span><div style="margin-top:0.8rem;padding:0.8rem;background:rgba(16,185,129,0.1);border-radius:8px;"><strong style="color:#10b981;">+' + formatMXN(ganancia) + '</strong> <span style="color:var(--text-muted);">de plusvalía estimada</span></div>';
}

// 3. MAPA INTERACTIVO
var LOCATIONS = [
    {
        name: '🏙️ Depas Cancún Centro',
        desc: 'Zona turística y comercial premium. A 15 min de la playa. Acceso a todas las avenidas principales.',
        url: 'https://maps.google.com/maps?q=Cancun+Centro,Quintana+Roo,Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed',
        card: 1
    },
    {
        name: '🏡 Casas Norte Mérida',
        desc: 'La zona de mayor plusvalía en Yucatán. Colonias modernas con todos los servicios y escuelas top.',
        url: 'https://maps.google.com/maps?q=Norte+Merida,Yucatan,Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed',
        card: 2
    },
    {
        name: '🌿 Villas Tulum',
        desc: 'En la selva maya a 5 min del cenote más famoso. Alta plusvalía garantizada por el boom turístico.',
        url: 'https://maps.google.com/maps?q=Tulum,Quintana+Roo,Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed',
        card: 3
    }
];
function selectLocation(i) {
    var loc = LOCATIONS[i];
    document.getElementById('mapaFrame').src = loc.url;
    var info = document.getElementById('mapaInfo');
    if (info) info.innerHTML = '<h3>' + loc.name + '</h3><p>' + loc.desc + '</p><button class="submit-btn" onclick="showCard(' + loc.card + ')">Ver Propiedad</button>';
    document.querySelectorAll('.mapa-pin').forEach(function (p, idx) {
        p.classList.toggle('active', idx === i);
    });
}

// 4. TEMPORIZADOR DE OFERTA
function startOfferTimer() {
    // Countdown persistente usando localStorage
    var stored = localStorage.getItem('offerEndTime');
    var endTime;
    if (stored) {
        endTime = parseInt(stored);
        if (endTime < Date.now()) {
            // Resetea si ya expiró
            endTime = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem('offerEndTime', endTime);
        }
    } else {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('offerEndTime', endTime);
    }

    var timerEl = document.getElementById('ofertaTimer');
    var display = document.getElementById('timerDisplay');
    if (timerEl) setTimeout(function () { timerEl.style.display = 'block'; }, 3000);

    function tick() {
        var remaining = endTime - Date.now();
        if (remaining <= 0) remaining = 0;
        var h = Math.floor(remaining / 3600000);
        var m = Math.floor((remaining % 3600000) / 60000);
        var s = Math.floor((remaining % 60000) / 1000);
        if (display) display.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    }
    function pad(n) { return n < 10 ? '0' + n : n; }
    tick();
    setInterval(tick, 1000);
}
startOfferTimer();

// 5. CONTADOR DE VISITANTES (SOCIAL PROOF)
function startVisitorsCounter() {
    var el = document.getElementById('visitorsAlert');
    var textEl = document.getElementById('visitorsText');
    if (!el || !textEl) return;

    var msgs = [
        '🔴 <strong>3 personas</strong> están viendo Cancún ahora',
        '🟡 <strong>5 interesados</strong> revisando Tulum hoy',
        '🟢 <strong>2 personas</strong> calculando su crédito ahora',
        '🔴 <strong>7 personas</strong> consultaron Mérida esta hora',
        '🟡 <strong>Alguien de CDMX</strong> acaba de agendar una cita'
    ];
    var i = 0;

    setTimeout(function () {
        el.style.display = 'block';
        textEl.innerHTML = msgs[0];
        setInterval(function () {
            i = (i + 1) % msgs.length;
            el.style.opacity = '0';
            setTimeout(function () {
                textEl.innerHTML = msgs[i];
                el.style.opacity = '1';
            }, 400);
        }, 8000);
    }, 6000);
}
startVisitorsCounter();

// 6. EXIT INTENT POPUP
(function () {
    var shown = false;
    document.addEventListener('mouseleave', function (e) {
        if (e.clientY <= 10 && !shown) {
            shown = true;
            var popup = document.getElementById('exitPopup');
            if (popup) {
                popup.style.display = 'flex';
                // Ocultar el timer durante el popup para que no se superponga
                var timer = document.getElementById('ofertaTimer');
                if (timer) timer.style.display = 'none';
            }
        }
    });
})();

// 7. GALERÍA MULTI-FOTO EN MODAL (via CARDS extendidos con fotos extra)
// Esta función permite avanzar la imagen del modal si hubiera galería
var GALLERY_IDX = 0;
var GALLERY_IMGS = [];
function modalNextImg() {
    if (!GALLERY_IMGS.length) return;
    GALLERY_IDX = (GALLERY_IDX + 1) % GALLERY_IMGS.length;
    var img = document.getElementById('pmMainImg');
    if (img) img.src = GALLERY_IMGS[GALLERY_IDX];
}
function modalPrevImg() {
    if (!GALLERY_IMGS.length) return;
    GALLERY_IDX = (GALLERY_IDX - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length;
    var img = document.getElementById('pmMainImg');
    if (img) img.src = GALLERY_IMGS[GALLERY_IDX];
}

// Init comparador on load
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(updateComparador, 500);
});

// =============================================
// MOBILE TOUCH FIX: Myth flip cards
// CSS :hover no funciona en pantallas táctiles.
// Agregamos soporte de clic/toque para voltear las tarjetas.
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.myth-card').forEach(function (card) {
        card.addEventListener('click', function () {
            // Toggle active class para el flip
            card.classList.toggle('flipped');
        });
    });
});

