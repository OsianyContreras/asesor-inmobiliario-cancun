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
let isAdmin = false; // Declaración global al inicio
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
if (typeof AppConfig !== 'undefined') {
    loadAppConfig();
    renderHomeCards();
}

// updateHomeCardPrices was removed and replaced by dynamic renderHomeCards()


// =========================================
// SHOW PROPERTY MODAL (ULTRA-SIMPLE, SIN DEPENDENCIAS)
// Llamada directamente desde el HTML con datos hardcodeados
// =========================================
let LocalPreviews = {}; // Global para guardar Blobs temporales

const ALL_AMENITIES = [
    { id: 'pool', label: 'Alberca', icon: 'bx-water' },
    { id: 'gym', label: 'Gimnasio', icon: 'bx-dumbbell' },
    { id: 'security', label: 'Seguridad 24/7', icon: 'bx-shield-quarter' },
    { id: 'park', label: 'Áreas Verdes', icon: 'bx-tree' },
    { id: 'court', label: 'Canchas', icon: 'bx-basketball' },
    { id: 'school', label: 'Escuelas', icon: 'bx-book-open' },
    { id: 'dog_park', label: 'Área de Mascotas', icon: 'bx-dog' },
    { id: 'kids_club', label: 'Kids Club', icon: 'bx-face' },
    { id: 'coworking', label: 'Coworking', icon: 'bx-laptop' }
];

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

    // Abrir modal e impedir scroll de fondo en móviles
    pmModal.classList.add('active');
    document.body.style.overflow = 'hidden';

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
        alert("Lo sentimos, los detalles de esta propiedad no están disponibles en este momento.");
        return;
    }

    const pmModal = document.getElementById('propertyModal');
    if (!pmModal) return;

    // El panel de amenidades y tipo se ha unificado dentro de cada unidad en updateModalContent para mayor orden.

    // Las amenidades ahora se renderizan dentro de cada unidad para unificación visual en updateModalContent

    // 1. Galería de Imágenes
    const pmMainImg = document.getElementById('pmMainImg');
    const imagesArray = data.images || [];
    if (pmMainImg && imagesArray.length > 0) {
        pmMainImg.src = imagesArray[0];
        pmMainImg.alt = data.title || 'Propiedad';
    }

    const pmThumbnails = document.getElementById('pmThumbnails');
    if (pmThumbnails) {
        pmThumbnails.innerHTML = '';
        const roomLabels = (activeLang === 'en') ? ['Exterior', 'Living', 'Bedroom', 'Bath', 'Kitchen'] : ['Exterior', 'Sala', 'Recámara', 'Baño', 'Cocina'];

        imagesArray.forEach((imgUrl, index) => {
            const label = roomLabels[index] || `Foto ${index + 1}`;
            const wrapper = document.createElement('div');
            wrapper.className = 'thumb-wrapper';
            wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;flex-shrink:0;position:relative;';

            const thumbElement = document.createElement('img');
            // Usar preview local si existe, de lo contrario la URL normal
            thumbElement.src = LocalPreviews[imgUrl] || imgUrl;
            thumbElement.style.cssText = `height:65px;width:90px;object-fit:cover;border-radius:8px;transition:all 0.25s ease;border:${index === 0 ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.1)'};`;

            const labelEl = document.createElement('span');
            labelEl.textContent = label;
            labelEl.style.cssText = `font-size:0.65rem;color:${index === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.4)'};text-transform:uppercase;`;

            wrapper.appendChild(thumbElement);
            wrapper.appendChild(labelEl);

            // Add delete button for image if admin
            if (isAdmin) {
                const delImg = document.createElement('button');
                delImg.innerHTML = '×';
                delImg.style.cssText = 'position:absolute;top:-5px;right:-5px;background:#ef4444;color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;z-index:5;';
                delImg.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm("¿Eliminar imagen?")) {
                        syncGalleryEdit(key, 'delete', index);
                        openPropertyModal(id);
                    }
                };
                wrapper.appendChild(delImg);

                // Add URL edit on double click
                wrapper.ondblclick = () => {
                    triggerImagePicker(key, 'edit', index, id);
                };
            }

            wrapper.onclick = () => {
                if (pmMainImg) pmMainImg.src = imgUrl;
                Array.from(pmThumbnails.querySelectorAll('img')).forEach(i => i.style.border = '2px solid rgba(255,255,255,0.1)');
                Array.from(pmThumbnails.querySelectorAll('span')).forEach(s => s.style.color = 'rgba(255,255,255,0.4)');
                thumbElement.style.border = '2px solid var(--primary)';
                labelEl.style.color = 'var(--primary)';
            };
            pmThumbnails.appendChild(wrapper);
        });

        // Add "Add Image" if admin
        if (isAdmin) {
            const addImgBtn = document.createElement('div');
            addImgBtn.style.cssText = 'height:65px;width:90px;border:2px dashed rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;';
            addImgBtn.innerHTML = '<i class="bx bx-plus" style="font-size:1.5rem;color:rgba(255,255,255,0.4);"></i>';
            addImgBtn.onclick = () => {
                triggerImagePicker(key, 'add', null, id);
            };
            pmThumbnails.appendChild(addImgBtn);
        }
    }

    // 2. Selector de Unidades
    const unitSelector = document.getElementById('unitSelector');
    if (unitSelector) {
        unitSelector.innerHTML = '';
        const units = data.units || [];

        // --- MEJORA: Selector de Niveles Inteligente ---
        if (data.propType === 'Departamento' || data.propType === 'Casa Duplex') {
            const selectorLabel = document.createElement('div');
            selectorLabel.style.cssText = 'font-size:0.7rem; color:var(--primary); margin:15px 0 10px; text-transform:uppercase; font-weight:700; text-align:center;';
            const labelText = data.propType === 'Casa Duplex' ? 'Selecciona Planta' : 'Selecciona Nivel';
            selectorLabel.textContent = isAdmin ? `-- ${labelText} --` : labelText + ':';
            unitSelector.appendChild(selectorLabel);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px;';

            units.forEach((unit, index) => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'position:relative; flex:1; min-width:80px;';

                const btn = document.createElement('button');
                btn.className = `unit-btn ${index === window.currentEditUnitIndex ? 'active' : ''}`;

                // Texto directo del nombre guardado
                const levelText = unit.name || (unit.level === 0 ? 'Planta Baja' : `Nivel ${unit.level}`);

                btn.style.cssText = 'width:100%; text-align:center; padding:10px; font-size:0.8rem; height:100%;';
                btn.textContent = levelText;

                btn.onclick = () => {
                    Array.from(grid.children).forEach(w => w.querySelector('.unit-btn').classList.remove('active'));
                    btn.classList.add('active');
                    window.currentEditUnitIndex = index;
                    updateModalContent(unit);
                };

                wrapper.appendChild(btn);

                // Icono de eliminación (Solo Admin)
                if (isAdmin) {
                    const del = document.createElement('div');
                    del.innerHTML = '&times;';
                    del.style.cssText = 'position:absolute; top:-5px; right:-5px; width:18px; height:18px; background:#ef4444; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; cursor:pointer; z-index:5; box-shadow:0 2px 4px rgba(0,0,0,0.3);';
                    del.onclick = (e) => {
                        e.stopPropagation();
                        if (data.units.length <= 1) {
                            alert("No puedes eliminar la única unidad.");
                            return;
                        }
                        if (confirm(`¿Eliminar "${levelText}" permanentemente?`)) {
                            data.units.splice(index, 1);
                            syncModalEdit(key, 'units', data.units);
                            window.currentEditUnitIndex = 0;
                            openPropertyModal(id);
                        }
                    };
                    wrapper.appendChild(del);
                }

                grid.appendChild(wrapper);
            });
            unitSelector.appendChild(grid);
        } else {
            // Selector normal para Casas / Residencial (con soporte de eliminación)
            const list = document.createElement('div');
            list.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
            units.forEach((unit, index) => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'position:relative; width:100%;';

                const btn = document.createElement('button');
                btn.className = `unit-btn ${index === window.currentEditUnitIndex ? 'active' : ''}`;
                btn.textContent = unit.name;
                btn.style.width = '100%';
                btn.onclick = () => {
                    Array.from(list.children).forEach(w => w.querySelector('.unit-btn').classList.remove('active'));
                    btn.classList.add('active');
                    window.currentEditUnitIndex = index;
                    updateModalContent(unit);
                };
                wrapper.appendChild(btn);

                if (isAdmin) {
                    const del = document.createElement('div');
                    del.innerHTML = '&times;';
                    del.style.cssText = 'position:absolute; top:50%; right:10px; transform:translateY(-50%); width:20px; height:20px; background:#ef4444; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; cursor:pointer; z-index:5;';
                    del.onclick = (e) => {
                        e.stopPropagation();
                        if (data.units.length <= 1) {
                            alert("No puedes eliminar la única unidad.");
                            return;
                        }
                        if (confirm(`¿Eliminar "${unit.name}" permanentemente?`)) {
                            data.units.splice(index, 1);
                            syncModalEdit(key, 'units', data.units);
                            window.currentEditUnitIndex = 0;
                            openPropertyModal(id);
                        }
                    };
                    wrapper.appendChild(del);
                }
                list.appendChild(wrapper);
            });
            unitSelector.appendChild(list);
        }

        // Add "Add Unit" button if admin
        if (isAdmin) {
            const addBtn = document.createElement('button');
            addBtn.className = 'unit-btn';
            addBtn.innerHTML = '<i class="bx bx-plus"></i>';
            addBtn.style.border = '1px dashed var(--primary)';
            addBtn.onclick = () => {
                const newUnit = {
                    name: "Planta Baja", // Nombre por defecto para que no salga undefined
                    price: "$0",
                    beds: 2,
                    baths: 1,
                    amenity: "Amenidad",
                    desc: "Descripción...",
                    level: units.length,
                    extras: []
                };
                if (!data.units) data.units = [];
                data.units.push(newUnit);
                openPropertyModal(id); // Refresh
            };
            unitSelector.appendChild(addBtn);
        }
    }

    // 3. Función para actualizar contenido según unidad
    function updateModalContent(unit) {
        const setT = (elId, val, field) => {
            const el = document.getElementById(elId);
            if (el) {
                el.textContent = val;
                if (isAdmin) {
                    el.contentEditable = "true";
                    el.onblur = () => {
                        syncModalEdit(key, field, el.textContent);
                        // Sincronizar herencia inmediata para todos los campos maestros
                        if ((data.propType === 'Departamento' || data.propType === 'Casa Duplex')) {
                            propagateUnitConfig(key, field, el.textContent);
                        }
                    };
                    // Soporte para Enter
                    el.onkeypress = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            el.blur();
                        }
                    };
                } else {
                    el.contentEditable = "false";
                }
            }
        };

        window.currentEditProperty = key; // Track for sync

        setT('pmBadge', data.badge, 'badge');
        setT('pmTitle', data.title, 'title');
        setT('pmPrice', unit.price, 'price');

        // Update Map View
        const mapContainer = document.getElementById('pmMapContainer');
        const mapIframe = document.getElementById('pmMapIframe');

        // Remove old address text if exists to avoid dupes
        let oldAddr = document.getElementById('pmAddressTextDisplay');
        if (oldAddr) oldAddr.remove();

        if (mapContainer && mapIframe) {
            if (data.mapLocation && data.mapLocation.trim() !== '') {
                mapIframe.src = data.mapLocation;
                mapContainer.style.display = 'block';

                // Mostrar dirección de texto al cliente
                if (data.addressText && data.addressText.trim() !== '') {
                    const addrP = document.createElement('p');
                    addrP.id = 'pmAddressTextDisplay';
                    addrP.style.cssText = 'color: #cbd5e1; font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4;';
                    addrP.innerHTML = `<i class='bx bx-map-pin' style='color:var(--primary); margin-right:4px;'></i> ${data.addressText}`;
                    mapContainer.insertBefore(addrP, mapIframe);
                }
            } else {
                mapContainer.style.display = 'none';
                mapIframe.src = '';
            }
        }

        // --- MEJORA: Atributos Granulares de la Unidad ---
        const detailsContainer = pmModal.querySelector('.pm-features');
        if (isAdmin && detailsContainer) {
            detailsContainer.innerHTML = '';
            detailsContainer.style.display = 'grid';
            detailsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
            detailsContainer.style.gap = '15px';


            // --- NUEVO: Selector de Tipo Integrado (AHORA PRIMERO) ---
            const typeHeader = document.createElement('div');
            typeHeader.style.cssText = 'grid-column: span 2; margin-top:5px; font-size:0.7rem; color:var(--primary); font-weight:700; text-align:center;';
            typeHeader.textContent = '-- TIPO DE VIVIENDA --';
            detailsContainer.appendChild(typeHeader);

            const typeGrid = document.createElement('div');
            typeGrid.style.cssText = 'grid-column: span 2; display:flex; gap:10px; margin-bottom:15px;';
            ['Departamento', 'Casa Individual', 'Casa Duplex'].forEach(t => {
                const btn = document.createElement('button');
                btn.textContent = t;
                const isSel = data.propType === t;
                btn.style.cssText = `flex:1; padding:10px; border-radius:8px; font-size:0.7rem; cursor:pointer; font-weight:${isSel ? '700' : '400'}; border:1px solid ${isSel ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; background:${isSel ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.2)'}; color:white; transition:all 0.3s; box-shadow:${isSel ? '0 0 15px rgba(16,185,129,0.2)' : 'none'};`;
                btn.onclick = () => {
                    data.propType = t;
                    syncModalEdit(key, 'propType', t);
                    if (t === 'Departamento' || t === 'Casa Duplex') {
                        const masterUnit = data.units[window.currentEditUnitIndex || 0];
                        if (masterUnit) {
                            ['beds', 'baths', 'sqm', 'amenity', 'desc', 'extras'].forEach(f => {
                                propagateUnitConfig(key, f, masterUnit[f]);
                            });
                        }
                    }
                    openPropertyModal(id);
                };
                typeGrid.appendChild(btn);
            });
            detailsContainer.appendChild(typeGrid);

            const addField = (label, value, field, type = 'number', step = '1') => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = `<label style="display:block; font-size:0.7rem; color:var(--primary); margin-bottom:4px;">${label}</label>`;
                const input = document.createElement('input');
                input.type = type;
                if (type === 'number') input.step = step;
                input.value = value;
                input.className = 'admin-input';
                input.style.cssText = 'width:100%; padding:8px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:6px;';
                input.onblur = () => {
                    syncModalEdit(key, field, input.value);
                    if ((data.propType === 'Departamento' || data.propType === 'Casa Duplex') && field !== 'level' && field !== 'price' && field !== 'name') {
                        propagateUnitConfig(key, field, input.value);
                    }
                    if (field === 'name' || field === 'price') {
                        openPropertyModal(id);
                    }
                };
                input.onkeypress = (e) => {
                    if (e.key === 'Enter') input.blur();
                };
                wrapper.appendChild(input);
                detailsContainer.appendChild(wrapper);
            };

            // --- UBICACIÓN DEL COMPLEJO ---
            const complexHeader = document.createElement('div');
            complexHeader.style.cssText = 'grid-column: span 2; margin-top:5px; font-size:0.75rem; color:var(--primary); font-weight:700; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;';
            complexHeader.textContent = '📍 DATOS GENERALES (Aplica a todo el complejo)';
            detailsContainer.appendChild(complexHeader);

            addField('Estado / Región (Ej. Quintana Roo)', data.state || '', 'state', 'text');

            // Botón y campo de Leaflet Map Picker
            const mapWrap = document.createElement('div');
            mapWrap.style.cssText = 'grid-column: span 2; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; margin-bottom: 5px;';

            mapWrap.innerHTML = `
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label style="font-size:0.7rem; color:var(--primary);">Coordenadas / Texto de Dirección</label>
                    <button type="button" id="btnOpenLeafletPicker" style="background:var(--primary); border:none; color:white; padding:4px 12px; border-radius:4px; font-size:0.65rem; cursor:pointer; font-weight:bold;">
                        <i class='bx bx-map-pin'></i> Seleccionar Ubicación
                    </button>
                </div>
            `;

            const addrInput = document.createElement('input');
            addrInput.type = 'text';
            addrInput.value = data.addressText || '';
            addrInput.className = 'admin-input';
            addrInput.style.cssText = 'width:100%; padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1; border-radius:6px; font-size: 0.75rem; margin-bottom:10px;';
            addrInput.placeholder = 'Ej. Av Tulum 23, Centro, 77500...';
            addrInput.onblur = () => {
                syncModalEdit(key, 'addressText', addrInput.value);
                // NOTA: Se removió openPropertyModal(id) para evitar recrear el DOM que mata el click del botón a continuación.
            };

            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.value = data.mapLocation || '';
            urlInput.className = 'admin-input';
            urlInput.style.cssText = 'width:100%; padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1; border-radius:6px; font-size: 0.65rem;';
            urlInput.placeholder = 'URL Embed iframe de Google Maps...';
            urlInput.onblur = () => {
                syncModalEdit(key, 'mapLocation', urlInput.value);
            };

            mapWrap.appendChild(addrInput);
            mapWrap.appendChild(urlInput);
            detailsContainer.appendChild(mapWrap);

            // Wire up Leaflet modal opener
            const pickerBtn = mapWrap.querySelector('#btnOpenLeafletPicker');
            pickerBtn.onclick = (e) => {
                e.preventDefault();
                showLocationPicker(key);
            };

            // --- DETALLES DE LA UNIDAD ---
            const unitHeader = document.createElement('div');
            unitHeader.style.cssText = 'grid-column: span 2; margin-top:15px; font-size:0.75rem; color:var(--primary); font-weight:700; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;';
            unitHeader.textContent = '🏠 CONFIGURACIÓN DE ESTA UNIDAD';
            detailsContainer.appendChild(unitHeader);

            addField('Nombre UNIDAD/PISO', unit.name || '', 'name', 'text');
            addField('Recámaras', unit.beds || 0, 'beds');

            addField('Baños', unit.baths || 0, 'baths', 'number', '0.5');
            addField('M2 Const.', unit.sqm || 0, 'sqm');
            addField('Amenidad (Ej: Rooftop)', unit.amenity || '', 'amenity', 'text');
            addField('Precio unitario', unit.price || '', 'price', 'text');

            // --- NUEVO: Catálogo Unificado de Características ---
            const catalogWrapper = document.createElement('div');
            catalogWrapper.style.gridColumn = 'span 2';
            catalogWrapper.innerHTML = `<label style="display:block; font-size:0.8rem; color:var(--primary); margin:15px 0 10px; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">CATÁLOGO DE CONFIGURACIÓN:</label>`;

            const renderCategory = (title, items, isProjectAmenity = false) => {
                const header = document.createElement('div');
                header.style.cssText = 'font-size:0.65rem; color:#888; margin:10px 0 5px; text-transform:uppercase;';
                header.textContent = title;
                catalogWrapper.appendChild(header);

                const grid = document.createElement('div');
                grid.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;';

                items.forEach(it => {
                    const btn = document.createElement('button');
                    btn.textContent = it.label;
                    const isSelected = isProjectAmenity
                        ? (data.amenities || []).includes(it.id)
                        : (unit.extras || []).includes(it.id);

                    btn.style.cssText = `padding:5px 12px; border-radius:50px; border:1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; background:${isSelected ? 'rgba(16,185,129,0.25)' : 'transparent'}; color:${isSelected ? 'var(--primary)' : '#aaa'}; cursor:pointer; font-size:0.65rem; transition:all 0.3s;`;

                    btn.onclick = () => {
                        if (isProjectAmenity) {
                            if (!data.amenities) data.amenities = [];
                            if (data.amenities.includes(it.id)) {
                                data.amenities = data.amenities.filter(id => id !== it.id);
                            } else {
                                data.amenities.push(it.id);
                            }
                            syncModalEdit(key, 'amenities', data.amenities);
                        } else {
                            if (!unit.extras) unit.extras = [];
                            if (unit.extras.includes(it.id)) {
                                unit.extras = unit.extras.filter(id => id !== it.id);
                            } else {
                                unit.extras.push(it.id);
                            }
                            syncModalEdit(key, 'extras', unit.extras);
                            if (data.propType === 'Departamento' || data.propType === 'Casa Duplex') {
                                propagateUnitConfig(key, 'extras', unit.extras);
                            }
                        }
                        updateModalContent(unit);
                    };
                    grid.appendChild(btn);
                });
                catalogWrapper.appendChild(grid);
            };

            // 1. Conceptos Básicos / Interior
            renderCategory('Interiores (Conceptos Básicos)', [
                { id: 'sala', label: 'Sala' },
                { id: 'comedor', label: 'Comedor' },
                { id: 'cocina', label: 'Cocina' },
                { id: 'patio_servicio', label: 'Patio de Servicio' }
            ]);

            // 2. Exteriores y Extras
            renderCategory('Exteriores / Privados', [
                { id: 'patio', label: 'Patio' },
                { id: 'roof', label: 'Roof Garden' },
                { id: 'estacionamiento', label: 'Estacionamiento' }
            ]);

            // 3. Amenidades del Conjunto (Lujo)
            renderCategory('Amenidades del Conjunto (Lujo)', ALL_AMENITIES, true);

            detailsContainer.appendChild(catalogWrapper);

        } else {
            // Modo cliente normal: mostrar iconos según los datos
            const detailsGrid = pmModal.querySelector('.pm-features');
            if (detailsGrid) {
                detailsGrid.innerHTML = `
                    <div class="pm-feature">
                        <i class='bx bx-bed'></i>
                        <span>${unit.beds} Recámaras</span>
                    </div>
                    <div class="pm-feature">
                        <i class='bx bx-bath'></i>
                        <span>${unit.baths} Baños</span>
                    </div>
                `;

                if (unit.name || (unit.level !== undefined && unit.level !== null)) {
                    const lvlLabel = unit.name || getFriendlyLevelName(unit.level, data.propType);

                    detailsGrid.innerHTML += `
                        <div class="pm-feature">
                            <i class='bx bx-building'></i>
                            <span>${lvlLabel}</span>
                        </div>`;
                }

                if (unit.sqm) {
                    detailsGrid.innerHTML += `
                        <div class="pm-feature">
                            <i class='bx bx-area'></i>
                            <span>${unit.sqm} m²</span>
                        </div>`;
                }

                if (unit.amenity && unit.amenity.trim() !== "" && unit.amenity !== "Amenidad") {
                    detailsGrid.innerHTML += `
                        <div class="pm-feature" style="grid-column: span 2;">
                            <i class='bx bx-building-house'></i>
                            <span>${unit.amenity}</span>
                        </div>
                    `;
                }

                // Renderizar EXTRAS de la unidad
                if (unit.extras && unit.extras.length > 0) {
                    const extraMap = {
                        'sala': { label: 'Sala', icon: 'bx-chair' },
                        'comedor': { label: 'Comedor', icon: 'bx-collection' },
                        'cocina': { label: 'Cocina', icon: 'bx-fridge' },
                        'patio_servicio': { label: 'Patio Serv.', icon: 'bx-water' },
                        'patio': { label: 'Patio', icon: 'bx-sun' },
                        'roof': { label: 'Roof Garden', icon: 'bx-leaf' },
                        'estacionamiento': { label: 'Estacionamiento', icon: 'bx-car' }
                    };
                    unit.extras.forEach(exId => {
                        const info = extraMap[exId];
                        if (info) {
                            detailsGrid.innerHTML += `
                                <div class="pm-feature">
                                    <i class='bx ${info.icon}'></i>
                                    <span>${info.label}</span>
                                </div>`;
                        }
                    });
                }

                // --- NUEVO: Renderizar AMENIDADES DEL PROYECTO (Alberca, Canchas, etc.) en la misma rejilla ---
                (data.amenities || []).forEach(amId => {
                    const amData = ALL_AMENITIES.find(a => a.id === amId);
                    if (amData) {
                        detailsGrid.innerHTML += `
                            <div class="pm-feature">
                                <i class='bx ${amData.icon}' style='color:var(--primary);'></i>
                                <span>${amData.label}</span>
                            </div>`;
                    }
                });
            }
        }

        // Descripcion siempre es editable/visible abajo
        setT('pmDesc', unit.desc, 'desc');
    }

    // Inicializar con la primera unidad
    if (data.units && data.units.length > 0) {
        window.currentEditUnitIndex = 0;
        updateModalContent(data.units[0]);
    }

    pmModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    pmModal.onclick = (e) => { if (e.target === pmModal) closePropertyModal(); };
}

