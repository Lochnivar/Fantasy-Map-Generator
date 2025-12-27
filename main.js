"use strict";
// Azgaar (azgaar.fmg@yandex.com). Minsk, 2017-2023. MIT License
// https://github.com/Azgaar/Fantasy-Map-Generator

// set debug options
const PRODUCTION = location.hostname && location.hostname !== "localhost" && location.hostname !== "127.0.0.1";
const DEBUG = JSON.safeParse(localStorage.getItem("debug")) || {};
const INFO = true;
const TIME = true;
const WARN = true;
const ERROR = true;

// detect device
const MOBILE = window.innerWidth < 600 || navigator.userAgentData?.mobile;

// typed arrays max values
const INT8_MAX = 127;
const UINT8_MAX = 255;
const UINT16_MAX = 65535;
const UINT32_MAX = 4294967295;

if (PRODUCTION && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(err => {
      console.error("ServiceWorker registration failed: ", err);
    });
  });

  window.addEventListener(
    "beforeinstallprompt",
    async event => {
      event.preventDefault();
      const Installation = await import("./modules/dynamic/installation.js?v=1.89.19");
      Installation.init(event);
    },
    {once: true}
  );
}

// append svg layers (in default order)
// Initialize DOM references in FMG.State.DOM
const State = window.FMG?.State;
if (!State) {
  console.error('FMG.State not initialized. Load core/state.js first.');
}

// Initialize DOM references
State.DOM.svg = d3.select("#map");
State.DOM.defs = State.DOM.svg.select("#deftemp");
State.DOM.viewbox = State.DOM.svg.select("#viewbox");
State.DOM.scaleBar = State.DOM.svg.select("#scaleBar");
State.DOM.legend = State.DOM.svg.append("g").attr("id", "legend");
State.DOM.ocean = State.DOM.viewbox.append("g").attr("id", "ocean");
State.DOM.oceanLayers = State.DOM.ocean.append("g").attr("id", "oceanLayers");
State.DOM.oceanPattern = State.DOM.ocean.append("g").attr("id", "oceanPattern");
State.DOM.lakes = State.DOM.viewbox.append("g").attr("id", "lakes");
State.DOM.landmass = State.DOM.viewbox.append("g").attr("id", "landmass");
State.DOM.texture = State.DOM.viewbox.append("g").attr("id", "texture");
State.DOM.terrs = State.DOM.viewbox.append("g").attr("id", "terrs");
State.DOM.biomes = State.DOM.viewbox.append("g").attr("id", "biomes");
State.DOM.cells = State.DOM.viewbox.append("g").attr("id", "cells");
State.DOM.gridOverlay = State.DOM.viewbox.append("g").attr("id", "gridOverlay");
State.DOM.coordinates = State.DOM.viewbox.append("g").attr("id", "coordinates");
State.DOM.compass = State.DOM.viewbox.append("g").attr("id", "compass").style("display", "none");
State.DOM.rivers = State.DOM.viewbox.append("g").attr("id", "rivers");
State.DOM.terrain = State.DOM.viewbox.append("g").attr("id", "terrain");
State.DOM.relig = State.DOM.viewbox.append("g").attr("id", "relig");
State.DOM.cults = State.DOM.viewbox.append("g").attr("id", "cults");
State.DOM.regions = State.DOM.viewbox.append("g").attr("id", "regions");
State.DOM.statesBody = State.DOM.regions.append("g").attr("id", "statesBody");
State.DOM.statesHalo = State.DOM.regions.append("g").attr("id", "statesHalo");
State.DOM.provs = State.DOM.viewbox.append("g").attr("id", "provs");
State.DOM.zones = State.DOM.viewbox.append("g").attr("id", "zones");
State.DOM.borders = State.DOM.viewbox.append("g").attr("id", "borders");
State.DOM.stateBorders = State.DOM.borders.append("g").attr("id", "stateBorders");
State.DOM.provinceBorders = State.DOM.borders.append("g").attr("id", "provinceBorders");
State.DOM.routes = State.DOM.viewbox.append("g").attr("id", "routes");
State.DOM.roads = State.DOM.routes.append("g").attr("id", "roads");
State.DOM.trails = State.DOM.routes.append("g").attr("id", "trails");
State.DOM.searoutes = State.DOM.routes.append("g").attr("id", "searoutes");
State.DOM.temperature = State.DOM.viewbox.append("g").attr("id", "temperature");
State.DOM.coastline = State.DOM.viewbox.append("g").attr("id", "coastline");
State.DOM.ice = State.DOM.viewbox.append("g").attr("id", "ice");
State.DOM.prec = State.DOM.viewbox.append("g").attr("id", "prec").style("display", "none");
State.DOM.population = State.DOM.viewbox.append("g").attr("id", "population");
State.DOM.emblems = State.DOM.viewbox.append("g").attr("id", "emblems").style("display", "none");
State.DOM.labels = State.DOM.viewbox.append("g").attr("id", "labels");
State.DOM.icons = State.DOM.viewbox.append("g").attr("id", "icons");
State.DOM.burgIcons = State.DOM.icons.append("g").attr("id", "burgIcons");
State.DOM.anchors = State.DOM.icons.append("g").attr("id", "anchors");
State.DOM.armies = State.DOM.viewbox.append("g").attr("id", "armies");
State.DOM.markers = State.DOM.viewbox.append("g").attr("id", "markers");
State.DOM.fogging = State.DOM.viewbox
  .append("g")
  .attr("id", "fogging-cont")
  .attr("mask", "url(#fog)")
  .append("g")
  .attr("id", "fogging")
  .style("display", "none");
State.DOM.ruler = State.DOM.viewbox.append("g").attr("id", "ruler").style("display", "none");
State.DOM.debug = State.DOM.viewbox.append("g").attr("id", "debug");

// Backward compatibility: Create global references
// These will be removed in a future phase after all code is migrated
let svg = State.DOM.svg;
let defs = State.DOM.defs;
let viewbox = State.DOM.viewbox;
let scaleBar = State.DOM.scaleBar;
let legend = State.DOM.legend;
let ocean = State.DOM.ocean;
let oceanLayers = State.DOM.oceanLayers;
let oceanPattern = State.DOM.oceanPattern;
let lakes = State.DOM.lakes;
let landmass = State.DOM.landmass;
let texture = State.DOM.texture;
let terrs = State.DOM.terrs;
let biomes = State.DOM.biomes;
let cells = State.DOM.cells;
let gridOverlay = State.DOM.gridOverlay;
let coordinates = State.DOM.coordinates;
let compass = State.DOM.compass;
let rivers = State.DOM.rivers;
let terrain = State.DOM.terrain;
let relig = State.DOM.relig;
let cults = State.DOM.cults;
let regions = State.DOM.regions;
let statesBody = State.DOM.statesBody;
let statesHalo = State.DOM.statesHalo;
let provs = State.DOM.provs;
let zones = State.DOM.zones;
let borders = State.DOM.borders;
let stateBorders = State.DOM.stateBorders;
let provinceBorders = State.DOM.provinceBorders;
let routes = State.DOM.routes;
let roads = State.DOM.roads;
let trails = State.DOM.trails;
let searoutes = State.DOM.searoutes;
let temperature = State.DOM.temperature;
let coastline = State.DOM.coastline;
let ice = State.DOM.ice;
let prec = State.DOM.prec;
let population = State.DOM.population;
let emblems = State.DOM.emblems;
let labels = State.DOM.labels;
let icons = State.DOM.icons;
let burgIcons = State.DOM.burgIcons;
let anchors = State.DOM.anchors;
let armies = State.DOM.armies;
let markers = State.DOM.markers;
let fogging = State.DOM.fogging;
let ruler = State.DOM.ruler;
let debug = State.DOM.debug;

