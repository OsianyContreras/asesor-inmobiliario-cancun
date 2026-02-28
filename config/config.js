const AppConfig = {
    "knowledgeBaseES": [
        {
            "intent": "comprar",
            "keywords": [
                "comprar",
                "adquirir",
                "casa",
                "departamento",
                "hogar",
                "propiedad",
                "vivienda",
                "quiero una casa"
            ],
            "response": "¡Qué gran paso! 🏠 Comprar propiedad es una decisión importante. Para poder darte las mejores opciones, cuéntame: ¿Estás buscando para <strong>Vivir</strong> o como <strong>Inversión</strong> (Rentas Vacacionales)?",
            "options": [
                {
                    "text": "Para Vivir con mi familia",
                    "action": "BUY_LIVE"
                },
                {
                    "text": "Para Inversión / Rentas",
                    "action": "BUY_INVEST"
                }
            ]
        },
        {
            "intent": "unir",
            "keywords": [
                "unir",
                "juntar",
                "pareja",
                "esposo",
                "esposa",
                "amigo",
                "familiar",
                "unamos",
                "sumar"
            ],
            "response": "¡Claro que sí! Con <strong>Unamos Créditos</strong> puedes juntar tus puntos Infonavit con quien tú quieras (incluso sin estar casados). Así alcanzan algo mucho mejor, ¡especialmente en Cancún y la Riviera Maya! 🌊",
            "options": [
                {
                    "text": "Hacer un plan juntos",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "puntos",
            "keywords": [
                "puntos",
                "saber",
                "checar",
                "cuantos",
                "1080",
                "1,080",
                "precalificación"
            ],
            "response": "Te lo explico súper fácil: el Infonavit te pide 1,080 puntos mínimos para prestarte. Estos se juntan con tu edad, tu sueldo y el ahorro de tu <strong>Subcuenta de Vivienda</strong>. No te preocupes si no sabes cuántos tienes, ¡yo te ayudo a revisarlo sin costo! 🔑",
            "options": [
                {
                    "text": "Revisar mis puntos gratis",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "vender",
            "keywords": [
                "vender",
                "venta",
                "ofrecer",
                "traspasar",
                "mi casa"
            ],
            "response": "Vender una propiedad requiere seguridad y rapidez. 🤝 Nosotros gestionamos ventas de terceros de forma 100% segura. Nos encargamos de los trámites y avalúos para que a ti te paguen rápido y sin estrés. ¿Dónde se ubica tu propiedad?",
            "options": [
                {
                    "text": "Agendar análisis comercial",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "requisitos",
            "keywords": [
                "requisitos",
                "papeles",
                "documentos",
                "tramite",
                "papeleo",
                "necesito",
                "que piden",
                "documentacion"
            ],
            "response": "¡Cero estrés con el papeleo! 📋 Básico necesitamos tu identificación (INE), acta de nacimiento, CURP y RFC. Pero honestamente, <strong>nosotros nos encargamos de todo el trámite pesado y los avalúos</strong> para que tú solo disfrutes el resultado.",
            "options": [
                {
                    "text": "Empezar ahora",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "ubicacion",
            "keywords": [
                "cancun",
                "mexico",
                "riviera",
                "playa",
                "sur",
                "norte",
                "donde",
                "ubicacion",
                "estados",
                "ciudad"
            ],
            "response": "¡Tenemos cobertura a nivel nacional! 🇲🇽 Pero somos grandes especialistas en el <strong>Caribe Mexicano (Cancún, Playa del Carmen, Tulum)</strong>. Tenemos opciones con alberca, escuelas y canchas. ¿Te interesa esta zona o el centro del país?",
            "options": [
                {
                    "text": "Dejar mis datos para opciones",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "precio",
            "keywords": [
                "cuanto",
                "precio",
                "cuesta",
                "valor",
                "dinero",
                "presupuesto",
                "barata",
                "cara",
                "mensualidad",
                "pagar"
            ],
            "response": "Los precios varían mucho dependiendo de la ubicación y las amenidades (alberca, seguridad, etc.). Lo mejor es que hagamos un esquema basado en lo que el Infonavit (o el banco) te puede prestar, ¡para que las mensualidades te queden súper cómodas! 💸",
            "options": [
                {
                    "text": "Calcular mis pagos e interés",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "tiempo",
            "keywords": [
                "tiempo",
                "tarda",
                "demora",
                "rapido",
                "meses",
                "dias",
                "cuando",
                "entregar"
            ],
            "response": "El tiempo es nuestra especialidad ⏱️. Un trámite normal de Infonavit puede tardar de 3 a 6 semanas desde que elegimos la casa hasta la firma de las escrituras. ¡Nosotros aceleramos los avalúos para que te mudes lo antes posible!",
            "options": [
                {
                    "text": "Agendar llamada para iniciar",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "cofinavit",
            "keywords": [
                "banco",
                "bancario",
                "cofinavit",
                "tradicional",
                "prestamo extra",
                "mas dinero"
            ],
            "response": "¡Excelente pregunta! Si el crédito del Infonavit no es suficiente, podemos usar la modalidad <strong>Cofinavit</strong>, donde el Infonavit pone una parte y un Banco pone el resto. Así puedes acceder a casas de mayor valor sin problema. 🏦",
            "options": [
                {
                    "text": "Analizar viabilidad bancaria",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "saludo",
            "keywords": [
                "hola",
                "buenas",
                "buen dia",
                "saludos",
                "que tal",
                "asesor"
            ],
            "response": "¡Hola de nuevo! 👋 Aquí sigo, listo para guiarte. Dime, ¿en qué etapa de tu sueño inmobiliario te encuentras ahora mismo?",
            "options": [
                {
                    "text": "Quiero comprar",
                    "action": "BUY"
                },
                {
                    "text": "Quiero unir mis puntos",
                    "action": "UNAMOS"
                }
            ]
        }
    ],
    "knowledgeBaseEN": [
        {
            "intent": "comprar",
            "keywords": [
                "buy",
                "purchase",
                "house",
                "apartment",
                "home",
                "property",
                "i want a house"
            ],
            "response": "What a great step! 🏠 Buying a property is a major decision. To give you the best options, tell me: Are you looking to <strong>Live</strong> in it or as an <strong>Investment</strong> (Vacation Rentals)?",
            "options": [
                {
                    "text": "To Live with my family",
                    "action": "BUY_LIVE"
                },
                {
                    "text": "For Investment / Rentals",
                    "action": "BUY_INVEST"
                }
            ]
        },
        {
            "intent": "unir",
            "keywords": [
                "join",
                "combine",
                "partner",
                "husband",
                "wife",
                "friend",
                "family",
                "together",
                "add"
            ],
            "response": "Of course! With <strong>Unamos Créditos</strong> you can combine your Infonavit points with whoever you want (even if you're not married). This way you can afford something much better, especially in Cancun and the Riviera Maya! 🌊",
            "options": [
                {
                    "text": "Make a plan together",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "puntos",
            "keywords": [
                "points",
                "know",
                "check",
                "how many",
                "1080",
                "1,080",
                "prequalification"
            ],
            "response": "Let me explain it super easily: Infonavit requires a minimum of 1,080 points to grant a loan. These are gathered based on your age, salary, and your <strong>Housing Subaccount</strong> savings. Don't worry if you don't know how many you have, I'll help you check for free! 🔑",
            "options": [
                {
                    "text": "Check my points for free",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "vender",
            "keywords": [
                "sell",
                "sale",
                "offer",
                "transfer",
                "my house"
            ],
            "response": "Selling a property requires security and speed. 🤝 We manage third-party sales 100% securely. We handle the paperwork and appraisals so you get paid quickly and without stress. Where is your property located?",
            "options": [
                {
                    "text": "Schedule commercial analysis",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "requisitos",
            "keywords": [
                "requirements",
                "papers",
                "documents",
                "process",
                "paperwork",
                "need",
                "documentation"
            ],
            "response": "Zero stress with paperwork! 📋 Basically, we need your ID (INE), birth certificate, CURP, and RFC. But honestly, <strong>we handle all the heavy lifting and appraisals</strong> so you can just enjoy the result.",
            "options": [
                {
                    "text": "Start now",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "ubicacion",
            "keywords": [
                "cancun",
                "mexico",
                "riviera",
                "beach",
                "south",
                "north",
                "where",
                "location",
                "states",
                "city"
            ],
            "response": "We have nationwide coverage! 🇲🇽 But we are absolute specialists in the <strong>Mexican Caribbean (Cancun, Playa del Carmen, Tulum)</strong>. We have options with pools, schools, and sports courts. Are you interested in this area or central Mexico?",
            "options": [
                {
                    "text": "Leave my info for options",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "precio",
            "keywords": [
                "how much",
                "price",
                "cost",
                "value",
                "money",
                "budget",
                "cheap",
                "expensive",
                "monthly payment",
                "pay"
            ],
            "response": "Prices vary greatly depending on location and amenities (pool, security, etc.). The best thing is to create a plan based on what Infonavit (or the bank) can lend you, so your monthly payments are super comfortable! 💸",
            "options": [
                {
                    "text": "Calculate my payments & interest",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "tiempo",
            "keywords": [
                "time",
                "takes",
                "delay",
                "fast",
                "months",
                "days",
                "when",
                "deliver"
            ],
            "response": "Time is our specialty ⏱️. A standard Infonavit process can take 3 to 6 weeks from choosing the house to signing the deeds. We speed up the appraisals so you can move in as soon as possible!",
            "options": [
                {
                    "text": "Schedule call to start",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "cofinavit",
            "keywords": [
                "bank",
                "banking",
                "cofinavit",
                "traditional",
                "extra loan",
                "more money"
            ],
            "response": "Excellent question! If the Infonavit loan isn't enough, we can use the <strong>Cofinavit</strong> modality, where Infonavit provides a portion and a Bank provides the rest. This way you can comfortably access higher-value homes. 🏦",
            "options": [
                {
                    "text": "Analyze bank viability",
                    "action": "LEAD",
                    "primary": true
                }
            ]
        },
        {
            "intent": "saludo",
            "keywords": [
                "hello",
                "hi",
                "good morning",
                "good day",
                "greetings",
                "advisor"
            ],
            "response": "Hello again! 👋 I'm still here, ready to guide you. Tell me, at what stage of your real estate dream are you right now?",
            "options": [
                {
                    "text": "I want to buy",
                    "action": "BUY"
                },
                {
                    "text": "I want to combine points",
                    "action": "UNAMOS"
                }
            ]
        }
    ],
    "translations": {
        "es": {
            "urgency": "🔥 Oportunidad: Mensualidades bajas y asesoría gratuita. ¡Aprovecha la plusvalía de Quintana Roo antes de que suban los precios!",
            "ctaNav": "Hablar con un Experto",
            "heroBadge": "🌴 Especialistas en Cancún y Todo México",
            "heroTitle": "Tu hogar ideal, <br><span class=\"highlight\">sin estrés ni complicaciones</span>",
            "heroSubtitle": "Descubre cómo aprovechar tus puntos Infonavit o expeditar tu venta. Transformamos trámites complejos en una experiencia increíble, estés donde estés.",
            "trustTitle": "Tramitamos tu crédito con seguridad a través de:",
            "mythsTitle": "Destruyendo Mitos del Infonavit 🔨",
            "simulatorTitle": "Descubre tu poder de compra en 10 segundos ⏱️",
            "whyTitle": "¿Por qué dejar tus trámites a Tu Amigo Experto?",
            "propTitle": "Desarrollos Destacados 🔥",
            "testTitle": "Lo que dicen nuestros clientes 🤝",
            "faqTitle": "Preguntas Frecuentes resueltas rápido ⚡",
            "footerDesc": "Tu aliado estratégico en bienes raíces. Transformamos la complejidad de vender o comprar tu casa en una experiencia digital simple, segura y transparente.",
            "langBtn": "🇺🇸 EN",
            "chatHeaderName": "Juan, Tu Amigo Experto",
            "chatHeaderRole": "Asesor Senior en Línea",
            "chatInputPlaceholder": "Escribe tu mensaje aquí...",
            "chatTyping": "Escribiendo",
            "filters": [
                "Todos",
                "Con Alberca",
                "Cerca del Mar",
                "Inversión"
            ],
            "pmCTA": "¡Me interesa! Agendar Visita",
            "videoTooltip": "¡Un mensaje de Juan!",
            "videoHeader": "Un mensaje para ti",
            "videoBody": "Descubre en 30 segundos cómo miles de familias ya obtuvieron sus llaves con nosotros.",
            "videoBtn": "¡Sí, quiero asesoría!",
            "exitTitle": "🎁 ¡No te vayas con las manos vacías!",
            "exitDesc": "Descarga GRATIS nuestra <strong>\"Guía Definitiva: 5 Errores al Comprar con Infonavit en Cancún en 2026\"</strong>.",
            "exitName": "Tu Nombre",
            "exitPhone": "WhatsApp para enviarte la guía",
            "exitBtn": "<i class='bx bxs-download'></i> Enviar Guía a mi WhatsApp",
            "exitCancel": "No, gracias. Prefiero cometer errores de novato.",
            "footerLinksTitle": "Enlaces Rápidos",
            "footerLink1": "Agendar Asesoría",
            "footerLink2": "Desarrollos Destacados",
            "footerLink3": "Simulador de Crédito",
            "footerContactTitle": "Contacto Premium",
            "footerRights": "&copy; 2026 Tu Amigo Experto. Todos los derechos reservados. <a href=\"#\">Aviso de Privacidad</a>",
            "leadTitle": "🏠 Da el primer paso",
            "leadDesc": "Déjanos tus datos para agendar una llamada y analizar tu caso personalizado.",
            "leadName": "Nombre Completo",
            "leadPhone": "Teléfono (WhatsApp)",
            "leadSelectLabel": "¿Qué sueño quieres cumplir?",
            "leadOptions": [
                "Selecciona una opción...",
                "Comprar una casa",
                "Vender mi propiedad",
                "Saber cuántos puntos tengo",
                "Unir créditos con alguien"
            ],
            "leadNotice": "<i class='bx bxs-lock-alt'></i> Por tu seguridad, <strong>no solicitamos tu NSS (Número de Seguridad Social) por chat</strong>. Te lo pediremos más adelante en un portal seguro.",
            "leadBtn": "Agendar Asesoría Gratuita",
            "waStatus": "En línea ahora",
            "waMsg": "¡Hola 👋! Tengo 5 minutos libres en la agenda. ¿Tienes alguna duda rápida sobre tus puntos o desarrollos?",
            "waBtn": "<i class='bx bxl-whatsapp'></i> Responder a Juan",
            "viewDetails": "<i class='bx bx-expand-alt'></i> Ver Detalles",
            "myths": [
                {
                    "t1": "Mito",
                    "p1": "\"Si uno mis puntos con otra persona, la casa será solo de uno de los dos.\"",
                    "t2": "Verdad",
                    "p2": "¡Falso! Con <strong>Unamos Créditos</strong> ambos son dueños legales bajo la figura de Copropiedad. Tu inversión está 100% protegida."
                },
                {
                    "t1": "Mito",
                    "p1": "\"Autorizar y escriturar con Infonavit tarda muchísimos meses.\"",
                    "t2": "Verdad",
                    "p2": "¡Para nada! Nosotros agilizamos avalúos y gestión. Normalmente en <strong>3 a 5 semanas</strong> ya te estamos entregando tus llaves."
                },
                {
                    "t1": "Mito",
                    "p1": "\"No puedo comprar una casa usada a un particular con mi crédito.\"",
                    "t2": "Verdad",
                    "p2": "¡Claro que puedes! Nosotros somos expertos en <strong>Venta de Terceros</strong>. Nos aseguramos de destrabar los trámites para que la compra sea legal y segura."
                }
            ],
            "sim": {
                "label1": "¿Qué edad tienes?",
                "label2": "Sueldo mensual libre aproximado",
                "btn": "Calcular Mi Potencial"
            },
            "features": [
                {
                    "t": "Educación desde Cero",
                    "p": "Te explicamos qué es la Subcuenta, Precalificación y Escrituración de forma clara y sin tecnicismos."
                },
                {
                    "t": "Unamos Créditos",
                    "p": "Junta tus puntos Infonavit con tu pareja, amigos o familiares para alcanzar tu meta más rápido."
                },
                {
                    "t": "Compra Segura",
                    "p": "Te guiamos paso a paso en la compra de tu propiedad con Alberca, Escuelas, Canchas deportivas, etc."
                },
                {
                    "t": "Velocidad Nacional",
                    "p": "Nosotros nos encargamos de todos los trámites para que tú solo disfrutes el resultado de las llaves."
                }
            ],
            "faqs": [
                {
                    "q": "¿Tiene algún costo tu asesoría inicial?",
                    "a": "<strong>¡Absolutamente ninguno!</strong> Mi primer objetivo es analizar tu caso, ver tus puntos y trazarte un plan. Solo ganamos si tú logras comprar o vender tu casa de forma exitosa."
                },
                {
                    "q": "¿Puedo comprar en Cancún si vivo en otro Estado?",
                    "a": "¡Por supuesto! De hecho, nuestro fuerte es ayudar a personas de todo México a invertir en el paraíso. Nosotros coordinamos los trámites a distancia para que tú solo vengas a disfrutar tu nueva casa."
                },
                {
                    "q": "¿Puedo unir mis puntos si no estoy casado?",
                    "a": "¡Sí! Ya no es necesario estar casados. Puedes unir tu crédito con un familiar (padres, hermanos) o un amigo(a) y comprar juntos una mejor propiedad dividiendo los gastos."
                }
            ]
        },
        "en": {
            "urgency": "🔥 Opportunity: Low monthly payments and free consulting. Take advantage of Quintana Roo's equity before prices rise!",
            "ctaNav": "Talk to an Expert",
            "heroBadge": "🌴 Specialists in Cancun & All of Mexico",
            "heroTitle": "Your ideal home, <br><span class=\"highlight\">without stress or complications</span>",
            "heroSubtitle": "Discover how to leverage your Infonavit points or expedite your sale. We transform complex paperwork into an incredible experience, wherever you are.",
            "trustTitle": "We securely process your credit through:",
            "mythsTitle": "Busting Real Estate Myths 🔨",
            "simulatorTitle": "Discover your buying power in 10 seconds ⏱️",
            "whyTitle": "Why leave your paperwork to Tu Amigo Experto?",
            "propTitle": "Featured Developments 🔥",
            "testTitle": "What our clients say 🤝",
            "faqTitle": "Frequently Asked Questions solved fast ⚡",
            "footerDesc": "Your strategic real estate ally. We transform the complexity of selling or buying your home into a simple, secure, and transparent digital experience.",
            "langBtn": "🇲🇽 ES",
            "chatHeaderName": "Juan, Your Expert Friend",
            "chatHeaderRole": "Senior Online Advisor",
            "chatInputPlaceholder": "Type your message here...",
            "chatTyping": "Typing",
            "filters": [
                "All",
                "With Pool",
                "Near the Beach",
                "Investment"
            ],
            "pmCTA": "I'm interested! Schedule Visit",
            "videoTooltip": "A message from Juan!",
            "videoHeader": "A message for you",
            "videoBody": "Discover in 30 seconds how thousands of families already got their keys with us.",
            "videoBtn": "Yes, I want advice!",
            "exitTitle": "🎁 Don't leave empty-handed!",
            "exitDesc": "Download our <strong>\"Ultimate Guide: 5 Mistakes When Buying with Infonavit in Cancun in 2026\"</strong> for FREE.",
            "exitName": "Your Name",
            "exitPhone": "WhatsApp to send you the guide",
            "exitBtn": "<i class='bx bxs-download'></i> Send Guide to my WhatsApp",
            "exitCancel": "No thanks. I prefer making beginner mistakes.",
            "footerLinksTitle": "Quick Links",
            "footerLink1": "Schedule Consulting",
            "footerLink2": "Featured Developments",
            "footerLink3": "Credit Simulator",
            "footerContactTitle": "Premium Contact",
            "footerRights": "&copy; 2026 Tu Amigo Experto. All rights reserved. <a href=\"#\">Privacy Policy</a>",
            "leadTitle": "🏠 Take the first step",
            "leadDesc": "Leave us your details to schedule a call and analyze your personalized case.",
            "leadName": "Full Name",
            "leadPhone": "Phone (WhatsApp)",
            "leadSelectLabel": "What dream do you want to fulfill?",
            "leadOptions": [
                "Select an option...",
                "Buy a house",
                "Sell my property",
                "Know how many points I have",
                "Combine credits with someone"
            ],
            "leadNotice": "<i class='bx bxs-lock-alt'></i> For your security, <strong>we do not ask for your SSN via chat</strong>. We will ask for it later on a secure portal.",
            "leadBtn": "Schedule Free Consulting",
            "waStatus": "Online now",
            "waMsg": "Hi 👋! I have 5 free minutes in my schedule. Do you have any quick questions about your points or developments?",
            "waBtn": "<i class='bx bxl-whatsapp'></i> Reply to Juan",
            "viewDetails": "<i class='bx bx-expand-alt'></i> View Details",
            "myths": [
                {
                    "t1": "Myth",
                    "p1": "\"If I combine my points with someone else, the house will only belong to one of us.\"",
                    "t2": "Truth",
                    "p2": "False! With <strong>Unamos Créditos</strong> both are legal owners under Joint Ownership. Your investment is 100% protected."
                },
                {
                    "t1": "Myth",
                    "p1": "\"Approving and registering with Infonavit takes many months.\"",
                    "t2": "Truth",
                    "p2": "Not at all! We speed up appraisals and management. Normally in <strong>3 to 5 weeks</strong> we are handing you the keys."
                },
                {
                    "t1": "Myth",
                    "p1": "\"I can't buy a used house from an individual with my credit.\"",
                    "t2": "Truth",
                    "p2": "Of course you can! We are experts in <strong>Third-Party Sales</strong>. We unlock the paperwork so the purchase is legal and secure."
                }
            ],
            "sim": {
                "label1": "How old are you?",
                "label2": "Approximate monthly net salary",
                "btn": "Calculate My Potential"
            },
            "features": [
                {
                    "t": "Education from Scratch",
                    "p": "We explain what the Subaccount, Prequalification, and Deeds are clearly and without technicalities."
                },
                {
                    "t": "Combine Credits",
                    "p": "Join your Infonavit points with your partner, friends, or family to reach your goal faster."
                },
                {
                    "t": "Secure Purchase",
                    "p": "We guide you step by step in buying your property with a Pool, Schools, Sports Courts, etc."
                },
                {
                    "t": "National Speed",
                    "p": "We handle all the paperwork so you only enjoy the result of the keys."
                }
            ],
            "faqs": [
                {
                    "q": "Is there any cost for your initial consulting?",
                    "a": "<strong>Absolutely none!</strong> My primary goal is to analyze your case, review your points, and draw up a plan. We only earn if you successfully buy or sell your home."
                },
                {
                    "q": "Can I buy in Cancun if I live in another State?",
                    "a": "Of course! In fact, our strength is helping people from all over Mexico invest in paradise. We coordinate paperwork remotely so you only come to enjoy your new house."
                },
                {
                    "q": "Can I combine my points if I'm not married?",
                    "a": "Yes! It is no longer necessary to be married. You can combine your credit with a family member (parents, siblings) or a friend and buy a better property together by splitting expenses."
                }
            ]
        }
    },
    "propertyDataBilingual": {
        "es": {
            "cancun": {
                "title": "Depas Cancún Centro",
                "badge": "Preventa",
                "state": "Quintana Roo",
                "mapLocation": "https://maps.google.com/maps?q=21.19714614014397,-86.82408941168772&t=&z=15&ie=UTF8&iwloc=&output=embed",
                "images": [
                    "assets/img/cancun_exterior.png",
                    "assets/img/cancun_sala.png",
                    "assets/img/cancun_recamara.png",
                    "assets/img/cancun_exterior.png",
                    "assets/img/cancun_sala.png",
                    "assets/img/nave.png"
                ],
                "units": [
                    {
                        "name": "PLANTA BAJA",
                        "price": "$990,000.00",
                        "beds": 2,
                        "baths": 1,
                        "amenity": "",
                        "desc": "Cuenta con escuelas, Areas Verdes etc",
                        "level": 1,
                        "extras": [
                            "estacionamiento",
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio"
                        ],
                        "sqm": 0
                    },
                    {
                        "name": "PRIMER PISO",
                        "price": "$700,000.00",
                        "beds": 2,
                        "baths": 1,
                        "amenity": "",
                        "desc": "Cuenta con escuelas, Areas Verdes etc",
                        "sqm": 0,
                        "extras": [
                            "estacionamiento",
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio"
                        ]
                    },
                    {
                        "name": "SEGUNDO PISO",
                        "price": "$600,000.00",
                        "beds": 2,
                        "baths": 1,
                        "amenity": "",
                        "desc": "Cuenta con escuelas, Areas Verdes etc",
                        "sqm": 0,
                        "extras": [
                            "estacionamiento",
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio"
                        ]
                    }
                ],
                "amenities": [
                    "pool",
                    "park",
                    "court",
                    "security"
                ],
                "propType": "Departamento",
                "addressText": "Supermanzana 77, Cancún, Benito Juárez, Distrito 4, Quintana Roo, 77258, México"
            },
            "merida": {
                "title": "Casas Norte Mérida",
                "badge": "Entrega Inmediata",
                "state": "Yucatán",
                "mapLocation": "https://maps.google.com/maps?q=Norte+Merida,Yucatan,Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed",
                "images": [
                    "assets/img/merida_exterior.png",
                    "assets/img/merida_exterior.png",
                    "assets/img/merida_exterior.png",
                    "assets/img/merida_exterior.png",
                    "assets/img/merida_exterior.png"
                ],
                "units": [
                    {
                        "name": "Modelo Jade (1 Rec)",
                        "price": "$8,900/mes",
                        "beds": 1,
                        "baths": 1,
                        "amenity": "Jardín Amplio",
                        "desc": "Casa compacta con posibilidad de crecimiento. Ubicada en zona de alta plusvalía."
                    },
                    {
                        "name": "Modelo Onix (2 Rec)",
                        "price": "$12,500/mes",
                        "beds": 2,
                        "baths": 2,
                        "amenity": "Cochera Techada",
                        "desc": "Diseño moderno con techos de doble altura. Acabados regionales en piedra."
                    }
                ]
            },
            "nuevo_complejo_1772284743045": {
                "title": "Nuevo CompLEJO",
                "badge": "Nuevo",
                "state": "Quintana Roo",
                "mapLocation": "https://maps.google.com/maps?q=Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed",
                "images": [
                    "assets/img/avatar.png"
                ],
                "propType": "Casa Individual",
                "amenities": [],
                "units": [
                    {
                        "name": "Planta Baja",
                        "price": "$1,000,000.00",
                        "beds": 1,
                        "baths": 1,
                        "sqm": 0,
                        "desc": "ESTO ES UNA PRUEBA",
                        "extras": [
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio",
                            "estacionamiento"
                        ],
                        "title": "Nuevo CompLEJO"
                    }
                ]
            }
        },
        "en": {
            "cancun": {
                "title": "Downtown Cancun Condos",
                "badge": "Pre-sale",
                "state": "Quintana Roo",
                "mapLocation": "https://maps.google.com/maps?q=21.19714614014397,-86.82408941168772&t=&z=15&ie=UTF8&iwloc=&output=embed",
                "images": [
                    "assets/img/cancun_exterior.png",
                    "assets/img/cancun_sala.png",
                    "assets/img/cancun_recamara.png",
                    "assets/img/cancun_exterior.png",
                    "assets/img/cancun_sala.png",
                    "assets/img/nave.png"
                ],
                "units": [
                    {
                        "name": "PLANTA BAJA",
                        "price": "$990,000.00",
                        "beds": 2,
                        "baths": 1,
                        "amenity": "",
                        "desc": "Cuenta con escuelas, Areas Verdes etc",
                        "level": 1,
                        "extras": [
                            "estacionamiento",
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio"
                        ],
                        "sqm": 0
                    },
                    {
                        "name": "PRIMER PISO",
                        "price": "$700,000.00",
                        "beds": 2,
                        "baths": 1,
                        "amenity": "",
                        "desc": "Cuenta con escuelas, Areas Verdes etc",
                        "sqm": 0,
                        "extras": [
                            "estacionamiento",
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio"
                        ]
                    },
                    {
                        "name": "SEGUNDO PISO",
                        "price": "$600,000.00",
                        "beds": 2,
                        "baths": 1,
                        "amenity": "",
                        "desc": "Cuenta con escuelas, Areas Verdes etc",
                        "sqm": 0,
                        "extras": [
                            "estacionamiento",
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio"
                        ]
                    }
                ],
                "amenities": [
                    "pool",
                    "park",
                    "court",
                    "security"
                ],
                "propType": "Departamento",
                "addressText": "Supermanzana 77, Cancún, Benito Juárez, Distrito 4, Quintana Roo, 77258, México"
            },
            "nuevo_complejo_1772284743045": {
                "title": "Nuevo CompLEJO",
                "badge": "New",
                "state": "Quintana Roo",
                "mapLocation": "https://maps.google.com/maps?q=Mexico&t=&z=13&ie=UTF8&iwloc=&output=embed",
                "images": [
                    "assets/img/avatar.png"
                ],
                "propType": "Casa Individual",
                "amenities": [],
                "units": [
                    {
                        "name": "Planta Baja",
                        "price": "$1,000,000.00",
                        "beds": 1,
                        "baths": 1,
                        "sqm": 0,
                        "desc": "ESTO ES UNA PRUEBA",
                        "extras": [
                            "sala",
                            "comedor",
                            "cocina",
                            "patio_servicio",
                            "patio",
                            "estacionamiento"
                        ],
                        "title": "Nuevo CompLEJO"
                    }
                ]
            }
        }
    }
};
