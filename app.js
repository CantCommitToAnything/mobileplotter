// =====================================================
// Quick Plotter Mobile V1
// Section 1: Config, Device Library, State, DOM References
//
// Dev note:
// This is the mobile-first version of the plotter.
// Desktop MR logic, FOV tools, filters, and legacy panels
// should stay out of this file unless intentionally re-added.
// =====================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// =====================================================
// CONFIG
// =====================================================

const CONFIG = {
  requireProjectName: true,
  pdfRenderScale: 2.0,

  note: {
    maxLength: 316,
    required: false
  }
};

// =====================================================
// DEVICE / SYSTEM LIBRARY
// =====================================================

const systems = {
  networking: {
    label: "Networking",
    color: "#2563eb",
    items: {
      singleDrop: {
        label: "Single Drop",
        symbol: "SD1",
        prefix: "SD",
        iconImage: null,
        iconSize: 16
      },
      dualDrop: {
        label: "Dual Drop",
        symbol: "DD2",
        prefix: "DD",
        iconImage: null,
        iconSize: 16
      },
      quadDrop: {
        label: "Quad Drop",
        symbol: "QD4",
        prefix: "QD",
        iconImage: null,
        iconSize: 16
      },
      ceilingDrop: {
        label: "Ceiling Drop",
        symbol: "CD",
        prefix: "CD",
        iconImage: null,
        iconSize: 16
      },
      floorBox: {
        label: "Floor Box",
        symbol: "FB",
        prefix: "FB",
        iconImage: null,
        iconSize: 18
      },
      fiberDrop: {
        label: "Fiber Drop",
        symbol: "FIB",
        prefix: "FIB",
        iconImage: null,
        iconSize: 16
      },
      wap: {
        label: "Wireless Access Point",
        symbol: "WAP",
        prefix: "WAP",
        iconImage: null,
        iconSize: 22
      }
    }
  },

  cctv: {
    label: "CCTV",
    color: "#dc2626",
    items: {
      camera: {
        label: "Camera",
        symbol: "CAM",
        prefix: "CAM",
        iconImage: null,
        iconSize: 22
      },
      domeCamera: {
        label: "Dome Camera",
        symbol: "DOM",
        prefix: "DOM",
        iconImage: null,
        iconSize: 22
      },
      bulletCamera: {
        label: "Bullet Camera",
        symbol: "BUL",
        prefix: "BUL",
        iconImage: null,
        iconSize: 22
      },
      ptzCamera: {
        label: "PTZ Camera",
        symbol: "PTZ",
        prefix: "PTZ",
        iconImage: null,
        iconSize: 22
      },
      camera360: {
        label: "360 Camera",
        symbol: "360",
        prefix: "360",
        iconImage: null,
        iconSize: 22
      }
    }
  },

  accessControl: {
    label: "Access Control",
    color: "#16a34a",
    items: {
      cardReader: {
        label: "Card Reader",
        symbol: "CR",
        prefix: "CR",
        iconImage: null,
        iconSize: 18
      },
      doorContact: {
        label: "Door Contact",
        symbol: "DC",
        prefix: "DC",
        iconImage: null,
        iconSize: 18
      },
      rex: {
        label: "REX",
        symbol: "REX",
        prefix: "REX",
        iconImage: null,
        iconSize: 18
      },
      electricStrike: {
        label: "Electric Strike",
        symbol: "ES",
        prefix: "ES",
        iconImage: null,
        iconSize: 18
      },
      magLock: {
        label: "Mag Lock",
        symbol: "ML",
        prefix: "ML",
        iconImage: null,
        iconSize: 18
      }
    }
  },

  av: {
    label: "AV / Audio",
    color: "#9333ea",
    items: {
      ceilingSpeaker: {
        label: "Ceiling Speaker",
        symbol: "SPK",
        prefix: "SPK",
        iconImage: null,
        iconSize: 20
      },
      wallSpeaker: {
        label: "Wall Speaker",
        symbol: "WSPK",
        prefix: "WSPK",
        iconImage: null,
        iconSize: 20
      }
    }
  },

  infrastructure: {
    label: "Infrastructure",
    color: "#f97316",
    items: {
      mdf: {
        label: "MDF",
        symbol: "MDF",
        prefix: "MDF",
        iconImage: null,
        iconSize: 24
      },
      idf: {
        label: "IDF",
        symbol: "IDF",
        prefix: "IDF",
        iconImage: null,
        iconSize: 24
      }
    }
  },

  endpoints: {
    label: "Endpoints",
    color: "#0891b2",
    items: {
      panicButton: {
        label: "Panic Button",
        symbol: "PB",
        prefix: "PB",
        iconImage: null,
        iconSize: 18
      },
      vapeDetector: {
        label: "Vape Detector",
        symbol: "VAPE",
        prefix: "VAPE",
        iconImage: null,
        iconSize: 20
      },
      intercom: {
        label: "Intercom",
        symbol: "INT",
        prefix: "INT",
        iconImage: null,
        iconSize: 20
      },
      videoIntercomDoor: {
        label: "Video Intercom Door",
        symbol: "VID",
        prefix: "VID",
        iconImage: null,
        iconSize: 20
      }
    }
  }
};

