/**
 * APP MASTER SCRIPT - CHAPARRA CMS EDITION
 * This file contains all the application logic, including admin features, 
 * property management, chat, and persistence.
 */

window.AppConfig = window.AppConfig || { propertyDataBilingual: { es: {}, en: {} } };

const MASTER_AMENITIES = [
    "Alberca", "Gimnasio", "Seguridad 24/7", "Elevador", "Estacionamiento", 
    "Roof Garden", "Cancha de Padel", "Área Infantil", "Jacuzzi", 
    "Playa Privada", "Club de Playa", "Coworking", "Pet Friendly", 
    "Cisterna", "Aire Central", "Business Center", "Área de BBQ", 
    "Jardines", "Sala de Fiestas", "Smart Home", "Escuelas", "SuperMercados",
    "Sala", "Comedor", "Patio de Servicio", "Bodega", "Cocina Integral", "Terraza", "Vestidor"
];


const MASTER_CONCEPTS = [
    "Lujo", "Eco-chic", "Inversión", "Familiar", "Residencial", 
    "Interés Social", "Cerca de Playa", "Zona Hotelera", "Centro", 
    "Plusvalía Alta", "Retorno Garantizado"
];

// --- INITIALIZATION ---

async function initApp() {
    console.log("🚀 Initializing App...");
    
    // Default: Hide Admin UI
    const btn = document.getElementById('masterAdminAddBtn');
    if (btn) btn.style.display = 'none';
    
    // 1. Load config.json
    try {
        const resp = await fetch('config/config.json');
        if (resp.ok) {
            const data = await resp.json();
            window.AppConfig = data;
            console.log("✅ Master Config loaded from JSON");
        }
    } catch (e) { console.warn("⚠️ config.json not found, using global config.js"); }

    // 2. Load session data (localStorage)
    const saved = localStorage.getItem('savedProperties');
    if (saved) {
        try {
            const local = JSON.parse(saved);
            if (local.es) Object.assign(window.AppConfig.propertyDataBilingual.es, local.es);
            if (local.en) Object.assign(window.AppConfig.propertyDataBilingual.en, local.en);
            console.log("💾 Local session data merged");
        } catch(e) { console.error("Error parsing local session data", e); }
    }

    // 3. Render
    window.currentLang = 'es';
    window.renderAllProperties();
    window.renderMasterMap();
    setupAdminAccess();
    setupLanguageToggle();
    
    // 4. Plugins
    if (typeof AOS !== 'undefined') AOS.init({ once: true, offset: 50 });
    
    console.log("✨ App Ready");
}

// --- RENDERING ENGINE ---

window.renderAllProperties = function() {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const props = window.AppConfig.propertyDataBilingual[window.currentLang || 'es'];
    for (let key in props) {
        renderPropertyCard(props[key], key);
    }
};

function renderPropertyCard(prop, key) {
    const grid = document.getElementById('propertyGrid');
    const card = document.createElement('div');
    card.className = 'prop-card glass-panel';
    card.setAttribute('data-aos', 'fade-up');
    card.style.cursor = 'pointer';
    card.onclick = () => window.showPropertyDetails(key);
    
    const img = prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
    
    card.innerHTML = `
        <div class="prop-img-wrapper" style="position:relative; height:200px; border-radius:12px; overflow:hidden;">
            <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
            <span class="prop-badge" style="position:absolute; top:12px; right:12px; background:var(--primary); color:white; padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:700;">${prop.badge}</span>
        </div>
        <div class="prop-info" style="padding:20px;">
            <div style="font-size:0.7rem; color:var(--secondary); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:5px;">${prop.propType}</div>
            <h3 style="font-size:1.2rem; margin-bottom:8px; color:white;">${prop.title}</h3>
            <p style="color:var(--primary); font-weight:800; font-size:1.2rem; margin-bottom:15px;">${prop.price}</p>
            <div style="display:flex; gap:15px; font-size:0.85rem; color:var(--text-muted); border-top:1px solid rgba(255,255,255,0.05); padding-top:15px;">
                <span><i class='bx bx-bed'></i> ${prop.beds} Rec.</span>
                <span><i class='bx bx-bath'></i> ${prop.baths} Baños</span>
                <span><i class='bx bx-ruler'></i> ${prop.sqm || 80}m²</span>
            </div>
        </div>
    `;
    grid.appendChild(card);
}

window.switchPropView = function(view) {
    const img = document.getElementById('pmMainImg');
    const thumbs = document.getElementById('pmThumbnails');
    const threed = document.getElementById('threed-container');
    const btnPhotos = document.getElementById('btnShowPhotos');
    const btn360 = document.getElementById('btnShow360');
    
    if (!img || !thumbs) return;

    // Reset styles
    if(btnPhotos) {
        btnPhotos.style.background = 'var(--primary)';
        btnPhotos.style.opacity = '0.5';
    }
    if(btn360) {
        btn360.style.background = 'var(--primary)';
        btn360.style.opacity = '0.5';
    }

    if (view === '360') {
        img.style.display = 'none';
        thumbs.style.display = 'none';
        if(threed) threed.style.display = 'block';
        if(btn360) btn360.style.opacity = '1';
    } else {
        img.style.display = 'block';
        thumbs.style.display = 'grid';
        if(threed) threed.style.display = 'none';
        if(btnPhotos) btnPhotos.style.opacity = '1';
    }
};

