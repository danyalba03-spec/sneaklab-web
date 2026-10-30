/*
 * SneakLab — bienvenida con el logo.
 * Se carga en el <head> para marcar la página antes de pintarla. Solo se muestra
 * la primera vez de cada sesión. La animación es 100% CSS (clase "intro" en <html>)
 * y no bloquea clics; si este archivo falla, el sitio se ve normal.
 */
(function () {
  'use strict';
  try {
    if (window.top !== window.self) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.sessionStorage.getItem('sneaklab-intro')) return;
    window.sessionStorage.setItem('sneaklab-intro', '1');
    document.documentElement.classList.add('intro');
    // Quita la clase cuando la animación ya terminó.
    window.setTimeout(function () { document.documentElement.classList.remove('intro'); }, 1600);
  } catch (e) { /* sin sessionStorage (navegación privada estricta): sin bienvenida */ }
})();