// =====================================================
// APP STATE
// =====================================================

const appState = {
  projectName: "",
  hasLoadedDrawing: false,
  hasUnsavedChanges: false,
  hasMarkers: false,
  lastSavedAt: null
};

let mobileScale = 1;
let lastTouchDistance = null;
let documents = [];
let currentDocIndex = 0;
let currentPageIndex = 0;

let currentSystem = "networking";
let currentItem = "singleDrop";
let mode = "view";

let selectedMobileMarkerIndex = null;

// Marker display settings.
// Adjust these if symbols/labels feel too small or too large.
const MARKER_RADIUS = 12;
const MARKER_SYMBOL_FONT = "10px Arial";
const MARKER_LABEL_FONT = "10px Arial";
const MARKER_LABEL_OFFSET = 14;
const MARKER_HIT_RADIUS = 24;

// =====================================================
// DOM REFERENCES
// =====================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const uploadedFileName = document.getElementById("uploadedFileName");

const projectNameInput = document.getElementById("projectName");
const projectNameError = document.getElementById("projectNameError");

const progressWrap = document.getElementById("progressWrap");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const statusMessage = document.getElementById("statusMessage");
const saveStatus = document.getElementById("saveStatus");

const deviceBtn = document.getElementById("mobileDeviceBtn");
const toolboxBtn = document.getElementById("mobileNotesBtn");

const devicePicker = document.getElementById("devicePickerBackdrop");
const closeDevicePickerBtn = document.getElementById("closeDevicePickerBtn");

const sidePanel = document.getElementById("sidePanel");
const closeToolboxBtn = document.getElementById("closeNotesBtn");

const counts = document.getElementById("counts");
const noteList = document.getElementById("noteList");

const panelProjectName = document.getElementById("panelProjectName");
const panelDrawingName = document.getElementById("panelDrawingName");
const panelPageInfo = document.getElementById("panelPageInfo");

const mobilePrevPageBtn = document.getElementById("mobilePrevPageBtn");
const mobileNextPageBtn = document.getElementById("mobileNextPageBtn");

const saveJsonBtn = document.getElementById("saveJsonBtn");
const exportPdfBtn = document.getElementById("exportAllPdfBtn");
const loadJsonBtn = document.getElementById("loadJsonBtn");
const loadProjectInput = document.getElementById("loadProjectInput");

const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");

const markerInspector = document.getElementById("markerInspector");
const inspectorTitle = document.getElementById("inspectorTitle");
const inspectorLabel = document.getElementById("inspectorLabel");
const inspectorNote = document.getElementById("inspectorNote");
const closeInspectorBtn = document.getElementById("closeInspectorBtn");
const saveInspectorBtn = document.getElementById("saveInspectorBtn");
const deleteInspectorBtn = document.getElementById("deleteInspectorBtn");
const pageNotesInput = document.getElementById("notes");
const savePageNotesBtn = document.getElementById("savePageNotesBtn");

// =====================================================
// Section 2: Init, Event Binding, Status, Validation
// =====================================================

function init() {
  bindEvents();
  updateProjectState();
  drawEmpty();
  setStatus("Ready to go!");
}