window.showPropertyDetails = function(key) {
    const prop = window.AppConfig.propertyDataBilingual.es[key];
    if (!prop) return;
    
    const pm = document.getElementById('propertyModal');
    pm.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // UI Cleanup (in case it was in admin mode)
    const toShow = ['pmBadge','pmTitle','pmPrice','pmDesc','fullAmenitiesDisplay','unitSelector'];
    toShow.forEach(id => { const el = document.getElementById(id); if(el) el.style.display='block'; });
    const feat = document.querySelector('.pm-features'); if(feat) feat.style.display='flex';
    const cta = document.querySelector('.pm-cta'); if(cta) cta.style.display='flex';

    document.getElementById('pmTitle').textContent = prop.title;
    document.getElementById('pmBadge').textContent = prop.badge || prop.delivery;
    document.getElementById('pmPrice').textContent = prop.price;
    
    // Insert Location Info (Link to Master Map)
    const existingLoc = document.getElementById('pmLocationDisplay');
    if (existingLoc) existingLoc.remove();
    const locDiv = document.createElement('div');
    locDiv.id = 'pmLocationDisplay';
    locDiv.style.cssText = 'color:var(--secondary); font-size:0.9rem; font-weight:600; margin-bottom:15px; display:flex; align-items:center; gap:6px; cursor:pointer; transition: 0.3s;';
    locDiv.onmouseover = () => locDiv.style.color = 'var(--primary)';
    locDiv.onmouseout = () => locDiv.style.color = 'var(--secondary)';
    locDiv.onclick = () => {
        window.closePropertyModal();
        setTimeout(() => {
            const masterMapSec = document.getElementById('ubicacion-maestra');
            if (masterMapSec) {
                masterMapSec.scrollIntoView({ behavior: 'smooth' });
                window.selectMasterMapProperty(key);
            }
        }, 300);
    };
    locDiv.innerHTML = `<i class='bx bx-map'></i> <span>${prop.location || ''} ${prop.municipio ? ', ' + prop.municipio : ''} ${prop.estado ? ', ' + prop.estado : ''}</span> <span style="font-size:0.65rem; background:rgba(0,186,163,0.1); padding:2px 6px; border-radius:4px; margin-left:5px;">VER MAPA INTERACTIVO</span>`;
    document.getElementById('pmPrice').parentNode.insertBefore(locDiv, document.getElementById('pmPrice').nextSibling);

    document.getElementById('pmDesc').textContent = prop.desc;

    // --- UNIT / LEVEL SELECTOR ---
    const existingUnits = document.getElementById('unitSelector');
    if (existingUnits) existingUnits.innerHTML = '';
    
    if (prop.units && prop.units.length > 0) {
        const wrapper = document.getElementById('unitSelector');
        if (wrapper) {
            wrapper.style.display = 'block';
            wrapper.innerHTML = `<label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">${prop.propType === 'Departamento' ? 'Selecciona Nivel / Piso' : 'Selecciona Modelo'}</label>`;
            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';
            btnGroup.style.gap = '10px';
            btnGroup.style.flexWrap = 'wrap';
            
            prop.units.forEach((u, idx) => {
                const b = document.createElement('button');
                b.className = 'unit-btn' + (idx === 0 ? ' active' : '');
                b.textContent = u.name;
                b.style.cssText = 'padding:8px 16px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:white; border-radius:8px; cursor:pointer; transition:0.3s; font-size:0.9rem;';
                if(idx === 0) b.style.borderColor = 'var(--primary)';
                
                b.onclick = () => {
                    // Reset others
                    Array.from(btnGroup.children).forEach(el => {
                        el.style.borderColor = 'var(--border-light)';
                        el.classList.remove('active');
                    });
                    b.style.borderColor = 'var(--primary)';
                    b.classList.add('active');
                    
                    // Update Price
                    document.getElementById('pmPrice').textContent = u.price;
                    
                    // Update Extra Perk Display
                    const perkDiv = document.getElementById('pmExtraPerk');
                    if (u.extra) {
                        perkDiv.style.display = 'block';
                        perkDiv.style.animation = 'none'; // reset
                        perkDiv.offsetHeight; // trigger reflow
                        perkDiv.style.animation = 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        perkDiv.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><i class='bx bxs-check-circle' style="color:var(--primary); font-size:1.2rem;"></i> <span>BENEFICIO: <span style="color:var(--primary); text-transform:uppercase;">${u.extra}</span></span></div>`;
                    } else {
                        perkDiv.style.display = 'none';
                    }
                };
                btnGroup.appendChild(b);
            });
            wrapper.appendChild(btnGroup);

            // Create Perk Area if not exists
            let perkDiv = document.getElementById('pmExtraPerk');
            if (!perkDiv) {
                perkDiv = document.createElement('div');
                perkDiv.id = 'pmExtraPerk';
                perkDiv.style.cssText = 'margin:12px 0; padding:12px 16px; background:linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%); border-left:4px solid var(--primary); color:white; font-size:0.9rem; font-weight:700; border-radius:8px; display:none; animation:fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
                document.getElementById('pmPrice').parentNode.insertBefore(perkDiv, document.getElementById('pmPrice').nextSibling);
            }

            // Default state to first unit
            document.getElementById('pmPrice').textContent = prop.units[0].price;
            if (prop.units[0].extra) {
                perkDiv.style.display = 'block';
                perkDiv.style.animation = 'none'; // reset
                perkDiv.offsetHeight; // trigger reflow
                perkDiv.style.animation = 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                perkDiv.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><i class='bx bxs-check-circle' style="color:var(--primary); font-size:1.2rem;"></i> <span>BENEFICIO: <span style="color:var(--primary); text-transform:uppercase;">${prop.units[0].extra}</span></span></div>`;
            } else {
                perkDiv.style.display = 'none';
            }
        }
    } else {
        const wrapper = document.getElementById('unitSelector');
        if (wrapper) wrapper.style.display = 'none';
        const perkDiv = document.getElementById('pmExtraPerk');
        if (perkDiv) perkDiv.style.display = 'none';
    }
    
    const featureContainer = document.querySelector('.pm-features');
    featureContainer.innerHTML = `
        <div class="pm-feature"><i class='bx bx-bed'></i><span>${prop.beds} Recámaras</span></div>
        <div class="pm-feature"><i class='bx bx-bath'></i><span>${prop.baths} Baños</span></div>
        <div class="pm-feature"><i class='bx bx-ruler'></i><span>${prop.sqm || 80} m²</span></div>
    `;
    
    // Amenities List
    const existing = document.getElementById('fullAmenitiesDisplay');
    if (existing) existing.remove();
    
    const amenDiv = document.createElement('div');
    amenDiv.id = 'fullAmenitiesDisplay';
    amenDiv.style.marginTop = '25px';
    
    let html = '<h4 style="color:white; margin-bottom:15px; font-size:1rem; border-bottom:1px solid var(--primary); padding-bottom:8px;">AMENIDADES Y CONCEPTO</h4>';
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">';
    if (prop.amenity) {
        prop.amenity.split(',').forEach(a => {
            html += `<div style="font-size:0.9rem; color:var(--text-muted); display:flex; align-items:center; gap:8px;"><i class='bx bx-check-circle' style="color:var(--primary);"></i> ${a.trim()}</div>`;
        });
    }
    html += '</div>';
    amenDiv.innerHTML = html;
    
    const desc = document.getElementById('pmDesc');
    desc.parentNode.insertBefore(amenDiv, desc.nextSibling);

    // --- PROFESSIONAL GALLERY LAYOUT (CLIENT SIDE) ---
    const gallery = pm.querySelector('.prop-gallery');
    gallery.style.background = '#06091a';
    gallery.style.display = 'flex';
    gallery.style.flexDirection = 'column';
    gallery.style.padding = '15px';

    gallery.innerHTML = `
        <div id="pmMainStage" style="width:100%; height:320px; background:#000; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1); position:relative;">
            
            <div class="gallery-toggles" style="position:absolute; top:15px; left:15px; z-index:10; display:flex; gap:8px;">
                <button class="gallery-toggle-btn active" id="btnShowPhotos" onclick="window.switchPropView('photos')" style="background:var(--primary); padding:6px 12px; border-radius:6px; color:white; border:none; cursor:pointer; font-size:0.75rem; display:flex; align-items:center; gap:5px;"><i class='bx bx-images'></i> Fotos</button>
                <button class="gallery-toggle-btn" id="btnShow360" onclick="window.switchPropView('360')" style="background:var(--primary); opacity:0.5; padding:6px 12px; border-radius:6px; color:white; border:none; cursor:pointer; font-size:0.75rem; display:flex; align-items:center; gap:5px;"><i class='bx bx-cube-alt'></i> Vista 360°</button>
            </div>

            <img id="pmMainImg" src="${prop.images && prop.images.length > 0 ? prop.images[0] : ''}" style="width:100%; height:100%; object-fit:contain;">
            
            <div id="threed-container" style="display:none; width:100%; height:100%;">
                <model-viewer id="pmModelViewer" src="" ar ar-modes="webxr scene-viewer quick-look" camera-controls shadow-intensity="1" auto-rotate style="width:100%; height:100%;"></model-viewer>
            </div>

            <div style="position:absolute; bottom:15px; right:15px; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); padding:5px 12px; border-radius:20px; color:white; font-size:0.65rem; font-weight:700; border:1px solid rgba(255,255,255,0.1); pointer-events:none;">
                <i class='bx bx-expand'></i> VISTA HD
            </div>
        </div>

        <div id="pmThumbnails">
            <!-- Thumbs here -->
        </div>
    `;

    // Initialize toggles AFTER gallery is generated
    const pmModelViewer = document.getElementById('pmModelViewer');
    if (pmModelViewer) {
        pmModelViewer.src = prop.model3d || "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
    }

    // Reset to photo view by default
    window.switchPropView('photos');

    const thumbs = document.getElementById('pmThumbnails');
    if (prop.images) {
        prop.images.forEach((img, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'thumb-wrapper' + (idx === 0 ? ' active' : '');
            wrap.innerHTML = `<img src="${img}">`;
            wrap.onclick = () => {
                document.getElementById('pmMainImg').src = img;
                Array.from(thumbs.children).forEach(c => c.classList.remove('active'));
                wrap.classList.add('active');
            };
            thumbs.appendChild(wrap);
        });
    }
};

// --- ADMIN & EDITOR ---

function setupAdminAccess() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.ondblclick = () => document.getElementById('adminModal').classList.add('active');
    }
    
    const btn = document.getElementById('masterAdminAddBtn');
    if (btn) {
        btn.onclick = () => window.addNewPropertyComplex();
        
        // Manual show only - remove auto-persistence
        if (sessionStorage.getItem('adminSession') === 'true') {
            document.body.classList.add('editor-mode');
            btn.style.setProperty('display', 'block', 'important');
        } else {
            btn.style.setProperty('display', 'none', 'important');
        }
    }
}

window.testLogin = function() {
    const key = document.getElementById('adminKey').value;
    if (key === '7003') {
        sessionStorage.setItem('adminSession', 'true');
        location.reload();
    } else {
        alert("Clave incorrecta (Tip: 7003)");
    }
};

// Global state for admin
window.adminImages = [];
window.adminUnits = [];
window.editingKey = null;

window.addNewPropertyComplex = function(keyToEdit = null) {
    console.log("🚀 Running addNewPropertyComplex v16 (Units Edition)");
    const pm = document.getElementById('propertyModal');
    if (!pm) return;
    
    pm.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Handle Edit Mode
    window.editingKey = keyToEdit;
    let p = { title: "", delivery: "Nuevo", propType: "Departamento", price: "", beds: 2, baths: 1, sqm: 80, desc: "", amenity: "", images: [], units: [] };
    if (keyToEdit) {
        p = { ...window.AppConfig.propertyDataBilingual.es[keyToEdit] };
    }
    window.adminImages = [...(p.images || [])];
    window.adminUnits = [...(p.units || [])];

    // 1. Details Panel - Form
    const details = pm.querySelector('.prop-details');
    if (details) {
        details.style.display = 'block';
        details.style.background = '#0b1221';
        details.style.padding = '20px';
        
        // Hide viewer components
        const toHide = ['pmBadge','pmTitle','pmPrice','pmDesc','fullAmenitiesDisplay','unitSelector'];
        toHide.forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });
        const feat = document.querySelector('.pm-features'); if(feat) feat.style.display='none';
        const cta = document.querySelector('.pm-cta'); if(cta) cta.style.display='none';

        details.innerHTML = `
            <div id="unifiedAdminForm" style="color:white; font-family:sans-serif;">
                <h3 style="color:var(--primary); margin-bottom:12px; font-size:1rem; text-transform:uppercase;">${keyToEdit ? 'Editar' : 'Registrar'} Fraccionamiento</h3>
                
                <div class="admin-field" style="margin-bottom:10px;">
                    <label style="font-size:0.6rem; color:#888;">NOMBRE DEL DESARROLLO</label>
                    <input id="newTitle" class="admin-input" value="${p.title}" style="width:100%; padding:8px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.6rem; color:#888;">ESTADO (República)</label>
                        <input id="newEstado" class="admin-input" value="${p.estado || ''}" placeholder="Ej: Quintana Roo" style="width:100%; padding:8px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                    </div>
                    <div>
                        <label style="font-size:0.6rem; color:#888;">MUNICIPIO / CIUDAD</label>
                        <input id="newMunicipio" class="admin-input" value="${p.municipio || ''}" placeholder="Ej: Cancún" style="width:100%; padding:8px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                    </div>
                </div>

                <div class="admin-field" style="margin-bottom:10px;">
                    <label style="font-size:0.6rem; color:#888;">UBICACIÓN / ZONA</label>
                    <input id="newLocation" class="admin-input" value="${p.location || ''}" placeholder="Ej: Av. Huayacán, SM 313" style="width:100%; padding:8px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                </div>

                <div class="admin-field" style="margin-bottom:10px;">
                    <label style="font-size:0.6rem; color:#888;">LINK GOOGLE MAPS (EMBED)</label>
                    <div style="display:flex; gap:5px;">
                        <input id="newMapUrl" class="admin-input" value="${p.mapUrl || ''}" placeholder="Pega el src del iframe de Google Maps" style="flex:1; padding:8px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                        <button onclick="window.previewAdminMap()" style="background:var(--secondary); border:none; color:white; padding:0 10px; border-radius:6px; cursor:pointer; font-size:0.7rem;">Probar</button>
                    </div>
                    <p style="font-size:0.55rem; color:#666; margin-top:2px;">Tip: En Google Maps dale a 'Compartir' -> 'Insertar mapa' y copia el link entre comillas.</p>
                </div>
                <div id="adminMapPreview" style="display:none; width:100%; height:150px; background:#000; border-radius:10px; margin-bottom:10px; border:1px solid #333; overflow:hidden;"></div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.6rem; color:#888;">ESTATUS</label>
                        <select id="newBadge" class="admin-input" style="width:100%; padding:6px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                            <option ${p.delivery==='Nuevo'||p.badge==='Nuevo'?'selected':''}>Nuevo</option>
                            <option ${p.delivery==='Preventa'||p.badge==='Preventa'?'selected':''}>Preventa</option>
                            <option ${p.delivery==='Entrega Inmediata'||p.badge==='Entrega Inmediata'?'selected':''}>Entrega Inmediata</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.6rem; color:#888;">TIPO</label>
                        <select id="newPropType" onchange="window.updateUnitOptions()" class="admin-input" style="width:100%; padding:6px; background:#1a2235; border:1px solid #444; color:white; border-radius:6px;">
                            <option value="Departamento" ${p.propType==='Departamento'?'selected':''}>Departamento</option>
                            <option value="Casa" ${p.propType==='Casa'?'selected':''}>Casa</option>
                            <option value="Terreno" ${p.propType==='Terreno'?'selected':''}>Terreno</option>
                        </select>
                    </div>
                </div>

                <div class="admin-field" style="margin-bottom:12px;">
                    <label style="font-size:0.6rem; color:#888; margin-bottom:5px; display:block;">UNIDADES / MODELOS / NIVELES</label>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:5px; margin-bottom:8px;">
                        <select id="unitSelectorList" onchange="window.syncAdminUnitInputs()" style="background:#1a2235; border:1px solid #444; color:white; padding:5px; font-size:0.7rem; border-radius:4px;">
                            <!-- Dinámico -->
                        </select>
                        <input id="unitPrice" placeholder="Precio ($)" style="background:#1a2235; border:1px solid #444; color:var(--primary); padding:5px; font-size:0.7rem; border-radius:4px;">
                        <input id="unitExtra" placeholder="Extras (ej: Con Patio)" style="background:#1a2235; border:1px solid #444; color:#aaa; padding:5px; font-size:0.7rem; border-radius:4px;">
                        <button onclick="window.addAdminUnit()" style="background:var(--primary); color:white; border:none; padding:0 10px; border-radius:4px; cursor:pointer;"><i class='bx bx-plus'></i></button>
                    </div>
                    <div id="adminUnitsList" style="display:flex; flex-direction:column; gap:4px; max-height:80px; overflow-y:auto; background:rgba(0,0,0,0.2); padding:6px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                        <!-- Filled by renderAdminUnits -->
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px;">
                    <div><label style="font-size:0.5rem; color:#888;">REC.</label><input id="newBeds" type="number" value="${p.beds}" style="width:100%; background:#1a2235; border:1px solid #444; color:white; text-align:center; border-radius:6px;"></div>
                    <div><label style="font-size:0.5rem; color:#888;">BAÑOS</label><input id="newBaths" type="number" value="${p.baths}" style="width:100%; background:#1a2235; border:1px solid #444; color:white; text-align:center; border-radius:6px;"></div>
                    <div><label style="font-size:0.5rem; color:#888;">M²</label><input id="newSqm" type="number" value="${p.sqm || 80}" style="width:100%; background:#1a2235; border:1px solid #444; color:white; text-align:center; border-radius:6px;"></div>
                </div>

                <div class="admin-field" style="margin-bottom:10px;">
                    <label style="font-size:0.6rem; color:#888;">DESCRIPCIÓN</label>
                    <textarea id="newDesc" style="width:100%; height:40px; background:#1a2235; border:1px solid #444; color:#ccc; padding:6px; font-size:0.75rem; border-radius:6px; resize:none;">${p.desc}</textarea>
                </div>

                <div class="admin-field" style="margin-bottom:12px;">
                    <label style="font-size:0.6rem; color:#888; margin-bottom:5px; display:block;">AMENIDADES Y CARACTERÍSTICAS</label>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px; background:rgba(0,0,0,0.2); padding:6px; border-radius:6px; max-height:80px; overflow-y:auto; border:1px solid rgba(255,255,255,0.05);">
                        ${MASTER_AMENITIES.map(a => `<label style="font-size:0.65rem; color:#94a3b8; display:flex; align-items:center; gap:5px; cursor:pointer;"><input type="checkbox" class="amenity-check" value="${a}" ${p.amenity && p.amenity.includes(a)?'checked':''}> ${a}</label>`).join('')}
                    </div>
                </div>

                <div style="display:flex; gap:10px;">
                    <button onclick="window.saveNewProperty()" style="flex:2; padding:10px; background:linear-gradient(135deg, #6366f1, #8b5cf6); border:none; color:white; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.8rem;">
                        <i class='bx bx-save'></i> ${keyToEdit ? 'Actualizar' : 'Guardar'}
                    </button>
                    ${keyToEdit ? `<button onclick="window.addNewPropertyComplex()" style="flex:1; padding:10px; background:#444; border:none; color:white; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.8rem;">Nuevo</button>` : ''}
                </div>

                <!-- INVENTORY SECTION -->
                <div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                    <label style="color:var(--primary); font-size:0.7rem; font-weight:700; text-transform:uppercase; display:block; margin-bottom:10px;">Inventario Existente</label>
                    <div id="adminInventory" style="max-height:150px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                        <!-- Filled below -->
                    </div>
                </div>
            </div>
        `;
        window.renderAdminInventory();
    }

    // 2. Gallery Panel
    const gallery = pm.querySelector('.prop-gallery');
    if (gallery) {
        gallery.style.background = '#06091a';
        gallery.innerHTML = `
            <div style="padding:15px; height:100%; display:flex; flex-direction:column; color:white;">
                <div id="unifiedUploadArea" style="height:60px; border:2px dashed #444; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:rgba(255,255,255,0.02); margin-bottom:10px;" onclick="document.getElementById('masterFilePicker').click()">
                    <div style="text-align:center; display:flex; align-items:center; gap:8px;">
                        <i class='bx bx-image-add' style="font-size:1.4rem; color:var(--primary);"></i>
                        <p style="font-weight:700; margin:0; font-size:0.8rem;">Agregar Fotos</p>
                    </div>
                    <input type="file" id="masterFilePicker" multiple accept="image/*" style="display:none" onchange="window.handleAdminFiles(this)">
                </div>

                <div id="adminMainPreview" style="width:100%; height:200px; background:#000; border-radius:10px; border:1px solid #333; overflow:hidden; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">
                    ${window.adminImages.length > 0 ? `<img src="${window.adminImages[0]}" style="width:100%; height:100%; object-fit:contain;">` : '<p style="color:#444; font-size:0.7rem;">Vista previa</p>'}
                </div>
                
                <div id="masterThumbs" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; overflow-y:auto; flex:1; align-content:start;"></div>
            </div>
        `;
        window.renderAdminThumbs();
        window.renderAdminUnits();
        window.updateUnitOptions();
        pm.querySelector('.modal-content').scrollTop = 0;
    }
};