State.DOM.lakes.append("g").attr("id", "freshwater");
State.DOM.lakes.append("g").attr("id", "salt");
State.DOM.lakes.append("g").attr("id", "sinkhole");
State.DOM.lakes.append("g").attr("id", "frozen");
State.DOM.lakes.append("g").attr("id", "lava");
State.DOM.lakes.append("g").attr("id", "dry");

State.DOM.coastline.append("g").attr("id", "sea_island");
State.DOM.coastline.append("g").attr("id", "lake_island");

State.DOM.terrs.append("g").attr("id", "oceanHeights");
State.DOM.terrs.append("g").attr("id", "landHeights");

State.DOM.burgLabels = State.DOM.labels.append("g").attr("id", "burgLabels");
State.DOM.labels.append("g").attr("id", "states");
State.DOM.labels.append("g").attr("id", "addedLabels");

State.DOM.burgIcons.append("g").attr("id", "cities");
State.DOM.burgLabels.append("g").attr("id", "cities");
State.DOM.anchors.append("g").attr("id", "cities");

State.DOM.burgIcons.append("g").attr("id", "towns");
State.DOM.burgLabels.append("g").attr("id", "towns");
State.DOM.anchors.append("g").attr("id", "towns");

// Backward compatibility: Create global reference
let burgLabels = State.DOM.burgLabels;

// population groups
State.DOM.population.append("g").attr("id", "rural");
State.DOM.population.append("g").attr("id", "urban");

// emblem groups
State.DOM.emblems.append("g").attr("id", "burgEmblems");
State.DOM.emblems.append("g").attr("id", "provinceEmblems");
State.DOM.emblems.append("g").attr("id", "stateEmblems");

// compass
State.DOM.compass.append("use").attr("xlink:href", "#defs-compass-rose");

// fogging
State.DOM.fogging.append("rect").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%");
State.DOM.fogging
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "#e8f0f6")
  .attr("filter", "url(#splotch)");

// assign events separately as not a viewbox child
State.DOM.scaleBar.on("mousemove", () => tip("Click to open Units Editor")).on("click", () => editUnits());
State.DOM.legend
  .on("mousemove", () => tip("Drag to change the position. Click to hide the legend"))
  .on("click", () => clearLegend());

// Initialize application data in FMG.State.Data
State.Data.grid = {}; // initial graph based on jittered square grid and data
State.Data.pack = {}; // packed graph and data
State.Data.rulers = new Rulers();
State.Data.biomesData = Biomes.getDefault();
State.Data.nameBases = Names.getNameBases(); // cultures-related data
State.Data.color = d3.scaleSequential(d3.interpolateSpectral); // default color scheme
State.Data.lineGen = d3.line().curve(d3.curveBasis); // d3 line generator with default curve interpolation

// Initialize view state in FMG.State.View
State.View.scale = 1;
State.View.viewX = 0;
State.View.viewY = 0;

const onZoom = debounce(function () {
  const {k, x, y} = d3.event.transform;

  const isScaleChanged = Boolean(State.View.scale - k);
  const isPositionChanged = Boolean(State.View.viewX - x || State.View.viewY - y);
  if (!isScaleChanged && !isPositionChanged) return;

  State.View.scale = k;
  State.View.viewX = x;
  State.View.viewY = y;

  handleZoom(isScaleChanged, isPositionChanged);
}, 50);
State.View.zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", onZoom);

// Initialize configuration values
State.Data.populationRate = +byId("populationRateInput").value;
State.Data.distanceScale = +byId("distanceScaleInput").value;
State.Data.urbanization = +byId("urbanizationInput").value;
State.Data.urbanDensity = +byId("urbanDensityInput").value;

// Backward compatibility: Create global references BEFORE they're used
// These will be removed in a future phase after all code is migrated
let grid = State.Data.grid;
let pack = State.Data.pack;
let seed = State.Data.seed;
let mapId = State.Data.mapId;
let mapHistory = State.Data.mapHistory;
let elSelected = State.Data.elSelected;
let modules = State.Data.modules;
let notes = State.Data.notes;
let rulers = State.Data.rulers;
let customization = State.Data.customization;
let biomesData = State.Data.biomesData;
let nameBases = State.Data.nameBases;
let color = State.Data.color;
const lineGen = State.Data.lineGen;
let scale = State.View.scale;
let viewX = State.View.viewX;
let viewY = State.View.viewY;
let options = State.Data.options;
let mapCoordinates = State.Data.mapCoordinates;
let populationRate = State.Data.populationRate;
let distanceScale = State.Data.distanceScale;
let urbanization = State.Data.urbanization;
let urbanDensity = State.Data.urbanDensity;
let graphWidth = State.View.graphWidth;
let graphHeight = State.View.graphHeight;
let svgWidth = State.View.svgWidth;
let svgHeight = State.View.svgHeight;
const zoom = State.View.zoom;

applyStoredOptions();

// voronoi graph extension, cannot be changed after generation
State.View.graphWidth = +mapWidthInput.value;
State.View.graphHeight = +mapHeightInput.value;

// svg canvas resolution, can be changed
State.View.svgWidth = State.View.graphWidth;
State.View.svgHeight = State.View.graphHeight;

// Update backward compatibility variables after graph dimensions are set
graphWidth = State.View.graphWidth;
graphHeight = State.View.graphHeight;
svgWidth = State.View.svgWidth;
svgHeight = State.View.svgHeight;

State.DOM.landmass.append("rect").attr("x", 0).attr("y", 0).attr("width", State.View.graphWidth).attr("height", State.View.graphHeight);
State.DOM.oceanPattern
  .append("rect")
  .attr("fill", "url(#oceanic)")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", State.View.graphWidth)
  .attr("height", State.View.graphHeight);
State.DOM.oceanLayers
  .append("rect")
  .attr("id", "oceanBase")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", State.View.graphWidth)
  .attr("height", State.View.graphHeight);

