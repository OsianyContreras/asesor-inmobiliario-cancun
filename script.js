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

// Bot Logic & Flow
async function botResponse(userMessage, action = null) {
    showTyping();
    chatForm.querySelector('button').disabled = true;
    
    // Simulate thinking delay (1-2 seconds)
    const delay = Math.random() * 1000 + 1000;
    
    setTimeout(() => {
        hideTyping();
        chatForm.querySelector('button').disabled = false;
        userInput.focus();
        
        let responseHTML = "";
        let options = [];

        // Determine response based on state or specific action
        if (action) {
            handleAction(action);
            return;
        }

        const lowerMsg = userMessage.toLowerCase();
        
        // Error handling for off-topic (very basic keyword check)
        const inmoKeywords = ['casa', 'comprar', 'vender', 'infonavit', 'puntos', 'crédito', 'departamento', 'hogar', 'hola', 'buenas'];
        const isRelated = inmoKeywords.some(kw => lowerMsg.includes(kw)) || currentUserState === 'START';

        if (!isRelated && lowerMsg.length > 5) {
            addMessage(`Me encantaría ayudarte con eso, pero mi especialidad es cumplir tu sueño de tener casa propia 🏠🌊. <br><br>¿Volvemos a hablar de tus puntos Infonavit o planes de vivienda?`, 'bot', true);
            return;
        }

        // Main Flow State Machine
        switch (currentUserState) {
            case 'START':
                // Initial greeting already sent, this is in case they just type normally 
                // Let's move them to diagnosis
                responseHTML = `¡Excelente! Para darte la mejor asesoría, cuéntame: ¿Es tu primera vez usando tu crédito o ya conoces un poco sobre cómo funciona el <strong>Infonavit</strong>?`;
                options = [
                    { text: "Empiezo desde cero", action: "ZERO" },
                    { text: "Ya sé mis puntos", action: "KNOW_POINTS" }
                ];
                currentUserState = 'DIAGNOSIS';
                break;
                
            case 'DIAGNOSIS':
                // If they type instead of clicking
                responseHTML = `Entiendo perfectamente. En Cancún y en todo México, nosotros agilizamos todos los avalúos y trámites. Tú no te estresas por el papeleo. 😉<br><br>¿Te gustaría que revisemos tu situación exacta?`;
                options = [
                    { text: "Sí, me interesa", action: "LEAD", primary: true },
                    { text: "Quiero saber más de Unamos Créditos", action: "UNAMOS" }
                ];
                currentUserState = 'VALUE_PROP';
                break;

            case 'VALUE_PROP':
                responseHTML = `Para darte el monto exacto y trazar el mejor plan para ti, ¿te gustaría que agendemos una llamada o prefieres registrarte para que analicemos tu caso hoy mismo? 📈`;
                options = [
                    { text: "Dejar mis datos (Recomendado)", action: "LEAD", primary: true }
                ];
                currentUserState = 'CAPTURE';
                break;
                
            default:
                responseHTML = `¡Siempre estoy aquí para ayudarte! Si quieres que revisemos tu caso a detalle, solo avísame.`;
                options = [
                    { text: "Agendar asesoría gratuita", action: "LEAD", primary: true }
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
            responseHTML = `¡Qué emoción! 🏠 Comprar casa es una gran decisión. Primero, necesitamos saber con qué contamos. Si no tienes los puntos suficientes ahora mismo, ¡no te preocupes! <strong>Vamos a trazar un plan para que llegues a la meta.</strong>`;
            options = [
                { text: "¿Qué es el sistema de puntos?", action: "EXPLAIN_POINTS" },
                { text: "Ya tengo mis puntos", action: "VALUE_PROP_JUMP" }
            ];
            currentUserState = 'DIAGNOSIS';
            break;
            
        case "SELL":
            responseHTML = `Vender una propiedad requiere seguridad y rapidez. 🤝 Nosotros gestionamos ventas de terceros de forma segura, nos encargamos de los trámites y avalúos para que a ti te paguen rápido y sin estrés.`;
             options = [
                { text: "Agendar análisis de mi propiedad", action: "LEAD", primary: true }
            ];
            currentUserState = 'CAPTURE';
            break;

        case "EXPLAIN_POINTS":
            responseHTML = `Te lo explico súper fácil: el Infonavit te pide 1,080 puntos para prestarte. Estos puntos se juntan con tu edad, tu sueldo y el ahorro que tienes en tu <strong>Subcuenta de Vivienda</strong> (un dinero tuyo que tu patrón guarda). No es un trámite aburrido, es tu llave 🔑 para tu casa.`;
            options = [
                { text: "¡Entendido! ¿Qué sigue?", action: "VALUE_PROP_JUMP" },
                { text: "¿Puedo juntar puntos con alguien?", action: "UNAMOS" }
            ];
            break;

        case "UNAMOS":
            responseHTML = `¡Claro que sí! Con <strong>Unamos Créditos</strong> puedes juntar tus puntos con tu pareja (sin estar casados), amigos o familiares. Así alcanzan una casa más grande o mejor ubicada, ¡especialmente aquí en la Riviera Maya! 🌊`;
            options = [
                { text: "Hacer un plan juntos", action: "LEAD", primary: true }
            ];
            currentUserState = 'CAPTURE';
            break;

        case "VALUE_PROP_JUMP":
            responseHTML = `Perfecto. Recuerda que con nosotros todo es más fácil. En Cancún y a nivel nacional, <strong>nosotros agilizamos los avalúos y el papeleo</strong>. Te guiamos hasta la Escrituración sin que te duela la cabeza. 🧠✨`;
            options = [
                { text: "Me interesa, quiero ver mi caso", action: "LEAD", primary: true }
            ];
            currentUserState = 'CAPTURE';
            break;

        case "LEAD":
            responseHTML = `¡Excelente decisión! 🚀 Para darte el monto exacto y la mejor atención, ¿te gustaría dejarnos tus datos y nos comunicamos contigo hoy mismo? <br><br><em>(Tranquilo, no pediremos tu NSS por aquí, eso se ve después de manera segura).</em>`;
            options = [
                { text: "📝 Abrir formulario seguro", action: "OPEN_MODAL", primary: true }
            ];
            currentUserState = 'CAPTURE';
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
                { text: "Quiero vender mi casa", action: "SELL" },
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
    // In a real app, send data to backend here.
    
    leadForm.style.display = 'none';
    successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        closeLeadModal();
        addMessage("¡He recibido tus datos! 🎉 Me pondré en contacto contigo por WhatsApp muy pronto para empezar a trabajar en tu plan.", "bot");
    }, 3000);
}

// Reset Chat manually
function resetChat() {
    initChat();
}

// Start
document.addEventListener('DOMContentLoaded', initChat);
