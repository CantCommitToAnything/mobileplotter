pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*
  SAFE EDIT AREA:
  Add/remove devices here. Use iconImage later if you want:
  iconImage: "assets/security/cam.png"
*/
const SYSTEMS = {
  networking: {
    label: "Networking",
    color: "#2563eb",
    items: {
      singleDrop: { label: "Single Drop", symbol: "SD", prefix: "SD", iconSize: 16, iconImage: null },
      dualDrop: { label: "Dual Drop", symbol: "DD", prefix: "DD", iconSize: 16, iconImage: null },
      quadDrop: { label: "Quad Drop", symbol: "QD", prefix: "QD", iconSize: 16, iconImage: null },
      wap: { label: "Wireless Access Point", symbol: "WAP", prefix: "WAP", iconSize: 18, iconImage: null },
      floorBox: { label: "Floor Box", symbol: "FB", prefix: "FB", iconSize: 16, iconImage: null },
      ceilingDrop: { label: "Ceiling Drop", symbol: "CD", prefix: "CD", iconSize: 16, iconImage: null },
      rack: { label: "IDF Rack", symbol: "RACK", prefix: "RACK", iconSize: 18, iconImage: null },
      fiberDrop: { label: "Fiber Drop", symbol: "FD", prefix: "FD", iconSize: 16, iconImage: null }
    }
  },
  security: {
    label: "Security",
    color: "#dc2626",
    items: {
      camera: { label: "Camera", symbol: "CAM", prefix: "CAM", iconSize: 17, iconImage: null },
      camera360: { label: "360 Camera", symbol: "360", prefix: "CAM360", iconSize: 17, iconImage: null },
      doorReader: { label: "Door Reader", symbol: "DR", prefix: "DR", iconSize: 16, iconImage: null },
      keypad: { label: "Keypad", symbol: "KP", prefix: "KP", iconSize: 16, iconImage: null },
      doorContact: { label: "Door Contact", symbol: "DC", prefix: "DC", iconSize: 16, iconImage: null },
      rex: { label: "Request to Exit", symbol: "REX", prefix: "REX", iconSize: 16, iconImage: null },
      maglock: { label: "Maglock", symbol: "MAG", prefix: "MAG", iconSize: 16, iconImage: null },
      electricStrike: { label: "Electric Strike", symbol: "STR", prefix: "STR", iconSize: 16, iconImage: null },
      acp: { label: "Access Control Panel", symbol: "ACP", prefix: "ACP", iconSize: 18, iconImage: null },
      intercom: { label: "Intercom", symbol: "INT", prefix: "INT", iconSize: 16, iconImage: null }
    }
  }
};

const CONFIG = {
  pdfScale: 1.5,
  note: { symbol: "N", prefix: "NOTE", label: "Note", color: "#7c3aed", iconSize: 16 },
  fov: {
    enabledFor: ["camera", "camera360"],
    color: "#dc2626",
    opacity: 0.30,
    size: 70,
    lineWidth: 3,
    arrowHead: 9
  }
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWrap = document.getElementById("canvasWrap");
const projectName = document.getElementById("projectName");
const upload = document.getElementById("upload");
const fileStatus = document.getElementById("fileStatus");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const systemSelect = document.getElementById("systemSelect");
const deviceSelect = document.getElementById("deviceSelect");
const pageInfo = document.getElementById("pageInfo");

const panel = document.getElementById("panel");
const pageNotes = document.getElementById("pageNotes");
const markerNote = document.getElementById("markerNote");
const selectedInfo = document.getElementById("selectedInfo");
const counts = document.getElementById("counts");

const fovType = document.getElementById("fovType");
const fovRotation = document.getElementById("fovRotation");
const fovSize = document.getElementById("fovSize");

let documents = [];
let currentDocIndex = 0;
let currentPageIndex = 0;
let currentSystem = "networking";
let currentDevice = "singleDrop";
let mode = "device";
let selectedMarkerIndex = null;
let draggingMarkerIndex = null;
let zoom = 1;
let iconCache = new Map();

function init() {
  populateSystems();
  populateDevices();
  bindEvents();
  drawEmpty();
  setMode("device");
}

function bindEvents() {
  upload.addEventListener("change", handleUpload);

  document.getElementById("prevPageBtn").addEventListener("click", prevPage);
  document.getElementById("nextPageBtn").addEventListener("click", nextPage);

  systemSelect.addEventListener("change", () => {
    currentSystem = systemSelect.value;
    currentDevice = Object.keys(SYSTEMS[currentSystem].items)[0];
    populateDevices();
  });

  deviceSelect.addEventListener("change", () => {
    currentDevice = deviceSelect.value;
    if (!isCameraDevice() && mode === "fov") setMode("device");
  });

  document.getElementById("deviceModeBtn").addEventListener("click", () => setMode("device"));
  document.getElementById("noteModeBtn").addEventListener("click", () => setMode("note"));
  document.getElementById("fovModeBtn").addEventListener("click", () => setMode("fov"));

  document.getElementById("undoBtn").addEventListener("click", undoLast);
  document.getElementById("deleteBtn").addEventListener("click", deleteSelected);

  document.getElementById("openPanelBtn").addEventListener("click", openPanel);
  document.getElementById("closePanelBtn").addEventListener("click", closePanel);

  pageNotes.addEventListener("input", savePageNotes);
  markerNote.addEventListener("input", saveMarkerNote);

  fovType.addEventListener("change", updateSelectedFov);
  fovRotation.addEventListener("input", updateSelectedFov);
  fovSize.addEventListener("input", updateSelectedFov);

  document.getElementById("exportPdfBtn").addEventListener("click", exportPdf);
  document.getElementById("exportPngBtn").addEventListener("click", exportPng);
  document.getElementById("saveJsonBtn").addEventListener("click", saveJson);
  document.getElementById("loadJsonInput").addEventListener("change", loadJson);

  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mouseleave", onPointerUp);

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onPointerUp);

 canvas.addEventListener("wheel", e => {
  if (!e.ctrlKey) return;
  e.preventDefault();

  if (e.deltaY < 0) zoomIn();
  else zoomOut();
}, { passive: false });
function populateSystems() {
  systemSelect.innerHTML = "";
  Object.keys(SYSTEMS).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = SYSTEMS[key].label;
    systemSelect.appendChild(opt);
  });
  systemSelect.value = currentSystem;
}

