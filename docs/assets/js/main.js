/*
 * SneakLab — comportamiento del sitio.
 * Seguridad: todo el contenido dinámico se crea con createElement/textContent;
 * no se usa innerHTML con datos. Las URLs externas se validan antes de usarse.
 */
(function () {
  'use strict';

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
    }
    if (!toggle || !nav) return;
    var label = $('.sr-only', toggle);
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
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
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (mq) { if (mq.matches) setOpen(false); });
  }

  /* ---------- Aparición al desplazarse ---------- */
  function initReveal() {
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

  /* ---------- Comparador antes/después ---------- */
  function initCompare(root) {
    var range = $('.compare-range', root);
    var before = $('.compare-before', root);
    var after = $('.compare-after', root);
    if (!range) return;
    function set(value) {
      root.style.setProperty('--pos', value + '%');
      range.setAttribute('aria-valuetext', Math.round(value) + '% de la foto de antes visible');
    }
    range.addEventListener('input', function () { root.classList.remove('is-hinting'); set(range.value); });
    set(range.value);

    // Pista inicial: el divisor se mueve una vez para mostrar que se puede arrastrar.
    if (!reduceMotion && root.hasAttribute('data-hint')) {
      root.classList.add('is-hinting');
      setTimeout(function () { set(68); }, 900);
      setTimeout(function () { set(50); range.value = 50; }, 1900);
      setTimeout(function () { root.classList.remove('is-hinting'); }, 2900);
    }

    var group = root.getAttribute('data-compare');
    var buttons = group ? $all('[data-compare-pair="' + group + '"] [data-pair]') : [];
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var pair = DATA.comparisons.filter(function (p) { return p.id === button.getAttribute('data-pair'); })[0];
        if (!pair) return;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        before.src = IMG + pair.before + '.webp';
        before.alt = pair.label + ' antes de la limpieza';
        after.src = IMG + pair.after + '.webp';
        after.alt = pair.label + ' después de la limpieza';
        range.value = 50; set(50);
      });
    });
  }

  function buildComparePairButtons() {
    $all('[data-compare-pair]').forEach(function (wrap) {
      DATA.comparisons.forEach(function (pair, i) {
        wrap.appendChild(el('button', { type: 'button', className: 'chip', 'data-pair': pair.id, 'aria-pressed': String(i === 0), text: pair.label }));
      });
    });
  }

  /* ---------- Servicios ---------- */
  function serviceCard(service) {
    var price = service.price
      ? el('p', { className: 'service-price' }, [document.createTextNode(formatPrice(service.price)), el('small', { text: 'MXN por par' })])
      : el('p', { className: 'service-price is-quote', text: 'Precio por cotización' });
    var benefits = el('ul', { className: 'check-list', 'aria-label': 'Beneficios' },
      (service.benefits || []).map(function (b) { return el('li', { text: b }); }));
    var cta = el('a', {
      className: 'btn', 'data-wa': 'Hola SneakLab, quiero solicitar una cotización de: ' + service.name + '.',
      href: 'contacto.html', text: 'Solicitar cotización',
      'aria-label': 'Solicitar cotización de ' + service.name + ' por WhatsApp'
    });
    return el('article', { className: 'service-card' + (service.featured ? ' is-featured' : ''), id: 'servicio-' + service.id }, [
      el('div', { className: 'service-media' }, [
        img(service.image, '', { srcset: true, sizes: '(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 400px' }),
        service.featured ? el('span', { className: 'service-badge', text: 'Más completo' }) : null
      ]),
      el('div', { className: 'service-body' }, [
        el('h3', { text: service.name }),
        el('p', { text: service.description }),
        benefits,
        price,
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
      grid.textContent = '';
      list.forEach(function (s) { grid.appendChild(serviceCard(s)); });
    });
    $all('[data-service-options]').forEach(function (select) {
      DATA.services.forEach(function (s) { select.appendChild(el('option', { value: s.name, text: s.name })); });
      select.appendChild(el('option', { value: 'No estoy seguro', text: 'No estoy seguro, quiero asesoría' }));
    });
  }

  /* ---------- Galería ---------- */
  function initGallery() {
    var grid = $('[data-gallery]');
    if (!grid) return;
    var filters = $('[data-gallery-filters]');
    var dialog = $('[data-lightbox]');
    var current = 'todos';
    var visible = [];
    var index = 0;
    var lastFocus = null;
    var limit = parseInt(grid.getAttribute('data-limit'), 10) || 0;

    function stageLabel(stage) { return stage === 'despues' ? 'Después' : 'Antes'; }

    function render(animate) {
      grid.textContent = '';
      visible = DATA.gallery.filter(function (g) { return current === 'todos' || g.category === current; });
      if (limit) visible = visible.slice(0, limit);
      if (!visible.length) {
        grid.appendChild(el('p', { className: 'gallery-empty', text: 'Todavía no hay fotos en esta categoría. Pronto agregaremos más trabajos.' }));
        return;
      }
      visible.forEach(function (item, i) {
        var tags = [el('span', { className: 'tag ' + (item.stage === 'despues' ? 'is-after' : 'is-before'), text: stageLabel(item.stage) }), el('span', { className: 'tag', text: item.pair })];
        var button = el('button', { type: 'button', 'aria-label': 'Ampliar foto: ' + item.alt }, [img(item.file, item.alt, { small: true })]);
        button.addEventListener('click', function () { open(i); });
        var fig = el('figure', { className: 'gallery-item' + (animate && !reduceMotion ? ' is-entering' : '') }, [button, el('figcaption', {}, tags)]);
        if (animate) fig.style.animationDelay = Math.min(i * 30, 300) + 'ms';
        grid.appendChild(fig);
      });
    }

    if (filters) {
      DATA.categories.forEach(function (cat, i) {
        var b = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(i === 0), text: cat.label });
        b.addEventListener('click', function () {
          current = cat.id;
          $all('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          render(true);
        });
        filters.appendChild(b);
      });
    }

    function show(i) {
      index = (i + visible.length) % visible.length;
      var item = visible[index];
      var image = $('img', dialog);
      image.src = IMG + item.file + '.webp';
      image.alt = item.alt;
      var cap = $('figcaption', dialog);
      cap.textContent = '';
      cap.appendChild(el('span', { className: 'tag ' + (item.stage === 'despues' ? 'is-after' : 'is-before'), text: stageLabel(item.stage) }));
      cap.appendChild(el('span', { text: item.pair + ' · ' + (index + 1) + ' de ' + visible.length }));
    }
    function open(i) {
      if (!dialog || typeof dialog.showModal !== 'function') { window.open(IMG + visible[i].file + '.webp', '_blank', 'noopener'); return; }
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
  buildComparePairButtons();
  renderServices();
  applyConfig();
  initNav();
  initReveal();
  $all('[data-compare]').forEach(initCompare);
  initGallery();
  initForm();
  initAnalytics();
})();
