// === SCRIPT PRINCIPAL - VERSION SIMPLIFICADA ===

console.log("🚀 Iniciando script...");

// Obtener elemento de forma segura
function getEl(id) {
    var el = document.getElementById(id);
    if (!el) {
        console.warn("No encontrado: " + id);
    }
    return el;
}

// ===================
// CHAT - Inicialización
// ===================
function initChat() {
    console.log("💬 Iniciando chat...");
    
    var chatContainer = getEl("chatMessages");
    if (!chatContainer) {
        console.error("❌ Contenedor de chat no encontrado");
        return false;
    }
    
    // Limpiar
    chatContainer.innerHTML = "";
    
    // Idioma
    var isEn = (window.currentLang === 'en');
    
    // Mensaje
    var msg = isEn
        ? "Hello! 👋 I'm <strong>Your Expert Friend</strong>, your trusted real estate advisor. <br><br>I'm here to make the paperwork simple. What dream do we want to fulfill today?"
        : "¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario de confianza. <br><br>Estoy aquí para hacer que los trámites sean sencillos. ¿Qué sueño queremos cumplir hoy?";
    
    // Añadir mensaje
    var msgDiv = document.createElement("div");
    msgDiv.className = "message bot";
    msgDiv.innerHTML = msg;
    chatContainer.appendChild(msgDiv);
    
    // Opciones
    var wrapper = document.createElement("div");
    wrapper.className = "options-wrapper";
    wrapper.style.cssText = "display:flex;flex-direction:column;gap:8px;margin-top:10px;opacity:1;";
    
    var opciones = isEn ? [
        "I want to buy a house",
        "I want to combine credits",
        "Know about my points"
    ] : [
        "Quiero comprar una casa",
        "Quiero unir mis puntos",
        "Saber de mis puntos"
    ];
    
    opciones.forEach(function(texto) {
        var btn = document.createElement("button");
        btn.className = "option-btn";
        btn.style.cssText = "padding:10px;background:rgba(255,255,255,0.1);border:1px solid #6366f1;color:white;border-radius:8px;cursor:pointer;text-align:left;";
        btn.textContent = texto;
        
        btn.onclick = function() {
            alert("Seleccionaste: " + texto);
            var userMsg = document.createElement("div");
            userMsg.className = "message user";
            userMsg.textContent = texto;
            chatContainer.appendChild(userMsg);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        };
        
        wrapper.appendChild(btn);
    });
    
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    console.log("✅ Chat iniciado");
    return true;
}

// ===================
// EDITOR - Funciones
// ===================
function showAdminModal() {
    var modal = getEl("adminModal");
    if (modal) {
        modal.classList.add("active");
        var keyInput = getEl("adminKey");
        if (keyInput) keyInput.focus();
    }
}

function handleAdminLogin() {
    var keyInput = getEl("adminKey");
    if (!keyInput) return;
    
    var key = keyInput.value;
    if (key === "7003") {
        enableEditorMode();
        closeAdminModal();
        localStorage.setItem("adminSession", "true");
        alert("🔓 MODO EDITOR ACTIVADO");
    } else {
        alert("❌ Clave incorrecta");
        keyInput.value = "";
    }
}

function closeAdminModal() {
    var modal = getEl("adminModal");
    if (modal) modal.classList.remove("active");
    var keyInput = getEl("adminKey");
    if (keyInput) keyInput.value = "";
}

function enableEditorMode() {
    console.log("🔓 Activando modo editor...");
    window.isAdmin = true;
    document.body.classList.add("editor-mode");
    var toolbar = getEl("adminToolbar");
    if (toolbar) toolbar.style.display = "flex";
    
    if (typeof renderHomeCards === 'function') {
        renderHomeCards();
    }
}

function disableEditorMode() {
    console.log("🔒 Desactivando modo editor...");
    window.isAdmin = false;
    document.body.classList.remove("editor-mode");
    var toolbar = getEl("adminToolbar");
    if (toolbar) toolbar.style.display = "none";
    localStorage.removeItem("adminSession");
    location.reload();
}

// ===================
// ACCESO AL EDITOR
// ===================
function setupEditorAccess() {
    var logo = document.querySelector(".logo");
    if (!logo) {
        console.warn("Logo no encontrado");
        return;
    }
    
    logo.style.cursor = "pointer";
    logo.title = "Doble clic para modo editor";
    
    var lastClick = 0;
    
    logo.addEventListener("click", function(e) {
        var now = new Date().getTime();
        if (now - lastClick < 300) {
            e.preventDefault();
            var key = prompt("Clave de administrador:", "");
            if (key === "7003") {
                enableEditorMode();
            } else if (key !== null) {
                alert("❌ Clave incorrecta");
            }
        }
        lastClick = now;
    });
}

// ===================
// INICIALIZACIÓN
// ===================
document.addEventListener("DOMContentLoaded", function() {
    console.log("📄 DOM listo");
    
    // Iniciar chat
    setTimeout(initChat, 500);
    
    // Configurar acceso editor
    setupEditorAccess();
    
    // Verificar sesión previa
    if (localStorage.getItem("adminSession") === "true") {
        enableEditorMode();
    }
});

// Funciones globales
window.initChat = initChat;
window.showAdminModal = showAdminModal;
window.handleAdminLogin = handleAdminLogin;
window.closeAdminModal = closeAdminModal;
window.enableEditorMode = enableEditorMode;
window.disableEditorMode = disableEditorMode;

console.log("✅ Script cargado");