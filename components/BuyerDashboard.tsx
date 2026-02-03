
import React, { useState } from 'react';
import { FarmProduct, BuyerUser, CertType } from '../types';
import { Search, Filter, ShoppingBag, MapPin, Award, CheckCircle, ChevronRight, Star, ArrowRight, ShieldCheck, Info, X } from 'lucide-react';

interface BuyerDashboardProps {
  products: FarmProduct[];
  user: BuyerUser;
  onSearch: (query: string) => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ products, user, onSearch }) => {
  const [selectedProduct, setSelectedProduct] = useState<FarmProduct | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Trái cây', 'Rau củ', 'Lúa gạo', 'Thủy sản'];

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      {/* Header / Hero */}
      <div className="bg-green-700 p-8 rounded-b-[3.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Chào mừng trở lại,</p>
              <h1 className="text-3xl font-black tracking-tighter uppercase">{user.fullName}</h1>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo sản phẩm hoặc mã PUC..." 
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white/20 focus:border-white transition-all font-bold placeholder:text-white/40"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <ShieldCheck size={200} />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="mt-8 px-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2.5 rounded-full font-black text-xs uppercase transition-all shrink-0 border-2 ${
                activeFilter === cat ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-slate-500 border-slate-100'
              }`}
            >
              {cat === 'All' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured / Verified Badge */}
      <div className="mt-8 px-6">
        <div className="bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-6">
          <div className="bg-green-100 p-4 rounded-3xl text-green-700 shrink-0">
            <Award size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tighter">SẢN PHẨM CHỨNG NHẬN OCOP</h3>
            <p className="text-xs font-bold text-slate-500 uppercase italic">100% Nguồn gốc từ các hợp tác xã được bảo hộ.</p>
          </div>
          <ArrowRight className="ml-auto text-black" size={24} />
        </div>
      </div>

      {/* Product Feed */}
      <div className="mt-10 px-6 space-y-8">
        <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Khám phá Nông sản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="bg-white border-2 border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="relative h-56">
                <img src={p.images.product[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {p.certificates.map((c, i) => (
                    <span key={i} className="bg-black/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border border-white/20">
                      {c.type}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-black text-black">{p.rating || 'Mới'}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-black text-black uppercase tracking-tighter leading-none">{p.name}</h4>
                  <p className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100">{p.category}</p>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-4">{p.farmerName}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{p.location.address.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-900 uppercase">Truy xuất</span>
                    <ChevronRight size={14} className="text-black" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traceability Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] border-4 border-black overflow-hidden animate-in slide-in-from-bottom-20 duration-300">
            <div className="relative h-64">
              <img src={selectedProduct.images.product[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 bg-black text-white p-2 rounded-full shadow-xl hover:scale-110 transition-transform"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-6 left-6">
                <span className="bg-green-600 text-white px-4 py-1 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-white shadow-lg flex items-center gap-2">
                  <CheckCircle size={14} /> ĐÃ XÁC THỰC TRUY XUẤT
                </span>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-4xl font-black text-black uppercase tracking-tighter leading-none mb-2">{selectedProduct.name}</h3>
                  <p className="text-xl font-bold text-green-800">{selectedProduct.farmerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã định danh PUC</p>
                  <p className="text-lg font-black text-black font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{selectedProduct.regionCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quy mô vùng trồng</p>
                  <p className="text-lg font-black text-black">{selectedProduct.area} HA</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sản lượng kỳ vọng</p>
                  <p className="text-lg font-black text-black">{selectedProduct.expectedYield} TẤN</p>
                </div>
              </div>

              {/* Timeline of Farming */}
              <div className="mb-10">
                <h4 className="text-xl font-black text-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <ShieldCheck size={24} className="text-green-700" /> NHẬT KÝ CANH TÁC SỐ
                </h4>
                <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
                  {selectedProduct.timeline.length > 0 ? selectedProduct.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-green-600 flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                      <p className="text-lg font-black text-black uppercase tracking-tight mb-1">{item.stage}</p>
                      <p className="text-sm font-bold text-slate-600 italic">"{item.description}"</p>
                    </div>
                  )) : (
                    <div className="bg-slate-50 p-8 rounded-3xl text-center border-2 border-dashed border-slate-200">
                       <p className="text-sm font-bold text-slate-400">Chưa có nhật ký canh tác cho đợt này.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-10">
                <h4 className="text-xl font-black text-black uppercase tracking-tighter mb-6">CHỨNG NHẬN CHẤT LƯỢNG</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProduct.certificates.map((cert, idx) => (
                    <div key={idx} className="bg-green-50 border-2 border-green-700 p-4 rounded-2xl flex items-center gap-4">
                      <Award size={24} className="text-green-800" />
                      <div>
                        <p className="text-lg font-black text-green-900 leading-none">{cert.type}</p>
                        <p className="text-[10px] font-bold text-green-700 uppercase">Đến: {cert.expiryDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t border-slate-100">
                <button className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-lg uppercase shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                  LIÊN HỆ MUA HÀNG
                </button>
                <button className="bg-white border-4 border-black p-5 rounded-2xl hover:bg-slate-50 shadow-lg active:scale-95">
                  <ShoppingBag size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