document.addEventListener("DOMContentLoaded", async () => {
  if (!location.hostname) {
    const wiki = "https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Run-FMG-locally";
    alertMessage.innerHTML = /* html */ `Fantasy Map Generator cannot run serverless. Follow the <a href="${wiki}" target="_blank">instructions</a> on how you can easily run a local web-server`;

    $("#alert").dialog({
      resizable: false,
      title: "Loading error",
      width: "28em",
      position: {my: "center center-4em", at: "center", of: "svg"},
      buttons: {
        OK: function () {
          $(this).dialog("close");
        }
      }
    });
  } else {
    hideLoading();
    await checkLoadParameters();
  }
  restoreDefaultEvents(); // apply default viewbox events
  initiateAutosave();
});

function hideLoading() {
  d3.select("#loading").transition().duration(3000).style("opacity", 0);
  d3.select("#optionsContainer").transition().duration(2000).style("opacity", 1);
  d3.select("#tooltip").transition().duration(3000).style("opacity", 1);
}

function showLoading() {
  d3.select("#loading").transition().duration(200).style("opacity", 1);
  d3.select("#optionsContainer").transition().duration(100).style("opacity", 0);
  d3.select("#tooltip").transition().duration(200).style("opacity", 0);
}

// decide which map should be loaded or generated on page load
async function checkLoadParameters() {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // of there is a valid maplink, try to load .map/.gz file from URL
  if (params.get("maplink")) {
    WARN && console.warn("Load map from URL");
    const maplink = params.get("maplink");
    const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    const valid = pattern.test(maplink);
    if (valid) {
      setTimeout(() => {
        loadMapFromURL(maplink, 1);
      }, 1000);
      return;
    } else showUploadErrorMessage("Map link is not a valid URL", maplink);
  }

  // if there is a seed (user of MFCG provided), generate map for it
  if (params.get("seed")) {
    FMG.Utils.Logger.warn("Generate map for seed");
    await generateMapOnLoad();
    return;
  }

  // check if there is a map saved to indexedDB
  if (byId("onloadBehavior").value === "lastSaved") {
    try {
      const blob = await ldb.get("lastMap");
      if (blob) {
        FMG.Utils.Logger.warn("Loading last stored map");
        uploadMap(blob);
        return;
      }
    } catch (error) {
      FMG.Utils.Logger.error(error);
    }
  }

  // else generate random map
  FMG.Utils.Logger.warn("Generate random map");
  generateMapOnLoad();
}

async function generateMapOnLoad() {
  await applyStyleOnLoad(); // apply previously selected default or custom style
  await generate(); // generate map
  applyLayersPreset(); // apply saved layers preset and reder layers
  drawLayers();
  fitMapToScreen();
  focusOn(); // based on searchParams focus on point, cell or burg from MFCG
  toggleAssistant();
}

// focus on coordinates, cell or burg provided in searchParams
function focusOn() {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const fromMGCG = params.get("from") === "MFCG" && document.referrer;
  if (fromMGCG) {
    if (params.get("seed").length === 13) {
      // show back burg from MFCG
      const burgSeed = params.get("seed").slice(-4);
      params.set("burg", burgSeed);
    } else {
      // select burg for MFCG
      findBurgForMFCG(params);
      return;
    }
  }

  const scaleParam = params.get("scale");
  const cellParam = params.get("cell");
  const burgParam = params.get("burg");

  if (scaleParam || cellParam || burgParam) {
    const scale = +scaleParam || 8;

    if (cellParam) {
      const cell = +params.get("cell");
      const [x, y] = State.Data.pack.cells.p[cell];
      zoomTo(x, y, State.View.scale, 1600);
      return;
    }

    if (burgParam) {
      const burg = isNaN(+burgParam) ? State.Data.pack.burgs.find(burg => burg.name === burgParam) : State.Data.pack.burgs[+burgParam];
      if (!burg) return;

      const {x, y} = burg;
      zoomTo(x, y, State.View.scale, 1600);
      return;
    }

    const x = +params.get("x") || State.View.graphWidth / 2;
    const y = +params.get("y") || State.View.graphHeight / 2;
    zoomTo(x, y, State.View.scale, 1600);
  }
}

let isAssistantLoaded = false;
function toggleAssistant() {
  const assistantContainer = byId("chat-widget-container");
  const showAssistant = byId("azgaarAssistant").value === "show";

  if (showAssistant) {
    if (isAssistantLoaded) {
      assistantContainer.style.display = "block";
    } else {
      import("./libs/openwidget.min.js").then(() => {
        isAssistantLoaded = true;
        setTimeout(() => {
          const bubble = byId("chat-widget-minimized");
          if (bubble) {
            bubble.dataset.tip = "Click to open the Assistant";
            bubble.on("mouseover", showDataTip);
          }
        }, 5000);
      });
    }
  } else if (isAssistantLoaded) {
    assistantContainer.style.display = "none";
  }
}

// find burg for MFCG and focus on it
function findBurgForMFCG(params) {
  const cells = pack.cells,
    burgs = pack.burgs;
  if (pack.burgs.length < 2) {
    ERROR && console.error("Cannot select a burg for MFCG");
    return;
  }

  // used for selection
  const size = +params.get("size");
  const coast = +params.get("coast");
  const port = +params.get("port");
  const river = +params.get("river");

  let selection = defineSelection(coast, port, river);
  if (!selection.length) selection = defineSelection(coast, !port, !river);
  if (!selection.length) selection = defineSelection(!coast, 0, !river);
  if (!selection.length) selection = [burgs[1]]; // select first if nothing is found

  function defineSelection(coast, port, river) {
    if (port && river) return burgs.filter(b => b.port && cells.r[b.cell]);
    if (!port && coast && river) return burgs.filter(b => !b.port && cells.t[b.cell] === 1 && cells.r[b.cell]);
    if (!coast && !river) return burgs.filter(b => cells.t[b.cell] !== 1 && !cells.r[b.cell]);
    if (!coast && river) return burgs.filter(b => cells.t[b.cell] !== 1 && cells.r[b.cell]);
    if (coast && river) return burgs.filter(b => cells.t[b.cell] === 1 && cells.r[b.cell]);
    return [];
  }

  // select a burg with closest population from selection
  const selected = d3.scan(selection, (a, b) => Math.abs(a.population - size) - Math.abs(b.population - size));
  const burgId = selection[selected].i;
  if (!burgId) {
    ERROR && console.error("Cannot select a burg for MFCG");
    return;
  }

  const b = burgs[burgId];
  const referrer = new URL(document.referrer);
  for (let p of referrer.searchParams) {
    if (p[0] === "name") b.name = p[1];
    else if (p[0] === "size") b.population = +p[1];
    else if (p[0] === "seed") b.MFCG = +p[1];
    else if (p[0] === "shantytown") b.shanty = +p[1];
    else b[p[0]] = +p[1]; // other parameters
  }
  if (params.get("name") && params.get("name") != "null") b.name = params.get("name");

  const label = State.DOM.burgLabels.select("[data-id='" + burgId + "']");
  if (label.size()) {
    label
      .text(b.name)
      .classed("drag", true)
      .on("mouseover", function () {
        d3.select(this).classed("drag", false);
        label.on("mouseover", null);
      });
  }

  zoomTo(b.x, b.y, 8, 1600);
  invokeActiveZooming();
  tip("Here stands the glorious city of " + b.name, true, "success", 15000);
}