window.renderAdminInventory = function() {
    const container = document.getElementById('adminInventory');
    if (!container) return;
    container.innerHTML = '';
    
    const props = window.AppConfig.propertyDataBilingual.es;
    Object.keys(props).forEach(key => {
        const p = props[key];
        const item = document.createElement('div');
        item.style.cssText = 'background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; display:flex; align-items:center; justify-content:space-between; border:1px solid rgba(255,255,255,0.05);';
        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                <img src="${(p.images && p.images[0]) || ''}" style="width:35px; height:35px; object-fit:cover; border-radius:4px; flex-shrink:0;">
                <span style="font-size:0.75rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:white;">${p.title}</span>
            </div>
            <div style="display:flex; gap:8px; margin-left:10px; flex-shrink:0;">
                <button onclick="window.addNewPropertyComplex('${key}')" style="background:#6366f1; border:none; color:white; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center;"><i class='bx bx-edit-alt'></i></button>
                <button onclick="window.deleteProperty('${key}')" style="background:#ef4444; border:none; color:white; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center;"><i class='bx bx-trash'></i></button>
            </div>
        `;
        container.appendChild(item);
    });
};

window.deleteProperty = function(key) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${key}"?`)) {
        delete window.AppConfig.propertyDataBilingual.es[key];
        delete window.AppConfig.propertyDataBilingual.en[key];
        localStorage.setItem('savedProperties', JSON.stringify(window.AppConfig.propertyDataBilingual));
        window.renderAdminInventory();
        window.renderAllProperties();
        window.renderMasterMap();
        alert("Eliminado. No olvides exportar config.js para hacerlo permanente.");
    }
};

