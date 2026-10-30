/*
 * SneakLab — comportamiento del sitio.
 * Seguridad: todo el contenido dinámico se crea con createElement/textContent;
 * no se usa innerHTML con datos. Las URLs externas se validan antes de usarse.
 */
(function () {
  'use strict';

  // Anti-clickjacking: GitHub Pages no permite el encabezado frame-ancestors,
  // así que si otra página mete este sitio en un iframe, salimos de él.
  if (window.top !== window.self) {
    try { window.top.location.replace(window.location.href); } catch (e) { /* iframe bloqueado */ }
    document.documentElement.style.display = 'none';
    return;
  }

  var CONFIG = window.SNEAKLAB_CONFIG || {};
  var DATA = window.SNEAKLAB_DATA || { services: [], gallery: [], categories: [], comparisons: [] };
  var IMG = 'assets/img/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  /* ---------- Utilidades ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined || value === false) return;
      if (key === 'text') node.textContent = value;
      else if (key === 'className') node.className = value;
      else node.setAttribute(key, value === true ? '' : String(value));
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  function isSafeHttpsUrl(value) {
    try { return new URL(value).protocol === 'https:'; } catch (e) { return false; }
  }

  function whatsappUrl(message) {
    var number = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    if (!number) return 'contacto.html';
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message || CONFIG.defaultWhatsappMessage || '');
  }

  function formatPrice(value) {
    return '$' + Number(value).toLocaleString('es-MX');
  }

  function img(file, alt, opts) {
    opts = opts || {};
    return el('img', {
      src: IMG + file + (opts.small ? '-sm' : '') + '.webp',
      srcset: opts.srcset ? IMG + file + '-sm.webp 480w, ' + IMG + file + '.webp 1050w' : null,
      sizes: opts.sizes || null,
      alt: alt || '',
      width: opts.width || 480,
      height: opts.height || 640,
      loading: opts.eager ? 'eager' : 'lazy',
      decoding: 'async'
    });
  }

  /* ---------- Datos del negocio en la página ---------- */
  function applyConfig() {
    $all('[data-wa]').forEach(function (link) {
      link.href = whatsappUrl(link.getAttribute('data-wa'));
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });

    var number = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    $all('[data-tel]').forEach(function (link) {
      if (!number) { link.hidden = true; return; }
      link.href = 'tel:+' + number;
      if (!link.textContent.trim()) link.textContent = CONFIG.phoneDisplay || number;
    });
    $all('[data-phone]').forEach(function (node) { node.textContent = CONFIG.phoneDisplay || ''; });

    var social = CONFIG.social || {};
    $all('[data-social]').forEach(function (link) {
      var url = social[link.getAttribute('data-social')];
      if (url && isSafeHttpsUrl(url)) {
        link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.hidden = false;
      } else {
        link.hidden = true;
      }
    });
    $all('[data-social-group]').forEach(function (group) {
      var visible = $all('[data-social]', group).some(function (a) { return !a.hidden; });
      group.hidden = !visible;
    });

    $all('[data-hours]').forEach(function (list) {
      var hours = CONFIG.hours || [];
      list.textContent = '';
      if (!hours.length) {
        list.appendChild(el('li', { text: 'Escríbenos por WhatsApp para confirmar disponibilidad.' }));
        return;
      }
      hours.forEach(function (row) {
        list.appendChild(el('li', {}, [el('strong', { text: row.days }), document.createTextNode(' ' + row.time)]));
      });
    });

    var legal = CONFIG.legal || {};
    $all('[data-legal]').forEach(function (node) {
      var key = node.getAttribute('data-legal');
      var value = legal[key];
      if (key === 'contactEmail') {
        if (value && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)) {
          node.textContent = value; if (node.tagName === 'A') node.href = 'mailto:' + value;
        } else {
          node.textContent = 'WhatsApp ' + (CONFIG.phoneDisplay || '');
          if (node.tagName === 'A') { node.href = whatsappUrl('Hola SneakLab, tengo una solicitud sobre mis datos personales.'); node.target = '_blank'; node.rel = 'noopener noreferrer'; }
        }
      } else if (value) {
        node.textContent = value;
      }
    });
    // Partes opcionales (p. ej. el domicilio): solo se muestran si el dato existe.
    $all('[data-legal-wrap]').forEach(function (node) {
      node.hidden = !legal[node.getAttribute('data-legal-wrap')];
    });

    $all('[data-year]').forEach(function (node) { node.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Navegación ---------- */
  function initNav() {
    var header = $('[data-header]');
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-nav]');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      initHeaderTheme(header);
    }
    if (!toggle || !nav) return;
    var label = $('.sr-only', toggle);
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      if (header) { header.classList.toggle('menu-open', open); header.dispatchEvent(new Event('sneaklab:menu')); }
      if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    }
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) { var first = $('a', nav); if (first) first.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    $all('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) { if (mq.matches) setOpen(false); });
  }

  // El header cambia a oscuro (con el logo blanco) mientras pasa sobre una sección negra.
  function initHeaderTheme(header) {
    var darks = $all('.section-dark, .page-intro-dark, .site-footer');
    var logo = $('.logo img', header);
    if (!darks.length || !('IntersectionObserver' in window)) return;
    var light = logo ? logo.getAttribute('src') : '';
    var white = IMG + 'logo-sneaklab-blanco.png';
    var inside = [];
    var io;
    function update() {
      var dark = inside.length > 0;
      header.classList.toggle('is-dark', dark);
      // Con el menú móvil abierto el header vuelve a ser blanco.
      if (logo) logo.setAttribute('src', dark && !header.classList.contains('menu-open') ? white : light);
    }
    header.addEventListener('sneaklab:menu', update);
    function observe() {
      if (io) io.disconnect();
      inside = [];
      // Solo cuenta la franja que queda detrás del header.
      var h = header.offsetHeight;
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var at = inside.indexOf(entry.target);
          if (entry.isIntersecting && at < 0) inside.push(entry.target);
          if (!entry.isIntersecting && at >= 0) inside.splice(at, 1);
        });
        update();
      }, { rootMargin: '0px 0px ' + (h - window.innerHeight) + 'px 0px' });
      darks.forEach(function (d) { io.observe(d); });
    }
    observe();
    var timer;
    window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(observe, 200); });
  }

  /* ---------- Barra de progreso y botón para volver arriba ---------- */
  function initScrollExtras() {
    var bar = el('div', { className: 'progress', 'aria-hidden': 'true' });
    var top = el('button', { type: 'button', className: 'to-top', 'aria-label': 'Volver arriba' });
    document.body.appendChild(bar);
    document.body.appendChild(top);
    var raf = 0;
    function paint() {
      raf = 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      bar.style.setProperty('--p', max > 0 ? String(Math.min(1, y / max)) : '0');
      bar.hidden = max < window.innerHeight;
      top.classList.toggle('is-visible', y > window.innerHeight * 1.2);
    }
    function queue() { if (!raf) raf = requestAnimationFrame(paint); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var logo = $('.logo');
      if (logo) logo.focus({ preventScroll: true });
    });
    paint();
  }

  /* ---------- Portada: profundidad sutil en la foto ---------- */
  function initHeroDepth() {
    var media = $('.hero-media');
    if (!media || reduceMotion) return;
    var image = $('img', media);
    var px = 0, py = 0, sy = 0, raf = 0;
    function paint() {
      raf = 0;
      image.style.setProperty('--tx', px.toFixed(2) + 'px');
      image.style.setProperty('--ty', (py + sy).toFixed(2) + 'px');
    }
    function queue() { if (!raf) raf = requestAnimationFrame(paint); }
    window.addEventListener('scroll', function () {
      if (window.scrollY > window.innerHeight * 1.5) return;
      sy = window.scrollY * 0.06;
      queue();
    }, { passive: true });
    // Movimiento con el cursor solo en equipos con mouse.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      media.addEventListener('pointermove', function (e) {
        var r = media.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - 0.5) * -14;
        py = ((e.clientY - r.top) / r.height - 0.5) * -14;
        queue();
      });
      media.addEventListener('pointerleave', function () { px = 0; py = 0; queue(); });
    }
  }

  /* ---------- Aparición al desplazarse ---------- */
  function initReveal() {
    // Los contenedores con data-reveal-stagger animan a sus hijos uno tras otro.
    $all('[data-reveal-stagger]').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.setAttribute('data-reveal', '');
        child.style.setProperty('--i', String(Math.min(i, 6)));
      });
    });
    var items = $all('[data-reveal]');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Visor de pares antes/después (lado a lado) ---------- */
  // Las fotos de antes y después no tienen exactamente el mismo encuadre,
  // así que se muestran una junto a la otra en vez de superponerse.
  function initPairViewer(root) {
    var chips = $('[data-pair-chips]', root);
    var before = $('[data-pv="before"]', root);
    var after = $('[data-pv="after"]', root);
    var caption = $('[data-pv-caption]', root);
    var stage = $('.pv-stage', root);
    if (!chips || !before || !after) return;
    // Deslizador solo para pares marcados con aligned: true (mismo encuadre exacto).
    var range = el('input', { type: 'range', className: 'pv-range', min: '0', max: '100', value: '50', step: '1', 'aria-label': 'Deslizar para comparar antes y después' });
    stage.appendChild(range);
    function setPos(v) {
      stage.style.setProperty('--pos', v + '%');
      range.setAttribute('aria-valuetext', Math.round(v) + '% de la foto de antes visible');
    }
    range.addEventListener('input', function () { setPos(range.value); });
    function show(pair) {
      root.classList.add('is-swapping');
      setTimeout(function () {
        stage.classList.toggle('is-compare', !!pair.aligned);
        range.hidden = !pair.aligned;
        range.value = 50; setPos(50);
        before.src = IMG + pair.before + '.webp';
        before.alt = pair.label + ' antes de la limpieza';
        after.src = IMG + pair.after + '.webp';
        after.alt = pair.label + ' después de la limpieza';
        if (caption) caption.textContent = pair.label + (pair.view ? ', ' + pair.view.toLowerCase() : '') + '.';
        root.classList.remove('is-swapping');
      }, reduceMotion ? 0 : 160);
    }
    DATA.comparisons.forEach(function (pair, i) {
      var b = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(i === 0), text: pair.label });
      b.addEventListener('click', function () {
        $all('button', chips).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        show(pair);
      });
      chips.appendChild(b);
    });
    stage.classList.toggle('is-compare', !!(DATA.comparisons[0] && DATA.comparisons[0].aligned));
    range.hidden = !stage.classList.contains('is-compare');
    setPos(50);
  }

  /* ---------- Servicios ---------- */
  function serviceCard(service, detailed) {
    var media = service.image
      ? el('div', { className: 'service-media' }, [img(service.image, service.imageAlt || '', { small: true, width: 480, height: 640 })])
      : el('div', { className: 'service-media is-material', 'aria-hidden': 'true' }, [el('span', { text: service.material || service.name })]);
    var price = service.price
      ? el('p', { className: 'service-price' }, [document.createTextNode(formatPrice(service.price)), el('small', { text: 'MXN por par' })])
      : el('p', { className: 'service-price is-quote', text: 'Por cotización' });
    var benefits = detailed
      ? el('ul', { className: 'service-points', 'aria-label': 'Incluye' },
          (service.benefits || []).map(function (b) { return el('li', { text: b }); }))
      : null;
    var waText = 'Hola SneakLab, quiero cotizar: ' + service.name +
      (service.price ? ' (' + formatPrice(service.price) + ' MXN por par, sujeto a confirmación al revisar mi par).' : '.');
    var cta = el('a', {
      className: 'btn btn-card btn-sm', 'data-wa': waText,
      href: 'contacto.html', text: 'Cotizar este servicio',
      'aria-label': 'Solicitar cotización de ' + service.name + ' por WhatsApp'
    });
    return el('article', { className: 'service-card', id: 'servicio-' + service.id }, [
      media,
      el('div', { className: 'service-body' }, [
        service.group ? el('p', { className: 'service-group', text: service.group }) : null,
        el('div', { className: 'service-title' }, [el('h3', { text: service.name }), price]),
        el('p', { className: 'service-desc', text: service.description }),
        benefits,
        cta
      ])
    ]);
  }

  function renderServices() {
    $all('[data-services]').forEach(function (grid) {
      var ids = (grid.getAttribute('data-services') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var list = ids.length
        ? ids.map(function (id) { return DATA.services.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean)
        : DATA.services;
      var detailed = grid.hasAttribute('data-services-detail');
      grid.textContent = '';
      list.forEach(function (s, i) {
        var card = serviceCard(s, detailed);
        card.setAttribute('data-reveal', '');
        card.style.setProperty('--i', String(i));
        grid.appendChild(card);
      });
    });
    $all('[data-service-options]').forEach(function (select) {
      DATA.services.forEach(function (s) { select.appendChild(el('option', { value: s.name, text: s.name })); });
      select.appendChild(el('option', { value: 'No estoy seguro', text: 'No estoy seguro, quiero asesoría' }));
    });
  }

  /* ---------- Galería (siempre en pares antes/después) ---------- */
  function initGallery() {
    var grid = $('[data-gallery]');
    if (!grid) return;
    var filters = $('[data-gallery-filters]');
    var dialog = $('[data-lightbox]');
    var current = 'todos';
    var photos = [];
    var index = 0;
    var lastFocus = null;

    function stageLabel(stage) { return stage === 'despues' ? 'Después' : 'Antes'; }
    function altText(item, stage) {
      return item.pair + ' ' + (stage === 'despues' ? 'después' : 'antes') + ' de la limpieza, ' + item.view.toLowerCase();
    }

    function half(item, stage, photoIndex) {
      var file = stage === 'despues' ? item.after : item.before;
      var button = el('button', { type: 'button', 'aria-label': 'Ampliar foto: ' + altText(item, stage) }, [img(file, altText(item, stage), { small: true })]);
      button.addEventListener('click', function () { open(photoIndex); });
      return el('div', { className: 'pair-half' }, [button, el('span', { className: 'tag ' + (stage === 'despues' ? 'is-after' : 'is-before'), text: stageLabel(stage) })]);
    }

    function render(animate) {
      grid.textContent = '';
      photos = [];
      var visible = DATA.gallery.filter(function (g) { return current === 'todos' || g.category === current; });
      if (!visible.length) {
        grid.appendChild(el('p', { className: 'gallery-empty', text: 'Todavía no hay trabajos en esta categoría. Pronto agregaremos más.' }));
        return;
      }
      visible.forEach(function (item, i) {
        photos.push({ file: item.before, stage: 'antes', item: item }, { file: item.after, stage: 'despues', item: item });
        var fig = el('figure', { className: 'pair-card' + (animate && !reduceMotion ? ' is-entering' : '') }, [
          el('div', { className: 'pair-media' }, [half(item, 'antes', i * 2), half(item, 'despues', i * 2 + 1)]),
          el('figcaption', {}, [el('strong', { text: item.pair }), el('span', { text: item.view })])
        ]);
        if (animate) fig.style.animationDelay = Math.min(i * 40, 240) + 'ms';
        grid.appendChild(fig);
      });
    }

    if (filters) {
      DATA.categories.forEach(function (cat, i) {
        var b = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(i === 0), text: cat.label });
        b.addEventListener('click', function () {
          if (current === cat.id) return;
          current = cat.id;
          $all('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          if (reduceMotion) { render(false); return; }
          grid.classList.add('is-filtering');
          setTimeout(function () { render(true); grid.classList.remove('is-filtering'); }, 180);
        });
        filters.appendChild(b);
      });
    }

    function show(i) {
      index = (i + photos.length) % photos.length;
      var photo = photos[index];
      var image = $('img', dialog);
      if (dialog.open && !reduceMotion) {
        image.classList.remove('is-changing');
        void image.offsetWidth; // reinicia la transición
        image.classList.add('is-changing');
      }
      image.src = IMG + photo.file + '.webp';
      image.alt = altText(photo.item, photo.stage);
      var cap = $('figcaption', dialog);
      cap.textContent = '';
      cap.appendChild(el('span', { className: 'tag ' + (photo.stage === 'despues' ? 'is-after' : 'is-before'), text: stageLabel(photo.stage) }));
      cap.appendChild(el('span', { text: photo.item.pair + ', ' + photo.item.view.toLowerCase() + ' · ' + (index + 1) + ' de ' + photos.length }));
    }
    function open(i) {
      if (!dialog || typeof dialog.showModal !== 'function') { window.open(IMG + photos[i].file + '.webp', '_blank', 'noopener'); return; }
      lastFocus = document.activeElement;
      show(i);
      dialog.showModal();
    }
    if (dialog) {
      $('[data-lb-close]', dialog).addEventListener('click', function () { dialog.close(); });
      $('[data-lb-prev]', dialog).addEventListener('click', function () { show(index - 1); });
      $('[data-lb-next]', dialog).addEventListener('click', function () { show(index + 1); });
      dialog.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      // Deslizar con el dedo para cambiar de foto.
      var startX = null;
      dialog.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      dialog.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      }, { passive: true });
      dialog.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
    }
    render(false);
  }

  /* ---------- Formulario de contacto (envío por WhatsApp) ---------- */
  function initForm() {
    var form = $('[data-contact-form]');
    if (!form) return;
    var status = $('[data-form-status]', form);
    var submit = $('[type="submit"]', form);
    var startedAt = Date.now();

    var rules = {
      nombre: function (v) {
        if (!v) return 'Escribe tu nombre.';
        if (v.length < 2 || v.length > 60) return 'El nombre debe tener entre 2 y 60 caracteres.';
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' .-]+$/.test(v)) return 'Usa solo letras y espacios.';
        return '';
      },
      servicio: function (v) { return v ? '' : 'Elige un servicio.'; },
      pares: function (v) {
        var n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 20 ? '' : 'Indica un número de pares entre 1 y 20.';
      },
      mensaje: function (v) { return v.length > 500 ? 'Máximo 500 caracteres.' : ''; },
      privacidad: function (v, input) { return input.checked ? '' : 'Para continuar, acepta el Aviso de privacidad.'; }
    };

    function clean(value) {
      // Quita caracteres de control y espacios repetidos.
      return String(value).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function validateField(name) {
      var input = form.elements[name];
      if (!input || !rules[name]) return true;
      var msg = rules[name](clean(input.value), input);
      var field = input.closest('.field, .check-field');
      var err = field && $('.field-error', field);
      if (field) field.classList.toggle('has-error', !!msg);
      if (err) err.textContent = msg;
      input.setAttribute('aria-invalid', String(!!msg));
      return !msg;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener(input.type === 'checkbox' ? 'change' : 'blur', function () { validateField(name); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') validateField(name); });
    });

    function setStatus(type, text) {
      status.className = 'form-status ' + (type ? 'is-' + type : '');
      status.textContent = text || '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      // Protección básica contra spam: campo trampa y envío demasiado rápido.
      if (form.elements.website && form.elements.website.value) return;
      if (Date.now() - startedAt < 2500) { setStatus('error', 'Revisa tus datos y vuelve a intentarlo en unos segundos.'); return; }

      var ok = Object.keys(rules).map(validateField).every(Boolean);
      if (!ok) {
        setStatus('error', 'Revisa los campos marcados.');
        var firstBad = $('[aria-invalid="true"]', form);
        if (firstBad) firstBad.focus();
        return;
      }

      var promos = form.elements.promociones && form.elements.promociones.checked;
      var now = new Date();
      var lines = [
        'Hola SneakLab, quiero cotizar una limpieza.',
        'Nombre: ' + clean(form.elements.nombre.value),
        'Servicio: ' + clean(form.elements.servicio.value),
        'Pares: ' + clean(form.elements.pares.value)
      ];
      var msg = clean(form.elements.mensaje.value);
      if (msg) lines.push('Detalles: ' + msg);
      lines.push('');
      lines.push('Registro de consentimiento:');
      lines.push('- Acepto el Aviso de privacidad (versión ' + ((CONFIG.legal || {}).privacyNoticeVersion || 's/v') + ').');
      lines.push('- Acepto que SneakLab muestre fotos de mis tenis como muestra de trabajo (Términos y condiciones).');
      lines.push('- Promociones por WhatsApp: ' + (promos ? 'Sí acepto' : 'No acepto') + '.');
      lines.push('- Fecha: ' + now.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }) + ' (' + now.toISOString() + ').');
      lines.push('- Medio: formulario de contacto del sitio web.');

      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      var labelNode = submit.lastChild;
      var label = labelNode.textContent;
      labelNode.textContent = 'Abriendo WhatsApp';

      // Un enlace real (en vez de window.open) evita bloqueos de ventanas emergentes en celulares.
      var link = el('a', { href: whatsappUrl(lines.join('\n')), target: '_blank', rel: 'noopener noreferrer' });
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
        labelNode.textContent = label;
        setStatus('ok', 'Abrimos WhatsApp con tu mensaje listo: solo falta que lo envíes desde ahí. Si no se abrió, escríbenos al ' + (CONFIG.phoneDisplay || '') + '.');
      }, 900);
    });
  }

  /* ---------- Analítica opcional con consentimiento ---------- */
  function initAnalytics() {
    var id = (CONFIG.analytics || {}).ga4Id;
    if (!id || !/^G-[A-Z0-9]{4,12}$/.test(id)) return;
    var KEY = 'sneaklab-consent';
    var choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) { /* navegación privada */ }

    function load() {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', id, { anonymize_ip: true });
      document.head.appendChild(el('script', { src: 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id), async: true }));
    }
    function save(value) { try { localStorage.setItem(KEY, value); } catch (e) { /* sin almacenamiento */ } }

    if (choice === 'accepted') { load(); return; }
    if (choice === 'rejected') return;

    var accept = el('button', { type: 'button', className: 'btn btn-sm', text: 'Aceptar analítica' });
    var reject = el('button', { type: 'button', className: 'btn btn-sm btn-ghost', text: 'Rechazar' });
    var policy = el('a', { href: 'cookies.html', text: 'Política de cookies' });
    var box = el('div', { className: 'consent on-dark', role: 'dialog', 'aria-live': 'polite', 'aria-label': 'Aviso de cookies' }, [
      el('p', {}, [document.createTextNode('Usamos cookies de analítica para saber cómo se usa el sitio, solo si las aceptas. '), policy, document.createTextNode('.')]),
      el('div', { className: 'consent-actions' }, [accept, reject])
    ]);
    accept.addEventListener('click', function () { save('accepted'); box.remove(); load(); });
    reject.addEventListener('click', function () { save('rejected'); box.remove(); });
    document.body.appendChild(box);
  }

  /* ---------- Inicio ---------- */
  renderServices();
  applyConfig();
  initNav();
  initScrollExtras();
  initHeroDepth();
  initReveal();
  $all('[data-pair-viewer]').forEach(initPairViewer);
  initGallery();
  initForm();
  initAnalytics();
})();