function handleZoom(isScaleChanged, isPositionChanged) {
  State.DOM.viewbox.attr("transform", `translate(${State.View.viewX} ${State.View.viewY}) scale(${State.View.scale})`);

  if (isPositionChanged) {
    if (layerIsOn("toggleCoordinates")) drawCoordinates();
  }

  if (isScaleChanged) {
    invokeActiveZooming();
    drawScaleBar(State.DOM.scaleBar, State.View.scale);
    fitScaleBar(State.DOM.scaleBar, State.View.svgWidth, State.View.svgHeight);
  }

  // zoom image converter overlay
  if (State.Data.customization === 1) {
    const canvas = byId("canvas");
    if (!canvas || canvas.style.opacity === "0") return;

    const img = byId("imageToConvert");
    if (!img) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(State.View.scale, 0, 0, State.View.scale, State.View.viewX, State.View.viewY);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}

// Zoom to a specific point
function zoomTo(x, y, z = 8, d = 2000) {
  const transform = d3.zoomIdentity.translate(x * -z + State.View.svgWidth / 2, y * -z + State.View.svgHeight / 2).scale(z);
  State.DOM.svg.transition().duration(d).call(State.View.zoom.transform, transform);
}

// Reset zoom to initial
function resetZoom(d = 1000) {
  State.DOM.svg.transition().duration(d).call(State.View.zoom.transform, d3.zoomIdentity);
}

// active zooming feature
function invokeActiveZooming() {
  const isOptimized = shapeRendering.value === "optimizeSpeed";

  if (State.DOM.coastline.select("#sea_island").size() && +State.DOM.coastline.select("#sea_island").attr("auto-filter")) {
    // toggle shade/blur filter for coatline on zoom
    const filter = State.View.scale > 1.5 && State.View.scale <= 2.6 ? null : State.View.scale > 2.6 ? "url(#blurFilter)" : "url(#dropShadow)";
    State.DOM.coastline.select("#sea_island").attr("filter", filter);
  }

  // rescale labels on zoom
  if (State.DOM.labels.style("display") !== "none") {
    State.DOM.labels.selectAll("g").each(function () {
      if (this.id === "burgLabels") return;
      const desired = +this.dataset.size;
      const relative = Math.max(rn((desired + desired / State.View.scale) / 2, 2), 1);
      if (rescaleLabels.checked) this.setAttribute("font-size", relative);

      const hidden = hideLabels.checked && (relative * State.View.scale < 6 || relative * State.View.scale > 60);
      if (hidden) this.classList.add("hidden");
      else this.classList.remove("hidden");
    });
  }

  // rescale emblems on zoom
  if (State.DOM.emblems.style("display") !== "none") {
    State.DOM.emblems.selectAll("g").each(function () {
      const size = this.getAttribute("font-size") * State.View.scale;
      const hidden = hideEmblems.checked && (size < 25 || size > 300);
      if (hidden) this.classList.add("hidden");
      else this.classList.remove("hidden");
      if (!hidden && window.COArenderer && this.children.length && !this.children[0].getAttribute("href"))
        renderGroupCOAs(this);
    });
  }

  // turn off ocean pattern if scale is big (improves performance)
  State.DOM.oceanPattern
    .select("rect")
    .attr("fill", State.View.scale > 10 ? "#fff" : "url(#oceanic)")
    .attr("opacity", State.View.scale > 10 ? 0.2 : null);

  // change states halo width
  if (!State.Data.customization && !isOptimized) {
    const desired = +State.DOM.statesHalo.attr("data-width");
    const haloSize = rn(desired / State.View.scale ** 0.8, 2);
    State.DOM.statesHalo.attr("stroke-width", haloSize).style("display", haloSize > 0.1 ? "block" : "none");
  }

  // rescale map markers
  +State.DOM.markers.attr("rescale") &&
    State.Data.pack.markers?.forEach(marker => {
      const {i, x, y, size = 30, hidden} = marker;
      const el = !hidden && byId(`marker${i}`);
      if (!el) return;

      const zoomedSize = Math.max(rn(size / 5 + 24 / State.View.scale, 2), 1);
      el.setAttribute("width", zoomedSize);
      el.setAttribute("height", zoomedSize);
      el.setAttribute("x", rn(x - zoomedSize / 2, 1));
      el.setAttribute("y", rn(y - zoomedSize, 1));
    });

  // rescale rulers to have always the same size
  if (State.DOM.ruler.style("display") !== "none") {
    const size = rn((10 / State.View.scale ** 0.3) * 2, 2);
    State.DOM.ruler.selectAll("text").attr("font-size", size);
  }
}

// add drag to upload logic, pull request from @evyatron
void (function addDragToUpload() {
  document.addEventListener("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
    byId("mapOverlay").style.display = null;
  });

  document.addEventListener("dragleave", function (e) {
    byId("mapOverlay").style.display = "none";
  });

  document.addEventListener("drop", function (e) {
    e.stopPropagation();
    e.preventDefault();

    const overlay = byId("mapOverlay");
    overlay.style.display = "none";
    if (e.dataTransfer.items == null || e.dataTransfer.items.length !== 1) return; // no files or more than one
    const file = e.dataTransfer.items[0].getAsFile();

    if (!file.name.endsWith(".map") && !file.name.endsWith(".gz")) {
      alertMessage.innerHTML =
        "Please upload a map file (<i>.map</i> or <i>.gz</i> formats) you have previously downloaded";
      $("#alert").dialog({
        resizable: false,
        title: "Invalid file format",
        position: {my: "center", at: "center", of: "svg"},
        buttons: {
          Close: function () {
            $(this).dialog("close");
          }
        }
      });
      return;
    }

    // all good - show uploading text and load the map
    overlay.style.display = null;
    overlay.innerHTML = "Uploading<span>.</span><span>.</span><span>.</span>";
    if (closeDialogs) closeDialogs();
    uploadMap(file, () => {
      overlay.style.display = "none";
      overlay.innerHTML = "Drop a map file to open";
    });
  });
})();

// Initialize generation process
function initializeGeneration(options) {
  const {seed: precreatedSeed} = options || {};
  invokeActiveZooming();
  setSeed(precreatedSeed);
  FMG.Utils.Logger.group("Generated Map " + seed);
  applyGraphSize();
  randomizeOptions();
  return precreatedSeed;
}

// Generate heightmap
async function generateHeightmap(options) {
  const {seed: precreatedSeed, graph: precreatedGraph} = options || {};
  if (shouldRegenerateGrid(grid, precreatedSeed)) grid = precreatedGraph || generateGrid();
  else delete grid.cells.h;
  grid.cells.h = await HeightmapGenerator.generate(grid);
  pack = {}; // reset pack
}