window.handleAdminFiles = function(input) {
    if (!input.files) return;
    for (let file of input.files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            window.adminImages.push(e.target.result);
            window.renderAdminThumbs();
            window.previewAdminImage(window.adminImages.length - 1);
        };
        reader.readAsDataURL(file);
    }
    input.value = '';
};

window.previewAdminImage = function(index) {
    const main = document.getElementById('adminMainPreview');
    if (!main || !window.adminImages[index]) return;
    main.innerHTML = `<img src="${window.adminImages[index]}" style="width:100%; height:100%; object-fit:contain; background:#000;">`;
};

window.updateUnitOptions = function() {
    const type = document.getElementById('newPropType')?.value;
    const list = document.getElementById('unitSelectorList');
    if(!list) return;
    
    let options = [];
    if (type === 'Departamento') {
        options = ['Planta Baja', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'];
    } else if (type === 'Casa') {
        options = ['Casa Individual', 'Duplex', 'Townhouse'];
    } else {
        options = ['Lote Estándar', 'Lote Premium'];
    }
    
    list.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    window.syncAdminUnitInputs();
};

window.syncAdminUnitInputs = function() {
    const selectedName = document.getElementById('unitSelectorList')?.value;
    const priceInput = document.getElementById('unitPrice');
    const extraInput = document.getElementById('unitExtra');
    if (!selectedName || !priceInput || !extraInput) return;

    const existing = window.adminUnits.find(u => u.name === selectedName);
    if (existing) {
        priceInput.value = existing.price;
        extraInput.value = existing.extra || "";
    } else {
        priceInput.value = "";
        extraInput.value = "";
    }
};

window.addAdminUnit = function() {
    const name = document.getElementById('unitSelectorList')?.value;
    const price = document.getElementById('unitPrice')?.value;
    const extra = document.getElementById('unitExtra')?.value || "";
    if(!name || !price) return;
    window.adminUnits.push({ name, price, extra });
    document.getElementById('unitPrice').value = '';
    document.getElementById('unitExtra').value = '';
    window.renderAdminUnits();
};

window.renderAdminUnits = function() {
    const list = document.getElementById('adminUnitsList');
    if(!list) return;
    list.innerHTML = '';
    window.adminUnits.forEach((u, idx) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:white; background:rgba(255,255,255,0.05); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); margin-bottom:4px;';
        item.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:2px;">
                <span><strong style="color:var(--secondary);">${u.name}</strong> — ${u.price}</span>
                ${u.extra ? `<span style="color:var(--primary); font-size:0.65rem; font-weight:700;">✨ ${u.extra.toUpperCase()}</span>` : ''}
            </div>
            <i class='bx bx-trash' onclick="window.removeAdminUnit(${idx})" style="color:#ef4444; cursor:pointer; font-size:1.1rem; padding:4px;"></i>
        `;
        list.appendChild(item);
    });
};

window.removeAdminUnit = function(idx) {
    window.adminUnits.splice(idx, 1);
    window.renderAdminUnits();
};

window.renderAdminThumbs = function() {
    const container = document.getElementById('masterThumbs');
    if (!container) return;
    container.innerHTML = '';
    window.adminImages.forEach((imgSrc, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:relative; width:100%; aspect-ratio:1/1; cursor:pointer;';
        wrapper.onclick = () => window.previewAdminImage(index);
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.1);';
        const btn = document.createElement('button');
        btn.innerHTML = "<i class='bx bx-x'></i>";
        btn.style.cssText = 'position:absolute; top:-2px; right:-2px; background:#ef4444; color:white; border:none; width:18px; height:18px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:10px; z-index:10; border:1px solid white;';
        btn.onclick = (e) => { e.stopPropagation(); window.removeAdminImage(index); };
        wrapper.appendChild(img);
        wrapper.appendChild(btn);
        container.appendChild(wrapper);
    });
};

window.removeAdminImage = function(index) {
    window.adminImages.splice(index, 1);
    window.renderAdminThumbs();
    if (window.adminImages.length === 0) {
        document.getElementById('adminMainPreview').innerHTML = '<p style="color:#444; font-size:0.7rem;">Vista previa</p>';
    } else {
        window.previewAdminImage(window.adminImages.length - 1);
    }
};

window.saveNewProperty = function() {
    const title = document.getElementById('newTitle')?.value;
    if (!title) return alert("Ingresa el nombre del desarrollo");

    // Auto-add logic: If there's a price in the field, add or update it automatically
    const autoPrice = document.getElementById('unitPrice')?.value;
    const autoName = document.getElementById('unitSelectorList')?.value;
    const autoExtra = document.getElementById('unitExtra')?.value || "";
    if (autoPrice && autoPrice.trim() !== "") {
        const existingIdx = window.adminUnits.findIndex(u => u.name === autoName);
        if (existingIdx !== -1) {
            // Update existing unit with potentially new price or extra text
            window.adminUnits[existingIdx].price = autoPrice;
            window.adminUnits[existingIdx].extra = autoExtra;
        } else {
            // Add as new
            window.adminUnits.push({ name: autoName, price: autoPrice, extra: autoExtra });
        }
    }

    const key = window.editingKey || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const checks = document.querySelectorAll('.amenity-check:checked');
    const amens = Array.from(checks).map(c => c.value).join(', ');
    
    const prop = {
        title: title,
        estado: document.getElementById('newEstado')?.value || "",
        municipio: document.getElementById('newMunicipio')?.value || "",
        location: document.getElementById('newLocation')?.value || "",
        mapUrl: (function() {
            let val = document.getElementById('newMapUrl')?.value || "";
            // Clean URL extraction
            if (val.includes('<iframe')) {
                const match = val.match(/src="([^"]+)"/);
                val = match ? match[1] : val;
            }
            // Remove any trailing/leading quotes
            val = val.replace(/^["']|["']$/g, '').trim();
            console.log("📍 Final Map URL Extracted:", val);
            return val;
        })(),
        badge: document.getElementById('newBadge')?.value || "Nuevo",
        price: window.adminUnits.length > 0 ? window.adminUnits[0].price : "Consultar Precio",
        beds: document.getElementById('newBeds')?.value || 0,
        baths: document.getElementById('newBaths')?.value || 0,
        sqm: document.getElementById('newSqm')?.value || 0,
        desc: document.getElementById('newDesc')?.value || "",
        propType: document.getElementById('newPropType')?.value || "Departamento",
        amenity: amens,
        units: window.adminUnits,
        images: window.adminImages.length > 0 ? window.adminImages : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
        delivery: document.getElementById('newBadge')?.value || "Nuevo"
    };

    window.AppConfig.propertyDataBilingual.es[key] = prop;
    window.AppConfig.propertyDataBilingual.en[key] = prop;
    
    localStorage.setItem('savedProperties', JSON.stringify(window.AppConfig.propertyDataBilingual));
    
    if(confirm("✅ Guardado correctamente.\n\n¿Quieres guardar los cambios permanentemente en tu archivo 'config.js'?")) {
        window.exportConfigJS();
    }
    
    window.renderAllProperties();
    window.renderMasterMap();
    window.closePropertyModal();
    // location.reload(); // Removed reload for smoother UX
};

window.exportConfigJS = async function() {
    const data = JSON.stringify(window.AppConfig, null, 4);
    const content = `/** 
 * ARCHIVO DE CONFIGURACIÓN AUTOMÁTICO 
 * Generado el: ${new Date().toLocaleString()}
 */
window.AppConfig = ${data};`;
    
    // Attempt native File System Access API (Save As)
    // Note: This only works in Secure Contexts (HTTPS/Localhost), NOT in file:///
    if ('showSaveFilePicker' in window && location.protocol !== 'file:') {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'config.js',
                types: [{
                    description: 'Javascript File',
                    accept: {'text/javascript': ['.js']},
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            alert("✅ ¡Archivo guardado directamente en tu proyecto!");
            return;
        } catch (err) {
            if(err.name === 'AbortError') return;
            console.error("File Picker error:", err);
        }
    }

    // Fallback: Show a choice between Download and Copy
    const choice = confirm("⚠️ AVISO DE SEGURIDAD:\n\nComo estás abriendo el archivo directamente (file:///), el navegador bloquea el acceso directo a tus carpetas.\n\n¿Quieres DESCARGAR el archivo actualizado? (Luego tendrás que moverlo manualmente a la carpeta config/)");
    
    if (choice) {
        const blob = new Blob([content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("✅ Descargado. Busca 'config.js' en tu carpeta de Descargas y muévelo a la carpeta 'config/' de tu proyecto.");
    } else {
        // Offer to copy to clipboard as 3rd option
        try {
            await navigator.clipboard.writeText(content);
            alert("📋 ¡Código copiado al portapapeles!\n\nAhora puedes ir a tu archivo 'config.js' en tu editor, borrar todo y pegar (Ctrl+V) los nuevos datos.");
        } catch(e) {
            console.error("Clipboard error", e);
        }
    }
};

// --- UTILS & UI HANDLERS ---

window.sharePropertyWhatsApp = function() {
    const title = document.getElementById('pmTitle')?.textContent || 'esta propiedad';
    const msg = `¡Hola! Me gustaría recibir más información de este desarrollo: *${title}*.\n\nLo vi en Tu Amigo Experto.`;
    const waUrl = `https://wa.me/529983008729?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
};

window.openLeadModal = function() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        // Set current date and time as default
        const now = new Date();
        const dateInput = document.getElementById('date');
        const timeInput = document.getElementById('time');
        
        if (dateInput) {
            dateInput.value = now.toISOString().split('T')[0];
        }
        if (timeInput) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if(nameInput) nameInput.focus();
        }, 300);
    }
};