function closePropertyModal() {
    const pmModal = document.getElementById('propertyModal');
    if (pmModal) {
        pmModal.classList.remove('active');
        document.body.style.overflow = '';
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

        case "BUY_LIVE":
            if ((typeof currentLang !== 'undefined' && currentLang === 'en')) {
                responseHTML = `Wonderful! A home for your family is the best investment. Do you already know if you have the 1080 Infonavit credit points needed?`;
                options = [
                    { text: "Yes, I have them", action: "VALUE_PROP_JUMP" },
                    { text: "I don't know my points", action: "EXPLAIN_POINTS" }
                ];
            } else {
                responseHTML = `¡Maravilloso! Un hogar para tu familia es la mejor decisión. ¿Ya sabes si cuentas con los 1080 puntos de crédito Infonavit necesarios?`;
                options = [
                    { text: "Sí, ya los tengo", action: "VALUE_PROP_JUMP" },
                    { text: "No sé cuántos tengo", action: "EXPLAIN_POINTS" }
                ];
            }
            break;

        case "BUY_INVEST":
            if ((typeof currentLang !== 'undefined' && currentLang === 'en')) {
                responseHTML = `Smart move! 📈 The Riviera Maya offers up to 15% annual ROI in vacation rentals. We have pre-sale options and immediate delivery. Would you like to see our highest-yield developments?`;
                options = [
                    { text: "Yes, show me options", action: "LEAD", primary: true },
                    { text: "How do I use my Infonavit?", action: "EXPLAIN_POINTS" }
                ];
            } else {
                responseHTML = `¡Movimiento inteligente! 📈 La Riviera Maya ofrece hasta 15% de ROI anual en rentas vacacionales. Tenemos opciones en preventa y entrega inmediata. ¿Te gustaría conocer los desarrollos de mayor rendimiento?`;
                options = [
                    { text: "Sí, quiero ver opciones", action: "LEAD", primary: true },
                    { text: "¿Cómo uso mi Infonavit?", action: "EXPLAIN_POINTS" }
                ];
            }
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
    if (leadModal) {
        leadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
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
    if (leadModal) {
        leadModal.classList.remove('active');
        document.body.style.overflow = '';
    }
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

function renderHomeCards(options = {}) {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;

    const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
    const data = (propertyDataBilingual && propertyDataBilingual[lang]) ? propertyDataBilingual[lang] : {};

    // --- NUEVO: Autocompletar Filtro Ubicación con Estados ---
    const locSelect = document.getElementById('filterLocation');
    if (locSelect) {
        // Collect all distinct states
        const uniqueStates = [...new Set(Object.values(data).map(p => p.state).filter(s => s && s.trim() !== ''))];
        // Retain the current value if possible
        const currentVal = locSelect.value;
        if (uniqueStates.length > 0) {
            locSelect.innerHTML = `<option value="all">${lang === 'es' ? 'Todas las ubicaciones' : 'All locations'}</option>`;
            uniqueStates.forEach(state => {
                locSelect.innerHTML += `<option value="${state.toLowerCase()}">${state}</option>`;
            });
            // Try to set back to currentVal if it still exists
            if (Array.from(locSelect.options).some(opt => opt.value === currentVal)) {
                locSelect.value = currentVal;
            } else {
                locSelect.value = 'all';
            }
        }
    }

    // 1. Filtrado de datos
    const filteredKeys = Object.keys(data).filter(key => {
        const prop = data[key];
        const { location, beds, price, delivery } = options;

        // Filtro Ubicación (Mejorado con el estado real)
        if (location && location !== 'all') {
            const stateStr = (prop.state || '').toLowerCase();
            const searchStr = stateStr + ' ' + (prop.title + key).toLowerCase();
            if (!searchStr.includes(location.toLowerCase())) return false;
        }

        // Filtro Recámaras (Máximo de recámaras en sus unidades)
        if (beds && beds !== '0') {
            const maxBeds = prop.units ? Math.max(...prop.units.map(u => u.beds || 0)) : 0;
            if (maxBeds < parseInt(beds)) return false;
        }

        // Filtro Entrega (Badge)
        if (delivery && delivery !== 'all') {
            if (prop.badge !== delivery) return false;
        }

        // Filtro Precio (Usamos el precio de la primera unidad)
        if (price && price !== 'all') {
            const firstPriceStr = (prop.units && prop.units[0]) ? prop.units[0].price : "0";
            const numericPrice = parseFloat(firstPriceStr.replace(/[^0-9.]/g, '')) || 0;

            if (price === 'low' && numericPrice >= 1000000) return false;
            if (price === 'mid' && (numericPrice < 1000000 || numericPrice > 2000000)) return false;
            if (price === 'high' && numericPrice <= 2000000) return false;
        }

        return true;
    });

    // 2. Renderizado
    grid.innerHTML = '';

    if (filteredKeys.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">
            <i class='bx bx-search-alt' style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;"></i>
            <h3>No encontramos coincidencias exactas</h3>
            <p>Intenta ajustar tus filtros para ver más opciones.</p>
        </div>`;
        return;
    }

    filteredKeys.forEach(key => {
        const prop = data[key];
        const firstUnit = (prop.units && prop.units[0]) ? prop.units[0] : null;
        let priceText = lang === 'es' ? 'Consultar precio' : 'Contact for price';

        if (firstUnit) {
            priceText = lang === 'es' ? `Desde ${firstUnit.price}` : `Starting from ${firstUnit.price}`;
            if (key === 'cancun' && lang === 'es') priceText += ' o puntos';
        }

        const card = document.createElement('div');
        card.className = 'prop-card';
        card.style.cursor = 'pointer';
        card.setAttribute('data-aos', 'fade-up');

        const mainImg = (prop.images && prop.images[0]) ? prop.images[0] : 'placeholder.png';

        card.innerHTML = `
            ${isAdmin ? `<button class="delete-complex-btn" onclick="event.stopPropagation(); deletePropertyComplex('${key}')" title="Eliminar complejo completo">&times;</button>` : ''}
            <img src="${mainImg}" alt="${prop.title}" style="width:100%;height:200px;object-fit:cover;display:block;">
            <span class="prop-badge">${prop.badge || ''}</span>
            <div class="prop-info">
                <h4>${prop.title}</h4>
                <p id="card-price-${key}">${priceText}</p>
                <button onclick="openPropertyModal('${key}')"
                    style="margin-top:10px;width:100%;background:var(--primary);border:none;color:white;padding:8px;border-radius:4px;cursor:pointer;font-weight:600;">
                    <i class='bx bx-expand-alt'></i> ${lang === 'es' ? 'Ver Detalles' : 'View Details'}
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    // 3. Add New Complex Card (Admin Only)
    if (isAdmin) {
        const addCard = document.createElement('div');
        addCard.className = 'add-complex-card';
        addCard.innerHTML = `
            <i class='bx bx-plus-circle'></i>
            <span>Ingresar Nuevo Complejo</span>
        `;
        addCard.onclick = () => addNewPropertyComplex();
        grid.appendChild(addCard);
    }

    // 4. Update Interactive Map
    setTimeout(buildInteractiveMap, 100);
}

// Init AOS Animation Library and Base Data
document.addEventListener('DOMContentLoaded', () => {
    loadAppConfig();

    // Inicializar tarjetas dinámicas
    renderHomeCards();

    // 1. Initialize Advanced Property Filter Listeners
    const filters = ['filterLocation', 'filterBeds', 'filterPrice', 'filterDelivery'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                const options = {
                    location: document.getElementById('filterLocation').value,
                    beds: document.getElementById('filterBeds').value,
                    price: document.getElementById('filterPrice').value,
                    delivery: document.getElementById('filterDelivery').value
                };
                renderHomeCards(options);
            });
        }
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
let LOCATIONS = [];

function buildInteractiveMap() {
    LOCATIONS = [];
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
    const data = (propertyDataBilingual && propertyDataBilingual[lang]) ? propertyDataBilingual[lang] : {};

    const pinsContainer = document.getElementById('mapaPinsContainer');
    if (!pinsContainer) return;

    pinsContainer.innerHTML = '';

    let index = 0;
    for (const key in data) {
        const prop = data[key];
        if (prop.mapLocation && prop.mapLocation.trim() !== '') {
            LOCATIONS.push({
                name: prop.title,
                desc: (prop.units && prop.units[0]) ? prop.units[0].desc : '',
                url: prop.mapLocation,
                card: key
            });

            const btn = document.createElement('div');
            btn.className = `mapa-pin ${index === 0 ? 'active' : ''}`;
            const iconKey = prop.propType === 'Casa Individual' ? 'bx-home' : 'bx-building-house';
            btn.innerHTML = `<i class='bx ${iconKey}'></i><span>${prop.title}</span>`;

            const currentIndex = index; // closure
            btn.onclick = () => selectLocation(currentIndex);

            pinsContainer.appendChild(btn);
            index++;
        }
    }

    // Auto-select the first one if exists
    if (LOCATIONS.length > 0) {
        selectLocation(0);
    } else {
        // Fallback or hide map if logic
        pinsContainer.innerHTML = '<p style="color:var(--text-muted); padding:10px;">No hay mapas configurados.</p>';
    }
}

function selectLocation(i) {
    if (!LOCATIONS[i]) return;
    const loc = LOCATIONS[i];
    const iframe = document.getElementById('mapaFrame');
    if (iframe) iframe.src = loc.url;
    const info = document.getElementById('mapaInfo');
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
    const btnText = lang === 'es' ? 'Ver Detalles' : 'View Details';

    if (info) info.innerHTML = `<h3>${loc.name}</h3><p>${loc.desc}</p><button class="submit-btn" onclick="openPropertyModal('${loc.card}')">${btnText}</button>`;

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

/* =========================================
   NUEVO: Lógica del Simulador de Crédito Gamificado
   ========================================= */
function formatCurrency(num) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
}

function updateSimulator() {
    const ingresoEl = document.getElementById('sim-ingreso');
    const edadEl = document.getElementById('sim-edad');
    const ahorroEl = document.getElementById('sim-ahorro');

    if (!ingresoEl || !edadEl || !ahorroEl) return;

    const ingreso = parseInt(ingresoEl.value) || 25000;
    const edad = parseInt(edadEl.value) || 30;
    const ahorro = parseInt(ahorroEl.value) || 50000;

    // Update slider visual labels
    document.getElementById('ingreso-val').textContent = formatCurrency(ingreso);
    document.getElementById('edad-val').textContent = edad + ' años';
    document.getElementById('ahorro-val').textContent = formatCurrency(ahorro);

    // Mortgage math
    let plazoYears = Math.min(20, 65 - edad);
    if (plazoYears < 5) plazoYears = 5;

    const PMT = ingreso * 0.30; // Max monthly payment = 30% of income
    const r = 0.1045 / 12; // 10.45% average annual rate
    const n = plazoYears * 12;

    // Present Value formula
    const creditoMaximo = PMT * ((1 - Math.pow(1 + r, -n)) / r);
    const poderTotal = creditoMaximo + ahorro;

    // Update Result Panel
    document.getElementById('res-poder').textContent = formatCurrency(poderTotal);
    document.getElementById('res-credito').textContent = formatCurrency(creditoMaximo);
    document.getElementById('res-ahorro').textContent = formatCurrency(ahorro);
    document.getElementById('res-mensualidad').textContent = formatCurrency(PMT);

    // Update interactive Pie Chart
    const chart = document.getElementById('sim-chart');
    if (chart && poderTotal > 0) {
        const creditPerc = Math.round((creditoMaximo / poderTotal) * 100);
        chart.style.background = `conic-gradient(var(--primary) 0% ${creditPerc}%, #10b981 ${creditPerc}% 100%)`;
    }
}

// Init comparador and simulador on load
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(updateComparador, 500);
    setTimeout(updateSimulator, 300);
});

// =============================================
// MOBILE TOUCH FIX & SPOTLIGHT LIGHTING: Myth flip cards
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.myth-card').forEach(function (card) {
        // Soporte de clic/toque para voltear las tarjetas
        card.addEventListener('click', function () {
            // Toggle active class para el flip
            card.classList.toggle('flipped');
        });

        // Spotlight (Glassmorphism 2.0) tracker
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

// =============================================
// PWA: Service Worker Registration
// =============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registrado!', reg.scope))
            .catch(err => console.error('Error al registrar Service Worker:', err));
    });
}

