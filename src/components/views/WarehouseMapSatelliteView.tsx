import React, { useState, useEffect, useRef } from 'react';
import { Warehouse, InventoryItem } from '../../types';
import { api } from '../../services/api';
import { LOGI_MASCOT } from '../../assets/mascot';
import { InsideWarehouseModal } from '../warehouse/InsideWarehouseModal';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  Search, 
  Compass, 
  Building, 
  Truck, 
  Thermometer, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  Eye, 
  Clock, 
  Zap, 
  Maximize2,
  Filter,
  Globe,
  Crosshair
} from 'lucide-react';
import L from 'leaflet';

interface WarehouseMapSatelliteViewProps {
  onSelectWarehouse?: (wh: Warehouse) => void;
  onBookSpace?: (wh: Warehouse) => void;
}

// Preset Indian Startup Hubs for quick distance calculation
const PRESET_COMPANY_LOCATIONS = [
  { name: 'Bengaluru (Koramangala / Indiranagar)', city: 'Bengaluru', state: 'Karnataka', coords: [12.9352, 77.6245] as [number, number] },
  { name: 'Mumbai (Bandra Kurla Complex - BKC)', city: 'Mumbai', state: 'Maharashtra', coords: [19.0664, 72.8687] as [number, number] },
  { name: 'Gurugram (Cyber City / Golf Course Rd)', city: 'Gurugram', state: 'Haryana', coords: [28.4952, 77.0895] as [number, number] },
  { name: 'Hyderabad (Hitec City / Gachibowli)', city: 'Hyderabad', state: 'Telangana', coords: [17.4435, 78.3772] as [number, number] },
  { name: 'Chennai (OMR IT Corridor)', city: 'Chennai', state: 'Tamil Nadu', coords: [12.9815, 80.2180] as [number, number] },
  { name: 'Pune (Hinjewadi Tech Park)', city: 'Pune', state: 'Maharashtra', coords: [18.5912, 73.7389] as [number, number] },
  { name: 'Kolkata (Salt Lake Sector V)', city: 'Kolkata', state: 'West Bengal', coords: [22.5804, 88.4378] as [number, number] },
  { name: 'Ahmedabad (SG Highway)', city: 'Ahmedabad', state: 'Gujarat', coords: [23.0338, 72.5085] as [number, number] },
  { name: 'Jaipur (Malviya Nagar)', city: 'Jaipur', state: 'Rajasthan', coords: [26.8528, 75.8236] as [number, number] },
  { name: 'Kochi (Infopark Kakkanad)', city: 'Kochi', state: 'Kerala', coords: [10.0159, 76.3639] as [number, number] },
];

