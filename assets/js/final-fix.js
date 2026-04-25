// === FIX DEFINITIVO PARA CHAT Y MODO EDITOR ===
// Este archivo debe reemplazar la sección problemática de script.js

// 1. Aseguramos que los elementos estén disponibles
function safeGetElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Elemento '${id}' no encontrado en el DOM`);
    }
    return el;
}

// 2. Inicialización segura del chat
function initChatFixed() {
    console.log("🚀 Inicializando chat...");
    
    const chatContainer = safeGetElement('chatMessages');
    if (!chatContainer) {
        console.error("❌ No se encontró el contenedor de chat");
        return;
    }
    
    // Limpiar contenido previo
    chatContainer.innerHTML = '';
    
    // Determinar idioma
    const isEn = (window.currentLang === 'en');
    
    // Mensaje de bienvenida
    const welcomeMsg = isEn
        ? "Hello! 👋 I'm <strong>Your Expert Friend</strong>, your trusted real estate advisor. <br><br>I'm here to make the paperwork simple. What dream do we want to fulfill today?"
        : "¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario de confianza. <br><br>Estoy aquí para hacer que los trámites sean sencillos. ¿Qué sueño queremos cumplir hoy?";
    
    // Añadir mensaje de bienvenida
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message bot';
    welcomeDiv.innerHTML = welcomeMsg;
    chatContainer.appendChild(welcomeDiv);
    
    // Crear contenedor de opciones
    const optionsWrapper = document.createElement('div');
    optionsWrapper.className = 'options-wrapper';
    optionsWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 10px; opacity: 1 !important;';
    
    // Definir opciones según idioma
    const options = isEn ? [
        { text: "I want to buy a house", action: "BUY" },
        { text: "I want to combine credits", action: "UNAMOS" },
        { text: "Know about my points", action: "EXPLAIN_POINTS" }
    ] : [
        { text: "Quiero comprar una casa", action: "BUY" },
        { text: "Quiero unir mis puntos", action: "UNAMOS" },
        { text: "Saber de mis puntos", action: "EXPLAIN_POINTS" }
    ];
    
    // Crear botones de opción
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.cssText = 'padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid #6366f1; color: white; border-radius: 8px; cursor: pointer; text-align: left;';
        if (opt.primary) {
            btn.style.background = 'rgba(16,185,129,0.3)';
        }
        
        btn.textContent = opt.text;
        
        // Manejar clic
        btn.onclick = function() {
            // Añadir mensaje de usuario
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.textContent = opt.text;
            chatContainer.appendChild(userMsg);
            
            // Deshabilitar botones visualmente
            optionsWrapper.style.opacity = '0.5';
            optionsWrapper.style.pointerEvents = 'none';
            
            // Scroll al fondo
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            alert('Seleccionaste: ' + opt.text);
        };
        
        optionsWrapper.appendChild(btn);
    });
    
    chatContainer.appendChild(optionsWrapper);
    
    // Asegurar scroll al final
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
    
    console.log("✅ Chat inicializado correctamente");
}

// 3. Función para activar modo editor
function enableEditorModeFixed() {
    console.log("🔓 Activando modo editor...");
    
    // Marcar como admin
    window.isAdmin = true;
    
    // Añadir clase al body
    document.body.classList.add('editor-mode');
    
    // Mostrar toolbar
    const adminToolbar = safeGetElement('adminToolbar');
    if (adminToolbar) {
        adminToolbar.style.display = 'flex';
    }
    
    // Guardar en sessionStorage
    localStorage.setItem('adminSession', 'true');
    
    // Recargar tarjetas si es necesario
    if (typeof renderHomeCards === 'function') {
        renderHomeCards();
    }
    
    alert("🔓 MODO EDITOR ACTIVADO");
    console.log("✅ Modo editor activado");
}

// 4. Función para desactivar modo editor
function disableEditorModeFixed() {
    console.log("🔒 Desactivando modo editor...");
    
    // Marcar como no admin
    window.isAdmin = false;
    
    // Remover clase del body
    document.body.classList.remove('editor-mode');
    
    // Ocultar toolbar
    const adminToolbar = safeGetElement('adminToolbar');
    if (adminToolbar) {
        adminToolbar.style.display = 'none';
    }
    
    // Limpiar sessionStorage
    localStorage.removeItem('adminSession');
    
    // Recargar página limpia
    location.reload();
}

// 5. Manejo del acceso al modo editor (doble click o largo press)
function setupEditorAccess() {
    console.log("🔧 Configurando acceso al modo editor...");
    
    const logo = document.querySelector('.logo');
    if (!logo) {
        console.error("❌ No se encontró el logo para activar modo editor");
        return;
    }
    
    // Estilo visual
    logo.style.cursor = 'pointer';
    logo.title = 'Haz doble click rápido para entrar al modo editor';
    
    // Variables para detección de doble click
    let lastClick = 0;
    
    // Manejar click
    logo.addEventListener('click', function(e) {
        const now = new Date().getTime();
        const timeSinceLastClick = now - lastClick;
        
        if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
            // Doble click detectado
            e.preventDefault();
            e.stopPropagation();
            
            console.log("⚡ Doble click detectado - activando modo editor");
            
            // Mostrar prompt de clave
            const key = prompt("Ingresa la clave de administrador:", "");
            if (key === "7003") {
                enableEditorModeFixed();
            } else if (key !== null) { // Usuario hizo click en cancelar
                alert("❌ Clave incorrecta");
            }
        }
        
        lastClick = now;
    });
    
    // También soportar tecla de acceso rápido (Ctrl+Shift+E)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            const key = prompt("Ingresa la clave de administrador:", "");
            if (key === "7003") {
                enableEditorModeFixed();
            } else if (key !== null) {
                alert("❌ Clave incorrecta");
            }
        }
    });
    
    console.log("✅ Acceso al modo editor configurado");
}

// 6. Inicialización principal
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM cargado - iniciando aplicación...");
    
    try {
        // Inicializar chat
        initChatFixed();
        
        // Configurar acceso al editor
        setupEditorAccess();
        
        // Verificar si ya hay una sesión activa
        if (localStorage.getItem('adminSession') === 'true') {
            enableEditorModeFixed();
        }
        
        console.log("🎯 Inicialización completada");
    } catch (error) {
        console.error("💥 Error durante la inicialización:", error);
        // Fallback: mostrar notificación
        alert('Error al inicializar la aplicación. Ver consola para detalles.');
    }
});

// Exportar funciones para acceso global
window.initChat = initChatFixed;
window.enableEditorMode = enableEditorModeFixed;
window.disableEditorMode = disableEditorModeFixed;

// Log de carga
console.log("📦 fix-script.js cargado y listo");