/*
 * CONTENIDO EDITABLE: SERVICIOS Y GALERÍA
 * ---------------------------------------
 * Servicios: cambia nombre, descripción, beneficios, precio o imagen.
 *   price: número en pesos (ej. 120) o null para "Precio por cotización".
 * Galería: cada foto necesita archivo en assets/img/ (versión grande y -sm).
 *   stage: 'antes' o 'despues'. pair: agrupa fotos del mismo par.
 */
window.SNEAKLAB_DATA = Object.freeze({
  services: [
    {
      id: 'basica',
      name: 'Limpieza básica',
      description: 'Limpieza general por fuera: corte, entresuela y suela para quitar polvo y suciedad del uso diario.',
      benefits: ['Ideal para mantenimiento frecuente', 'Cuidado según el material', 'Agujetas incluidas en la revisión'],
      price: 120,
      image: '8714'
    },
    {
      id: 'aroma',
      name: 'Limpieza + aroma',
      description: 'Todo lo de la limpieza básica más perfume especializado para calzado, con un aroma fresco.',
      benefits: ['Frescura extra por dentro', 'Perfume especial para tenis', 'Nuestra opción más completa'],
      price: 140,
      image: '8711',
      featured: true
    },
    {
      id: 'profunda',
      name: 'Limpieza profunda',
      description: 'Para pares con suciedad acumulada: trabajo detallado en costuras, malla, plantilla y zonas difíciles.',
      benefits: ['Atención a costuras y malla', 'Pensada para suciedad acumulada', 'Revisamos el par antes de empezar'],
      price: null,
      image: '8725'
    },
    {
      id: 'suelas',
      name: 'Limpieza de suelas',
      description: 'Enfoque en la goma, los bordes y la entresuela, donde más se nota el desgaste y el polvo.',
      benefits: ['Bordes y entresuela', 'Goma y dibujo de la suela', 'Complementa cualquier limpieza'],
      price: null,
      image: '8715'
    },
    {
      id: 'agujetas',
      name: 'Limpieza de agujetas',
      description: 'Lavado de agujetas por separado para que combinen con el resto del par limpio.',
      benefits: ['Se lavan aparte', 'Evita que manchen el corte', 'Detalle que cambia el look'],
      price: null,
      image: '8720'
    },
    {
      id: 'manchas',
      name: 'Tratamiento de manchas',
      description: 'Evaluamos la mancha y el material para intentar reducirla con el método adecuado.',
      benefits: ['Evaluación por foto antes', 'Método según el tipo de mancha', 'Te decimos qué esperar'],
      price: null,
      image: '8689'
    },
    {
      id: 'delicados',
      name: 'Materiales delicados',
      description: 'Cuidado específico para gamuza, nobuk y tejidos sensibles que no aguantan una limpieza común.',
      benefits: ['Gamuza y nobuk', 'Técnica controlada', 'Protege textura y color'],
      price: null,
      image: '8818'
    }
  ],

  categories: [
    { id: 'todos', label: 'Todos' },
    { id: 'running', label: 'Running y malla' },
    { id: 'gamuza', label: 'Gamuza' }
  ],

  // Pares para el comparador antes/después (misma vista en ambas fotos).
  comparisons: [
    { id: 'naranja', label: 'Running naranja', before: '8677', after: '8715' },
    { id: 'gris', label: 'Running gris', before: '8687', after: '8724' },
    { id: 'blanco', label: 'Running blanco', before: '8670', after: '8720' }
  ],

  gallery: [
    { file: '8676', pair: 'Running naranja', category: 'running', stage: 'antes', alt: 'Tenis de running naranjas antes de la limpieza, vista lateral con polvo en la malla' },
    { file: '8714', pair: 'Running naranja', category: 'running', stage: 'despues', alt: 'Tenis de running naranjas después de la limpieza, vista lateral' },
    { file: '8674', pair: 'Running naranja', category: 'running', stage: 'antes', alt: 'Tenis de running naranjas antes de la limpieza, vista superior' },
    { file: '8710', pair: 'Running naranja', category: 'running', stage: 'despues', alt: 'Tenis de running naranjas después de la limpieza, vista superior' },
    { file: '8689', pair: 'Running gris', category: 'running', stage: 'antes', alt: 'Tenis de running grises antes de la limpieza, vista lateral con manchas' },
    { file: '8723', pair: 'Running gris', category: 'running', stage: 'despues', alt: 'Tenis de running grises después de la limpieza, vista lateral' },
    { file: '8683', pair: 'Running gris', category: 'running', stage: 'antes', alt: 'Tenis de running grises antes de la limpieza, vista superior' },
    { file: '8721', pair: 'Running gris', category: 'running', stage: 'despues', alt: 'Tenis de running grises después de la limpieza, vista superior' },
    { file: '8671', pair: 'Running blanco', category: 'running', stage: 'antes', alt: 'Tenis blancos de malla antes de la limpieza, vista lateral' },
    { file: '8717', pair: 'Running blanco', category: 'running', stage: 'despues', alt: 'Tenis blancos de malla después de la limpieza' },
    { file: '8672', pair: 'Running blanco', category: 'running', stage: 'antes', alt: 'Tenis blancos de malla antes de la limpieza, detalle de la suela' },
    { file: '8719', pair: 'Running blanco', category: 'running', stage: 'despues', alt: 'Tenis blancos de malla después de la limpieza, vista lateral' },
    { file: '8817', pair: 'Gamuza rosa', category: 'gamuza', stage: 'antes', alt: 'Tenis de gamuza rosa antes de la limpieza, vista frontal' },
    { file: '8819', pair: 'Gamuza rosa', category: 'gamuza', stage: 'antes', alt: 'Tenis de gamuza rosa antes de la limpieza, detalle lateral' },
    { file: '8822', pair: 'Gamuza rosa', category: 'gamuza', stage: 'antes', alt: 'Tenis de gamuza rosa antes de la limpieza, vista trasera' }
  ]
});