// =============================================
// ADMIN / EDITOR MODE LOGIC
// =============================================
const ADMIN_KEY = "7003";

// 1. Secret Access Trigger (Long press on logo)
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    let pressTimer;

    if (logo) {
        logo.addEventListener('mousedown', () => {
            pressTimer = window.setTimeout(showAdminModal, 3000); // 3 seconds
        });
        logo.addEventListener('mouseup', () => clearTimeout(pressTimer));
        logo.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        // Touch support
        logo.addEventListener('touchstart', () => {
            pressTimer = window.setTimeout(showAdminModal, 3000);
        });
        logo.addEventListener('touchend', () => clearTimeout(pressTimer));
    }

    // Check session
    if (localStorage.getItem('adminSession') === 'true') {
        enableEditorMode();
    }
});

function showAdminModal() {
    document.getElementById('adminModal').classList.add('active');
    document.getElementById('adminKey').focus();
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    document.getElementById('adminKey').value = '';
}

function handleAdminLogin() {
    const key = document.getElementById('adminKey').value;
    if (key === ADMIN_KEY) {
        enableEditorMode();
        closeAdminModal();
        localStorage.setItem('adminSession', 'true');
        alert("🔓 MODO EDITOR ACTIVADO");
    } else {
        alert("❌ Clave incorrecta");
        document.getElementById('adminKey').value = '';
    }
}