function bindEvents() {
  if (upload) {
    upload.addEventListener("change", handleUploads);
  }

  if (projectNameInput) {
    projectNameInput.addEventListener("input", () => {
      updateProjectState();
      markUnsaved();
    });
  }

  if (deviceBtn && devicePicker) {
    deviceBtn.addEventListener("click", () => {
      devicePicker.classList.remove("hidden");
    });
  }

  if (closeDevicePickerBtn && devicePicker) {
    closeDevicePickerBtn.addEventListener("click", closeDevicePicker);
  }

  if (devicePicker) {
    devicePicker.addEventListener("click", event => {
      if (event.target === devicePicker) {
        closeDevicePicker();
      }
    });
  }

  document.querySelectorAll(".quick-device").forEach(button => {
    button.addEventListener("click", () => {
      selectQuickDevice(button.dataset.system, button.dataset.item);
    });
  });

  if (toolboxBtn) {
    toolboxBtn.addEventListener("click", openToolbox);
  }

  if (closeToolboxBtn) {
    closeToolboxBtn.addEventListener("click", closeToolbox);
  }

  if (canvas) {
    canvas.addEventListener("click", handleCanvasClick);
  }

  if (saveInspectorBtn) {
    saveInspectorBtn.addEventListener("click", saveMobileMarker);
  }

  if (closeInspectorBtn) {
    closeInspectorBtn.addEventListener("click", closeMarkerInspector);
  }

  if (deleteInspectorBtn) {
    deleteInspectorBtn.addEventListener("click", deleteSelectedMobileMarker);
  }

  if (mobilePrevPageBtn) {
    mobilePrevPageBtn.addEventListener("click", goToPreviousPage);
  }

  if (mobileNextPageBtn) {
    mobileNextPageBtn.addEventListener("click", goToNextPage);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearCurrentPageMarkers);
  }

  if (undoBtn) {
    undoBtn.addEventListener("click", undoLastMarker);
  }

  if (saveJsonBtn) {
    saveJsonBtn.addEventListener("click", downloadMobileJson);
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", downloadMobileProject);
  }

  if (loadJsonBtn && loadProjectInput) {
    loadJsonBtn.addEventListener("click", () => {
      loadProjectInput.click();
    });

    loadProjectInput.addEventListener("change", loadMobileJson);
  }

if (pageNotesInput) {
  pageNotesInput.addEventListener("input", () => {
    const page = getCurrentPage();
    if (!page) return;

    page.notes = pageNotesInput.value;
    markUnsaved();
    updateMobileToolbox();
  });

}
  window.addEventListener("beforeunload", event => {
    if (!appState.hasUnsavedChanges) return;

    event.preventDefault();
    event.returnValue = "";
  });
  if (savePageNotesBtn) {
  savePageNotesBtn.addEventListener("click", savePageNote);
}
  const drawingScroll = document.getElementById("drawingScroll");
const canvasWrap = document.getElementById("canvasWrap");

if (drawingScroll && canvasWrap) {
  drawingScroll.addEventListener("touchmove", event => {
    if (event.touches.length !== 2) return;

    event.preventDefault();

    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    const distance = Math.hypot(dx, dy);

    if (lastTouchDistance !== null) {
      const delta = distance / lastTouchDistance;

      mobileScale = Math.min(4, Math.max(0.5, mobileScale * delta));

      canvasWrap.style.transform = `scale(${mobileScale})`;
      canvasWrap.style.transformOrigin = "top left";
    }

    lastTouchDistance = distance;
  }, { passive: false });

  drawingScroll.addEventListener("touchend", () => {
    lastTouchDistance = null;
  });
}
}

function updateProjectState() {
  const projectName = getProjectName();

  appState.projectName = projectName;
  appState.hasLoadedDrawing = documents.length > 0;
  appState.hasMarkers = documents.some(doc =>
    doc.pages.some(page => page.markers.length > 0)
  );

  if (panelProjectName) {
    panelProjectName.textContent = projectName || "Current Project";
  }

  if (projectNameError) {
    projectNameError.textContent =
      CONFIG.requireProjectName && !projectName
        ? "Required for save/export."
        : "";
  }

  updateSaveStatus();
  updateMobileToolbox();
}

