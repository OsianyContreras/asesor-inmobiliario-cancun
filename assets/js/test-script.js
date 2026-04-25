// Simple test script to verify functionality
console.log("🧪 Test script loading");

// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM loaded");
    
    // Add test buttons if they don't exist
    if (!document.getElementById('test-chat-btn')) {
        const chatBtn = document.createElement('button');
        chatBtn.id = 'test-chat-btn';
        chatBtn.textContent = '💬 Probar Chat';
        chatBtn.style.position = 'fixed';
        chatBtn.style.bottom = '20px';
        chatBtn.style.left = '20px';
        chatBtn.style.zIndex = '999999';
        chatBtn.style.background = '#10b981';
        chatBtn.style.color = 'white';
        chatBtn.style.border = 'none';
        chatBtn.style.padding = '12px 20px';
        chatBtn.style.borderRadius = '8px';
        chatBtn.style.cursor = 'pointer';
        chatBtn.style.fontSize = '16px';
        chatBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        document.body.appendChild(chatBtn);
        
        chatBtn.onclick = function() {
            // Create simple chat interface
            const chatContainer = document.createElement('div');
            chatContainer.id = 'test-chat-container';
            chatContainer.style.position = 'fixed';
            chatContainer.style.bottom = '80px';
            chatContainer.style.right = '20px';
            chatContainer.style.width = '320px';
            chatContainer.style.height = '400px';
            chatContainer.style.background = '#0f172a';
            chatContainer.style.border = '2px solid #6366f1';
            chatContainer.style.borderRadius = '12px';
            chatContainer.style.zIndex = '999999';
            chatContainer.style.color = 'white';
            chatContainer.style.fontFamily = 'Arial, sans-serif';
            chatContainer.style.display = 'flex';
            chatContainer.style.flexDirection = 'column';
            chatContainer.style.overflow = 'hidden';
            
            // Header
            const header = document.createElement('div');
            header.style.background = '#1e293b';
            header.style.padding = '12px 16px';
            header.style.borderBottom = '1px solid #334155';
            header.innerHTML = '<h3 style="margin:0;font-size:18px;">💬 Tu Amigo Experto</h3>';
            chatContainer.appendChild(header);
            
            // Messages area
            const messages = document.createElement('div');
            messages.style.flex = '1';
            messages.style.overflowY = 'auto';
            messages.style.padding = '16px';
            messages.style.display = 'flex';
            messages.style.flexDirection = 'column';
            messages.style.gap = '12px';
            
            // Welcome message
            const welcome = document.createElement('div');
            welcome.style.background = '#334155';
            welcome.style.padding = '12px 16px';
            welcome.style.borderRadius = '18px';
            welcome.style.maxWidth = '80%';
            welcome.innerHTML = '¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario de confianza. <br><br>Estoy aquí para hacer que los trámites sean sencillos. ¿Qué sueño queremos cumplir hoy?';
            messages.appendChild(welcome);
            
            // Options container
            const options = document.createElement('div');
            options.style.display = 'flex';
            options.style.flexDirection = 'column';
            options.style.gap = '8px';
            options.style.margin = '0 16px 16px 16px';
            
            const optionTexts = [
                "Quiero comprar una casa",
                "Quiero unir mis puntos", 
                "Saber de mis puntos"
            ];
            
            optionTexts.forEach(text => {
                const btn = document.createElement('button');
                btn.textContent = text;
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.border = '1px solid #6366f1';
                btn.style.color = 'white';
                btn.style.padding = '12px 16px';
                btn.style.borderRadius = '8px';
                btn.style.cursor = 'pointer';
                btn.style.textAlign = 'left';
                btn.style.fontSize = '14px';
                btn.onclick = function() {
                    alert('Seleccionaste: ' + text);
                    // Add user message to chat
                    const userMsg = document.createElement('div');
                    userMsg.style.background = '#6366f1';
                    userMsg.style.color = 'white';
                    userMsg.style.padding = '10px 14px';
                    userMsg.style.borderRadius = '18px';
                    userMsg.style.maxWidth = '70%';
                    userMsg.style.alignSelf = 'flex-end';
                    userMsg.textContent = text;
                    messages.appendChild(userMsg);
                    messages.scrollTop = messages.scrollHeight;
                };
                options.appendChild(btn);
            });
            
            chatContainer.appendChild(messages);
            chatContainer.appendChild(options);
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Cerrar';
            closeBtn.style.background = 'rgba(239,68,68,0.8)';
            closeBtn.style.border = 'none';
            closeBtn.style.color = 'white';
            closeBtn.style.padding = '8px 12px';
            closeBtn.style.borderRadius = '6px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.margin = '0 12px 12px 12px';
            closeBtn.style.alignSelf = 'flex-end';
            closeBtn.onclick = function() {
                chatContainer.remove();
            };
            chatContainer.appendChild(closeBtn);
            
            document.body.appendChild(chatContainer);
        };
    }
    
    // Add editor test button
    if (!document.getElementById('test-editor-btn')) {
        const editorBtn = document.createElement('button');
        editorBtn.id = 'test-editor-btn';
        editorBtn.textContent = '🔧 Probar Editor';
        editorBtn.style.position = 'fixed';
        editorBtn.style.bottom = '20px';
        editorBtn.style.left = '80px';
        editorBtn.style.zIndex = '999999';
        editorBtn.style.background = '#6366f1';
        editorBtn.style.color = 'white';
        editorBtn.style.border = 'none';
        editorBtn.style.padding = '12px 20px';
        editorBtn.style.borderRadius = '8px';
        editorBtn.style.cursor = 'pointer';
        editorBtn.style.fontSize = '16px';
        editorBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        document.body.appendChild(editorBtn);
        
        editorBtn.onclick = function() {
            // Try to open the real admin modal
            const adminModal = document.getElementById('adminModal');
            if (adminModal) {
                adminModal.classList.add('active');
                const keyInput = document.getElementById('adminKey');
                if (keyInput) keyInput.focus();
                alert('Modal de editor abierto. Usa la clave: 7003');
            } else {
                // Create simple test modal
                alert('Intentando abrir modo editor...\n\nSi tienes el logo de la casita visible, intenta hacer DOBLE CLIC rápido en él para activar el modo editor.\n\nLa clave es: 7003');
            }
        };
    }
    
    console.log("✅ Test buttons added");
});

// Also test direct access
window.testChat = function() {
    alert('Función testChat disponible en consola');
};
window.testEditor = function() {
    alert('Función testEditor disponible en consola');
};