function enableEditorMode() {
    isAdmin = true;
    document.body.classList.add('editor-mode');
    document.getElementById('adminToolbar').style.display = 'flex';
    renderHomeCards(); // <- Ensure new UI renders immediately
}

function disableEditorMode() {
    isAdmin = false;
    document.body.classList.remove('editor-mode');
    document.getElementById('adminToolbar').style.display = 'none';
    localStorage.removeItem('adminSession');
    location.reload(); // Reset to clear edits and editable states
}

// 2. Dynamic Edit Sync
// This function will be called when fields are updated in the modal
function syncModalEdit(key, field, value) {
    if (!isAdmin) return;

    // Sincronizar en ambos idiomas para que no se pierdan los cambios al cambiar de bandera
    ['es', 'en'].forEach(lang => {
        if (propertyDataBilingual[lang] && propertyDataBilingual[lang][key]) {
            const prop = propertyDataBilingual[lang][key];
            if (field === 'badge' || field === 'title' || field === 'amenities' || field === 'propType' || field === 'units' || field === 'state' || field === 'mapLocation' || field === 'addressText') {
                prop[field] = value;
            } else if (prop.units && prop.units[window.currentEditUnitIndex]) {
                // Si el valor es numérico pero viene como string (desde inputs), guardarlo como número si aplica
                const numFields = ['beds', 'baths', 'level', 'sqm'];
                if (numFields.includes(field)) {
                    prop.units[window.currentEditUnitIndex][field] = parseFloat(value) || 0;
                } else {
                    prop.units[window.currentEditUnitIndex][field] = value;
                }
            }
        }
    });

    // Actualizar las tarjetas en el Home inmediatamente con los filtros actuales
    const options = {
        location: document.getElementById('filterLocation') ? document.getElementById('filterLocation').value : 'all',
        beds: document.getElementById('filterBeds') ? document.getElementById('filterBeds').value : '0',
        price: document.getElementById('filterPrice') ? document.getElementById('filterPrice').value : 'all',
        delivery: document.getElementById('filterDelivery') ? document.getElementById('filterDelivery').value : 'all'
    };
    renderHomeCards(options);
}

