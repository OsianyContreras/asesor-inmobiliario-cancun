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

// Base de conocimientos (Simulador de NLP Expandido)
const knowledgeBase = [
    {
        intent: "comprar",
        keywords: ["comprar", "adquirir", "casa", "departamento", "hogar", "propiedad", "vivienda", "quiero una casa"],
        response: `¡Qué gran paso! 🏠 Comprar casa es una decisión importante. En "Tu Amigo Experto" te llevamos de la mano en todo el proceso. ¿Ya sabes si cuentas con los 1080 puntos de crédito?`,
        options: [
            { text: "Sí, ya los tengo", action: "VALUE_PROP_JUMP" },
            { text: "No sé cómo verlos", action: "EXPLAIN_POINTS" }
        ]
    },
    {
        intent: "unir",
        keywords: ["unir", "juntar", "pareja", "esposo", "esposa", "amigo", "familiar", "unamos", "sumar"],
        response: `¡Claro que sí! Con <strong>Unamos Créditos</strong> puedes juntar tus puntos Infonavit con quien tú quieras (incluso sin estar casados). Así alcanzan algo mucho mejor, ¡especialmente en Cancún y la Riviera Maya! 🌊`,
        options: [
            { text: "Hacer un plan juntos", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "puntos",
        keywords: ["puntos", "saber", "checar", "cuantos", "1080", "1,080", "precalificación"],
        response: `Te lo explico súper fácil: el Infonavit te pide 1,080 puntos mínimos para prestarte. Estos se juntan con tu edad, tu sueldo y el ahorro de tu <strong>Subcuenta de Vivienda</strong>. No te preocupes si no sabes cuántos tienes, ¡yo te ayudo a revisarlo sin costo! 🔑`,
        options: [
            { text: "Revisar mis puntos gratis", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "vender",
        keywords: ["vender", "venta", "ofrecer", "traspasar", "mi casa"],
        response: `Vender una propiedad requiere seguridad y rapidez. 🤝 Nosotros gestionamos ventas de terceros de forma 100% segura. Nos encargamos de los trámites y avalúos para que a ti te paguen rápido y sin estrés. ¿Dónde se ubica tu propiedad?`,
        options: [
            { text: "Agendar análisis comercial", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "requisitos",
        keywords: ["requisitos", "papeles", "documentos", "tramite", "papeleo", "necesito", "que piden", "documentacion"],
        response: `¡Cero estrés con el papeleo! 📋 Básico necesitamos tu identificación (INE), acta de nacimiento, CURP y RFC. Pero honestamente, <strong>nosotros nos encargamos de todo el trámite pesado y los avalúos</strong> para que tú solo disfrutes el resultado.`,
        options: [
            { text: "Empezar ahora", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "ubicacion",
        keywords: ["cancun", "mexico", "riviera", "playa", "sur", "norte", "donde", "ubicacion", "estados", "ciudad"],
        response: `¡Tenemos cobertura a nivel nacional! 🇲🇽 Pero somos grandes especialistas en el <strong>Caribe Mexicano (Cancún, Playa del Carmen, Tulum)</strong>. Tenemos opciones con alberca, escuelas y canchas. ¿Te interesa esta zona o el centro del país?`,
        options: [
            { text: "Dejar mis datos para opciones", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "precio",
        keywords: ["cuanto", "precio", "cuesta", "valor", "dinero", "presupuesto", "barata", "cara", "mensualidad", "pagar"],
        response: `Los precios varían mucho dependiendo de la ubicación y las amenidades (alberca, seguridad, etc.). Lo mejor es que hagamos un esquema basado en lo que el Infonavit (o el banco) te puede prestar, ¡para que las mensualidades te queden súper cómodas! 💸`,
        options: [
            { text: "Calcular mis pagos e interés", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "tiempo",
        keywords: ["tiempo", "tarda", "demora", "rapido", "meses", "dias", "cuando", "entregar"],
        response: `El tiempo es nuestra especialidad ⏱️. Un trámite normal de Infonavit puede tardar de 3 a 6 semanas desde que elegimos la casa hasta la firma de las escrituras. ¡Nosotros aceleramos los avalúos para que te mudes lo antes posible!`,
        options: [
            { text: "Agendar llamada para iniciar", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "cofinavit",
        keywords: ["banco", "bancario", "cofinavit", "tradicional", "prestamo extra", "mas dinero"],
        response: `¡Excelente pregunta! Si el crédito del Infonavit no es suficiente, podemos usar la modalidad <strong>Cofinavit</strong>, donde el Infonavit pone una parte y un Banco pone el resto. Así puedes acceder a casas de mayor valor sin problema. 🏦`,
        options: [
            { text: "Analizar viabilidad bancaria", action: "LEAD", primary: true }
        ]
    },
    {
        intent: "saludo",
        keywords: ["hola", "buenas", "buen dia", "saludos", "que tal", "asesor"],
        response: `¡Hola de nuevo! 👋 Aquí sigo, listo para guiarte. Dime, ¿en qué etapa de tu sueño inmobiliario te encuentras ahora mismo?`,
        options: [
            { text: "Quiero comprar", action: "BUY" },
            { text: "Quiero unir mis puntos", action: "UNAMOS" }
        ]
    }
];

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
        for (const kb of knowledgeBase) {
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

            responseHTML = `¡Uy! Me encantaría ayudarte con eso, pero mi especialidad es cumplir tu sueño de tener casa propia o invertir en propiedades. 🏠🌊 <br><br>¿Te gustaría preguntarme sobre precios, requisitos, tiempos, o sobre cómo funcionan tus puntos de crédito?`;
            options = [
                { text: "Hablemos de comprar casa", action: "BUY" },
                { text: "¿Cuáles son los requisitos?", action: "EXPLAIN_POINTS" }
            ];
        }

        addMessage(responseHTML, 'bot', true);
        if (options.length > 0) addOptions(options);

    }, delay);
}

// Handle specific button actions
function handleAction(action) {
    let responseHTML = "";
    let options = [];

    switch (action) {
        case "BUY":
            // Reuse knowledge base content manually for actions
            responseHTML = knowledgeBase.find(kb => kb.intent === "comprar").response;
            options = knowledgeBase.find(kb => kb.intent === "comprar").options;
            break;

        case "SELL":
            responseHTML = knowledgeBase.find(kb => kb.intent === "vender").response;
            options = knowledgeBase.find(kb => kb.intent === "vender").options;
            break;

        case "EXPLAIN_POINTS":
            responseHTML = knowledgeBase.find(kb => kb.intent === "puntos").response;
            options = knowledgeBase.find(kb => kb.intent === "puntos").options;
            break;

        case "UNAMOS":
            responseHTML = knowledgeBase.find(kb => kb.intent === "unir").response;
            options = knowledgeBase.find(kb => kb.intent === "unir").options;
            break;

        case "KNOW_POINTS":
        case "VALUE_PROP_JUMP":
            responseHTML = `¡Perfecto! Vas un paso adelante. Recuerda que con nosotros todo es más fácil. En Cancún y a nivel nacional, <strong>nosotros agilizamos los avalúos y el papeleo</strong>. Te guiamos hasta la Escrituración sin que te duela la cabeza. 🧠✨`;
            options = [
                { text: "Me interesa, agendar llamada", action: "LEAD", primary: true }
            ];
            break;

        case "LEAD":
            responseHTML = `¡Excelente decisión! 🚀 Para darte el monto exacto y la mejor atención personalizada, ¿te gustaría dejarnos tus datos y nos comunicamos contigo hoy mismo por WhatsApp? <br><br><em>(Tranquilo, no pediremos tu NSS por aquí, eso se revisa después de manera súper segura).</em>`;
            options = [
                { text: "📝 Abrir formulario seguro", action: "OPEN_MODAL", primary: true }
            ];
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

// Init Chat
function initChat() {
    chatMessages.innerHTML = '';
    currentUserState = 'START';

    setTimeout(() => {
        addMessage(`¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario de confianza. <br><br>Estoy aquí para hacer que los trámites sean sencillos. ¿Qué sueño queremos cumplir hoy?`, 'bot', true);

        setTimeout(() => {
            addOptions([
                { text: "Quiero comprar una casa", action: "BUY" },
                { text: "Quiero unir mis puntos", action: "UNAMOS" },
                { text: "Saber de mis puntos", action: "EXPLAIN_POINTS" }
            ]);
        }, 500);
    }, 500);
}

// Modal Logic
function openLeadModal() {
    leadModal.classList.add('active');
    successMessage.classList.add('hidden');
    leadForm.style.display = 'block';
    leadForm.reset();
}

function closeLeadModal() {
    leadModal.classList.remove('active');
}

function submitLead(e) {
    e.preventDefault();

    // Cambiar texto del botón a "Enviando..."
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Conectando con WhatsApp...";
    submitBtn.disabled = true;

    // Obtener los datos del formulario
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const interestSelect = document.getElementById('interest');
    const interestText = interestSelect.options[interestSelect.selectedIndex].text;

    // Número al que llegará el mensaje
    const whatsappNumber = "529983008729";

    // Crear el mensaje pre-llenado
    const message = `¡Hola Tu Amigo Experto! 👋\n\nSoy *${name}* y me gustaría agendar una asesoría gratuita.\n\nMi número de contacto es: ${phone}\n\nMe interesa: *${interestText}*.\n\n¡Espero tu mensaje!`;
    const encodedMessage = encodeURIComponent(message);

    // Intenta usar la API universal (a veces evade el QR en móviles, pero en desktop Web siempre pedirá inicio de sesión)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    // Mostrar mensaje de éxito en la web
    leadForm.style.display = 'none';
    successMessage.classList.remove('hidden');

    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
        closeLeadModal();
        addMessage(`¡Te he redirigido a WhatsApp, ${name}! 🎉 En cuanto le des a "Enviar" en tu aplicación, nos llegará tu mensaje para empezar a analizar tu plan.`, "bot");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Reset Chat manually
function resetChat() {
    initChat();
}

// Start
document.addEventListener('DOMContentLoaded', initChat);