// Generate geographic features
function generateGeographicFeatures() {
  Features.markupGrid();
  addLakesInDeepDepressions();
  openNearSeaLakes();
  OceanLayers();
  defineMapSize();
  calculateMapCoordinates();
}

// Generate climate
function generateClimate() {
  calculateTemperatures();
  generatePrecipitation();
}

// Generate pack (refined cell structure)
function generatePack() {
  reGraph();
  Features.markupPack();
  createDefaultRuler();
}

// Generate natural features
function generateNaturalFeatures() {
  Rivers.generate();
  Biomes.define();
}

// Generate civilization
function generateCivilization() {
  rankCells();
  Cultures.generate();
  Cultures.expand();
  BurgsAndStates.generate();
  Routes.generate();
  Religions.generate();
  BurgsAndStates.defineStateForms();
  Provinces.generate();
  Provinces.getPoles();
  BurgsAndStates.defineBurgFeatures();
}

// Generate final details
function generateFinalDetails() {
  Rivers.specify();
  Features.specify();
  Military.generate();
  Markers.generate();
  Zones.generate();
  drawScaleBar(scaleBar, scale);
  Names.getMapName();
}

// Finalize generation
function finalizeGeneration(timeStart) {
  FMG.Utils.Logger.warn(`TOTAL: ${rn((performance.now() - timeStart) / 1000, 2)}s`);
  showStatistics();
  FMG.Utils.Logger.groupEnd("Generated Map " + seed);
}

// Main generation function
async function generate(options) {
  try {
    const timeStart = performance.now();
    
    initializeGeneration(options);
    await generateHeightmap(options);
    generateGeographicFeatures();
    generateClimate();
    generatePack();
    generateNaturalFeatures();
    generateCivilization();
    generateFinalDetails();
    finalizeGeneration(timeStart);
  } catch (error) {
    FMG.Utils.Logger.error(error);
    clearMainTip();
    FMG.Utils.Dialog.showGenerationError(error);
  }
}

// set map seed (string!)
function setSeed(precreatedSeed) {
  if (!precreatedSeed) {
    const first = !mapHistory[0];
    const params = new URL(window.location.href).searchParams;
    const urlSeed = params.get("seed");
    if (first && params.get("from") === "MFCG" && urlSeed.length === 13) seed = urlSeed.slice(0, -4);
    else if (first && urlSeed) seed = urlSeed;
    else seed = generateSeed();
  } else {
    seed = precreatedSeed;
  }

  byId("optionsSeed").value = seed;
  Math.random = aleaPRNG(seed);
}

function addLakesInDeepDepressions() {
  FMG.Utils.Logger.time("addLakesInDeepDepressions");
  const elevationLimit = +byId("lakeElevationLimitOutput").value;
  if (elevationLimit === 80) return;

  const {cells, features} = grid;
  const {c, h, b} = cells;

  for (const i of cells.i) {
    if (b[i] || h[i] < 20) continue;

    const minHeight = d3.min(c[i].map(c => h[c]));
    if (h[i] > minHeight) continue;

    let deep = true;
    const threshold = h[i] + elevationLimit;
    const queue = [i];
    const checked = [];
    checked[i] = true;

    // check if elevated cell can potentially pour to water
    while (deep && queue.length) {
      const q = queue.pop();

      for (const n of c[q]) {
        if (checked[n]) continue;
        if (h[n] >= threshold) continue;
        if (h[n] < 20) {
          deep = false;
          break;
        }

        checked[n] = true;
        queue.push(n);
      }
    }

    // if not, add a lake
    if (deep) {
      const lakeCells = [i].concat(c[i].filter(n => h[n] === h[i]));
      addLake(lakeCells);
    }
  }

  function addLake(lakeCells) {
    const f = features.length;

    lakeCells.forEach(i => {
      cells.h[i] = 19;
      cells.t[i] = -1;
      cells.f[i] = f;
      c[i].forEach(n => !lakeCells.includes(n) && (cells.t[c] = 1));
    });

    features.push({i: f, land: false, border: false, type: "lake"});
  }

  FMG.Utils.Logger.timeEnd("addLakesInDeepDepressions");
}

// near sea lakes usually get a lot of water inflow, most of them should break threshold and flow out to sea (see Ancylus Lake)
function openNearSeaLakes() {
  if (byId("templateInput").value === "Atoll") return; // no need for Atolls

  const cells = grid.cells;
  const features = grid.features;
  if (!features.find(f => f.type === "lake")) return; // no lakes
  FMG.Utils.Logger.time("openLakes");
  const LIMIT = 22; // max height that can be breached by water

  for (const i of cells.i) {
    const lakeFeatureId = cells.f[i];
    if (features[lakeFeatureId].type !== "lake") continue; // not a lake

    check_neighbours: for (const c of cells.c[i]) {
      if (cells.t[c] !== 1 || cells.h[c] > LIMIT) continue; // water cannot break this

      for (const n of cells.c[c]) {
        const ocean = cells.f[n];
        if (features[ocean].type !== "ocean") continue; // not an ocean
        removeLake(c, lakeFeatureId, ocean);
        break check_neighbours;
      }
    }
  }

  function removeLake(thresholdCellId, lakeFeatureId, oceanFeatureId) {
    cells.h[thresholdCellId] = FMG.Config.Map.MAX_WATER_HEIGHT;
    cells.t[thresholdCellId] = -1;
    cells.f[thresholdCellId] = oceanFeatureId;
    cells.c[thresholdCellId].forEach(function (c) {
      if (cells.h[c] >= FMG.Config.Map.MIN_LAND_HEIGHT) cells.t[c] = 1; // mark as coastline
    });

    cells.i.forEach(i => {
      if (cells.f[i] === lakeFeatureId) cells.f[i] = oceanFeatureId;
    });
    features[lakeFeatureId].type = "ocean"; // mark former lake as ocean
  }

  FMG.Utils.Logger.timeEnd("openLakes");
}

