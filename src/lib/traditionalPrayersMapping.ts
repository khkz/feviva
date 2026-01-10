// Mapeo de santos importantes a sus oraciones tradicionales en fuentes católicas oficiales
// Fuentes: ACI Prensa, Vatican.va, Catholic.net

export interface TraditionalPrayerSource {
  url: string;
  fuente: string;
  nombre_oracion?: string;
}

export const TRADITIONAL_PRAYERS: Record<string, TraditionalPrayerSource> = {
  // === SANTOS MARIANOS ===
  "Nuestra Señora de Guadalupe": {
    url: "https://www.aciprensa.com/recursos/oraciones-a-la-virgen-de-guadalupe-2222",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Nuestra Señora de Guadalupe"
  },
  "Virgen de Guadalupe": {
    url: "https://www.aciprensa.com/recursos/oraciones-a-la-virgen-de-guadalupe-2222",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a la Virgen de Guadalupe"
  },
  "Nuestra Señora de Fátima": {
    url: "https://www.aciprensa.com/recursos/oracion-a-nuestra-senora-de-fatima-1598",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Nuestra Señora de Fátima"
  },
  "Nuestra Señora de Lourdes": {
    url: "https://www.aciprensa.com/recursos/oracion-a-nuestra-senora-de-lourdes-1564",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Nuestra Señora de Lourdes"
  },
  "Nuestra Señora del Carmen": {
    url: "https://www.aciprensa.com/recursos/oracion-a-la-virgen-del-carmen-1605",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a la Virgen del Carmen"
  },
  "Nuestra Señora del Rosario": {
    url: "https://www.aciprensa.com/recursos/oracion-a-nuestra-senora-del-rosario-1524",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Nuestra Señora del Rosario"
  },

  // === SAN JOSÉ ===
  "San José": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-jose-obrero-1545",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San José Obrero"
  },

  // === APÓSTOLES ===
  "San Pedro": {
    url: "https://www.aciprensa.com/recursos/oracion-a-los-santos-apostoles-pedro-y-pablo-1525",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Pedro Apóstol"
  },
  "San Pablo": {
    url: "https://www.aciprensa.com/recursos/oracion-a-los-santos-apostoles-pedro-y-pablo-1525",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Pablo Apóstol"
  },
  "San Pedro y San Pablo": {
    url: "https://www.aciprensa.com/recursos/oracion-a-los-santos-apostoles-pedro-y-pablo-1525",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a los Santos Pedro y Pablo"
  },
  "Santiago Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santiago-apostol-1640",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santiago Apóstol"
  },
  "San Juan Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-apostol-y-evangelista-1707",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Juan Apóstol"
  },
  "San Matías Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-matias-apostol-1556",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Matías Apóstol"
  },
  "Santo Tomás Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santo-tomas-apostol-1624",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santo Tomás Apóstol"
  },
  "San Andrés Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-andres-apostol-1699",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Andrés Apóstol"
  },
  "San Bartolomé Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-bartolome-apostol-1649",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Bartolomé Apóstol"
  },
  "San Felipe Apóstol": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-felipe-apostol-1543",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Felipe Apóstol"
  },

  // === ARCÁNGELES ===
  "San Miguel Arcángel": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-miguel-arcangel-1577",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Miguel Arcángel"
  },
  "San Gabriel Arcángel": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-gabriel-arcangel-1578",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Gabriel Arcángel"
  },
  "San Rafael Arcángel": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-rafael-arcangel-1579",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Rafael Arcángel"
  },
  "Santos Arcángeles": {
    url: "https://www.aciprensa.com/recursos/oracion-a-los-santos-arcangeles-1580",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a los Santos Arcángeles"
  },

  // === SANTOS POPULARES ===
  "San Antonio de Padua": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-antonio-de-padua-1519",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Antonio de Padua"
  },
  "Santa María Magdalena": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-maria-magdalena-1635",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa María Magdalena"
  },
  "San Juan Bautista": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-bautista-1603",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Juan Bautista"
  },
  "San Benito": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-benito-abad-1629",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Benito Abad"
  },
  "Santa Rita de Casia": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-rita-de-casia-1565",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Rita de Casia"
  },
  "San Luis Gonzaga": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-luis-gonzaga-1591",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Luis Gonzaga"
  },
  "Santa Catalina de Siena": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-catalina-de-siena-1543",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Catalina de Siena"
  },
  "San Francisco de Asís": {
    url: "https://www.aciprensa.com/recursos/oracion-de-san-francisco-de-asis-1524",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración de San Francisco de Asís"
  },
  "Santo Domingo de Guzmán": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santo-domingo-de-guzman-1645",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santo Domingo de Guzmán"
  },
  "San Ignacio de Loyola": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-ignacio-de-loyola-1622",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Ignacio de Loyola"
  },
  "Santa Teresa de Jesús": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-teresa-de-jesus-1683",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Teresa de Jesús"
  },
  "San Juan de la Cruz": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-de-la-cruz-1709",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Juan de la Cruz"
  },
  "Santa Teresa de Lisieux": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-teresita-del-nino-jesus-1524",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Teresita del Niño Jesús"
  },
  "San Judas Tadeo": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-judas-tadeo-1687",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Judas Tadeo"
  },
  "San Martín de Porres": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-martin-de-porres-1693",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Martín de Porres"
  },
  "Santa Rosa de Lima": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-rosa-de-lima-1651",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Rosa de Lima"
  },
  "San Agustín": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-agustin-1655",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Agustín"
  },
  "San Jerónimo": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-jeronimo-1577",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Jerónimo"
  },
  "San Patricio": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-patricio-1535",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Patricio"
  },
  "San Jorge": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-jorge-1539",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Jorge"
  },
  "San Cristóbal": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-cristobal-1638",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Cristóbal"
  },
  "San Expedito": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-expedito-1538",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Expedito"
  },
  "San Blas": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-blas-1505",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Blas"
  },
  "Santa Lucía": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-lucia-1713",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Lucía"
  },
  "Santa Cecilia": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-cecilia-1697",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Cecilia"
  },
  "San Valentín": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-valentin-1521",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Valentín"
  },
  "San Nicolás de Bari": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-nicolas-de-bari-1703",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Nicolás de Bari"
  },

  // === DOCTORES DE LA IGLESIA ===
  "Santo Tomás de Aquino": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santo-tomas-de-aquino-1515",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santo Tomás de Aquino"
  },
  "San Alberto Magno": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-alberto-magno-1693",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Alberto Magno"
  },

  // === SANTOS MODERNOS ===
  "San Pío de Pietrelcina": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-pio-de-pietrelcina-1574",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Pío de Pietrelcina"
  },
  "Santa Faustina Kowalska": {
    url: "https://www.aciprensa.com/recursos/coronilla-de-la-divina-misericordia-104",
    fuente: "ACI Prensa",
    nombre_oracion: "Coronilla de la Divina Misericordia"
  },
  "San Juan Pablo II": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-pablo-ii-4444",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Juan Pablo II"
  },
  "Santa Madre Teresa de Calcuta": {
    url: "https://www.aciprensa.com/recursos/oracion-a-la-madre-teresa-de-calcuta-2654",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Teresa de Calcuta"
  },

  // === SAGRADA FAMILIA ===
  "Santa Ana": {
    url: "https://www.aciprensa.com/recursos/oracion-a-santa-ana-1641",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a Santa Ana"
  },
  "San Joaquín": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-joaquin-1641",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Joaquín"
  },

  // === SANTOS PATRONOS ===
  "San Isidro Labrador": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-isidro-labrador-1557",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Isidro Labrador"
  },
  "San Cayetano": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-cayetano-1645",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Cayetano"
  },
  "San Pancracio": {
    url: "https://www.aciprensa.com/recursos/oracion-a-san-pancracio-1557",
    fuente: "ACI Prensa",
    nombre_oracion: "Oración a San Pancracio"
  }
};

