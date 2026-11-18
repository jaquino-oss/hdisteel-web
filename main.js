// =========================================================
// HDISTEEL — Script compartido
// =========================================================

// --- Menú móvil ---
const botonHamburguesa = document.getElementById('boton-hamburguesa');
const panelMenuMovil = document.getElementById('panel-menu-movil');
const iconoAbrir = document.getElementById('icono-abrir');
const iconoCerrar = document.getElementById('icono-cerrar');

function setMenuAbierto(abierto) {
    panelMenuMovil.classList.toggle('hidden', !abierto);
    iconoAbrir.classList.toggle('hidden', abierto);
    iconoCerrar.classList.toggle('hidden', !abierto);
    botonHamburguesa.setAttribute('aria-expanded', String(abierto));
    botonHamburguesa.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
}

if (botonHamburguesa && panelMenuMovil) {
    botonHamburguesa.addEventListener('click', () => {
        setMenuAbierto(panelMenuMovil.classList.contains('hidden'));
    });
    panelMenuMovil.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuAbierto(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenuAbierto(false); });
}

// --- Sombra del header al hacer scroll ---
const header = document.getElementById('header-principal');
if (header) {
    const actualizarHeader = () => header.classList.toggle('shadow-lg', window.scrollY > 10);
    window.addEventListener('scroll', actualizarHeader, { passive: true });
    actualizarHeader();
}

// --- Año dinámico ---
const anio = document.getElementById('anio-actual');
if (anio) anio.textContent = new Date().getFullYear();

// --- Video: respetar movimiento reducido ---
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videoHero = document.getElementById('video-hero');
if (videoHero && reducirMovimiento) {
    videoHero.removeAttribute('autoplay');
    videoHero.pause();
}

// --- Aparición al hacer scroll ---
const elementosReveal = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducirMovimiento) {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 });
    elementosReveal.forEach(el => observador.observe(el));
} else {
    elementosReveal.forEach(el => el.classList.add('visible'));
}

// --- Tarjetas giratorias: toque/teclado en móviles ---
document.querySelectorAll('.flip').forEach(tarjeta => {
    const alternar = () => tarjeta.classList.toggle('is-flipped');
    tarjeta.addEventListener('click', alternar);
    tarjeta.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
    });
});

// --- "Cotizar este calibre": preselecciona el diámetro en el formulario ---
const selectDiametro = document.getElementById('rfq-diametro');
document.querySelectorAll('[data-calibre]').forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectDiametro) selectDiametro.value = boton.dataset.calibre;
    });
});

// --- Formulario de cotización (Web3Forms) sin salir de la página ---
const formRfq = document.getElementById('form-rfq');
if (formRfq) {
    const botonEnviar = document.getElementById('rfq-enviar');
    const estadoRfq = document.getElementById('rfq-estado');
    const textoBoton = botonEnviar.textContent;

    const mostrarEstado = (mensaje, exito) => {
        estadoRfq.className = 'text-sm p-4 rounded-xl border ' + (exito
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
            : 'bg-red-50 border-red-500 text-red-800');
        estadoRfq.textContent = mensaje;
    };

    formRfq.addEventListener('submit', async (e) => {
        e.preventDefault();
        botonEnviar.disabled = true;
        botonEnviar.textContent = 'Enviando...';
        estadoRfq.className = 'hidden';

        try {
            const respuesta = await fetch(formRfq.action, {
                method: 'POST',
                body: new FormData(formRfq),
                headers: { 'Accept': 'application/json' }
            });
            const datos = await respuesta.json();
            if (respuesta.ok && datos.success) {
                formRfq.reset();
                mostrarEstado('✅ ¡Gracias! Recibimos su solicitud. Un asesor comercial le contactará en breve con su cotización.', true);
            } else {
                throw new Error(datos.message || 'Error de envío');
            }
        } catch (error) {
            mostrarEstado('No pudimos enviar su solicitud. Por favor intente de nuevo o llámenos al +(504) 2555-0199.', false);
        } finally {
            botonEnviar.disabled = false;
            botonEnviar.textContent = textoBoton;
        }
    });
}