function populateDevices() {
  deviceSelect.innerHTML = "";
  const items = SYSTEMS[currentSystem].items;
  Object.keys(items).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${items[key].symbol}  ${items[key].label}`;
    deviceSelect.appendChild(opt);
  });
  deviceSelect.value = currentDevice;
}

function isCameraDevice() {
  return CONFIG.fov.enabledFor.includes(currentDevice);
}

function setMode(nextMode) {
  if (nextMode === "fov" && !isCameraDevice()) {
    alert("FOV is only available when Camera or 360 Camera is selected.");
    nextMode = "device";
  }

  mode = nextMode;

  document.getElementById("deviceModeBtn").classList.toggle("active", mode === "device");
  document.getElementById("noteModeBtn").classList.toggle("active", mode === "note");
  document.getElementById("fovModeBtn").classList.toggle("active", mode === "fov");
}

async function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  documents = [];
  currentDocIndex = 0;
  currentPageIndex = 0;
  selectedMarkerIndex = null;
  fileStatus.textContent = file.name;

  showProgress("Loading...");

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    await loadPdf(file);
  } else if (file.type.startsWith("image/")) {
    await loadImage(file);
  } else {
    alert("Use a PDF or image file.");
  }

  hideProgress();
  draw();
}

function loadImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();

      img.onload = () => {
        documents.push({
          name: file.name,
          pages: [{
            imageData: e.target.result,
            image: img,
            markers: [],
            notes: ""
          }]
        });
        resolve();
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

function loadPdf(file) {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = async e => {
      try {
        const pdf = await pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise;
        const doc = { name: file.name, pages: [] };

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          updateProgress(pageNum, pdf.numPages, file.name);

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: CONFIG.pdfScale });
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");

          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;

          await page.render({ canvasContext: tempCtx, viewport }).promise;

          const imageData = tempCanvas.toDataURL("image/png");
          const image = await imageFromData(imageData);

          doc.pages.push({ imageData, image, markers: [], notes: "" });
        }

        documents.push(doc);
      } catch (err) {
        console.error(err);
        alert("Could not load PDF.");
      }

      resolve();
    };

    reader.readAsArrayBuffer(file);
  });
}

function imageFromData(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function showProgress(text) {
  progressWrap.style.display = "block";
  progressBar.style.width = "0%";
  progressText.textContent = text;
}

function updateProgress(current, total, name) {
  const pct = Math.round((current / total) * 100);
  progressBar.style.width = pct + "%";
  progressText.textContent = `Loading ${name}: page ${current} of ${total} — ${pct}%`;
}

function hideProgress() {
  progressWrap.style.display = "none";
}

function getCurrentPage() {
  return documents[currentDocIndex]?.pages[currentPageIndex] || null;
}

function prevPage() {
  const doc = documents[currentDocIndex];
  if (!doc || currentPageIndex <= 0) return;
  savePageNotes();
  currentPageIndex--;
  selectedMarkerIndex = null;
  draw();
}

function nextPage() {
  const doc = documents[currentDocIndex];
  if (!doc || currentPageIndex >= doc.pages.length - 1) return;
  savePageNotes();
  currentPageIndex++;
  selectedMarkerIndex = null;
  draw();
}

function savePageNotes() {
  const page = getCurrentPage();
  if (page) page.notes = pageNotes.value;
}

function saveMarkerNote() {
  const marker = getSelectedMarker();
  if (marker) {
    marker.note = markerNote.value;
    draw();
  }
}

function getSelectedMarker() {
  const page = getCurrentPage();
  if (!page || selectedMarkerIndex === null) return null;
  return page.markers[selectedMarkerIndex] || null;
}

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getTouchPoint(e) {
  const touch = e.touches[0];
  return getPoint(touch);
}

function onTouchStart(e) {
  e.preventDefault();
  onPointerDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}

function onTouchMove(e) {
  e.preventDefault();
  if (!e.touches.length) return;
  onPointerMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}

function onPointerDown(e) {
  const page = getCurrentPage();
  if (!page) {
    alert("Upload a drawing first.");
    return;
  }

  const { x, y } = getPoint(e);
  const hit = findMarker(x, y);

  if (hit !== null) {
    selectedMarkerIndex = hit;
    draggingMarkerIndex = hit;
    syncSelectedPanel();
    draw();
    return;
  }

  if (mode === "note") {
    page.markers.push(createNoteMarker(x, y, page.markers));
    selectedMarkerIndex = page.markers.length - 1;
    openPanel();
  } else if (mode === "fov") {
    page.markers.push(createFovMarker(x, y));
    selectedMarkerIndex = page.markers.length - 1;
  } else {
    page.markers.push(createDeviceMarker(x, y, page.markers));
    selectedMarkerIndex = page.markers.length - 1;
  }

  syncSelectedPanel();
  draw();
}

function onPointerMove(e) {
  if (draggingMarkerIndex === null) return;
  const page = getCurrentPage();
  if (!page) return;

  const { x, y } = getPoint(e);
  page.markers[draggingMarkerIndex].x = x;
  page.markers[draggingMarkerIndex].y = y;
  draw();
}

function onPointerUp() {
  draggingMarkerIndex = null;
}

function findMarker(x, y) {
  const page = getCurrentPage();
  if (!page) return null;

  for (let i = page.markers.length - 1; i >= 0; i--) {
    const m = page.markers[i];
    const radius = m.kind === "fov" ? 20 : 18;
    if (Math.hypot(m.x - x, m.y - y) <= radius) return i;
  }

  return null;
}

function createDeviceMarker(x, y, markers) {
  const item = SYSTEMS[currentSystem].items[currentDevice];

  return {
    kind: "device",
    system: currentSystem,
    type: currentDevice,
    label: nextLabel(item.prefix, markers),
    symbol: item.symbol,
    itemLabel: item.label,
    iconSize: item.iconSize,
    iconImage: item.iconImage,
    color: SYSTEMS[currentSystem].color,
    x,
    y,
    note: ""
  };
}

function createNoteMarker(x, y, markers) {
  return {
    kind: "note",
    system: "notes",
    type: "note",
    label: nextLabel(CONFIG.note.prefix, markers),
    symbol: CONFIG.note.symbol,
    itemLabel: CONFIG.note.label,
    iconSize: CONFIG.note.iconSize,
    color: CONFIG.note.color,
    x,
    y,
    note: ""
  };
}

function createFovMarker(x, y) {
  return {
    kind: "fov",
    fovType: fovType.value,
    rotation: Number(fovRotation.value) || 0,
    size: Number(fovSize.value) || CONFIG.fov.size,
    color: CONFIG.fov.color,
    opacity: CONFIG.fov.opacity,
    x,
    y
  };
}

function nextLabel(prefix, markers) {
  const count = markers.filter(m => m.prefix === prefix || (m.label || "").startsWith(prefix + "-")).length + 1;
  return `${prefix}-${count}`;
}

function drawEmpty() {
  canvas.width = 900;
  canvas.height = 650;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6b7280";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Upload a PDF or image", canvas.width / 2, canvas.height / 2);
  updateUi();
}

function draw() {
  const page = getCurrentPage();

  if (!page) {
    drawEmpty();
    return;
  }

  canvas.width = page.image.width;
  canvas.height = page.image.height;

  ctx.drawImage(page.image, 0, 0);

  page.markers.forEach((m, i) => {
    if (m.kind === "fov") drawFov(m, i === selectedMarkerIndex);
  });

  page.markers.forEach((m, i) => {
    if (m.kind !== "fov") drawMarker(m, i === selectedMarkerIndex);
  });

  drawLegend();
  updateUi();
}

function drawMarker(marker, selected) {
  const size = marker.iconSize || 16;
  const color = marker.color || "#111827";

  if (selected) {
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, size + 8, 0, Math.PI * 2);
    ctx.fillStyle = color + "33";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawBadge(marker.symbol, marker.x, marker.y, size, color);

  ctx.fillStyle = color;
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(marker.label, marker.x, marker.y + size + 11);

  if (marker.note) {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(marker.x + size, marker.y - size, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBadge(text, x, y, size, color) {
  const width = Math.max(size + 12, String(text).length * 8 + 12);
  const height = size + 6;

  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  roundRect(ctx, x - width / 2, y - height / 2, width, height, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.max(10, size * 0.6)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawFov(marker, selected) {
  ctx.save();
  ctx.globalAlpha = marker.opacity ?? CONFIG.fov.opacity;
  ctx.fillStyle = marker.color || CONFIG.fov.color;
  ctx.strokeStyle = marker.color || CONFIG.fov.color;

  if (marker.fovType === "circle") {
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, marker.size, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.translate(marker.x, marker.y);
    ctx.rotate((marker.rotation || 0) * Math.PI / 180);
    ctx.lineWidth = CONFIG.fov.lineWidth;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(marker.size, 0);
    ctx.stroke();

    const head = CONFIG.fov.arrowHead;
    ctx.beginPath();
    ctx.moveTo(marker.size, 0);
    ctx.lineTo(marker.size - head, -head * .65);
    ctx.lineTo(marker.size - head, head * .65);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  if (selected) {
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, marker.fovType === "circle" ? marker.size : 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawLegend() {
  const page = getCurrentPage();
  if (!page) return;

  const items = getLegendItems();
  if (!items.length) return;

  const x = 12;
  const y = 12;
  const width = 250;
  const height = 32 + items.length * 22;

  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.strokeStyle = "rgba(17,24,39,.25)";
  roundRect(ctx, x, y, width, height, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Legend / Counts", x + 10, y + 18);

  let cy = y + 42;

  items.forEach(item => {
    ctx.fillStyle = item.color;
    ctx.font = "bold 12px Arial";
    ctx.fillText(`${item.symbol} - ${item.label}: ${item.count}`, x + 10, cy);
    cy += 22;
  });
}

function getLegendItems() {
  const page = getCurrentPage();
  if (!page) return [];

  const map = new Map();

  page.markers.forEach(m => {
    if (m.kind === "fov") return;

    const key = m.kind === "note" ? "note" : `${m.system}-${m.type}`;

    if (!map.has(key)) {
      map.set(key, {
        symbol: m.symbol,
        label: m.itemLabel,
        color: m.color,
        count: 0
      });
    }

    map.get(key).count++;
  });

  return Array.from(map.values());
}

function updateUi() {
  const page = getCurrentPage();
  const doc = documents[currentDocIndex];

  pageInfo.textContent = doc ? `Page ${currentPageIndex + 1} of ${doc.pages.length}` : "Page 0 of 0";
  document.getElementById("prevPageBtn").disabled = !doc || currentPageIndex === 0;
  document.getElementById("nextPageBtn").disabled = !doc || currentPageIndex >= doc.pages.length - 1;

  pageNotes.value = page?.notes || "";
  updateCounts();
  syncSelectedPanel();
}

function updateCounts() {
  const items = getLegendItems();

  if (!items.length) {
    counts.innerHTML = "No devices plotted yet.";
    return;
  }

  counts.innerHTML = items.map(i => `<strong>${i.label}</strong>: ${i.count}`).join("<br>");
}

function syncSelectedPanel() {
  const marker = getSelectedMarker();

  if (!marker) {
    selectedInfo.textContent = "No item selected.";
    markerNote.value = "";
    markerNote.disabled = true;
    return;
  }

  markerNote.disabled = marker.kind === "fov";
  markerNote.value = marker.note || "";

  if (marker.kind === "fov") {
    selectedInfo.textContent = `Selected: FOV ${marker.fovType}`;
    fovType.value = marker.fovType;
    fovRotation.value = marker.rotation || 0;
    fovSize.value = marker.size || CONFIG.fov.size;
  } else {
    selectedInfo.textContent = `Selected: ${marker.label} (${marker.itemLabel})`;
  }
}

function updateSelectedFov() {
  const marker = getSelectedMarker();
  if (!marker || marker.kind !== "fov") return;

  marker.fovType = fovType.value;
  marker.rotation = Number(fovRotation.value) || 0;
  marker.size = Number(fovSize.value) || CONFIG.fov.size;
  draw();
}

function undoLast() {
  const page = getCurrentPage();
  if (!page) return;
  page.markers.pop();
  selectedMarkerIndex = null;
  draw();
}

function deleteSelected() {
  const page = getCurrentPage();
  if (!page || selectedMarkerIndex === null) return;
  page.markers.splice(selectedMarkerIndex, 1);
  selectedMarkerIndex = null;
  draw();
}

function openPanel() {
  panel.classList.add("open");
}

function closePanel() {
  panel.classList.remove("open");
}

function requireProjectName() {
  if (projectName.value.trim()) return true;
  alert("Enter a project name first.");
  projectName.focus();
  return false;
}

async function exportPng() {
  if (!requireProjectName()) return;
  const page = getCurrentPage();
  if (!page) return alert("Upload a file first.");

  const exportCanvas = await buildExportCanvas(page);
  const a = document.createElement("a");
  a.href = exportCanvas.toDataURL("image/png");
  a.download = `${safeName(projectName.value)}-page-${currentPageIndex + 1}.png`;
  a.click();
}

async function exportPdf() {
  if (!requireProjectName()) return;
  const page = getCurrentPage();
  if (!page) return alert("Upload a file first.");

  const pdf = new window.jspdf.jsPDF({
    unit: "pt",
    format: "letter",
    orientation: page.image.width > page.image.height ? "landscape" : "portrait"
  });

  const exportCanvas = await buildExportCanvas(page);
  const img = exportCanvas.toDataURL("image/png");
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const ratio = Math.min((pw - margin * 2) / exportCanvas.width, (ph - margin * 2) / exportCanvas.height);

  pdf.addImage(img, "PNG", margin, margin, exportCanvas.width * ratio, exportCanvas.height * ratio);
  pdf.save(`${safeName(projectName.value)}-page-${currentPageIndex + 1}.pdf`);
}

async function buildExportCanvas(page) {
  const footer = 180;
  const c = document.createElement("canvas");
  const x = c.getContext("2d");

  c.width = canvas.width;
  c.height = canvas.height + footer;

  x.fillStyle = "white";
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(canvas, 0, 0);

  x.fillStyle = "#111827";
  x.font = "bold 22px Arial";
  x.textAlign = "left";
  x.fillText(projectName.value || "Untitled Project", 20, canvas.height + 34);

  x.font = "14px Arial";
  x.fillText(`Page ${currentPageIndex + 1}`, 20, canvas.height + 58);

  x.font = "bold 15px Arial";
  x.fillText("Notes:", 20, canvas.height + 88);

  x.font = "13px Arial";
  wrapText(x, page.notes || "No notes entered.", 20, canvas.height + 112, c.width - 40, 18);

  return c;
}

function saveJson() {
  if (!requireProjectName()) return;
  savePageNotes();

  const data = {
    projectName: projectName.value,
    documents: documents.map(d => ({
      name: d.name,
      pages: d.pages.map(p => ({
        imageData: p.imageData,
        markers: p.markers,
        notes: p.notes
      }))
    }))
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${safeName(projectName.value)}-editable.json`;
  a.click();

  URL.revokeObjectURL(url);
}