function markUnsaved() {
  appState.hasUnsavedChanges = true;
  updateSaveStatus();
}

function markSaved() {
  appState.hasUnsavedChanges = false;
  appState.lastSavedAt = new Date();
  updateSaveStatus();
}

function updateSaveStatus() {
  if (!saveStatus) return;

  if (appState.hasUnsavedChanges) {
    saveStatus.textContent = "Unsaved changes";
    saveStatus.className = "save-status unsaved";
  } else {
    saveStatus.textContent = "Saved";
    saveStatus.className = "save-status saved";
  }
}

function setStatus(message) {
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

function showProgress(message = "Loading...") {
  if (progressText) {
    progressText.textContent = message;
  }

  if (progressBar) {
    progressBar.style.width = "10%";
  }

  if (progressWrap) {
    progressWrap.classList.remove("hidden");
  }
}

function updateProgress(current, total, fileName = "") {
  const percent = total ? Math.round((current / total) * 100) : 0;

  if (progressText) {
    progressText.textContent = fileName
      ? `Loading ${fileName}: ${percent}%`
      : `Loading: ${percent}%`;
  }

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
}

function hideProgress() {
  if (progressBar) {
    progressBar.style.width = "0%";
  }

  if (progressWrap) {
    progressWrap.classList.add("hidden");
  }
}

function getProjectName() {
  return projectNameInput?.value.trim() || "";
}

function validateProjectName() {
  if (!CONFIG.requireProjectName) return true;

  const projectName = getProjectName();

  if (!projectName) {
    if (projectNameError) {
      projectNameError.textContent = "Project name is required.";
    }

    if (projectNameInput) {
      projectNameInput.focus();
    }

    return false;
  }

  if (projectNameError) {
    projectNameError.textContent = "";
  }

  return true;
}

function validateCanExport(type = "export") {
  if (!validateProjectName()) {
    alert(`Project name is required before ${type}.`);
    return false;
  }

  if (!documents.length) {
    alert("Upload a drawing before exporting.");
    return false;
  }

  return true;
}

function openToolbox() {
  document.body.classList.add("notes-open");
  updateMobileToolbox();
}

function closeToolbox() {
  document.body.classList.remove("notes-open");
}

function closeDevicePicker() {
  if (devicePicker) {
    devicePicker.classList.add("hidden");
  }
}

function savePageNote() {
  const page = getCurrentPage();

  if (!page || !pageNotesInput) return;

  page.notes = pageNotesInput.value.trim();

  markUnsaved();
  updateMobileToolbox();

  setStatus("Page note added. Download JSON to save the project file.");
}

// =====================================================
// Section 3: Uploads, PDF/Image Loading, JSON Loading
// =====================================================

async function handleUploads(event) {
  const files = Array.from(event.target.files || []);

  if (!files.length) return;

  documents = [];
  currentDocIndex = 0;
  currentPageIndex = 0;
  selectedMobileMarkerIndex = null;

  showProgress("Loading files...");

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      updateProgress(i + 1, files.length, file.name);

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        await loadPdfFile(file);
      } else {
        await loadImageFile(file);
      }
    }

    if (uploadedFileName) {
      uploadedFileName.textContent =
        files.length === 1 ? files[0].name : `${files.length} files loaded`;
    }

    currentDocIndex = 0;
    currentPageIndex = 0;

    markUnsaved();
    updateProjectState();
    redrawCurrentPage();

    setStatus("Drawing loaded.");
  } catch (error) {
    console.error(error);
    alert("Could not load one or more files.");
  } finally {
    hideProgress();
    event.target.value = "";
  }
}

async function loadPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer
  }).promise;

  const documentItem = {
    id: uid(),
    name: file.name,
    type: "pdf",
    pages: []
  };

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const pdfPage = await pdf.getPage(pageNumber);
    const viewport = pdfPage.getViewport({
      scale: CONFIG.pdfRenderScale
    });

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = viewport.width;
    tempCanvas.height = viewport.height;

    await pdfPage.render({
      canvasContext: tempCtx,
      viewport
    }).promise;

    const imageData = tempCanvas.toDataURL("image/png");
    const image = await imageFromData(imageData);

    documentItem.pages.push({
      imageData,
      image,
      renderedWidth: image.width,
      renderedHeight: image.height,
      pdfWidth: viewport.width,
      pdfHeight: viewport.height,
      notes: "",
      markers: []
    });
  }

  documents.push(documentItem);
}

