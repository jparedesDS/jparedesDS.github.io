/* ============================================================
   Datos del puzle — Murdoku: La Búsqueda del Tesoro
   Extraídos del PDF oficial (concurso mundial #1, octubre 2026)
   Las coordenadas de la solución son 1-indexadas (Fila, Columna).
   ============================================================ */

const ASSET_VERSION = "6";

const PUZZLE = {
  n: 24,
  title: "La Búsqueda del Tesoro",
  subtitle: "Murdoku · Concurso mundial #1",
  designer: "Puzle de Manuel Garand",
  treasure: { row: 4, col: 11 },
  rules: [
    "Cada fila y cada columna contiene exactamente un sospechoso.",
    "Los sospechosos solo pueden ocupar casillas transitables (no mesas, árboles, rocas, etc.).",
    "\"Junto a\" significa directamente adyacente (arriba, abajo, izquierda o derecha) y en la misma zona.",
    "Esta vez no hay asesino: coloca a los 23 sospechosos y el cofre aparecerá en la única casilla que no comparte fila ni columna con ninguno."
  ],
  people: [
    {
      id: "augustus", name: "Augustus", tag: "objeto", color: "#c9a227",
      clue: "Estaba junto a una fogata.",
      solution: [9, 4]
    },
    {
      id: "bart", name: "Bart", tag: "objeto", color: "#5b8def",
      clue: "Estaba en una hamaca. No había ningún saco en toda su columna.",
      solution: [5, 21]
    },
    {
      id: "cedric", name: "Cedric", tag: "posición", color: "#2f9e8f",
      clue: "Alguien situado exactamente ocho filas al norte de él estaba junto a la lápida.",
      solution: [11, 24]
    },
    {
      id: "dudley", name: "Dudley", tag: "posición", color: "#c0504d",
      clue: "Estaba al este de Griselda y al oeste de Linus.",
      solution: [16, 19]
    },
    {
      id: "eiko", name: "Eiko", tag: "objeto", color: "#8e6bbf",
      clue: "Estaba junto a una estantería.",
      solution: [2, 6]
    },
    {
      id: "fleur", name: "Fleur", tag: "objeto", color: "#d96c9e",
      clue: "Estaba junto a unas flores.",
      solution: [24, 10]
    },
    {
      id: "griselda", name: "Griselda", tag: "zona", color: "#6b7280",
      clue: "Estaba en la fila superior de su zona.",
      solution: [6, 18]
    },
    {
      id: "hyacinth", name: "Hyacinth", tag: "zona", color: "#b07cc6",
      clue: "Estaba en el Acantilado. Nadie en una columna adyacente llevaba sombrero.",
      solution: [22, 7]
    },
    {
      id: "isolde", name: "Isolde", tag: "objeto + compañía", color: "#c97b84",
      clue: "Estaba sentada en una silla. Estaba en una Cabaña con alguien que llevaba un parche en el ojo.",
      solution: [15, 13]
    },
    {
      id: "julius", name: "Julius", tag: "objeto", color: "#7a8f3a",
      clue: "Estaba junto a un barril.",
      solution: [18, 9]
    },
    {
      id: "kathleen", name: "Kathleen", tag: "zona", color: "#4aa3c7",
      clue: "Estaba en una Balandra.",
      solution: [12, 5]
    },
    {
      id: "linus", name: "Linus", tag: "objeto", color: "#4f9d69",
      clue: "Estaba junto a un árbol.",
      solution: [23, 20]
    },
    {
      id: "mortimer", name: "Mortimer", tag: "zona + objeto", color: "#3f5c8a",
      clue: "Estaba en un barco, junto a una cuerda.",
      solution: [10, 17]
    },
    {
      id: "nehemiah", name: "Nehemiah", tag: "zona + objeto", color: "#9a6b4f",
      clue: "Estaba en el Agua, junto a un barco.",
      solution: [8, 16]
    },
    {
      id: "orville", name: "Orville", tag: "zona", color: "#2fa7a0",
      clue: "Estaba en un barco.",
      solution: [17, 8]
    },
    {
      id: "pedro", name: "Pedro", tag: "objeto", color: "#d08a3e",
      clue: "Estaba en una cama.",
      solution: [14, 15]
    },
    {
      id: "quincy", name: "Quincy", tag: "zona + objeto", color: "#3f8f9e",
      clue: "Estaba en el Agua, junto a un tiburón.",
      solution: [19, 1]
    },
    {
      id: "rosalind", name: "Rosalind", tag: "objeto", color: "#a06a8f",
      clue: "Estaba sentada en una silla.",
      solution: [20, 22]
    },
    {
      id: "seraphina", name: "Seraphina", tag: "posición", color: "#d4b13f",
      clue: "Estaba al menos seis filas al norte de Linus.",
      solution: [3, 14]
    },
    {
      id: "ursula", name: "Ursula", tag: "posición", color: "#b03a48",
      clue: "Estaba delante de una puerta.",
      solution: [21, 12]
    },
    {
      id: "wilfred", name: "Wilfred", tag: "objeto", color: "#5c7a4a",
      clue: "Estaba junto a un cerdo.",
      solution: [13, 23]
    },
    {
      id: "yannis", name: "Yannis", tag: "zona", color: "#7d7d7d",
      clue: "Estaba en el Bosque. No estaba junto a un árbol.",
      solution: [7, 3]
    },
    {
      id: "zoe", name: "Zoe", tag: "objeto", color: "#8a5bbf",
      clue: "Estaba junto a un arbusto.",
      solution: [1, 2]
    }
  ]
};

/* Utilidades de datos */
const PEOPLE_BY_ID = Object.fromEntries(PUZZLE.people.map(p => [p.id, p]));
const PERSON_IDS = PUZZLE.people.map(p => p.id);
const N = PUZZLE.n;
const TREASURE = PUZZLE.treasure;

function cellKey(r, c) { return `${r},${c}`; }
function parseKey(key) { const [r, c] = key.split(",").map(Number); return { r, c }; }
function personSolution(id) {
  const p = PEOPLE_BY_ID[id];
  return { r: p.solution[0], c: p.solution[1] };
}