// define map size and position based on template and random factor
function defineMapSize() {
  const [size, latitude, longitude] = getSizeAndLatitude();
  const randomize = new URL(window.location.href).searchParams.get("options") === "default"; // ignore stored options
  if (randomize || !locked("mapSize")) mapSizeOutput.value = mapSizeInput.value = size;
  if (randomize || !locked("latitude")) latitudeOutput.value = latitudeInput.value = latitude;
  if (randomize || !locked("longitude")) longitudeOutput.value = longitudeInput.value = longitude;

  function getSizeAndLatitude() {
    const template = byId("templateInput").value; // heightmap template

    if (template === "africa-centric") return [45, 53, 38];
    if (template === "arabia") return [20, 35, 35];
    if (template === "atlantics") return [42, 23, 65];
    if (template === "britain") return [7, 20, 51.3];
    if (template === "caribbean") return [15, 40, 74.8];
    if (template === "east-asia") return [11, 28, 9.4];
    if (template === "eurasia") return [38, 19, 27];
    if (template === "europe") return [20, 16, 44.8];
    if (template === "europe-accented") return [14, 22, 44.8];
    if (template === "europe-and-central-asia") return [25, 10, 39.5];
    if (template === "europe-central") return [11, 22, 46.4];
    if (template === "europe-north") return [7, 18, 48.9];
    if (template === "greenland") return [22, 7, 55.8];
    if (template === "hellenica") return [8, 27, 43.5];
    if (template === "iceland") return [2, 15, 55.3];
    if (template === "indian-ocean") return [45, 55, 14];
    if (template === "mediterranean-sea") return [10, 29, 45.8];
    if (template === "middle-east") return [8, 31, 34.4];
    if (template === "north-america") return [37, 17, 87];
    if (template === "us-centric") return [66, 27, 100];
    if (template === "us-mainland") return [16, 30, 77.5];
    if (template === "world") return [78, 27, 40];
    if (template === "world-from-pacific") return [75, 32, 30]; // longitude doesn't fit

    const part = grid.features.some(f => f.land && f.border); // if land goes over map borders
    const max = part ? 80 : 100; // max size
    const lat = () => gauss(P(0.5) ? 40 : 60, 20, 25, 75); // latitude shift

    if (!part) {
      if (template === "pangea") return [100, 50, 50];
      if (template === "shattered" && P(0.7)) return [100, 50, 50];
      if (template === "continents" && P(0.5)) return [100, 50, 50];
      if (template === "archipelago" && P(0.35)) return [100, 50, 50];
      if (template === "highIsland" && P(0.25)) return [100, 50, 50];
      if (template === "lowIsland" && P(0.1)) return [100, 50, 50];
    }

    if (template === "pangea") return [gauss(70, 20, 30, max), lat(), 50];
    if (template === "volcano") return [gauss(20, 20, 10, max), lat(), 50];
    if (template === "mediterranean") return [gauss(25, 30, 15, 80), lat(), 50];
    if (template === "peninsula") return [gauss(15, 15, 5, 80), lat(), 50];
    if (template === "isthmus") return [gauss(15, 20, 3, 80), lat(), 50];
    if (template === "atoll") return [gauss(3, 2, 1, 5, 1), lat(), 50];

    return [gauss(30, 20, 15, max), lat(), 50]; // Continents, Archipelago, High Island, Low Island
  }
}

// calculate map position on globe
function calculateMapCoordinates() {
  const sizeFraction = +byId("mapSizeOutput").value / 100;
  const latShift = +byId("latitudeOutput").value / 100;
  const lonShift = +byId("longitudeOutput").value / 100;

  const latT = rn(sizeFraction * 180, 1);
  const latN = rn(90 - (180 - latT) * latShift, 1);
  const latS = rn(latN - latT, 1);

  const lonT = rn(Math.min((graphWidth / graphHeight) * latT, 360), 1);
  const lonE = rn(180 - (360 - lonT) * lonShift, 1);
  const lonW = rn(lonE - lonT, 1);
  mapCoordinates = {latT, latN, latS, lonT, lonW, lonE};
}

// temperature model, trying to follow real-world data
// based on http://www-das.uwyo.edu/~geerts/cwx/notes/chap16/Image64.gif
function calculateTemperatures() {
  try {
    FMG.Utils.Logger.time("calculateTemperatures");
  const cells = grid.cells;
  cells.temp = new Int8Array(cells.i.length); // temperature array

  const {temperatureEquator, temperatureNorthPole, temperatureSouthPole} = options;
  const tropics = [16, -20]; // tropics zone
  const tropicalGradient = 0.15;

  const tempNorthTropic = temperatureEquator - tropics[0] * tropicalGradient;
  const northernGradient = (tempNorthTropic - temperatureNorthPole) / (90 - tropics[0]);

  const tempSouthTropic = temperatureEquator + tropics[1] * tropicalGradient;
  const southernGradient = (tempSouthTropic - temperatureSouthPole) / (90 + tropics[1]);

  const exponent = +heightExponentInput.value;

  for (let rowCellId = 0; rowCellId < cells.i.length; rowCellId += grid.cellsX) {
    const [, y] = grid.points[rowCellId];
    const rowLatitude = mapCoordinates.latN - (y / graphHeight) * mapCoordinates.latT; // [90; -90]
    const tempSeaLevel = calculateSeaLevelTemp(rowLatitude);
    DEBUG.temperature && console.info(`${rn(rowLatitude)}° sea temperature: ${rn(tempSeaLevel)}°C`);

    for (let cellId = rowCellId; cellId < rowCellId + grid.cellsX; cellId++) {
      const tempAltitudeDrop = getAltitudeTemperatureDrop(cells.h[cellId]);
      cells.temp[cellId] = minmax(tempSeaLevel - tempAltitudeDrop, -128, 127);
    }
  }

  function calculateSeaLevelTemp(latitude) {
    const isTropical = latitude <= 16 && latitude >= -20;
    if (isTropical) return temperatureEquator - Math.abs(latitude) * tropicalGradient;

    return latitude > 0
      ? tempNorthTropic - (latitude - tropics[0]) * northernGradient
      : tempSouthTropic + (latitude - tropics[1]) * southernGradient;
  }

  // temperature drops by 6.5°C per 1km of altitude
  function getAltitudeTemperatureDrop(h) {
    if (h < 20) return 0;
    const height = Math.pow(h - 18, exponent);
    return rn((height / 1000) * 6.5);
  }

    FMG.Utils.Logger.timeEnd("calculateTemperatures");
  } catch (error) {
    FMG.Utils.Error.handleCalculationError(error, "calculateTemperatures");
    throw error; // Re-throw to prevent silent failures
  }
}

