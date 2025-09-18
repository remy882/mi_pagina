const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const btn = document.getElementById("btnAnalizar");
const resultado = document.getElementById("resultado");
const recoTitulo = document.getElementById("recomendacionesTitulo");
const recoLista = document.getElementById("recomendacionesLista");
const recoImagenes = document.getElementById("recoImagenes");
const generoSel = document.getElementById("genero");
const estiloSel = document.getElementById("estilo");

const API_URL = "http://localhost:5000/predict";

// Mostrar imagen al subir
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Funciones de ejemplo de recomendación
function recomendar(genero, estilo, pred) {
  // Aquí puedes devolver recomendaciones simuladas
  return ["Recomendación 1", "Recomendación 2", "Recomendación 3"];
}

function mostrarImagenesRecomendadas(sugerencias, cantidad) {
  recoImagenes.innerHTML = "";
  for (let i = 0; i < cantidad; i++) {
    const img = document.createElement("img");
    img.src = "https://via.placeholder.com/150"; // Imagen placeholder
    img.alt = sugerencias[i] || "Recomendación";
    recoImagenes.appendChild(img);
  }
}

// Analizar imagen
btn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) { 
    resultado.textContent = "⚠️ Sube una imagen primero."; 
    return; 
  }

  resultado.textContent = "Analizando...";
  recoTitulo.textContent = "";
  recoLista.innerHTML = "";
  recoImagenes.innerHTML = "";

  const fd = new FormData();
  fd.append("image", file);

  try {
    const resp = await fetch(API_URL, { method: "POST", body: fd });
    if (!resp.ok) throw new Error(`Error ${resp.status}`);
    const data = await resp.json();

    const pred = data.predicted; 
    let top3Txt = data.top3 ? " | Top-3: " + data.top3.map(t => `${t.class} (${(t.prob*100).toFixed(1)}%)`).join(", ") : "";

    resultado.textContent = `🔮 Prenda detectada: ${pred}${top3Txt}`;

    const genero = generoSel.value;
    const estilo = estiloSel.value;
    const sugerencias = recomendar(genero, estilo, pred);

    if (sugerencias.length) {
      recoTitulo.textContent = `Recomendaciones (${estilo}, ${genero}):`;
      sugerencias.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        recoLista.appendChild(li);
      });
      mostrarImagenesRecomendadas(sugerencias, 3);
    } else {
      recoTitulo.textContent = "No se encontraron recomendaciones para esta combinación.";
    }

  } catch(err) {
    console.error(err);
    resultado.textContent = "❌ Hubo un problema con la predicción.";
  }
});
