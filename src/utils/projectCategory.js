export function getProjectCategory(tags) {
  const categories = {
    "Proyectos de ingeniería": [
      "arquitectura", "autocad", "programación", "desarrollo",
      "ingeniería civil", "estructuras", "software", "app",
      "backend", "frontend", "circuitos", "mecánica", "eléctrica", "industrial"
    ],
    "Proyectos económicos": [
      "finanzas", "economía", "marketing", "planificación",
      "emprendimiento", "administración financiera", "inversiones",
      "contabilidad", "negocios", "análisis financiero"
    ],
    "Proyectos de investigación": [
      "tesis", "investigación", "análisis", "encuestas",
      "ciencia", "laboratorio", "revisión bibliográfica", "experimento",
      "artículo académico", "publicación"
    ],
    "Proyectos tecnológicos": [
      "tecnología", "hardware", "iot", "electrónica", "automatización",
      "prototipo", "sistemas embebidos", "robot", "ciberseguridad",
      "realidad virtual", "realidad aumentada"
    ],
    "Proyectos de gestión": [
      "administración", "calidad", "organización", "bpm",
      "procesos", "gestión", "liderazgo", "scrum", "agile", "recursos humanos"
    ],
    "Proyectos de arte y diseño": [
      "arte", "dibujo", "pintura", "escultura", "ilustración",
      "diseño gráfico", "branding", "ux", "ui", "moda", "fotografía", "edición"
    ],
    "Proyectos musicales": [
      "música", "composición", "instrumentación", "grabación",
      "producción musical", "mezcla", "dj", "teoría musical", "sonido"
    ],
    "Proyectos educativos y pedagógicos": [
      "pedagogía", "educación", "enseñanza", "planificación educativa",
      "material didáctico", "e-learning", "formación", "capacitación"
    ],
    "Proyectos sociales y comunitarios": [
      "comunidad", "inclusión", "impacto social", "voluntariado",
      "asistencia social", "desarrollo humano", "ONG", "igualdad"
    ],
    "Proyectos legales y jurídicos": [
      "leyes", "jurídico", "derecho", "constitución", "contratos",
      "normativa", "jurisprudencia", "legal"
    ],
    "Proyectos de salud y medicina": [
      "salud", "medicina", "enfermería", "biología", "clínico",
      "prevención", "salud pública", "psicología", "nutrición"
    ],
    "Proyectos lingüísticos y de comunicación": [
      "idiomas", "traducción", "interpretación", "comunicación",
      "periodismo", "redacción", "literatura", "escritura creativa"
    ],
    "Proyectos medioambientales y sostenibles": [
      "ecología", "medioambiente", "sostenibilidad", "energía renovable",
      "reciclaje", "impacto ambiental", "conservación", "forestal"
    ]
  };

  const counts = {};
  Object.keys(categories).forEach(category => counts[category] = 0);

  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    Object.keys(categories).forEach(category => {
      if (categories[category].some(keyword => keyword.toLowerCase() === tagLower)) {
        counts[category]++;
      }
    });
  });

  let maxCount = 0;
  let selectedCategory = "Sin categoría definida";
  Object.keys(counts).forEach(category => {
    if (counts[category] > maxCount) {
      maxCount = counts[category];
      selectedCategory = category;
    }
  });

  return selectedCategory;
}
