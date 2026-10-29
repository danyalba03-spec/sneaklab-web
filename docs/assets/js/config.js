/*
 * CONFIGURACIÓN CENTRAL DE SNEAKLAB
 * ---------------------------------
 * Edita aquí los datos del negocio. Todo el sitio los lee de este archivo.
 * Un campo vacío ('') se oculta automáticamente en la página.
 *
 * IMPORTANTE: este archivo es PÚBLICO (cualquiera puede verlo en el navegador).
 * Nunca escribas aquí contraseñas, tokens privados ni claves secretas.
 */
window.SNEAKLAB_CONFIG = Object.freeze({
  businessName: 'SneakLab',
  originBrand: 'FreshKicks',
  city: 'León',
  state: 'Guanajuato',
  country: 'México',

  // WhatsApp en formato internacional, solo números (52 = México).
  whatsappNumber: '524778021115',
  phoneDisplay: '477 802 1115',
  defaultWhatsappMessage: 'Hola SneakLab, quiero cotizar la limpieza de mis tenis.',

  // Redes sociales: pega la URL completa (https://...) o deja vacío.
  social: Object.freeze({
    instagram: '',
    tiktok: '',
    facebook: '',
    googleBusiness: '' // Enlace a tu Perfil de Empresa en Google (Maps)
  }),

  // Horarios: deja la lista vacía para mostrar "Escríbenos para confirmar".
  hours: Object.freeze([
    // Ejemplo con días: { days: 'Lunes a sábado', time: '9:00 a. m. a 6:00 p. m.' }
    { days: 'Horario:', time: '9:00 a. m. a 6:00 p. m.' }
  ]),

  // Datos legales (OBLIGATORIOS antes de publicar). Ver README.
  legal: Object.freeze({
    responsibleName: 'Daniel Alejandro Alba Zamarripa',
    address: '', // Vacío = solo se muestra la ciudad
    contactEmail: '', // Correo para solicitudes de privacidad (derechos ARCO)
    privacyNoticeVersion: '2026-10-28'
  }),

  // Analítica opcional. Si pones un ID de Google Analytics 4 (G-XXXXXXX),
  // el sitio mostrará un aviso de cookies y solo cargará la analítica
  // si la persona acepta. Vacío = sin analítica y sin cookies.
  // Al activarla, agrega también los dominios de Google a la CSP (ver README).
  analytics: Object.freeze({
    ga4Id: ''
  })
});
