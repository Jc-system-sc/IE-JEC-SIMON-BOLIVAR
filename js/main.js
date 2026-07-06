// ═══════════════════════════════════════════════════════════
// COLEGIO SIMÓN BOLÍVAR — Sitio Institucional — Interactividad
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  /* ── Año automático en el footer ── */
  document.getElementById('anioActual').textContent = new Date().getFullYear();

  /* ═══════════════ MODO CLARO / OSCURO ═══════════════
     No altera los colores de marca (guinda/oro): solo cambia
     fondo y superficie. Preferencia guardada en localStorage. */
  const btnTema  = document.getElementById('btnTema');
  const iconTema = document.getElementById('iconTema');
  const raiz     = document.documentElement;

  const aplicarTema = (tema) => {
    if (tema === 'oscuro') {
      raiz.setAttribute('data-tema', 'oscuro');
      iconTema.className = 'fa-solid fa-sun';
      btnTema.setAttribute('aria-label', 'Cambiar a modo claro');
    } else {
      raiz.removeAttribute('data-tema');
      iconTema.className = 'fa-solid fa-moon';
      btnTema.setAttribute('aria-label', 'Cambiar a modo oscuro');
    }
  };

  const temaGuardado = localStorage.getItem('sb-tema');
  const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
  aplicarTema(temaGuardado || (prefiereOscuro ? 'oscuro' : 'claro'));

  btnTema.addEventListener('click', () => {
    const nuevoTema = raiz.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro';
    aplicarTema(nuevoTema);
    localStorage.setItem('sb-tema', nuevoTema);
  });

  /* ═══════════════ HEADER: sombra al hacer scroll ═══════════════ */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /* ═══════════════ MENÚ MÓVIL ═══════════════ */
  const btnMenu   = document.getElementById('btnMenu');
  const headerNav = document.getElementById('headerNav');
  const navOverlay = document.getElementById('navOverlay');

  const cerrarMenu = () => {
    headerNav.classList.remove('abierto');
    navOverlay.classList.remove('activo');
    btnMenu.querySelector('i').className = 'fa-solid fa-bars';
  };
  const abrirMenu = () => {
    headerNav.classList.add('abierto');
    navOverlay.classList.add('activo');
    btnMenu.querySelector('i').className = 'fa-solid fa-xmark';
  };

  btnMenu.addEventListener('click', () => {
    headerNav.classList.contains('abierto') ? cerrarMenu() : abrirMenu();
  });
  navOverlay.addEventListener('click', cerrarMenu);
  headerNav.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', cerrarMenu));

  /* ═══════════════ MICRO-ANIMACIÓN: BARRA DE CARGA EN BOTONES ═══════════════
     Al presionar cualquier botón marcado con [data-barra], una barra se
     llena de izquierda a derecha antes de ejecutar la acción real
     (navegar, hacer scroll, enviar el formulario, etc.) */
  const conBarra = document.querySelectorAll('[data-barra]');
  conBarra.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // El botón "Ingresar al Aula Virtual" tiene su propia lógica especial
      // (pantalla de transición a pantalla completa) — se maneja aparte.
      if (this.id === 'btnAula' || this.id === 'btnAulaHero' || this.classList.contains('footer-aula-link')) return;

      this.classList.add('presionado');
      setTimeout(() => this.classList.remove('presionado'), 650);
    });
  });

  /* ═══════════════ CONTADORES ANIMADOS (stats) ═══════════════ */
  const contadores = document.querySelectorAll('[data-cuenta]');
  const animarContador = (el) => {
    const meta = parseInt(el.getAttribute('data-cuenta'), 10);
    const duracion = 1400;
    const inicio = performance.now();
    const paso = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const valorActual = Math.floor(progreso * meta);
      el.textContent = valorActual;
      if (progreso < 1) requestAnimationFrame(paso);
      else el.textContent = meta;
    };
    requestAnimationFrame(paso);
  };

  /* ═══════════════ REVEAL ON SCROLL (incluye contadores y galería) ═══════════════ */
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        if (entrada.target.hasAttribute('data-cuenta')) animarContador(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observador.observe(el));
  contadores.forEach(el => observador.observe(el));

  /* ═══════════════ GALERÍA: FILTROS + LIGHTBOX ═══════════════ */
  const chips = document.querySelectorAll('.filtro-chip');
  const items = document.querySelectorAll('.galeria-item');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('activo'));
      chip.classList.add('activo');
      const filtro = chip.getAttribute('data-filtro');
      items.forEach(item => {
        const coincide = filtro === 'todos' || item.getAttribute('data-cat') === filtro;
        item.classList.toggle('oculto', !coincide);
      });
    });
  });

  // Lightbox simple
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `<button class="lightbox-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button><img src="" alt="">`;
  document.body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector('img');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('activo');
    });
  });
  const cerrarLightbox = () => lightbox.classList.remove('activo');
  lightbox.querySelector('.lightbox-cerrar').addEventListener('click', cerrarLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) cerrarLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarLightbox(); });

  /* ═══════════════ FORMULARIO DE CONTACTO → WHATSAPP ═══════════════
     No hay backend: el formulario arma un mensaje con los datos
     ingresados y abre WhatsApp Business con todo pre-escrito. */
  const NUMERO_WHATSAPP = '51978159209';
  const formContacto = document.getElementById('formContacto');

  formContacto.addEventListener('submit', (e) => {
    e.preventDefault();
    const boton = formContacto.querySelector('.btn-form');
    const nombre    = document.getElementById('fNombre').value.trim();
    const telefono  = document.getElementById('fTelefono').value.trim();
    const mensaje   = document.getElementById('fMensaje').value.trim();

    if (!nombre || !mensaje) return;

    boton.classList.add('presionado');

    const texto =
      `Hola, soy ${nombre}` +
      (telefono ? ` (contacto: ${telefono})` : '') +
      `.\n\n${mensaje}`;

    setTimeout(() => {
      window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank');
      boton.classList.remove('presionado');
      formContacto.reset();
    }, 600);
  });

  /* ═══════════════ TRANSICIÓN A PANTALLA COMPLETA: "INGRESAR AL AULA VIRTUAL" ═══════════════
     No se salta directo al link externo: se activa una pantalla de carga
     elegante con fade, una barra de progreso, y recién ahí se navega. */
  const transicion      = document.getElementById('transicionAula');
  const transicionBarra = document.getElementById('transicionBarra');
  const botonesAula     = document.querySelectorAll('#btnAula, #btnAulaHero, .footer-aula-link');

  botonesAula.forEach(boton => {
    boton.addEventListener('click', (e) => {
      e.preventDefault();
      const destino = boton.getAttribute('href');

      boton.classList.add('presionado');
      transicionBarra.style.width = '0%';

      setTimeout(() => {
        transicion.classList.add('activa');
        // Pequeño delay para que la transición de opacidad se vea antes
        // de empezar a llenar la barra.
        requestAnimationFrame(() => {
          setTimeout(() => { transicionBarra.style.width = '100%'; }, 120);
        });

        setTimeout(() => {
          window.location.href = destino;
        }, 1400);
      }, 300);
    });
  });

});