async function loadImageFile(file) {
  const imageData = await fileToDataUrl(file);
  const image = await imageFromData(imageData);

  documents.push({
    id: uid(),
    name: file.name,
    type: "image",
    pages: [
      {
        imageData,
        image,
        renderedWidth: image.width,
        renderedHeight: image.height,
        pdfWidth: image.width,
        pdfHeight: image.height,
        notes: "",
        markers: []
      }
    ]
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => resolve(event.target.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function imageFromData(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadMobileJson(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    showProgress("Loading project JSON...");

    const text = await file.text();
    const payload = JSON.parse(text);

    if (!payload.documents || !Array.isArray(payload.documents)) {
      alert("Invalid project file.");
      return;
    }

    documents = payload.documents;

    for (const doc of documents) {
      for (const page of doc.pages) {
        if (page.imageData) {
          page.image = await imageFromData(page.imageData);
        }

        page.markers = page.markers || [];
        page.notes = page.notes || "";
      }
    }

    currentDocIndex = payload.currentDocIndex || 0;
    currentPageIndex = payload.currentPageIndex || 0;
    selectedMobileMarkerIndex = null;

    if (projectNameInput) {
      projectNameInput.value = payload.projectName || "";
    }

    updateProjectState();
    markSaved();
    redrawCurrentPage();

    setStatus("Project loaded.");
  } catch (error) {
    console.error(error);
    alert("Could not load project JSON.");
  } finally {
    hideProgress();

    if (event?.target) {
      event.target.value = "";
    }
  }
}

function uid() {
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

// =====================================================
// Section 4: Device Selection, Canvas Plotting, Marker Editing
// =====================================================

function selectQuickDevice(systemKey, itemKey) {
  const item = systems[systemKey]?.items?.[itemKey];

  if (!item) {
    alert("That device is not available yet.");
    return;
  }

  currentSystem = systemKey;
  currentItem = itemKey;
  mode = "device";

  closeDevicePicker();

  setStatus(`${item.label} selected. Tap the drawing to place it.`);
}

function handleCanvasClick(event) {
  const page = getCurrentPage();

  if (!page) {
    alert("Upload a drawing first.");
    return;
  }

  const point = getCanvasTapPoint(event);
  const hitIndex = findMarkerAtPoint(page, point.x, point.y);

  if (hitIndex !== null) {
    openMobileMarkerEditor(page.markers[hitIndex], hitIndex);
    return;
  }

  if (mode !== "device") return;

  const item = getCurrentItem();

  if (!item) {
    alert("Select a device first.");
    return;
  }

  const marker = createDeviceMarker(point.x, point.y, item);

  page.markers.push(marker);
  selectedMobileMarkerIndex = page.markers.length - 1;

  markUnsaved();
  redrawCurrentPage();
  updateMobileToolbox();

  setStatus(`${marker.label} placed.`);

  openMobileMarkerEditor(marker, selectedMobileMarkerIndex);

  // Guardrail:
  // Mobile V1 places one item per device selection to reduce accidental taps.
  // Remove this line later if you want continuous plotting mode.
  mode = "view";
}

function getCanvasTapPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function findMarkerAtPoint(page, x, y) {
  if (!page?.markers) return null;

  for (let index = page.markers.length - 1; index >= 0; index--) {
    const marker = page.markers[index];
    const distance = Math.hypot(marker.x - x, marker.y - y);

    if (distance <= MARKER_HIT_RADIUS) {
      return index;
    }
  }

  return null;
}

function createDeviceMarker(x, y, item) {
  const existingCount = getAllMarkers().filter(marker =>
    marker.prefix === item.prefix
  ).length;

  return {
    kind: "device",
    x,
    y,
    system: currentSystem,
    type: currentItem,
    symbol: item.symbol,
    iconImage: item.iconImage || null,
    iconSize: item.iconSize || 16,
    color: systems[currentSystem]?.color || "#1f6feb",
    label: `${item.prefix}${existingCount + 1}`,
    itemLabel: item.label,
    prefix: item.prefix,
    note: ""
  };
}

function openMobileMarkerEditor(marker, markerIndex) {
  selectedMobileMarkerIndex = markerIndex;

  if (!markerInspector || !marker) return;

  if (inspectorTitle) {
    inspectorTitle.textContent = marker.label || "Selected Item";
  }

  if (inspectorLabel) {
    inspectorLabel.value = marker.label || "";
  }

  if (inspectorNote) {
    inspectorNote.value = marker.note || "";
    inspectorNote.maxLength = CONFIG.note.maxLength;
  }

  markerInspector.classList.remove("hidden");
}

function closeMarkerInspector() {
  if (markerInspector) {
    markerInspector.classList.add("hidden");
  }
}

function saveMobileMarker() {
  const page = getCurrentPage();
  const marker = page?.markers?.[selectedMobileMarkerIndex];

  if (!page || !marker) return;

  const newLabel = inspectorLabel?.value.trim() || marker.label;
  const newNote = inspectorNote?.value.trim() || "";

  if (!newLabel) {
    alert("Device name is required.");
    return;
  }

  if (isDuplicateMarkerLabel(page, newLabel, selectedMobileMarkerIndex)) {
    alert(`"${newLabel}" is already used. Please choose a unique name.`);
    return;
  }

  marker.label = newLabel;
  marker.note = newNote;

  markUnsaved();
  redrawCurrentPage();
  updateMobileToolbox();
  closeMarkerInspector();

  setStatus(`${marker.label} updated.`);
}

function deleteSelectedMobileMarker() {
  const page = getCurrentPage();

  if (!page || selectedMobileMarkerIndex === null) return;

  if (!confirm("Delete this device?")) return;

  page.markers.splice(selectedMobileMarkerIndex, 1);
  selectedMobileMarkerIndex = null;

  markUnsaved();
  redrawCurrentPage();
  updateMobileToolbox();
  closeMarkerInspector();

  setStatus("Device deleted.");
}

function undoLastMarker() {
  const page = getCurrentPage();

  if (!page || !page.markers.length) return;

  page.markers.pop();
  selectedMobileMarkerIndex = null;

  markUnsaved();
  redrawCurrentPage();
  updateMobileToolbox();

  setStatus("Last device removed.");
}

function clearCurrentPageMarkers() {
  const page = getCurrentPage();

  if (!page || !page.markers.length) return;

  if (!confirm("Clear all devices on this page?")) return;

  page.markers = [];
  selectedMobileMarkerIndex = null;

  markUnsaved();
  redrawCurrentPage();
  updateMobileToolbox();
  closeMarkerInspector();

  setStatus("Page devices cleared.");
}

function isDuplicateMarkerLabel(page, label, selectedIndex) {
  const normalized = String(label || "").trim().toLowerCase();

  return page.markers.some((marker, index) => {
    if (index === selectedIndex) return false;

    return String(marker.label || "").trim().toLowerCase() === normalized;
  });
}

function getCurrentPage() {
  return documents[currentDocIndex]?.pages?.[currentPageIndex] || null;
}

function getCurrentItem() {
  return systems[currentSystem]?.items?.[currentItem] || null;
}

function getAllMarkers() {
  const markers = [];

  documents.forEach(doc => {
    doc.pages.forEach(page => {
      markers.push(...(page.markers || []));
    });
  });

  return markers;
}

// =====================================================
// Section 5: Drawing, Page Navigation, Toolbox Counts/Notes
// =====================================================

function drawEmpty() {
  canvas.width = 800;
  canvas.height = 500;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#64748b";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    "Upload drawings or PDFs to begin",
    canvas.width / 2,
    canvas.height / 2
  );
}

function redrawCurrentPage() {
  const page = getCurrentPage();

  if (!page?.image) {
    drawEmpty();
    updateMobileToolbox();
    return;
  }

  canvas.width = page.renderedWidth || page.image.width;
  canvas.height = page.renderedHeight || page.image.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(page.image, 0, 0, canvas.width, canvas.height);

  page.markers.forEach(marker => {
    drawMobileMarker(marker);
  });

  updateMobileToolbox();
}

function drawMobileMarker(marker) {
  ctx.beginPath();
  ctx.arc(marker.x, marker.y, MARKER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = marker.color || "#1f6feb";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = MARKER_SYMBOL_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(marker.symbol || "?", marker.x, marker.y);

  ctx.fillStyle = "#111827";
  ctx.font = MARKER_LABEL_FONT;
  ctx.fillText(marker.label || "", marker.x, marker.y + MARKER_LABEL_OFFSET);

  if (marker.note && marker.note.trim()) {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(marker.x + MARKER_RADIUS, marker.y - MARKER_RADIUS, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function goToPreviousPage() {
  const currentDoc = documents[currentDocIndex];

  if (!currentDoc || currentPageIndex <= 0) return;

  currentPageIndex--;
  selectedMobileMarkerIndex = null;

  redrawCurrentPage();

  setStatus(`Page ${currentPageIndex + 1} of ${currentDoc.pages.length}`);
}

function goToNextPage() {
  const currentDoc = documents[currentDocIndex];

  if (!currentDoc || currentPageIndex >= currentDoc.pages.length - 1) return;

  currentPageIndex++;
  selectedMobileMarkerIndex = null;

  redrawCurrentPage();

  setStatus(`Page ${currentPageIndex + 1} of ${currentDoc.pages.length}`);
}

function updateMobileToolbox() {
  const currentDoc = documents[currentDocIndex];
  const page = currentDoc?.pages?.[currentPageIndex];

  if (panelProjectName) {
    panelProjectName.textContent = getProjectName() || "Current Project";
  }

  if (panelDrawingName) {
    panelDrawingName.textContent = currentDoc?.name || "No drawing loaded";
  }

  if (panelPageInfo) {
    panelPageInfo.textContent = currentDoc
      ? `${currentPageIndex + 1} / ${currentDoc.pages.length}`
      : "0";
  }

  updateMobileCounts(page);
  updateMobileNotes(page);
}

function updateMobileCounts(page) {
  if (!counts) return;

  if (!page || !page.markers.length) {
    counts.innerHTML = "No items plotted yet.";
    return;
  }

  const grouped = {};

  page.markers.forEach(marker => {
    if (marker.kind !== "device") return;

    const label = marker.itemLabel || marker.type || "Device";
    grouped[label] = (grouped[label] || 0) + 1;
  });

  const entries = Object.entries(grouped);

  counts.innerHTML = entries.length
    ? entries.map(([label, count]) => `<strong>${escapeHtml(label)}:</strong> ${count}`).join("<br>")
    : "No items plotted yet.";
}

function updateMobileNotes(page) {
  if (!noteList) return;

  if (!page) {
    noteList.innerHTML = "No notes placed yet.";
    return;
  }

  const notes = [];

  if (page.notes && page.notes.trim()) {
    notes.push(`
      <div class="note-list-item">
        <strong>Page Note</strong><br>
        ${escapeHtml(page.notes)}
      </div>
    `);
  }

  page.markers
    .filter(marker => marker.note && marker.note.trim())
    .forEach(marker => {
      notes.push(`
        <div class="note-list-item">
          <strong>${escapeHtml(marker.label)}</strong><br>
          ${escapeHtml(marker.note)}
        </div>
      `);
    });

  noteList.innerHTML = notes.length
    ? notes.join("")
    : "No notes placed yet.";
}

// =====================================================
// Section 6: Export JSON, Export PDF, Summary Page
// =====================================================

function downloadMobileProject() {
  downloadMobileJson();
  downloadMobilePdf();
}

function downloadMobileJson() {
  if (!validateCanExport("exporting JSON")) return;

  const payload = {
    app: "Quick Plotter Mobile",
    version: "1.0",
    projectName: getProjectName(),
    exportedAt: new Date().toISOString(),
    documents: documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      pages: doc.pages.map(page => ({
        imageData: page.imageData,
        renderedWidth: page.renderedWidth || page.image?.width,
        renderedHeight: page.renderedHeight || page.image?.height,
        pdfWidth: page.pdfWidth || null,
        pdfHeight: page.pdfHeight || null,
        notes: page.notes || "",
        markers: page.markers || []
      }))
    })),
    currentDocIndex,
    currentPageIndex,
    currentSystem,
    currentItem
  };

  downloadText(
    JSON.stringify(payload, null, 2),
    `${getProjectSafeName()}-quick-plotter.json`,
    "application/json"
  );

  markSaved();
  setStatus("Project JSON saved.");
}

function downloadMobilePdf() {
  if (!validateCanExport("exporting PDF")) return;

  const { jsPDF } = window.jspdf;

  const originalDocIndex = currentDocIndex;
  const originalPageIndex = currentPageIndex;
  const originalSelectedMarkerIndex = selectedMobileMarkerIndex;

  let pdf = null;
  let pageCounter = 0;

  documents.forEach((doc, docIndex) => {
    doc.pages.forEach((page, pageIndex) => {
      currentDocIndex = docIndex;
      currentPageIndex = pageIndex;
      selectedMobileMarkerIndex = null;

      redrawCurrentPage();

      const orientation =
        canvas.width > canvas.height ? "landscape" : "portrait";

      if (!pdf) {
        pdf = new jsPDF({
          orientation,
          unit: "pt",
          format: [canvas.width, canvas.height]
        });
      } else {
        pdf.addPage([canvas.width, canvas.height], orientation);
      }

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height
      );

      pageCounter++;
    });
  });

  currentDocIndex = originalDocIndex;
  currentPageIndex = originalPageIndex;
  selectedMobileMarkerIndex = originalSelectedMarkerIndex;

  redrawCurrentPage();

  if (!pdf || pageCounter === 0) {
    alert("No pages were available to export.");
    return;
  }

  addMobileSummaryPage(pdf);

  pdf.save(`${getProjectSafeName()}-marked.pdf`);

  markSaved();
  setStatus("PDF exported.");
}

function addMobileSummaryPage(pdf) {
  const summary = getProjectSummaryRows();

  pdf.addPage("letter", "portrait");

  pdf.setFontSize(18);
  pdf.text("Quick Plotter Summary", 40, 50);

  pdf.setFontSize(11);
  pdf.text(`Project: ${getProjectName() || "Untitled Project"}`, 40, 78);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 96);

  let y = 135;

  pdf.setFontSize(14);
  pdf.text("Device Counts", 40, y);
  y += 24;

  pdf.setFontSize(11);

  if (!summary.length) {
    pdf.text("No devices plotted.", 40, y);
    y += 18;
  } else {
    summary.forEach(row => {
      if (y > 740) {
        pdf.addPage("letter", "portrait");
        y = 50;
      }

      pdf.text(`${row.label}: ${row.count}`, 40, y);
      y += 18;
    });
  }

  y += 20;
  pdf.setFontSize(14);
  pdf.text("Notes", 40, y);
  y += 24;

  pdf.setFontSize(10);

  documents.forEach(doc => {
    doc.pages.forEach((page, pageIndex) => {
      if (page.notes && page.notes.trim()) {
        if (y > 740) {
          pdf.addPage("letter", "portrait");
          y = 50;
        }

        pdf.text(`Page ${pageIndex + 1} Note: ${page.notes}`, 40, y);
        y += 16;
      }

      page.markers.forEach(marker => {
        if (!marker.note || !marker.note.trim()) return;

        if (y > 740) {
          pdf.addPage("letter", "portrait");
          y = 50;
        }

        pdf.text(`${marker.label}: ${marker.note}`, 40, y);
        y += 16;
      });
    });
  });
}

function getProjectSummaryRows() {
  const grouped = {};

  documents.forEach(doc => {
    doc.pages.forEach(page => {
      page.markers.forEach(marker => {
        if (marker.kind !== "device") return;

        const label = marker.itemLabel || marker.type || "Device";
        grouped[label] = (grouped[label] || 0) + 1;
      });
    });
  });

  return Object.entries(grouped)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function getProjectSafeName() {
  return cleanFileName(getProjectName() || "quick-plotter-project");
}

function cleanFileName(value) {
  return String(value || "project")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_ ]/gi, "")
    .trim()
    .replace(/\s+/g, "-") || "project";
}

// =====================================================
// Section 7: Utilities and Boot
// =====================================================

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Dev note:
// Keep this boot call at the very bottom of app.js.
// The HTML should only load this file once with:
// <script src="app.js"></script>
init();
