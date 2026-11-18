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

// --- Carrusel de portada ---
const slider = document.getElementById('hero-slider');
if (slider) {
    const slides = [...slider.querySelectorAll('.slide')];
    const puntos = [...slider.querySelectorAll('.slider-punto')];
    const botonPausa = document.getElementById('slider-pausa');
    const iconoPausa = document.getElementById('icono-pausa');
    const iconoPlay = document.getElementById('icono-play');
    let actual = 0;
    let temporizador = null;
    let pausadoPorUsuario = false;  // solo el botón de pausa lo detiene
    let interaccion = false;        // navegación con teclado dentro del carrusel

    const actualizarBotonPausa = () => {
        iconoPausa.classList.toggle('hidden', pausadoPorUsuario);
        iconoPlay.classList.toggle('hidden', !pausadoPorUsuario);
        botonPausa.setAttribute('aria-label', pausadoPorUsuario ? 'Reproducir carrusel' : 'Pausar carrusel');
    };

    const programar = () => {
        clearTimeout(temporizador);
        if (pausadoPorUsuario || interaccion || document.hidden) return;
        const duracion = Number(slides[actual].dataset.duracion) || 7000;
        temporizador = setTimeout(() => irA(actual + 1), duracion);
    };

    function irA(indice) {
        slides[actual].classList.remove('activo');
        puntos[actual].classList.remove('activo');
        puntos[actual].removeAttribute('aria-current');

        actual = (indice + slides.length) % slides.length;

        slides[actual].classList.add('activo');
        puntos[actual].classList.add('activo');
        puntos[actual].setAttribute('aria-current', 'true');

        // Solo el video de la diapositiva activa se reproduce
        slides.forEach((slide, i) => {
            const video = slide.querySelector('video');
            if (!video) return;
            if (i === actual && !reducirMovimiento) {
                video.currentTime = 0;
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
        programar();
    }

    puntos.forEach((punto, i) => punto.addEventListener('click', () => irA(i)));
    document.getElementById('slider-anterior').addEventListener('click', () => irA(actual - 1));
    document.getElementById('slider-siguiente').addEventListener('click', () => irA(actual + 1));

    botonPausa.addEventListener('click', () => {
        pausadoPorUsuario = !pausadoPorUsuario;
        actualizarBotonPausa();
        programar();
    });

    // Pausa solo mientras se navega con teclado (Tab) dentro del carrusel.
    // No se pausa al pasar el cursor: la portada ocupa casi toda la pantalla
    // y el carrusel quedaría detenido siempre.
    slider.addEventListener('focusin', (e) => {
        interaccion = e.target.matches(':focus-visible');
        programar();
    });
    slider.addEventListener('focusout', () => { interaccion = false; programar(); });
    document.addEventListener('visibilitychange', programar);

    // Flechas del teclado
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') irA(actual - 1);
        if (e.key === 'ArrowRight') irA(actual + 1);
    });

    // Deslizar con el dedo en celulares
    let inicioX = null;
    slider.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
        if (inicioX === null) return;
        const dx = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(dx) > 50) irA(dx < 0 ? actual + 1 : actual - 1);
        inicioX = null;
    });

    actualizarBotonPausa();
    programar();
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

// --- Contadores animados ---
const contadores = document.querySelectorAll('[data-contador]');
if ('IntersectionObserver' in window && !reducirMovimiento) {
    const animarContador = (el) => {
        const final = Number(el.dataset.contador);
        const duracion = 1600;
        const inicio = performance.now();
        const paso = (ahora) => {
            const avance = Math.min((ahora - inicio) / duracion, 1);
            const suavizado = 1 - Math.pow(1 - avance, 3);
            el.textContent = Math.round(final * suavizado);
            if (avance < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
    };
    const obsContador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                animarContador(entrada.target);
                obsContador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.5 });
    contadores.forEach(el => { el.textContent = '0'; obsContador.observe(el); });
}

// --- Calculadora de peso ---
const calcCalibre = document.getElementById('calc-calibre');
if (calcCalibre) {
    const calcLongitud = document.getElementById('calc-longitud');
    const calcCantidad = document.getElementById('calc-cantidad');
    const PIE_A_METRO = 0.3048;
    const fmt = (n, dec) => n.toLocaleString('es-HN', { minimumFractionDigits: dec, maximumFractionDigits: dec });

    const calcular = () => {
        const kgPorMetro = Number(calcCalibre.value);
        const metros = Number(calcLongitud.value) * PIE_A_METRO;
        const cantidad = Math.max(0, Math.floor(Number(calcCantidad.value) || 0));
        const kgVarilla = kgPorMetro * metros;
        const toneladas = (kgVarilla * cantidad) / 1000;
        document.getElementById('calc-por-varilla').textContent = fmt(kgVarilla, 2);
        document.getElementById('calc-total').textContent = fmt(toneladas, 3);
        document.getElementById('calc-por-tonelada').textContent = fmt(Math.floor(1000 / kgVarilla), 0);
        return { cantidad, toneladas };
    };

    [calcCalibre, calcLongitud, calcCantidad].forEach(el => el.addEventListener('input', calcular));
    calcular();

    // Enviar el resultado a la página de contacto (se prellena el formulario)
    document.getElementById('calc-cotizar').addEventListener('click', (e) => {
        const { cantidad, toneladas } = calcular();
        const opcion = calcCalibre.selectedOptions[0];
        const params = new URLSearchParams({
            diametro: opcion.dataset.rfq,
            longitud: calcLongitud.value + "'",
        });
        if (toneladas > 0) params.set('volumen', toneladas.toFixed(2));
        if (cantidad > 0) {
            params.set('detalles', `Calculadora: ${cantidad} varillas de ${opcion.dataset.nombre} x ${calcLongitud.value}' (≈ ${toneladas.toFixed(2)} t).`);
        }
        e.currentTarget.href = 'contacto.html?' + params.toString();
    });
}

// --- Prellenar el formulario con datos recibidos en la URL (desde Calibres o la calculadora) ---
if (document.getElementById('form-rfq')) {
    const params = new URLSearchParams(window.location.search);
    const asignar = (id, valor) => {
        const campo = document.getElementById(id);
        if (!campo || !valor) return;
        if (campo.tagName === 'SELECT' && ![...campo.options].some(o => o.value === valor)) return;
        campo.value = valor;
    };
    asignar('rfq-diametro', params.get('diametro'));
    asignar('rfq-longitud', params.get('longitud'));
    asignar('rfq-volumen', params.get('volumen'));
    asignar('rfq-detalles', params.get('detalles'));
    if ([...params.keys()].length) {
        document.getElementById('rfq')?.scrollIntoView({ block: 'start' });
    }
}

// --- Tarjetas giratorias: toque/teclado en móviles ---
document.querySelectorAll('.flip').forEach(tarjeta => {
    const alternar = () => tarjeta.classList.toggle('is-flipped');
    tarjeta.addEventListener('click', alternar);
    tarjeta.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
    });
});

// --- "Cotizar" dentro de una tarjeta: navega a contacto sin voltear la tarjeta ---
document.querySelectorAll('[data-calibre]').forEach(boton => {
    boton.addEventListener('click', (e) => e.stopPropagation());
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
