const MAP_CENTER = [36.35, 127.88];
const DEFAULT_ZOOM = 7;

const state = {
  allPlaces: [],
  map: null,
  markerLayer: null,
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
    maxZoom: 18,
  }).setView(MAP_CENTER, DEFAULT_ZOOM);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(state.map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    pane: "overlayPane",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
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
    const halo = L.circle([place.lat, place.lng], {
      radius: 110,
      stroke: false,
      fillColor: getMarkerColor(place.status),
      fillOpacity: 0.16,
    });

    marker.bindPopup(createPopupContent(place), {
      offset: [0, -28],
    });
    marker.bindTooltip(place.name, {
      permanent: true,
      direction: "bottom",
      offset: [0, 18],
      className: "place-label",
    });
    halo.addTo(state.markerLayer);
    marker.addTo(state.markerLayer);

    if (state.allPlaces.length === 1) {
      window.setTimeout(() => {
        marker.openPopup();
      }, 150);
    }
  });
}

function fitMapToPlaces() {
  if (state.allPlaces.length === 0) {
    state.map.setView(MAP_CENTER, DEFAULT_ZOOM);
    return;
  }

  if (state.allPlaces.length === 1) {
    const [place] = state.allPlaces;
    state.map.setView([place.lat, place.lng], 16);
    return;
  }

  const bounds = L.latLngBounds(state.allPlaces.map((place) => [place.lat, place.lng]));
  state.map.fitBounds(bounds, { padding: [32, 32] });
}

function createPopupContent(place) {
  const meta = [formatStatus(place.status), place.category, `${place.region} · ${place.district}`]
    .filter(Boolean)
    .join(" · ");
  const tags = (place.tags ?? [])
    .map((tag) => `<span class="popup-tag">${escapeHtml(tag)}</span>`)
    .join("");
  const topMenu = (place.topMenu ?? [])
    .map((item) => `<span class="popup-tag is-soft">${escapeHtml(item)}</span>`)
    .join("");
  const reviewSummary = place.reviews
    ? `방문자 ${place.reviews.visitor ?? 0} · 블로그 ${place.reviews.blog ?? 0}`
    : "";
  const hourSummary =
    place.hours && place.hours.open && place.hours.close
      ? `${escapeHtml(place.hours.days ?? "")} ${escapeHtml(place.hours.open)} - ${escapeHtml(
          place.hours.close
        )}`.trim()
      : "";
  const ratingSummary = place.rating ? `평점 ${escapeHtml(place.rating)}` : "";
  const stationSummary = place.nearestStation ? escapeHtml(place.nearestStation) : "";
  const phoneSummary = place.phone ? escapeHtml(place.phone) : "";
  const homepageLink = place.homepage
    ? `<a class="popup-link" href="${escapeHtml(place.homepage)}" target="_blank" rel="noreferrer">인스타그램</a>`
    : "";
  const sourceLink =
    place.source?.url && place.source?.name
      ? `<a class="popup-link" href="${escapeHtml(place.source.url)}" target="_blank" rel="noreferrer">${escapeHtml(
          place.source.name
        )}</a>`
      : "";

  return `
    <article class="popup-card">
      <p class="popup-meta">${meta}</p>
      <h3 class="popup-title">${escapeHtml(place.name)}</h3>
      <p class="popup-summary">${escapeHtml(place.summary ?? place.notes ?? "")}</p>
      <div class="popup-tags">${tags}</div>
      <div class="popup-info">
        ${renderPopupRow("주소", place.address)}
        ${renderPopupRow("영업", hourSummary)}
        ${renderPopupRow("평점", ratingSummary)}
        ${renderPopupRow("리뷰", reviewSummary)}
        ${renderPopupRow("가까운 역", stationSummary)}
        ${renderPopupRow("전화", phoneSummary)}
      </div>
      ${
        topMenu
          ? `<div class="popup-section"><p class="popup-label">대표 메뉴</p><div class="popup-tags">${topMenu}</div></div>`
          : ""
      }
      <p class="popup-note">${escapeHtml(place.notes ?? "")}</p>
      ${
        homepageLink || sourceLink
          ? `<div class="popup-actions">${homepageLink}${sourceLink}</div>`
          : ""
      }
    </article>
  `;
}

function renderPopupRow(label, value) {
  if (!value) {
    return "";
  }

  return `<div class="popup-row"><span class="popup-row-label">${escapeHtml(
    label
  )}</span><span class="popup-row-value">${escapeHtml(value)}</span></div>`;
}

function createMarkerIcon(status) {
  const color = getMarkerColor(status);

  return L.divIcon({
    className: "",
    html: `
      <div style="position: relative; width: 38px; height: 50px;">
        <svg width="38" height="50" viewBox="0 0 38 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M19 1C9.611 1 2 8.611 2 18c0 11.617 13.272 24.315 16.117 26.923a1.3 1.3 0 0 0 1.766 0C22.728 42.315 36 29.617 36 18 36 8.611 28.389 1 19 1Z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="19" cy="18" r="6.5" fill="#FFF9F1"/>
        </svg>
        <div style="position:absolute; left:50%; top:36px; width:20px; height:8px; transform:translateX(-50%); background:rgba(38,24,12,0.18); filter:blur(6px); border-radius:999px;"></div>
      </div>
    `,
    iconSize: [38, 50],
    iconAnchor: [19, 46],
    popupAnchor: [0, -36],
    tooltipAnchor: [0, 8],
  });
}

function getMarkerColor(status) {
  return status === "visited" ? "#205c4d" : "#bb7a22";
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