// Calculate Haversine Distance in Kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const WarehouseMapSatelliteView: React.FC<WarehouseMapSatelliteViewProps> = ({
  onSelectWarehouse,
  onBookSpace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const companyMarkerRef = useRef<L.Marker | null>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Map Tile Layers: 'satellite' | 'street' | 'dark'
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street' | 'dark'>('satellite');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Selected Company / Search Location
  const [selectedCompanyLoc, setSelectedCompanyLoc] = useState(PRESET_COMPANY_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCoords, setCustomCoords] = useState<[number, number] | null>(null);

  // Closest Warehouse Analysis
  const [rankedWarehouses, setRankedWarehouses] = useState<Array<Warehouse & { distanceKm: number; transitSla: string; estRateInr: number }>>([]);
  const [selectedWarehouseForInside, setSelectedWarehouseForInside] = useState<Warehouse | null>(null);

  // Filter toggles
  const [filterColdChain, setFilterColdChain] = useState(false);
  const [filterHazmat, setFilterHazmat] = useState(false);

  // Mascot speech message
  const [mascotTip, setMascotTip] = useState<string>(
    "Hi there! I'm Logi, your Smart Warehouse Assistant! Choose your company location or click any warehouse marker to step inside and view the racks!"
  );

  // Fetch warehouses on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whRes, invRes] = await Promise.all([
        api.getWarehouses(),
        api.getInventory().catch(() => ({ total: 0, items: [] })),
      ]);
      setWarehouses(whRes.data);
      setInventory(invRes.items || []);
    } catch (err) {
      console.error('Error fetching map data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-calculate proximity rankings when company location or filters change
  useEffect(() => {
    if (warehouses.length === 0) return;

    const userCoords = customCoords || selectedCompanyLoc.coords;

    let filtered = [...warehouses];
    if (filterColdChain) filtered = filtered.filter(w => w.temperatureControlled);
    if (filterHazmat) filtered = filtered.filter(w => w.hazmatCertified);

    const ranked = filtered.map((wh) => {
      const dist = calculateDistanceKm(userCoords[0], userCoords[1], wh.coordinates[0], wh.coordinates[1]);
      
      // Compute realistic Indian logistics SLA based on road/air network
      let transitSla = '2-3 Business Days';
      let estRateInr = 120;

      if (dist <= 60) {
        transitSla = 'Same-Day QuickCommerce (2-4 Hrs)';
        estRateInr = 65;
      } else if (dist <= 350) {
        transitSla = 'Next-Day Guaranteed (12-18 Hrs)';
        estRateInr = 95;
      } else if (dist <= 900) {
        transitSla = 'Express Direct (24-36 Hrs)';
        estRateInr = 135;
      } else {
        transitSla = 'Pan-India Air/Surface (48 Hrs)';
        estRateInr = 165;
      }

      return {
        ...wh,
        distanceKm: dist,
        transitSla,
        estRateInr,
      };
    });

    // Sort by nearest distance
    ranked.sort((a, b) => a.distanceKm - b.distanceKm);
    setRankedWarehouses(ranked);

    if (ranked.length > 0) {
      const nearest = ranked[0];
      setMascotTip(
        `Beep boop! The closest facility to ${selectedCompanyLoc.name} is ${nearest.name} (${nearest.code}), only ${nearest.distanceKm} km away with ${nearest.transitSla}! Click 'Step Inside' to inspect live racks.`
      );
    }
  }, [warehouses, selectedCompanyLoc, customCoords, filterColdChain, filterHazmat]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center of India
    const initialCenter: [number, number] = [21.5937, 78.9629];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 5,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Apply tile layer
    updateTileLayer(map, mapLayer);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map tile layers
  const updateTileLayer = (map: L.Map, layerType: 'satellite' | 'street' | 'dark') => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let attribution = '';

    if (layerType === 'satellite') {
      // High-resolution Esri World Imagery
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (layerType === 'dark') {
      // CartoDB Dark Matter
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    } else {
      // OpenStreetMap / Carto Voyager
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    }

    const newTileLayer = L.tileLayer(url, {
      maxZoom: 19,
      attribution,
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  };

  // Change tile layer when toggle changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, mapLayer);
    }
  }, [mapLayer]);

  // Render warehouse markers & company origin marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || warehouses.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (companyMarkerRef.current) {
      map.removeLayer(companyMarkerRef.current);
      companyMarkerRef.current = null;
    }

    const userCoords = customCoords || selectedCompanyLoc.coords;

    // Create Company Origin Marker
    const companyIcon = L.divIcon({
      className: 'company-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-bold">
            🏢
          </div>
          <div class="absolute -bottom-6 bg-slate-950/90 text-blue-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-blue-500/40">
            YOUR FACILITY
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const compMarker = L.marker(userCoords, { icon: companyIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-2 text-slate-900 font-sans text-xs">
          <strong class="text-blue-600 block">${selectedCompanyLoc.name}</strong>
          <span class="text-slate-500 text-[10px]">Active Company Origin for Proximity Analysis</span>
        </div>
      `);
    companyMarkerRef.current = compMarker;

    // Add Warehouse Pins
    let visibleWarehouses = [...warehouses];
    if (filterColdChain) visibleWarehouses = visibleWarehouses.filter(w => w.temperatureControlled);
    if (filterHazmat) visibleWarehouses = visibleWarehouses.filter(w => w.hazmatCertified);

    visibleWarehouses.forEach((wh) => {
      const occupancy = Math.round((wh.usedCapacitySqFt / wh.totalCapacitySqFt) * 100);
      const isNearest = rankedWarehouses.length > 0 && rankedWarehouses[0].id === wh.id;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'warehouse-custom-pin',
        html: `
          <div class="relative group cursor-pointer">
            ${isNearest ? '<div class="absolute -inset-1.5 rounded-full bg-emerald-400/60 animate-ping"></div>' : ''}
            <div class="w-10 h-10 rounded-xl ${
              isNearest ? 'bg-emerald-600 border-2 border-emerald-300' : 'bg-slate-900 border-2 border-orange-500'
            } shadow-2xl flex flex-col items-center justify-center text-white font-bold transition-transform hover:scale-110">
              <span class="text-[13px] leading-none">🏭</span>
              <span class="text-[8px] font-mono leading-tight ${isNearest ? 'text-emerald-100' : 'text-orange-300'}">${wh.code.slice(0, 3)}</span>
            </div>
            
            <div class="absolute -top-2 -right-2 px-1.5 py-0.2 bg-slate-950 text-white font-mono text-[8px] font-bold rounded-full border border-slate-700 shadow">
              ${occupancy}%
            </div>
            
            <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-950/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
              ${wh.code}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker(wh.coordinates, { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div class="p-3 font-sans text-slate-900 min-w-[240px] space-y-2">
          <div class="flex items-center justify-between border-b pb-1.5">
            <span class="font-mono font-bold text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">${wh.code}</span>
            <span class="text-[10px] text-green-700 font-bold uppercase">● Active Hub</span>
          </div>
          <div>
            <h4 class="font-bold text-xs text-slate-900 leading-snug">${wh.name}</h4>
            <p class="text-[10px] text-slate-500">${wh.location}</p>
          </div>
          <div class="bg-slate-50 p-2 rounded border text-[11px] space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Utilization:</span>
              <strong class="font-mono">${occupancy}% (${(wh.usedCapacitySqFt/1000).toFixed(0)}k / ${(wh.totalCapacitySqFt/1000).toFixed(0)}k sq ft)</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Pick Rate:</span>
              <strong class="font-mono text-blue-600">${wh.hourlyPickRate} units/hr</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Rate:</span>
              <strong class="font-mono">₹${wh.monthlyBaseRatePerSqFt}/sq ft/mo</strong>
            </div>
          </div>
          <div class="flex flex-wrap gap-1 text-[9px]">
            ${wh.temperatureControlled ? '<span class="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">Cold-Chain +4°C</span>' : ''}
            ${wh.hazmatCertified ? '<span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-medium">Hazmat Drone Vault</span>' : ''}
          </div>
          <div class="pt-2 flex flex-col gap-1.5">
            <button
              id="btn-inside-${wh.id}"
              class="w-full py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center space-x-1"
            >
              <span>🚀 Step Inside Warehouse</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Listen for popup open to bind button click
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inside-${wh.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedWarehouseForInside(wh);
            marker.closePopup();
          };
        }
      });

      // Direct click opens inside warehouse
      marker.on('click', () => {
        setMascotTip(
          `Inspecting ${wh.name} (${wh.code})! It has ${wh.totalBays - wh.occupiedBays} open bays available. Click 'Step Inside' in the popup or below to see the 3D rack floorplan!`
        );
      });

      markersRef.current.push(marker);
    });

    // Draw route line to closest warehouse
    if (rankedWarehouses.length > 0) {
      const nearestWh = rankedWarehouses[0];
      const routeLine = L.polyline([userCoords, nearestWh.coordinates], {
        color: '#10b981',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      routeLineRef.current = routeLine;
    }

  }, [warehouses, rankedWarehouses, selectedCompanyLoc, customCoords, filterColdChain, filterHazmat]);

  // Quick Fly to Location
  const flyToLocation = (coords: [number, number], zoom = 10) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, {
        duration: 1.4,
      });
    }
  };

  const handleSelectCompanyHub = (loc: typeof PRESET_COMPANY_LOCATIONS[0]) => {
    setSelectedCompanyLoc(loc);
    setCustomCoords(null);
    flyToLocation(loc.coords, 9);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const userCoords: [number, number] = [lat, lon];
          setCustomCoords(userCoords);
          setSelectedCompanyLoc({
            name: 'Your Real-Time GPS Location',
            city: 'Current Location',
            state: 'India',
            coords: userCoords,
          });
          flyToLocation(userCoords, 10);
        },
        (err) => {
          alert('Could not retrieve geolocation. Using default Indian hub.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header Banner with Mascot Companion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Mascot & Title */}
        <div className="flex items-center space-x-4 relative z-10">
          <div className="relative group shrink-0">
            <img
              src={LOGI_MASCOT.avatar}
              alt="Logi Mascot"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-xl shadow-orange-500/20"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-emerald-500 text-[9px] text-slate-950 font-bold uppercase rounded-full border border-slate-900">
              LIVE
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded">
                PAN-INDIA LOGISTICS GRID
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Real-Time Satellite Orbit</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white flex items-center space-x-2">
              <span>Find Closest Warehouses & Digital Twin Explorer</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Locate high-throughput bonded 3PL fulfillment hubs near your factory or startup headquarters. Click any warehouse pin to step inside and view real-time rack occupancy.
            </p>
          </div>
        </div>

        {/* Mascot Dynamic Guidance Bubble */}
        <div className="bg-slate-950/80 border border-orange-500/30 rounded-xl p-3.5 max-w-md w-full text-xs text-slate-200 relative z-10 shadow-lg flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="font-bold text-orange-400 block text-[11px]">Logi AI Proximity Advisor:</span>
            <p className="text-slate-300 italic text-[11px] leading-relaxed">
              {mascotTip}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Control Sidebar + Satellite Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Proximity Engine & Closest Facility List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Location Selector Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Your Company Location</span>
              </div>
              <button
                onClick={handleUseCurrentLocation}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors border border-blue-200"
              >
                <Crosshair className="w-3 h-3" />
                <span>GPS Location</span>
              </button>
            </div>

            {/* Quick Hub Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Select Startup City / Region:
              </label>
              <select
                value={selectedCompanyLoc.name}
                onChange={(e) => {
                  const found = PRESET_COMPANY_LOCATIONS.find(p => p.name === e.target.value);
                  if (found) handleSelectCompanyHub(found);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {PRESET_COMPANY_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            <div className="pt-1 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setFilterColdChain(!filterColdChain)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all border ${
                  filterColdChain
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                <span>Cold-Chain (+4°C)</span>
              </button>

              <button
                onClick={() => setFilterHazmat(!filterHazmat)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all border ${
                  filterHazmat
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hazmat Drone Vault</span>
              </button>
            </div>

          </div>

          {/* Ranked Nearest Warehouses List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Closest Warehouses to You ({rankedWarehouses.length})
              </span>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">Auto-Ranked</span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {rankedWarehouses.map((wh, index) => {
                const isClosest = index === 0;
                const occupancy = Math.round((wh.usedCapacitySqFt / wh.totalCapacitySqFt) * 100);

                return (
                  <div
                    key={wh.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      isClosest
                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                            isClosest 
                              ? 'bg-emerald-600 text-white border-emerald-600' 
                              : 'bg-slate-200 text-slate-800 border-slate-300'
                          }`}>
                            {wh.code}
                          </span>
                          {isClosest && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase rounded-full">
                              ⭐ Closest Hub
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">{wh.name}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{wh.location}</p>
                      </div>

                      {/* Distance Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold font-mono text-blue-700 block">
                          {wh.distanceKm} km
                        </span>
                        <span className="text-[9px] text-slate-400 block font-medium">Road Distance</span>
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">Transit SLA:</span>
                        <span className="font-bold text-slate-800">{wh.transitSla}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Base Freight Est:</span>
                        <span className="font-mono font-bold text-emerald-600">₹{wh.estRateInr}/kg base</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => {
                          flyToLocation(wh.coordinates, 12);
                          setSelectedWarehouseForInside(wh);
                        }}
                        className="flex-1 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Step Inside Warehouse</span>
                      </button>

                      <button
                        onClick={() => flyToLocation(wh.coordinates, 13)}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs"
                        title="Fly to location on Map"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right Side: Leaflet Satellite Map Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[650px] relative">
            
            {/* Map Top Overlay Controls */}
            <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-3 px-4 flex items-center justify-between z-20 flex-wrap gap-2">
              
              {/* Satellite Feed Indicator */}
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  SATELLITE ORBIT VIEW • HIGH-RES RESOLUTION
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Pan-India Smart Grid</span>
              </div>

              {/* Map Layer Toggles */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMapLayer('satellite')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapLayer === 'satellite'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛰️ Satellite
                </button>
                <button
                  onClick={() => setMapLayer('street')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapLayer === 'street'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🗺️ Tactical Roads
                </button>
                <button
                  onClick={() => setMapLayer('dark')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapLayer === 'dark'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌙 Cyber Dark
                </button>
              </div>

            </div>

            {/* Leaflet Map Stage */}
            <div className="flex-1 w-full h-full relative" ref={mapContainerRef}>
              {/* Fallback loader */}
              {loading && (
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-white text-xs z-30">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-5 h-5 animate-spin text-orange-400" />
                    <span>Synchronizing Satellite Telemetry Feed...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Map Quick Stats Bar */}
            <div className="bg-slate-950/95 border-t border-slate-800 p-3 px-4 flex items-center justify-between text-xs text-slate-300 z-20 flex-wrap gap-2 font-mono">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1 text-slate-400">
                  <Building className="w-3.5 h-3.5 text-orange-400" />
                  <span>{warehouses.length} Active Hubs Nationwide</span>
                </span>
                <span className="flex items-center space-x-1 text-slate-400">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Delhivery • Blue Dart • Shadowfax Integrated</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Click any <strong className="text-orange-400">🏭 Warehouse Pin</strong> to inspect interior racks
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Inside the Warehouse Modal (Digital Twin) */}
      {selectedWarehouseForInside && (
        <InsideWarehouseModal
          warehouse={selectedWarehouseForInside}
          inventory={inventory}
          onClose={() => setSelectedWarehouseForInside(null)}
          onBookSpace={onBookSpace}
        />
      )}

    </div>
  );
};