window.closeLeadModal = function() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.submitLead = function(event) {
    if (event) event.preventDefault();
    
    const name = document.getElementById('name')?.value;
    const phone = document.getElementById('phone')?.value;
    const interest = document.getElementById('interest')?.value;
    const date = document.getElementById('date')?.value;
    const time = document.getElementById('time')?.value;

    if (!name || !phone) return alert("Por favor completa los campos básicos.");

    // Visual Feedback: Confetti
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#8b5cf6', '#ffffff']
        });
    }

    // Prepare WhatsApp Message
    const msg = `Hola Juan! Soy ${name}. Me interesa: ${interest}. Me gustaría agendar asesoría para el día ${date} a las ${time}. Mi WhatsApp es ${phone}.`;
    const waUrl = `https://wa.me/529983008729?text=${encodeURIComponent(msg)}`;

    // Show success state in UI
    const form = document.getElementById('leadForm');
    const success = document.getElementById('successMessage');
    if (form) form.classList.add('hidden');
    if (success) success.classList.remove('hidden');

    // Redirect after 2 seconds
    setTimeout(() => {
        window.open(waUrl, '_blank');
        window.closeLeadModal();
        // Reset form for next time
        if (form) {
            form.reset();
            form.classList.remove('hidden');
        }
        if (success) success.classList.add('hidden');
    }, 2000);
};