// Lista de santos prioritarios para importación (en orden de importancia)
export const PRIORITY_SAINTS = [
  "Nuestra Señora de Guadalupe",
  "San José",
  "San Miguel Arcángel",
  "San Judas Tadeo",
  "San Antonio de Padua",
  "Santa Rita de Casia",
  "San Pedro y San Pablo",
  "San Francisco de Asís",
  "Santa Teresa de Jesús",
  "San Juan Pablo II",
  "San Martín de Porres",
  "Santa Rosa de Lima",
  "San Pío de Pietrelcina",
  "Santa María Magdalena",
  "San Juan Bautista",
  "San Benito",
  "Santo Tomás de Aquino",
  "San Ignacio de Loyola",
  "Santa Teresa de Lisieux",
  "San Gabriel Arcángel",
  "San Rafael Arcángel",
  "San Expedito",
  "San Cayetano",
  "Santa Lucía",
  "San Blas"
];

// Función para buscar una oración tradicional por nombre de santo
export function findTraditionalPrayer(saintName: string): TraditionalPrayerSource | null {
  // Buscar coincidencia exacta
  if (TRADITIONAL_PRAYERS[saintName]) {
    return TRADITIONAL_PRAYERS[saintName];
  }

  // Buscar coincidencia parcial (normalizada)
  const normalizedName = saintName.toLowerCase().trim();
  for (const [key, value] of Object.entries(TRADITIONAL_PRAYERS)) {
    if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}