// simplest precipitation model
function generatePrecipitation() {
  try {
    FMG.Utils.Logger.time("generatePrecipitation");
    prec.selectAll("*").remove();
    const {cells, cellsX, cellsY} = grid;
    cells.prec = new Uint8Array(cells.i.length); // precipitation array

    const cellsNumberModifier = (pointsInput.dataset.cells / 10000) ** 0.25;
    const precInputModifier = precInput.value / 100;
    const modifier = cellsNumberModifier * precInputModifier;

    const westerly = [];
    const easterly = [];
    let southerly = 0;
    let northerly = 0;

    // precipitation modifier per latitude band
    // x4 = 0-5 latitude: wet through the year (rising zone)
    // x2 = 5-20 latitude: wet summer (rising zone), dry winter (sinking zone)
    // x1 = 20-30 latitude: dry all year (sinking zone)
    // x2 = 30-50 latitude: wet winter (rising zone), dry summer (sinking zone)
    // x3 = 50-60 latitude: wet all year (rising zone)
    // x2 = 60-70 latitude: wet summer (rising zone), dry winter (sinking zone)
    // x1 = 70-85 latitude: dry all year (sinking zone)
    // x0.5 = 85-90 latitude: dry all year (sinking zone)
    const latitudeModifier = [4, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 1, 1, 1, 0.5];
    const MAX_PASSABLE_ELEVATION = 85;

    // define wind directions based on cells latitude and prevailing winds there
    d3.range(0, cells.i.length, cellsX).forEach(function (c, i) {
      const lat = mapCoordinates.latN - (i / cellsY) * mapCoordinates.latT;
      const latBand = ((Math.abs(lat) - 1) / 5) | 0;
      const latMod = latitudeModifier[latBand];
      const windTier = (Math.abs(lat - 89) / 30) | 0; // 30d tiers from 0 to 5 from N to S
      const {isWest, isEast, isNorth, isSouth} = getWindDirections(windTier);

      if (isWest) westerly.push([c, latMod, windTier]);
      if (isEast) easterly.push([c + cellsX - 1, latMod, windTier]);
      if (isNorth) northerly++;
      if (isSouth) southerly++;
    });

    // distribute winds by direction
    if (westerly.length) passWind(westerly, 120 * modifier, 1, cellsX);
    if (easterly.length) passWind(easterly, 120 * modifier, -1, cellsX);

    const vertT = southerly + northerly;
    if (northerly) {
      const bandN = ((Math.abs(mapCoordinates.latN) - 1) / 5) | 0;
      const latModN = mapCoordinates.latT > 60 ? d3.mean(latitudeModifier) : latitudeModifier[bandN];
      const maxPrecN = (northerly / vertT) * 60 * modifier * latModN;
      passWind(d3.range(0, cellsX, 1), maxPrecN, cellsX, cellsY);
    }

    if (southerly) {
      const bandS = ((Math.abs(mapCoordinates.latS) - 1) / 5) | 0;
      const latModS = mapCoordinates.latT > 60 ? d3.mean(latitudeModifier) : latitudeModifier[bandS];
      const maxPrecS = (southerly / vertT) * 60 * modifier * latModS;
      passWind(d3.range(cells.i.length - cellsX, cells.i.length, 1), maxPrecS, -cellsX, cellsY);
    }

    function getWindDirections(tier) {
      const angle = options.winds[tier];

      const isWest = angle > 40 && angle < 140;
      const isEast = angle > 220 && angle < 320;
      const isNorth = angle > 100 && angle < 260;
      const isSouth = angle > 280 || angle < 80;

      return {isWest, isEast, isNorth, isSouth};
    }

    function passWind(source, maxPrec, next, steps) {
      const maxPrecInit = maxPrec;

      for (let first of source) {
        if (first[0]) {
          maxPrec = Math.min(maxPrecInit * first[1], 255);
          first = first[0];
        }

        let humidity = maxPrec - cells.h[first]; // initial water amount
        if (humidity <= 0) continue; // if first cell in row is too elevated consider wind dry

        for (let s = 0, current = first; s < steps; s++, current += next) {
          if (cells.temp[current] < -5) continue; // no flux in permafrost

          if (cells.h[current] < 20) {
            // water cell
            if (cells.h[current + next] >= 20) {
              cells.prec[current + next] += Math.max(humidity / rand(10, 20), 1); // coastal precipitation
            } else {
              humidity = Math.min(humidity + 5 * modifier, maxPrec); // wind gets more humidity passing water cell
              cells.prec[current] += 5 * modifier; // water cells precipitation (need to correctly pour water through lakes)
            }
            continue;
          }

          // land cell
          const isPassable = cells.h[current + next] <= MAX_PASSABLE_ELEVATION;
          const precipitation = isPassable ? getPrecipitation(humidity, current, next) : humidity;
          cells.prec[current] += precipitation;
          const evaporation = precipitation > 1.5 ? 1 : 0; // some humidity evaporates back to the atmosphere
          humidity = isPassable ? minmax(humidity - precipitation + evaporation, 0, maxPrec) : 0;
        }
      }
    }

    function getPrecipitation(humidity, i, n) {
      const normalLoss = Math.max(humidity / (10 * modifier), 1); // precipitation in normal conditions
      const diff = Math.max(cells.h[i + n] - cells.h[i], 0); // difference in height
      const mod = (cells.h[i + n] / 70) ** 2; // 50 stands for hills, 70 for mountains
      return minmax(normalLoss + diff * mod, 1, humidity);
    }

    void (function drawWindDirection() {
      const wind = prec.append("g").attr("id", "wind");

      d3.range(0, 6).forEach(function (t) {
        if (westerly.length > 1) {
          const west = westerly.filter(w => w[2] === t);
          if (west && west.length > 3) {
            const from = west[0][0],
              to = west[west.length - 1][0];
            const y = (grid.points[from][1] + grid.points[to][1]) / 2;
            wind.append("text").attr("text-rendering", "optimizeSpeed").attr("x", 20).attr("y", y).text("\u21C9");
          }
        }
        if (easterly.length > 1) {
          const east = easterly.filter(w => w[2] === t);
          if (east && east.length > 3) {
            const from = east[0][0],
              to = east[east.length - 1][0];
            const y = (grid.points[from][1] + grid.points[to][1]) / 2;
            wind
              .append("text")
              .attr("text-rendering", "optimizeSpeed")
              .attr("x", graphWidth - 52)
              .attr("y", y)
              .text("\u21C7");
          }
        }
      });

      if (northerly)
        wind
          .append("text")
          .attr("text-rendering", "optimizeSpeed")
          .attr("x", graphWidth / 2)
          .attr("y", 42)
          .text("\u21CA");
      if (southerly)
        wind
          .append("text")
          .attr("text-rendering", "optimizeSpeed")
          .attr("x", graphWidth / 2)
          .attr("y", graphHeight - 20)
          .text("\u21C8");
    })();

    FMG.Utils.Logger.timeEnd("generatePrecipitation");
  } catch (error) {
    FMG.Utils.Error.handleCalculationError(error, "generatePrecipitation");
    throw error; // Re-throw to prevent silent failures
  }
}

