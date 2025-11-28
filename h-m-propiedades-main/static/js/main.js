document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay usuario logueado al cargar la página
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateNavUI(session);

    // 2. Escuchar cambios en la sesión (Login, Logout, etc.)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateNavUI(session);
        
        // Lógica de Redirección:
        // Si el usuario está logueado y está en las páginas de login o registro, lo mandamos al inicio.
        const path = window.location.pathname;
        if (session && (path === '/login' || path === '/register')) {
            window.location.href = '/';
        }
    });
});

// --- Actualizar la Barra de Navegación ---
function updateNavUI(session) {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (session) {
        // SI ESTÁ LOGUEADO: Mostrar email y botón de Cerrar Sesión
        const email = session.user.email || 'Usuario';
        authContainer.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-xs text-slate-500 hidden md:block border-r border-slate-300 pr-3">${email}</span>
                <button onclick="handleLogout()" class="text-red-500 hover:text-red-700 font-bold text-sm transition px-2">
                    <i class="fas fa-sign-out-alt mr-1"></i> Cerrar Sesión
                </button>
            </div>
        `;
    } else {
        // NO LOGUEADO: Mostrar botones originales
        authContainer.innerHTML = `
            <div class="flex items-center space-x-3">
                <a href="/login" class="text-slate-600 hover:text-blue-600 font-medium text-sm transition px-2">
                    Iniciar Sesión
                </a>
                <a href="/register" class="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 shadow-md transition transform hover:scale-105">
                    Registrarse
                </a>
            </div>
        `;
    }
}

// --- Funciones de Autenticación (usadas en login.html y register.html) ---

async function registerWithEmail(email, password, name) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: name } }
    });
    if (error) throw error;
    alert('¡Cuenta creada con éxito! Bienvenido a Renta Ya.');
    // La redirección la maneja el onAuthStateChange automáticamente
}

async function loginWithEmail(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) throw error;
}

async function loginWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google'
    });
    if (error) throw error;
}

async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) alert('Error al salir: ' + error.message);
    window.location.href = '/';
}

// --- Funciones del Modal de Contacto (usadas en detalle.html y base.html) ---

let currentContactType = '';
let currentPropName = '';

function openContact(type, propName) {
    const modal = document.getElementById('contactModal');
    const icon = document.getElementById('channelIcon');
    const name = document.getElementById('channelName');
    const btn = document.getElementById('sendBtn');
    
    currentContactType = type;
    currentPropName = propName;

    modal.classList.remove('hidden');
    modal.classList.add('flex'); // Usar flex para centrar el modal

    // Configurar modal según sea WhatsApp o Email
    if (type === 'whatsapp') {
        icon.className = 'fab fa-whatsapp text-4xl text-green-500 mr-4';
        name.innerText = 'WhatsApp';
        btn.innerText = 'Enviar a WhatsApp';
        btn.className = 'w-full mt-6 py-3.5 rounded-xl font-bold text-white transition transform hover:scale-[1.02] shadow-lg bg-green-500 hover:bg-green-600';
    } else {
        icon.className = 'fas fa-envelope text-4xl text-red-500 mr-4';
        name.innerText = 'Correo Electrónico';
        btn.innerText = 'Enviar Correo';
        btn.className = 'w-full mt-6 py-3.5 rounded-xl font-bold text-white transition transform hover:scale-[1.02] shadow-lg bg-red-500 hover:bg-red-600';
    }
}

function closeModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function sendMessage() {
    const msg = document.getElementById('messageInput').value;
    if (!msg) return alert('Por favor escribe un mensaje para continuar.');

    const text = `Hola, estoy interesado en *${currentPropName}*. ${msg}`;
    
    if (currentContactType === 'whatsapp') {
        const phone = '5493764290496'; // Tu número configurado
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
        // --- CORRECCIÓN APLICADA: Abrir Gmail Directamente ---
        const email = 'hutteroctavio18@gmail.com'; 
        const subject = encodeURIComponent(`Consulta por ${currentPropName}`);
        const body = encodeURIComponent(text);
        
        // Esta URL abre específicamente la ventana de redacción de Gmail
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        
        window.open(gmailUrl, '_blank');
    }
    closeModal();
}

// Cerrar modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeModal();
    }
}