window.submitExitLead = function(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('exitName')?.value;
    const phone = document.getElementById('exitPhone')?.value;

    if (!name || !phone) return alert("Por favor completa tus datos.");

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.8 } });
    }

    const msg = `Hola Juan! Quiero descargar la guía gratuita. Mi nombre es ${name} y mi WhatsApp es ${phone}.`;
    const waUrl = `https://wa.me/529983008729?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    window.closeExitModal();
};

window.calcPlusvalia = function() {
    const zona = document.getElementById('pv-zona').value;
    const res = document.getElementById('plusvalia-result');
    if (!res) return;
    
    let pct = 12;
    if (zona === 'Cancún') pct = 15;
    if (zona === 'Tulum') pct = 18;
    if (zona === 'Mérida') pct = 10;
    
    res.innerHTML = `Estimado de Plusvalía Anual: <strong style="color:var(--primary)">${pct}%</strong>`;
};

window.startVoiceRecognition = function() {
    const input = document.getElementById('aiSearchInput');
    const btn = document.getElementById('aiVoiceBtn');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Tu navegador no soporta reconocimiento de voz. Te recomendamos usar Chrome.");
        return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();

    recognition.lang = window.currentLang === 'es' ? 'es-MX' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        if(btn) btn.classList.add('recording');
        if(input) input.placeholder = window.currentLang === 'es' ? "Escuchando..." : "Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(input) {
            input.value = transcript;
            window.searchWithAI();
        }
    };

    recognition.onerror = () => {
        if(btn) btn.classList.remove('recording');
    };

    recognition.onend = () => {
        if(btn) btn.classList.remove('recording');
        if(input) input.placeholder = TRANSLATIONS[window.currentLang].search_placeholder;
    };

    recognition.start();
};

window.searchWithAI = function() {
    const input = document.getElementById('aiSearchInput');
    const query = input?.value.trim().toLowerCase();
    const btn = document.getElementById('aiSearchBtn');
    const spinner = btn?.querySelector('.ai-spinner');
    const btnText = btn?.querySelector('.btn-text');

    if (!query) return;

    // Show Loading
    if(spinner) spinner.classList.remove('hidden');
    if(btnText) btnText.style.opacity = '0';
    
    setTimeout(() => {
        const props = window.AppConfig.propertyDataBilingual[window.currentLang || 'es'];
        const grid = document.getElementById('propertyGrid');
        if (!grid) return;

        grid.innerHTML = '';
        let found = 0;
        let foundKeys = [];

        for (let key in props) {
            const p = props[key];
            const textToSearch = `${p.title} ${p.desc} ${p.propType} ${p.price} ${p.amenity} ${p.estado} ${p.municipio} ${p.location}`.toLowerCase();
            
            // Simple semantic/keyword match
            if (textToSearch.includes(query) || query.split(' ').some(word => word.length > 3 && textToSearch.includes(word))) {
                renderPropertyCard(p, key);
                found++;
                foundKeys.push(key);
            }
        }

        // Update Master Map with filtered keys
        window.renderMasterMap(foundKeys);

        // UI Reset
        if(spinner) spinner.classList.add('hidden');
        if(btnText) btnText.style.opacity = '1';

        // Feedback
        if (found === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);">
                <i class='bx bx-search-alt' style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p>${window.currentLang === 'es' ? 'No encontramos coincidencias exactas para "' + query + '".' : 'No exact matches found for "' + query + '".'}</p>
                <button onclick="window.renderAllProperties()" style="margin-top: 15px; color: var(--primary); background: none; border: 1px solid var(--primary); padding: 8px 20px; border-radius: 50px; cursor: pointer;">${window.currentLang === 'es' ? 'Ver todo' : 'See all'}</button>
            </div>`;
        }

        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Confetti if found!
        if (found > 0 && typeof confetti === 'function') {
            confetti({ particleCount: 50, spread: 40, origin: { y: 0.9 } });
        }
    }, 1200);
};

window.showCard = (id) => window.showPropertyDetails(Object.keys(window.AppConfig.propertyDataBilingual.es)[0]);

window.closeExitModal = () => {
    const modal = document.getElementById('exitModal');
    if (modal) modal.style.display = 'none';
};

window.handleOptionClick = (text) => window.selectOption(text);

// --- CHAT SYSTEM ---

window.selectOption = function(text) {
    const chat = document.getElementById('chatMessages');
    if (!chat) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = text;
    chat.appendChild(userMsg);
    chat.scrollTop = chat.scrollHeight;
    
    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span>•</span><span>•</span><span>•</span>';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
    
    setTimeout(() => {
        const typingInd = document.getElementById('typingIndicator');
        if (typingInd) typingInd.remove();
        
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.innerHTML = window.getBotResponse(text);
        chat.appendChild(botMsg);
        chat.scrollTop = chat.scrollHeight;
    }, 1500);
};

window.sendChatMessage = function() {
    const input = document.getElementById('userInput');
    if (!input || !input.value.trim()) return;
    window.selectOption(input.value.trim());
    input.value = '';
};

window.getBotResponse = function(text) {
    text = text.toLowerCase();
    
    if (text.includes('ver') || text.includes('propiedad') || text.includes('casas')) {
        return '📱 ¡Muy bien! He actualizado la lista de <strong>Desarrollos Destacados</strong> para ti.<br><br>Tengo opciones en Cancún, Tulum y Mérida. ¿Buscas algún rango de precio específico?';
    }
    if (text.includes('puntos') || text.includes('infonavit')) {
        return '📊 Para Infonavit necesitas <strong>1080 puntos</strong>. Las mujeres tienen un bono y pueden precalificar con 1060.<br><br>¿Ya tienes tu precalificación? Si no, puedo explicarte cómo obtenerla.';
    }
    if (text.includes('unir') || text.includes('juntar')) {
        return '💑 ¡Excelente idea! Puedes unir tu crédito con tu pareja, un familiar o incluso un amigo.<br><br>Esto aumenta considerablemente su capacidad de compra. ¿Con quién planeas unirlo?';
    }
    if (text.includes('requisitos')) {
        return '📋 Los requisitos básicos son:<br>1. Estar cotizando en el IMSS.<br>2. Tener los puntos mínimos.<br>3. Tomar el curso "Saber más para decidir mejor".<br><br>¿Te gustaría que agendemos una asesoría gratuita?';
    }
    
    return '¡Entendido! Me encantaría ayudarte con eso. Para darte la mejor info, ¿en qué ciudad te interesa comprar y cuál es tu presupuesto aproximado?';
};

window.resetChat = function() {
    const chat = document.getElementById('chatMessages');
    if (!chat) return;
    chat.innerHTML = `
        <div class="message bot">
            ¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario inteligente.<br><br>
            Estoy aquí para que comprar tu casa sea un proceso emocionante y sin estrés. ¿En qué puedo apoyarte hoy?
        </div>
        <div class="options-wrapper">
            <button class="option-btn" onclick="selectOption('Ver Propiedades')">🏠 Ver Propiedades</button>
            <button class="option-btn" onclick="selectOption('Mis Puntos Infonavit')">📊 Mis Puntos</button>
            <button class="option-btn" onclick="selectOption('Unir Créditos')">💑 Unir Créditos</button>
        </div>
    `;
};

// --- MISC ---

window.closeAdminModal = () => document.getElementById('adminModal').classList.remove('active');
window.closePropertyModal = () => {
    document.getElementById('propertyModal').classList.remove('active');
    document.body.style.overflow = '';
};

// --- MULTI-LANGUAGE SYSTEM ---

