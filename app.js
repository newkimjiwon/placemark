const MAP_CENTER = [36.35, 127.88];
const DEFAULT_ZOOM = 7;

const state = {
  allPlaces: [],
  map: null,
  markerLayer: null,
};

const elements = {
  popupTemplate: document.querySelector("#popup-template"),
};

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  initializeMap();

  try {
    const response = await fetch("./data/places.json");
    if (!response.ok) {
      throw new Error(`Failed to load place data: ${response.status}`);
    }

    const payload = await response.json();
    state.allPlaces = payload.places ?? [];
    renderMarkers();
    fitMapToPlaces();
  } catch (error) {
    renderFallbackPopup(error);
  }
}

function initializeMap() {
  state.map = L.map("map", {
    zoomControl: true,
    minZoom: 6,
  }).setView(MAP_CENTER, DEFAULT_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(state.map);

  state.markerLayer = L.layerGroup().addTo(state.map);
}

function renderMarkers() {
  state.markerLayer.clearLayers();

  state.allPlaces.forEach((place) => {
    const marker = L.marker([place.lat, place.lng], {
      icon: createMarkerIcon(place.status),
      title: place.name,
    });

    marker.bindPopup(createPopupContent(place));
    marker.addTo(state.markerLayer);
  });
}

function fitMapToPlaces() {
  if (state.allPlaces.length === 0) {
    state.map.setView(MAP_CENTER, DEFAULT_ZOOM);
    return;
  }

  if (state.allPlaces.length === 1) {
    const [place] = state.allPlaces;
    state.map.setView([place.lat, place.lng], 12);
    return;
  }

  const bounds = L.latLngBounds(state.allPlaces.map((place) => [place.lat, place.lng]));
  state.map.fitBounds(bounds, { padding: [32, 32] });
}

function createMarkerIcon(status) {
  return L.divIcon({
    className: "",
    html: `<div class="custom-marker ${escapeHtml(status)}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function createPopupContent(place) {
  const fragment = elements.popupTemplate.content.cloneNode(true);
  fragment.querySelector(".popup-title").textContent = place.name;
  fragment.querySelector(".popup-meta").textContent = [
    formatStatus(place.status),
    place.category,
    `${place.region} · ${place.district}`,
  ]
    .filter(Boolean)
    .join(" · ");
  fragment.querySelector(".popup-note").textContent = place.notes ?? place.address;

  const wrapper = document.createElement("div");
  wrapper.appendChild(fragment);
  return wrapper.innerHTML;
}

function renderFallbackPopup(error) {
  L.popup()
    .setLatLng(MAP_CENTER)
    .setContent(
      `<div class="popup-card"><h3 class="popup-title">데이터를 불러오지 못했습니다.</h3><p class="popup-note">${escapeHtml(
        error.message
      )}</p></div>`
    )
    .openOn(state.map);
}

function formatStatus(status) {
  return status === "visited" ? "다녀온 곳" : "갈 예정";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