async function loadJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const data = JSON.parse(await file.text());

  projectName.value = data.projectName || "";
  documents = [];

  for (const d of data.documents || []) {
    const doc = { name: d.name, pages: [] };

    for (const p of d.pages || []) {
      doc.pages.push({
        imageData: p.imageData,
        image: await imageFromData(p.imageData),
        markers: p.markers || [],
        notes: p.notes || ""
      });
    }

    documents.push(doc);
  }

  currentDocIndex = 0;
  currentPageIndex = 0;
  selectedMarkerIndex = null;
  fileStatus.textContent = `Loaded: ${file.name}`;
  draw();
}

function safeName(text) {
  return String(text).trim().replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-") || "markup";
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";

  words.forEach(word => {
    const testLine = line + word + " ";
    if (context.measureText(testLine).width > maxWidth && line !== "") {
      context.fillText(line, x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  context.fillText(line, x, y);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

  function zoomIn() {
  zoom = Math.min(3, zoom + 0.1);
  updateZoom();
}

function zoomOut() {
  zoom = Math.max(0.3, zoom - 0.1);
  updateZoom();
}

function updateZoom() {
  canvasWrap.style.transform = `scale(${zoom})`;
  document.getElementById("zoomLabel").textContent = `${Math.round(zoom * 100)}%`;
}
init();