const TRANSLATIONS = {
    es: {
        nav_cta: "Hablar con un Experto",
        hero_badge: "🌴 Especialistas en Cancún y Todo México",
        hero_title: 'Tu hogar ideal, <br><span class="highlight">sin estrés ni complicaciones</span>',
        hero_subtitle: "Descubre cómo aprovechar tus puntos Infonavit o expeditar tu venta. Transformamos trámites complejos en una experiencia increíble, estés donde estés.",
        search_placeholder: "Tu hogar ideal o presupuesto...",
        search_btn: "Buscar con IA",
        prop_title: "🏆 Desarrollos Destacados",
        prop_subtitle: "Selección exclusiva de las mejores oportunidades de inversión en el Caribe Mexicano.",
        sim_title: "📊 Simulador de Crédito Interactivo",
        sim_subtitle: "Calcula tu poder de compra en segundos. ¡Mueve los controles!",
        sim_label_income: "Tu Ingreso Mensual Libre",
        sim_label_age: "Tu Edad Actual",
        sim_label_ssv: "Saldo Subcuenta de Vivienda (SSV)",
        sim_result_label: "Poder de Compra Total",
        sim_note: "<i class='bx bx-lock-alt'></i> Consulta gratuita. No afecta tu Buró de Crédito.",
        sim_break_credit: "<i class='bx bx-credit-card'></i> Crédito",
        sim_break_ssv: "<i class='bx bx-wallet'></i> Saldo SSV",
        sim_break_payment: "<i class='bx bx-calendar'></i> Pago Mensual",
        sim_btn: "<i class='bx bx-check-shield'></i> ¡Validar mi Precalificación Oficial!",
        pv_title: "📈 Simulador de Plusvalía",
        pv_subtitle: "Descubre cuánto valdrá tu inversión en el tiempo",
        pv_label_price: "Precio de compra (MXN)",
        pv_label_zone: "Zona de la propiedad",
        pv_opt_1: "Cancún (12% anual)",
        pv_opt_2: "Tulum (15% anual)",
        pv_opt_3: "Mérida (9% anual)",
        pv_opt_4: "Riviera Maya (10% anual)",
        pv_label_years: "Años de inversión",
        pv_summary_init: "Introduce el precio de tu propiedad para ver la proyección",
        feat_title: "¿Por qué dejas tus trámites a <span>Tu Amigo Experto</span>?",
        feat_1_title: "Educación desde Cero",
        feat_1_desc: "Te explicamos qué es la Subcuenta, Precalificación y Escrituración de forma clara y sin tecnicismos.",
        feat_2_title: "Unamos Créditos",
        feat_2_desc: "Junta tus puntos Infonavit con tu pareja, amigos o familiares para alcanzar tu meta más rápido.",
        feat_3_title: "Compra Segura",
        feat_3_desc: "Te guiamos paso a paso en la compra de tu propiedad con Alberca, Escuelas, Canchas deportivas, etc.",
        feat_4_title: "Velocidad Nacional",
        feat_4_desc: "Nosotros nos encargamos de todos los trámites para que tú solo disfrutes el resultado de las llaves.",
        myth_title: "Destruyendo Mitos del Infonavit 🔨",
        myth_tag: "Mito",
        truth_tag: "Verdad",
        myth_hint: "Toca para ver la verdad",
        myth_1_f: '"Si uno mis puntos con otra persona, la casa será solo de uno de los dos."',
        myth_1_t: "¡Falso! Con <strong>Unamos Créditos</strong> ambos son dueños legales bajo la figura de Copropiedad. Tu inversión está 100% protegida.",
        myth_2_f: '"Autorizar y escriturar con Infonavit tarda muchísimos meses."',
        myth_2_t: "¡Para nada! Nosotros agilizamos avalúos y gestión. Normalmente en <strong>3 a 5 semanas</strong> ya te estamos entregando tus llaves.",
        myth_3_f: '"No puedo comprar una casa usada a un particular con mi crédito."',
        myth_3_t: "¡Claro que puedes! Nosotros somos expertos en <strong>Venta de Terceros</strong>. Nos aseguramos de destrabar los trámites para que la compra sea legal y segura.",
        test_title: "Lo que dicen nuestros clientes 🤝",
        test_1_txt: '"Pensé que no me alcanzaban los puntos, pero Juan me ayudó a unir mi crédito."',
        test_1_name: "- Sofía M.",
        test_2_txt: '"El proceso fue súper rápido. En 3 semanas ya estábamos firmando escrituras."',
        test_2_name: "- Carlos R.",
        test_3_txt: '"Me consiguieron el departamento exacto que quería frente al mar. ¡10/10!"',
        test_3_name: "- Ana L.",
        test_4_txt: '"Vendieron mi casa en tiempo récord y sin vueltas legales. Excelente servicio."',
        test_4_name: "- Miguel A.",
        faq_title: "Preguntas Frecuentes resueltas rápido ⚡",
        faq_q1: "¿Tiene algún costo tu asesoría inicial?",
        faq_a1: "<strong>¡Absolutamente ninguno!</strong> Mi primer objetivo es analizar tu caso, ver tus puntos y trazarte un plan. Solo ganamos si tú logras comprar o vender tu casa de forma exitosa.",
        faq_q2: "¿Puedo comprar en Cancún si vivo en otro Estado?",
        faq_a2: "¡Por supuesto! De hecho, nuestro fuerte es ayudar a personas de todo México a invertir en el paraíso. Nosotros coordinamos los trámites a distancia para que tú solo vengas a disfrutar tu nueva casa.",
        faq_q3: "¿Puedo unir mis puntos si no estoy casado?",
        faq_a3: "¡Sí! Ya no es necesario estar casados. Puedes unir tu crédito con un familiar (padres, hermanos) o un amigo(a) y comprar juntos una mejor propiedad dividiendo los gastos.",
        footer_brand: "Tu Amigo Experto",
        footer_desc: "Tu aliado para comprar o vender propiedades en Cancún, Riviera Maya y México de forma segura, garantizando tu inversión.",
        footer_links_title: "Enlaces Rápidos",
        footer_contact_title: "Contacto Premium",
        link_advice: "Agendar Asesoría",
        link_props: "Desarrollos Destacados",
        link_sim: "Simulador de Crédito",
        link_privacy: "Aviso de Privacidad",
        footer_copy: "&copy; 2026 Tu Amigo Experto. Todos los derechos reservados.",
        chat_name: "Juan | Experto",
        chat_name_full: "Juan, Tu Amigo Experto",
        chat_status: "✓ En línea",
        chat_online: "En línea ahora",
        chat_welcome: "<p>¡Hola! 👋 Soy <strong>Tu Amigo Experto</strong>, tu asesor inmobiliario de confianza.</p><p>Estoy aquí para hacer que los trámites sean sencillos. ¿Qué sueño queremos cumplir hoy?</p>",
        chat_opt_1: "Quiero comprar una casa",
        chat_opt_2: "Quiero unir mis puntos",
        chat_opt_3: "Saber de mis puntos"
    },
    en: {
        nav_cta: "Talk to an Expert",
        hero_badge: "🌴 Specialists in Cancun and All Mexico",
        hero_title: 'Your ideal home, <br><span class="highlight">stress-free and hassle-free</span>',
        hero_subtitle: "Discover how to leverage your Infonavit points or expedite your sale. We transform complex procedures into an amazing experience, wherever you are.",
        search_placeholder: "Your ideal home or budget...",
        search_btn: "AI Search",
        prop_title: "🏆 Featured Developments",
        prop_subtitle: "Exclusive selection of the best investment opportunities in the Mexican Caribbean.",
        sim_title: "📊 Interactive Credit Simulator",
        sim_subtitle: "Calculate your buying power in seconds. Move the controls!",
        sim_label_income: "Your Monthly Net Income",
        sim_label_age: "Your Current Age",
        sim_label_ssv: "Housing Subaccount Balance (SSV)",
        sim_result_label: "Total Buying Power",
        sim_note: "<i class='bx bx-lock-alt'></i> Free consultation. Does not affect your Credit Bureau.",
        sim_break_credit: "<i class='bx bx-credit-card'></i> Credit",
        sim_break_ssv: "<i class='bx bx-wallet'></i> SSV Balance",
        sim_break_payment: "<i class='bx bx-calendar'></i> Monthly Payment",
        sim_btn: "<i class='bx bx-check-shield'></i> Validate my Official Pre-qualification!",
        pv_title: "📈 Appreciation Simulator",
        pv_subtitle: "Discover how much your investment will be worth over time",
        pv_label_price: "Purchase Price (MXN)",
        pv_label_zone: "Property Zone",
        pv_opt_1: "Cancun (12% annual)",
        pv_opt_2: "Tulum (15% annual)",
        pv_opt_3: "Merida (9% annual)",
        pv_opt_4: "Riviera Maya (10% annual)",
        pv_label_years: "Years of Investment",
        pv_summary_init: "Enter your property price to see the projection",
        feat_title: "Why leave your procedures to <span>Your Expert Friend</span>?",
        feat_1_title: "Education from Scratch",
        feat_1_desc: "We explain what the Subaccount, Pre-qualification and Deeds are in a clear way without technicalities.",
        feat_2_title: "Join Credits",
        feat_2_desc: "Join your Infonavit points with your partner, friends or family to reach your goal faster.",
        feat_3_title: "Safe Purchase",
        feat_3_desc: "We guide you step by step in the purchase of your property with Pool, Schools, Sports courts, etc.",
        feat_4_title: "National Speed",
        feat_4_desc: "We take care of all the procedures so that you only enjoy the result of the keys.",
        myth_title: "Destroying Infonavit Myths 🔨",
        myth_tag: "Myth",
        truth_tag: "Truth",
        myth_hint: "Tap to see the truth",
        myth_1_f: '"If I join my points with someone else, the house will belong to only one of the two."',
        myth_1_t: "False! With <strong>Join Credits</strong> both are legal owners under the figure of Co-ownership. Your investment is 100% protected.",
        myth_2_f: '"Authorizing and deed with Infonavit takes many months."',
        myth_2_t: "Not at all! We speed up appraisals and management. Normally in <strong>3 to 5 weeks</strong> we are already delivering your keys.",
        myth_3_f: '"I cannot buy a used house from a private individual with my credit."',
        myth_3_t: "Of course you can! We are experts in <strong>Third Party Sales</strong>. We make sure to unblock the procedures so that the purchase is legal and safe.",
        test_title: "What our clients say 🤝",
        test_1_txt: '"I thought I didn\'t have enough points, but Juan helped me join my credit."',
        test_1_name: "- Sofia M.",
        test_2_txt: '"The process was super fast. In 3 weeks we were already signing deeds."',
        test_2_name: "- Carlos R.",
        test_3_txt: '"They got me the exact apartment I wanted by the sea. 10/10!"',
        test_3_name: "- Ana L.",
        test_4_txt: '"They sold my house in record time and without legal detours. Excellent service."',
        test_4_name: "- Miguel A.",
        faq_title: "Frequently Asked Questions solved fast ⚡",
        faq_q1: "Is there any cost for your initial advice?",
        faq_a1: "<strong>Absolutely none!</strong> My first goal is to analyze your case, see your points and draw up a plan. We only win if you manage to buy or sell your house successfully.",
        faq_q2: "Can I buy in Cancun if I live in another State?",
        faq_a2: "Of course! In fact, our strength is helping people from all over Mexico to invest in paradise. We coordinate procedures remotely so you only come to enjoy your new home.",
        faq_q3: "Can I join my points if I'm not married?",
        faq_a3: "Yes! It is no longer necessary to be married. You can join your credit with a family member (parents, siblings) or a friend and buy a better property together by splitting the expenses.",
        footer_brand: "Your Expert Friend",
        footer_desc: "Your ally to buy or sell properties in Cancun, Riviera Maya and Mexico safely, guaranteeing your investment.",
        footer_links_title: "Quick Links",
        footer_contact_title: "Premium Contact",
        link_advice: "Schedule Advice",
        link_props: "Featured Developments",
        link_sim: "Credit Simulator",
        link_privacy: "Privacy Policy",
        footer_copy: "© 2026 Your Expert Friend. All rights reserved.",
        chat_name: "Juan | Expert",
        chat_name_full: "Juan, Your Expert Friend",
        chat_status: "✓ Online",
        chat_online: "Online now",
        chat_welcome: "<p>Hello! 👋 I am <strong>Your Expert Friend</strong>, your trusted real estate advisor.</p><p>I am here to make procedures simple. What dream do we want to fulfill today?</p>",
        chat_opt_1: "I want to buy a house",
        chat_opt_2: "I want to join my points",
        chat_opt_3: "Know about my points"
    }
};