/**
 * Helper para obtener el nombre amigable de un nivel
 */
function getFriendlyLevelName(level, propType) {
    // Forzamos que sea un número válido, si es "" o undefined, tratamos como 0 (Planta Baja)
    let lvl = parseInt(level);
    if (isNaN(lvl)) lvl = 0;

    if (propType === 'Casa Duplex') {
        return lvl === 0 ? 'Planta Baja' : 'Planta Alta';
    }

    if (lvl === 0) return 'Planta Baja';

    const names = {
        1: 'Primer PISO',
        2: 'Segundo PISO',
        3: 'Tercer PISO',
        4: 'Cuarto PISO',
        5: 'Quinto PISO',
        6: 'Sexto PISO',
        7: 'Séptimo PISO',
        8: 'Octavo PISO',
        9: 'Noveno PISO',
        10: 'Décimo PISO'
    };

    return names[lvl] || `Nivel ${lvl}`;
}

/**
 * Propaga un cambio a TODAS las unidades de un proyecto.
 * Útil para Torres de Deptos donde todo es igual excepto el precio/nivel.
 */
function propagateUnitConfig(key, field, value) {
    if (!isAdmin) return;
    const numFields = ['beds', 'baths', 'level', 'sqm'];

    ['es', 'en'].forEach(lang => {
        const proj = propertyDataBilingual[lang] ? propertyDataBilingual[lang][key] : null;
        if (proj && proj.units) {
            proj.units.forEach(u => {
                // No propagamos nivel ni precio
                if (field !== 'level' && field !== 'price' && field !== 'units') {
                    if (numFields.includes(field)) {
                        u[field] = parseFloat(value) || 0;
                    } else if (field === 'extras') {
                        // Clonar arrays para extras
                        u[field] = Array.isArray(value) ? [...value] : [value];
                    } else {
                        u[field] = value;
                    }
                }
            });
        }
    });
}