// recalculate Voronoi Graph to pack cells
function reGraph() {
  try {
    FMG.Utils.Logger.time("reGraph");
    const {cells: gridCells, points, features} = grid;
    const newCells = {p: [], g: [], h: []}; // store new data
    const spacing2 = grid.spacing ** 2;

    for (const i of gridCells.i) {
      const height = gridCells.h[i];
      const type = gridCells.t[i];

      if (height < FMG.Config.Map.MIN_LAND_HEIGHT && type !== -1 && type !== -2) continue; // exclude all deep ocean points
      if (type === -2 && (i % 4 === 0 || features[gridCells.f[i]].type === "lake")) continue; // exclude non-coastal lake points

      const [x, y] = points[i];
      addNewPoint(i, x, y, height);

      // add additional points for cells along coast
      if (type === 1 || type === -1) {
        if (gridCells.b[i]) continue; // not for near-border cells
        gridCells.c[i].forEach(function (e) {
          if (i > e) return;
          if (gridCells.t[e] === type) {
            const dist2 = (y - points[e][1]) ** 2 + (x - points[e][0]) ** 2;
            if (dist2 < spacing2) return; // too close to each other
            const x1 = rn((x + points[e][0]) / 2, 1);
            const y1 = rn((y + points[e][1]) / 2, 1);
            addNewPoint(i, x1, y1, height);
          }
        });
      }
    }

    function addNewPoint(i, x, y, height) {
      newCells.p.push([x, y]);
      newCells.g.push(i);
      newCells.h.push(height);
    }

    const {cells: packCells, vertices} = calculateVoronoi(newCells.p, grid.boundary);
    pack.vertices = vertices;
    pack.cells = packCells;
    pack.cells.p = newCells.p;
    pack.cells.g = createTypedArray({maxValue: grid.points.length, from: newCells.g});
    pack.cells.q = d3.quadtree(newCells.p.map(([x, y], i) => [x, y, i]));
    pack.cells.h = createTypedArray({maxValue: 100, from: newCells.h});
    pack.cells.area = createTypedArray({maxValue: UINT16_MAX, length: packCells.i.length}).map((_, cellId) => {
      const area = Math.abs(d3.polygonArea(getPackPolygon(cellId)));
      return Math.min(area, UINT16_MAX);
    });

    FMG.Utils.Logger.timeEnd("reGraph");
  } catch (error) {
    FMG.Utils.Error.handleCalculationError(error, "reGraph");
    throw error; // Re-throw to prevent silent failures
  }
}

function isWetLand(moisture, temperature, height) {
  const {WET_LAND_MOISTURE_THRESHOLD_COAST, WET_LAND_MOISTURE_THRESHOLD_OFF_COAST, 
         WET_LAND_TEMPERATURE_THRESHOLD, WET_LAND_HEIGHT_THRESHOLD_COAST,
         WET_LAND_HEIGHT_MIN_OFF_COAST, WET_LAND_HEIGHT_MAX_OFF_COAST} = FMG.Config.Map;
  
  if (moisture > WET_LAND_MOISTURE_THRESHOLD_COAST && 
      temperature > WET_LAND_TEMPERATURE_THRESHOLD && 
      height < WET_LAND_HEIGHT_THRESHOLD_COAST) return true; //near coast
  if (moisture > WET_LAND_MOISTURE_THRESHOLD_OFF_COAST && 
      temperature > WET_LAND_TEMPERATURE_THRESHOLD && 
      height > WET_LAND_HEIGHT_MIN_OFF_COAST && 
      height < WET_LAND_HEIGHT_MAX_OFF_COAST) return true; //off coast
  return false;
}

// assess cells suitability to calculate population and rand cells for culture center and burgs placement
function rankCells() {
  try {
    FMG.Utils.Logger.time("rankCells");
    const {cells, features} = pack;
    cells.s = new Int16Array(cells.i.length); // cell suitability array
    cells.pop = new Float32Array(cells.i.length); // cell population array

    const flMean = d3.median(cells.fl.filter(f => f)) || 0;
    const flMax = d3.max(cells.fl) + d3.max(cells.conf); // to normalize flux
    const areaMean = d3.mean(cells.area); // to adjust population by cell area

    for (const i of cells.i) {
      if (cells.h[i] < 20) continue; // no population in water
      let s = +biomesData.habitability[cells.biome[i]]; // base suitability derived from biome habitability
      if (!s) continue; // uninhabitable biomes has 0 suitability
      if (flMean) s += normalize(cells.fl[i] + cells.conf[i], flMean, flMax) * 250; // big rivers and confluences are valued
      s -= (cells.h[i] - 50) / 5; // low elevation is valued, high is not;

      if (cells.t[i] === 1) {
        if (cells.r[i]) s += 15; // estuary is valued
        const feature = features[cells.f[cells.haven[i]]];
        if (feature.type === "lake") {
          if (feature.group === "freshwater") s += 30;
          else if (feature.group == "salt") s += 10;
          else if (feature.group == "frozen") s += 1;
          else if (feature.group == "dry") s -= 5;
          else if (feature.group == "sinkhole") s -= 5;
          else if (feature.group == "lava") s -= 30;
        } else {
          s += 5; // ocean coast is valued
          if (cells.harbor[i] === 1) s += 20; // safe sea harbor is valued
        }
      }

      cells.s[i] = s / 5; // general population rate
      // cell rural population is suitability adjusted by cell area
      cells.pop[i] = cells.s[i] > 0 ? (cells.s[i] * cells.area[i]) / areaMean : 0;
    }

    FMG.Utils.Logger.timeEnd("rankCells");
  } catch (error) {
    FMG.Utils.Error.handleCalculationError(error, "rankCells");
    throw error; // Re-throw to prevent silent failures
  }
}

// show map stats on generation complete
function showStatistics() {
  const heightmap = byId("templateInput").value;
  const isTemplate = heightmap in heightmapTemplates;
  const heightmapType = isTemplate ? "template" : "precreated";
  const isRandomTemplate = isTemplate && !locked("template") ? "random " : "";

  const stats = `  Seed: ${seed}
    Canvas size: ${graphWidth}x${graphHeight} px
    Heightmap: ${heightmap}
    Template: ${isRandomTemplate}${heightmapType}
    Points: ${grid.points.length}
    Cells: ${pack.cells.i.length}
    Map size: ${mapSizeOutput.value}%
    States: ${pack.states.length - 1}
    Provinces: ${pack.provinces.length - 1}
    Burgs: ${pack.burgs.length - 1}
    Religions: ${pack.religions.length - 1}
    Culture set: ${culturesSet.value}
    Cultures: ${pack.cultures.length - 1}`;

  mapId = Date.now(); // unique map id is it's creation date number
  mapHistory.push({seed, width: graphWidth, height: graphHeight, template: heightmap, created: mapId});
  INFO && console.info(stats);
}

const regenerateMap = debounce(async function (options) {
  FMG.Utils.Logger.warn("Generate new random map");

  const cellsDesired = +byId("pointsInput").dataset.cells;
  const shouldShowLoading = cellsDesired > FMG.Config.Map.LARGE_MAP_CELL_THRESHOLD;
  shouldShowLoading && showLoading();

  closeDialogs("#worldConfigurator, #options3d");
  customization = 0;
  resetZoom(1000);
  undraw();
  await generate(options);
  drawLayers();
  if (ThreeD.options.isOn) ThreeD.redraw();
  if ($("#worldConfigurator").is(":visible")) editWorld();

  fitMapToScreen();
  shouldShowLoading && hideLoading();
  clearMainTip();
}, FMG.Config.Map.DEFAULT_DEBOUNCE_DELAY);

// clear the map
function undraw() {
  viewbox
    .selectAll("path, circle, polygon, line, text, use, #texture > image, #zones > g, #armies > g, #ruler > g")
    .remove();
  byId("deftemp")
    .querySelectorAll("path, clipPath, svg")
    .forEach(el => el.remove());
  byId("coas").innerHTML = ""; // remove auto-generated emblems
  notes = [];
  unfog();
}