function setupLanguageToggle() {
    const btn = document.getElementById('langToggle');
    if (btn) btn.onclick = window.toggleLanguage;
}

window.toggleLanguage = function() {
    window.currentLang = window.currentLang === 'es' ? 'en' : 'es';
    const btn = document.getElementById('langToggle');
    if (btn) btn.innerHTML = window.currentLang === 'es' ? '🇺🇸 EN' : '🇲🇽 ES';
    
    // 1. Translate all elements with data-i18n
    const t = TRANSLATIONS[window.currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });

    // 2. Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    // 3. Special handling for Chat Welcome Message (dynamic innerHTML)
    const chatWelcome = document.querySelector('.message.bot');
    if (chatWelcome && t.chat_welcome) {
        chatWelcome.innerHTML = t.chat_welcome;
    }
    
    // 4. Re-render dynamic content
    window.renderAllProperties();
    window.renderMasterMap();
    if(window.updateSimulator) window.updateSimulator();
    if(window.calcPlusvalia) window.calcPlusvalia();
    
    console.log("🌐 Language switched to:", window.currentLang);
};

// --- MASTER DISCOVERY MAP LOGIC ---

window.renderMasterMap = function(keysToShow = null) {
    const list = document.getElementById('masterMapPropertyList');
    if (!list) return;

    // Refresh from storage to be 100% sure we have the latest
    const saved = localStorage.getItem('savedProperties');
    if (saved) window.AppConfig.propertyDataBilingual = JSON.parse(saved);

    list.innerHTML = '';
    const props = window.AppConfig.propertyDataBilingual[window.currentLang || 'es'];
    const keys = keysToShow || Object.keys(props);

    if (keys.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No hay desarrollos registrados.</p>';
        return;
    }

    keys.forEach((key, index) => {
        const p = props[key];
        const item = document.createElement('div');
        item.className = 'map-prop-item';
        item.setAttribute('data-key', key);
        item.innerHTML = `
            <div class="map-prop-main">
                <img src="${(p.images && p.images[0]) || ''}" alt="${p.title}">
                <div class="map-prop-info" style="flex:1;">
                    <h4>${p.title}</h4>
                    <p><i class='bx bx-map'></i> ${p.municipio || ''}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                        <div class="map-prop-price">${p.price}</div>
                        <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); padding:4px 8px; border-radius:4px; display:flex; align-items:center; gap:5px;" title="Plusvalía (5 años)">
                            <i class='bx bx-trending-up' style="color:#10b981;"></i>
                            <span style="color:#10b981; font-size:0.55rem; font-weight:800; text-transform:uppercase;">Plusvalía en 5 años:</span>
                            <span style="color:white; font-size:0.7rem; font-weight:700;">+${window.calculatePlusvaliaValue(p.price, p.municipio)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="map-prop-footer">
                <button onclick="event.stopPropagation(); window.showPropertyDetails('${key}')" class="map-item-btn">
                    Ver Detalles <i class='bx bx-chevron-right'></i>
                </button>
            </div>
        `;
        item.onclick = () => window.selectMasterMapProperty(key, item);
        list.appendChild(item);

        // Auto-select first one on load
        if (index === 0) window.selectMasterMapProperty(key, item);
    });
};

window.calculatePlusvaliaValue = function(priceStr, municipio) {
    if (!priceStr) return "Consultar";
    let num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    if (isNaN(num) || num === 0) return "Consultar";
    
    let pct = 0.12; 
    let muni = (municipio || '').toLowerCase();
    if (muni.includes('cancun') || muni.includes('cancún')) pct = 0.15;
    else if (muni.includes('tulum')) pct = 0.18;
    else if (muni.includes('merida') || muni.includes('mérida')) pct = 0.10;
    
    let gain = num * (Math.pow(1 + pct, 5) - 1);
    return '$' + Math.round(gain).toLocaleString('es-MX');
};

window.selectMasterMapProperty = function(key, element) {
    const lang = window.currentLang || 'es';
    let p = window.AppConfig.propertyDataBilingual[lang][key];
    if (!p) p = window.AppConfig.propertyDataBilingual['es'][key] || window.AppConfig.propertyDataBilingual['en'][key];
    
    const iframe = document.getElementById('masterMapIframe');
    if (!p || !iframe) return;

    // Highlight sidebar
    let targetEl = element || document.querySelector(`.map-prop-item[data-key="${key}"]`);
    document.querySelectorAll('.map-prop-item').forEach(el => el.classList.remove('active'));
    if (targetEl) {
        targetEl.classList.add('active');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Update Map - Force Refresh
    const url = p.mapUrl || "";
    console.log(`🗺️ Sincronizando Mapa para [${key}]:`, url);
    
    // Clear and set to force reload
    iframe.src = ""; 
    setTimeout(() => {
        if (url) {
            iframe.src = url;
            iframe.style.opacity = '1';
        } else {
            iframe.src = "about:blank";
            iframe.style.opacity = '0.3';
            console.warn(`⚠️ La propiedad "${key}" no tiene una URL de mapa válida.`);
        }
    }, 50);
};

window.previewAdminMap = function() {
    const val = document.getElementById('newMapUrl')?.value;
    const preview = document.getElementById('adminMapPreview');
    if (!val || !preview) return;
    
    let url = val;
    if (url.includes('<iframe')) {
        const match = url.match(/src="([^"]+)"/);
        url = match ? match[1] : url;
    }
    url = url.replace(/^["']|["']$/g, '').trim();

    preview.style.display = 'block';
    preview.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:0;" allowfullscreen loading="lazy"></iframe>`;
};

document.addEventListener('DOMContentLoaded', initApp);
