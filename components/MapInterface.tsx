
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FarmProduct } from '../types';
import { MapPin, Phone, Star, Award, ExternalLink, Navigation } from 'lucide-react';

interface MapInterfaceProps {
  products: FarmProduct[];
  isFarmerView?: boolean;
}

const MapInterface: React.FC<MapInterfaceProps> = ({ products, isFarmerView = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FarmProduct | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [15.8, 108.2],
        zoom: 6,
        zoomControl: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }
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
      // Highlight farmer's own product if needed (logic can be added)
      const marker = L.marker([p.location.lat, p.location.lng], { icon: createIcon() })
        .addTo(mapRef.current!)
        .on('click', () => setSelectedProduct(p));
      markersRef.current.push(marker);
    });
  }, [products]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Floating UI Elements */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
        <button className="bg-white border-4 border-black p-4 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all flex items-center gap-3 font-black text-black">
          <Navigation size={24} className="text-blue-700" />
          VỊ TRÍ CỦA TÔI
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
