/*
 * CONTENIDO EDITABLE: SERVICIOS Y GALERÍA
 * ---------------------------------------
 * Servicios: cambia nombre, descripción, beneficios o precio.
 *   group: para qué materiales es el servicio (texto corto).
 *   price: número en pesos (ej. 120) o null para "Por cotización".
 *   tone: color de la tarjeta: 'ink' (negro), 'red', 'steel' (gris) o 'blue'.
 * Galería: cada trabajo es un PAR de fotos (antes y después) del mismo
 *   tenis y, de preferencia, desde el mismo ángulo. Cada foto necesita su
 *   archivo en assets/img/ (versión grande y -sm). Una foto de "antes" nunca
 *   se muestra sola: siempre va junto a su "después".
 */
window.SNEAKLAB_DATA = Object.freeze({
  services: [
    {
      id: 'basica',
      name: 'Limpieza básica',
      group: 'Malla, tela, piel y sintéticos',
      description: 'Limpieza general por fuera: corte, entresuela y suela para quitar polvo y suciedad del uso diario.',
      benefits: ['Ideal para mantenimiento frecuente', 'Cuidado según el material', 'Agujetas incluidas en la revisión'],
      price: 120,
      tone: 'ink'
    },
    {
      id: 'aroma',
      name: 'Limpieza + aroma',
      group: 'Malla, tela, piel y sintéticos',
      description: 'Todo lo de la limpieza básica más perfume especializado para calzado, con un aroma fresco.',
      benefits: ['Frescura extra por dentro', 'Perfume especial para tenis', 'Incluye la limpieza básica'],
      price: 140,
      tone: 'red'
    },
    {
      id: 'delicados',
      name: 'Materiales delicados',
      group: 'Gamuza, nobuk y tejidos sensibles',
      description: 'Cuidado específico para gamuza, nobuk y tejidos sensibles que no aguantan una limpieza común.',
      benefits: ['Gamuza y nobuk', 'Técnica controlada', 'Protege textura y color'],
      price: 130,
      tone: 'steel'
    },
    {
      id: 'delicados-aroma',
      name: 'Materiales delicados + aroma',
      group: 'Gamuza, nobuk y tejidos sensibles',
      description: 'Todo lo del cuidado para materiales delicados más perfume especializado para calzado.',
      benefits: ['Técnica controlada', 'Perfume especial para tenis', 'Incluye el cuidado para delicados'],
      price: 150,
      tone: 'blue'
    }
  ],

  // Filtros de la galería (category de cada trabajo).
  categories: [
    { id: 'todos', label: 'Todos' },
    { id: 'naranja', label: 'Running naranja' },
    { id: 'gris', label: 'Running gris' },
    { id: 'blanco', label: 'Running blanco' }
  ],

  // Pares para el comparador deslizable (misma vista en ambas fotos).
  comparisons: [
    { id: 'naranja', label: 'Running naranja', before: '8677', after: '8715' },
    { id: 'gris', label: 'Running gris', before: '8687', after: '8724' },
    { id: 'blanco', label: 'Running blanco', before: '8670', after: '8716' }
  ],

  // Trabajos de la galería: siempre antes + después del mismo par.
  gallery: [
    { pair: 'Running naranja', view: 'Vista superior', category: 'naranja', before: '8674', after: '8710' },
    { pair: 'Running naranja', view: 'Vista trasera', category: 'naranja', before: '8677', after: '8715' },
    { pair: 'Running naranja', view: 'Vista lateral', category: 'naranja', before: '8675', after: '8714' },
    { pair: 'Running gris', view: 'Vista superior', category: 'gris', before: '8683', after: '8721' },
    { pair: 'Running gris', view: 'Vista trasera', category: 'gris', before: '8687', after: '8724' },
    { pair: 'Running gris', view: 'Vista lateral', category: 'gris', before: '8689', after: '8723' },
    { pair: 'Running blanco', view: 'Vista frontal', category: 'blanco', before: '8670', after: '8716' },
    { pair: 'Running blanco', view: 'Vista lateral', category: 'blanco', before: '8671', after: '8718' }
  ]
});
