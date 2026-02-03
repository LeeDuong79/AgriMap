
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FarmProduct } from '../types';
import { MapPin, Phone, Star, Award, ExternalLink, Navigation, Layers, Globe, Moon, Mountain } from 'lucide-react';

interface MapInterfaceProps {
  products: FarmProduct[];
  isFarmerView?: boolean;
}

const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }
};

const MapInterface: React.FC<MapInterfaceProps> = ({ products, isFarmerView = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const layerRef = useRef<L.TileLayer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FarmProduct | null>(null);
  const [activeLayer, setActiveLayer] = useState<keyof typeof TILE_LAYERS>('standard');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [15.8, 108.2],
        zoom: 6,
        zoomControl: false
      });

      layerRef.current = L.tileLayer(TILE_LAYERS[activeLayer].url, {
        attribution: TILE_LAYERS[activeLayer].attribution
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }
  }, []);

  // Handle Layer Switching
  useEffect(() => {
    if (mapRef.current && layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
      layerRef.current = L.tileLayer(TILE_LAYERS[activeLayer].url, {
        attribution: TILE_LAYERS[activeLayer].attribution
      }).addTo(mapRef.current);
    }
  }, [activeLayer]);

  // Handle Markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    
    const createIcon = (color = '#15803d') => L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${color};" class="p-2 rounded-full border-2 border-white shadow-xl transform hover:scale-125 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 9.5a7 7 0 0 1-7 7c-2 0-3-1-3-1"/><path d="M11 20s-1 1.5-3.5 1.5-4.5-1.5-4.5-5 4-5 4-5"/></svg>
            </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    products.forEach(p => {
      const marker = L.marker([p.location.lat, p.location.lng], { icon: createIcon() })
        .addTo(mapRef.current!)
        .on('click', () => setSelectedProduct(p));
      markersRef.current.push(marker);
    });
  }, [products]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
          
          // Temporary marker for user location
          const userIcon = L.divIcon({
            className: 'user-location-icon',
            html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-ping"></div>`,
            iconSize: [16, 16]
          });
          L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Không thể lấy vị trí của bạn. Vui lòng cấp quyền truy cập.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full h-full bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Top Controls Overlay */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-none">
        {/* Layer Switcher */}
        <div className="flex bg-white border-4 border-black p-1.5 rounded-2xl shadow-xl pointer-events-auto">
          <button 
            onClick={() => setActiveLayer('standard')}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-xs uppercase ${activeLayer === 'standard' ? 'bg-black text-white' : 'hover:bg-slate-100 text-black'}`}
            title="Bản đồ chuẩn"
          >
            <Layers size={18} />
            <span className="hidden sm:inline">Chuẩn</span>
          </button>
          <button 
            onClick={() => setActiveLayer('satellite')}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-xs uppercase ${activeLayer === 'satellite' ? 'bg-black text-white' : 'hover:bg-slate-100 text-black'}`}
            title="Vệ tinh"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">Vệ tinh</span>
          </button>
          <button 
            onClick={() => setActiveLayer('dark')}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-xs uppercase ${activeLayer === 'dark' ? 'bg-black text-white' : 'hover:bg-slate-100 text-black'}`}
            title="Chế độ tối"
          >
            <Moon size={18} />
            <span className="hidden sm:inline">Tối</span>
          </button>
          <button 
            onClick={() => setActiveLayer('terrain')}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-xs uppercase ${activeLayer === 'terrain' ? 'bg-black text-white' : 'hover:bg-slate-100 text-black'}`}
            title="Địa hình"
          >
            <Mountain size={18} />
            <span className="hidden sm:inline">Địa hình</span>
          </button>
        </div>

        {/* My Location Button */}
        <button 
          onClick={handleMyLocation}
          disabled={isLocating}
          className={`bg-white border-4 border-black p-4 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all flex items-center gap-3 font-black text-black pointer-events-auto active:scale-95 ${isLocating ? 'opacity-50' : ''}`}
        >
          <Navigation size={24} className={`${isLocating ? 'animate-spin' : 'text-blue-700'}`} />
          {isLocating ? 'ĐANG ĐỊNH VỊ...' : 'VỊ TRÍ CỦA TÔI'}
        </button>
      </div>

      {selectedProduct && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-[1000] animate-in slide-in-from-bottom-12">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-black overflow-hidden">
            <div className="relative h-56">
              <img src={selectedProduct.images.product[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-black text-white p-2 rounded-full transition-all shadow-lg hover:bg-red-700"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="absolute bottom-4 left-4">
                 <span className="bg-black text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/20">Mã PUC: {selectedProduct.regionCode}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-4">
                <h3 className="text-3xl font-black text-black leading-none mb-1 uppercase tracking-tighter">{selectedProduct.name}</h3>
                <p className="text-xl text-green-800 font-black">{selectedProduct.farmerName}</p>
              </div>

              <div className="flex items-center gap-2 text-slate-900 text-lg font-bold mb-6">
                <MapPin size={22} className="text-red-700 shrink-0" />
                <span className="truncate">{selectedProduct.location.address}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedProduct.certificates.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-green-50 border-2 border-green-700 px-4 py-1.5 rounded-xl">
                    <Award size={16} className="text-green-800" />
                    <span className="text-xs font-black text-green-900 uppercase">{c.type}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <a 
                  href={`tel:${selectedProduct.contact}`}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-black text-xl text-center flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 border-b-4 border-green-900"
                >
                  <Phone size={24} />
                  LIÊN HỆ
                </a>
                <button className="p-4 bg-white border-4 border-black rounded-2xl hover:bg-slate-50 transition-all text-black shadow-lg active:scale-95">
                  <ExternalLink size={28} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapInterface;