function syncGalleryEdit(key, action, index, value) {
    if (!isAdmin) return;
    ['es', 'en'].forEach(lang => {
        if (propertyDataBilingual[lang] && propertyDataBilingual[lang][key]) {
            const prop = propertyDataBilingual[lang][key];
            if (!prop.images) prop.images = [];

            if (action === 'edit') {
                prop.images[index] = value;
            } else if (action === 'delete') {
                prop.images.splice(index, 1);
            } else if (action === 'add') {
                prop.images.push(value);
            }
        }
    });
}

// 2.5 Image Picker Trigger
function triggerImagePicker(key, action, index, propertyId) {
    const picker = document.getElementById('adminFilePicker');
    if (!picker) return;

    picker.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Usar el nombre original del archivo tal cual (sin Carpetas)
        const finalPath = file.name.split('\\').pop().split('/').pop();

        // Crear preview local (blob)
        const blobUrl = URL.createObjectURL(file);
        LocalPreviews[finalPath] = blobUrl;

        // Guardar en la config y refrescar modal
        syncGalleryEdit(key, action, index, finalPath);
        openPropertyModal(propertyId);

        picker.value = ''; // Reset
    };

    picker.click();
}

// 3. Export Logic
async function exportNewConfig() {
    console.log("Export: Iniciando exportación...");
    try {
        const exportConfig = {
            knowledgeBaseES: knowledgeBaseES,
            knowledgeBaseEN: knowledgeBaseEN,
            translations: translations,
            propertyDataBilingual: propertyDataBilingual
        };

        const json = JSON.stringify(exportConfig, null, 4);
        const configString = `const AppConfig = ${json};\n`;

        const blob = new Blob([configString], { type: 'text/javascript' });

        // Si el navegador soporta File System Access API y estamos en un entorno seguro (localhost/https)
        if ('showSaveFilePicker' in window && window.isSecureContext) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'config.js',
                    types: [{
                        description: 'JavaScript File',
                        accept: { 'text/javascript': ['.js'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                alert("✅ Archivo guardado correctamente en la carpeta seleccionada.");
                return;
            } catch (err) {
                if (err.name === 'AbortError') return; // User cancelled
                console.warn("showSaveFilePicker falló, usando método tradicional", err);
            }
        }

        // Método manual con Modal (Obligatorio para archivos locales file:///)
        const url = URL.createObjectURL(blob);

        let existingCard = document.getElementById('manualDownloadCard');
        if (existingCard) existingCard.remove();

        const card = document.createElement('div');
        card.id = 'manualDownloadCard';
        card.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1e293b;padding:30px;border-radius:12px;border:2px solid #6366f1;z-index:99999;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.9); width: 90%; max-width: 450px;";

        card.innerHTML = `
            <div style="font-size:3rem; margin-bottom:10px;">📂</div>
            <h3 style="color:white;margin-bottom:15px;">Guardar Configuración</h3>
            <p style="color:#cbd5e1;font-size:0.95rem;margin-bottom:20px;line-height:1.5;">
                Como abriste la página directamente desde tu computadora, tu navegador bloquea la ventana automática de guardar carpetas.<br><br>
                Para elegir DÓNDE guardar <b>config.js</b> haz lo siguiente:<br><br>
                1. Haz <strong style="color:#60a5fa;">clic derecho</strong> en el botón azul de abajo.<br>
                2. Selecciona <strong style="color:#60a5fa;">"Guardar enlace como..."</strong> (Save link as...).<br>
                3. Reemplaza el archivo anterior.
            </p>
            <a href="${url}" download="config.js" style="display:inline-block;background:linear-gradient(135deg, #3b82f6, #6366f1);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1.1rem;cursor:pointer;box-shadow:0 4px 15px rgba(59,130,246,0.4);" onclick="setTimeout(()=>document.getElementById('manualDownloadCard').remove(), 2000)">
                ⬇️ Descargar config.js
            </a>
            <br><br>
            <button onclick="document.getElementById('manualDownloadCard').remove()" style="background:transparent;color:#94a3b8;border:none;cursor:pointer;text-decoration:underline;font-size:0.9rem;">Cerrar (no guardar)</button>
        `;
        document.body.appendChild(card);

    } catch (e) {
        console.error("Export: Error fatal", e);
        alert("Error al exportar: " + e.message + "\nRevisa la consola para más detalles.");
    }
}

// 4. Delete & Add Property Complex
function deletePropertyComplex(key) {
    if (!isAdmin) return;
    const title = propertyDataBilingual['es'][key]?.title || key;
    if (confirm(`¿Estás seguro de que deseas ELIMINAR el complejo "${title}" completamente? Esta acción no se puede deshacer hasta exportar.`)) {
        delete propertyDataBilingual['es'][key];
        delete propertyDataBilingual['en'][key];
        renderHomeCards();
        alert(`🗑️ Complejo "${title}" eliminado.`);
    }
}

function addNewPropertyComplex() {
    if (!isAdmin) return;
    const timestamp = Date.now();
    const newKey = `nuevo_complejo_${timestamp}`;

    // Estructura base bilingüe
    const baseProp = {
        title: "Nuevo Complejo",
        badge: "Nuevo",
        state: "Quintana Roo",
        mapLocation: "https://maps.google.com/maps?q=Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed",
        images: ["placeholder.png"],
        propType: "Departamento",
        amenities: [],
        units: [{
            name: "Planta Baja",
            price: "$0",
            beds: 1,
            baths: 1,
            sqm: 0,
            desc: "Descripción del nuevo complejo...",
            extras: []
        }]
    };

    propertyDataBilingual['es'][newKey] = { ...baseProp };
    propertyDataBilingual['en'][newKey] = {
        ...baseProp,
        title: "New Complex",
        badge: "New",
        state: "Quintana Roo",
        mapLocation: "https://maps.google.com/maps?q=Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed",
        units: [{ ...baseProp.units[0], desc: "Description for the new complex..." }]
    };

    renderHomeCards();

    // Scroll al nuevo elemento
    setTimeout(() => {
        const newCard = Array.from(document.querySelectorAll('.prop-card')).pop();
        if (newCard) newCard.scrollIntoView({ behavior: 'smooth' });
        alert("✨ Nuevo complejo creado. Haz clic en 'Ver Detalles' para editarlo.");
    }, 100);
}

// 5. Leaflet Location Picker Logic
let lfMap = null;
let lfMarker = null;
let lfCurrentKey = null;

function showLocationPicker(propKey) {
    lfCurrentKey = propKey;
    const modal = document.getElementById('locationPickerModal');
    if (!modal) return;

    // Ocultar modal de propiedades momentáneamente
    const propModal = document.getElementById('propertyModal');
    if (propModal) propModal.style.opacity = '0';

    modal.style.display = 'flex'; // En caso de que tuviera display none
    modal.classList.add('active'); // <-- EL SECRETO PARA QUE SE VEA (opacidad 1)

    document.getElementById('lfAddressText').textContent = "Cargando mapa interactivo...";
    document.getElementById('lfConfirmBtn').disabled = true;

    // Inicializar Leaflet la primera vez
    if (!lfMap) {
        lfMap = L.map('lfMapContainer').setView([21.1619, -86.8515], 10); // Default Cancún

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(lfMap);

        lfMarker = L.marker([21.1619, -86.8515], { draggable: true }).addTo(lfMap);

        // Geocodificar al mover el marcador
        lfMarker.on('dragend', function (e) {
            const pos = lfMarker.getLatLng();
            fetchAddress(pos.lat, pos.lng);
        });

        // Mover marcador y geocodificar al hacer clic en el mapa
        lfMap.on('click', function (e) {
            lfMarker.setLatLng(e.latlng);
            fetchAddress(e.latlng.lat, e.latlng.lng);
        });
    }

    // Invalidar tamaño para que Leaflet renderice bien dentro del modal visible
    setTimeout(() => {
        lfMap.invalidateSize();
        // Si la propiedad ya tenía coordenadas (las extraemos si podemos del iframe viejo)
        // Por ahora, usamos el centro de Cancún para arrancar rápido
        lfMap.setView([21.1619, -86.8515], 12);
        lfMarker.setLatLng([21.1619, -86.8515]);
        document.getElementById('lfAddressText').textContent = "Da clic en o arrastra el pin por el mapa para ubicar la propiedad...";
    }, 200);
}

function closeLocationPicker() {
    const modal = document.getElementById('locationPickerModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300); // Esperar transición CSS
    }

    // Restaurar modal de propiedades
    const propModal = document.getElementById('propertyModal');
    if (propModal) propModal.style.opacity = '1';
}

function fetchAddress(lat, lng) {
    const textEl = document.getElementById('lfAddressText');
    const btnConfirm = document.getElementById('lfConfirmBtn');
    textEl.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Obteniendo dirección...';
    btnConfirm.disabled = true;

    // Nominatim Reverse Geocoding API (OpenStreetMap) Free
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
            if (data && data.display_name) {
                textEl.textContent = data.display_name;

                // Generar el Iframe URL de Google Maps visual usando esas coords
                const googleMapIframeUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

                // Al confirmar
                btnConfirm.disabled = false;
                btnConfirm.onclick = () => {
                    syncModalEdit(lfCurrentKey, 'addressText', data.display_name);
                    syncModalEdit(lfCurrentKey, 'mapLocation', googleMapIframeUrl);

                    closeLocationPicker();
                    openPropertyModal(lfCurrentKey); // Refresca los inputs
                };
            } else {
                textEl.textContent = "Dirección no encontrada. Arrastra a una calle u otra zona.";
            }
        })
        .catch(err => {
            console.error(err);
            textEl.textContent = "Error al obtener dirección. Coordenadas: " + lat.toFixed(4) + ", " + lng.toFixed(4);
        });
}
