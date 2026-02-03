
import React, { useState, useMemo } from 'react';
import { UserRole, FarmProduct, ProductStatus, User, AdminUser, AdminLevel } from './types';
import { MOCK_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import MapInterface from './components/MapInterface';
import FarmerPortal from './components/FarmerPortal';
import AdminDashboard from './components/AdminDashboard';
import AuthScreen from './components/AuthScreen';
import FarmerProfile from './components/FarmerProfile';
import FarmerHome from './components/FarmerHome';
import BuyerDashboard from './components/BuyerDashboard';
import { Home, Map as MapIcon, User as UserIcon, LayoutGrid, PlusCircle, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [products, setProducts] = useState<FarmProduct[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Tabs for Farmer/Buyer
  const [activeTab, setActiveTab] = useState<string>('home');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (user?.role === UserRole.ADMIN) {
        const matchesArea = p.location.address.toLowerCase().includes(user.assignedArea.split(' ').pop()?.toLowerCase() || '');
        if (!matchesArea && user.level !== AdminLevel.CENTRAL) return false;
      }
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.regionCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const isAdminView = user?.role === UserRole.ADMIN;
      const isApproved = p.status === ProductStatus.APPROVED;
      return matchesSearch && matchesCategory && (isAdminView || isApproved);
    });
  }, [products, searchQuery, categoryFilter, user]);

  const handleAddProduct = (newProduct: FarmProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setActiveTab('list');
  };

  const handleUpdateStatus = (id: string, status: ProductStatus, note?: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status, 
      verificationNote: note,
      verifiedAt: new Date().toISOString(),
      verifiedBy: user?.role === UserRole.ADMIN ? user.fullName : undefined
    } : p));
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentRole(loggedUser?.role || UserRole.BUYER);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRole(null);
  };

  if (!user) {
    return <AuthScreen onLogin={handleAuthSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans">
      {/* Navbar for Admin or Desktop view */}
      {user.role === UserRole.ADMIN ? (
        <Navbar 
          currentRole={user.role} 
          onRoleChange={() => {}} 
          onSearch={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />
      ) : null}
      
      <main className="flex-1 relative flex overflow-hidden">
        {user.role === UserRole.FARMER && (
          <div className="flex-1 flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'home' && (
                <FarmerHome onNavigate={(tab) => setActiveTab(tab)} farmName={(user as any).farmName} />
              )}
              {activeTab === 'register' && (
                <FarmerPortal 
                  onAdd={handleAddProduct} 
                  existingProducts={products.filter(p => p.farmerId === 'f_current' || p.farmerId === user.id)}
                  activeView="register"
                />
              )}
              {activeTab === 'list' && (
                <FarmerPortal 
                  onAdd={handleAddProduct} 
                  existingProducts={products.filter(p => p.farmerId === 'f_current' || p.farmerId === user.id)}
                  activeView="my-farms"
                />
              )}
              {activeTab === 'map' && (
                <div className="h-full relative">
                  <MapInterface products={filteredProducts} isFarmerView={true} />
                </div>
              )}
              {activeTab === 'profile' && (
                <FarmerProfile user={user as any} onLogout={handleLogout} />
              )}
            </div>

            <nav className="bg-white border-t border-slate-100 flex justify-around items-center py-3 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[2000]">
              <BottomNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={24} />} label="Trang chủ" />
              <BottomNavItem active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<LayoutGrid size={24} />} label="Hồ sơ" />
              <BottomNavItem active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<div className="bg-green-600 p-3 rounded-full text-white shadow-lg -mt-10 border-4 border-slate-50"><MapIcon size={24} /></div>} label="Bản đồ" isSpecial />
              <BottomNavItem active={false} onClick={() => {}} icon={<PlusCircle size={24} />} label="Cộng đồng" />
              <BottomNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={24} />} label="Cá nhân" />
            </nav>
          </div>
        )}

        {user.role === UserRole.BUYER && (
          <div className="flex-1 flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'home' && (
                <BuyerDashboard products={filteredProducts} user={user} onSearch={setSearchQuery} />
              )}
              {activeTab === 'map' && (
                <div className="h-full relative">
                  <MapInterface products={filteredProducts} isFarmerView={false} />
                </div>
              )}
              {activeTab === 'profile' && (
                <FarmerProfile user={{...user, farmName: user.fullName, representative: user.fullName} as any} onLogout={handleLogout} />
              )}
            </div>

            <nav className="bg-white border-t border-slate-100 flex justify-around items-center py-3 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[2000]">
              <BottomNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={24} />} label="Khám phá" />
              <BottomNavItem active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<div className="bg-green-700 p-3 rounded-full text-white shadow-lg -mt-10 border-4 border-slate-50"><MapIcon size={24} /></div>} label="Bản đồ" isSpecial />
              <BottomNavItem active={activeTab === 'cart'} onClick={() => {}} icon={<ShoppingBag size={24} />} label="Giỏ hàng" />
              <BottomNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={24} />} label="Tài khoản" />
            </nav>
          </div>
        )}

        {user.role === UserRole.ADMIN && (
          <div className="h-full overflow-y-auto w-full bg-slate-50">
            <AdminDashboard 
              products={products} 
              onUpdateStatus={handleUpdateStatus} 
              admin={user as AdminUser}
            />
          </div>
        )}
      </main>
    </div>
  );
};

const BottomNavItem = ({ active, onClick, icon, label, isSpecial = false }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${isSpecial ? '' : (active ? 'text-green-600' : 'text-slate-400')}`}
  >
    <div className={`${active && !isSpecial ? 'scale-110' : ''} transition-transform`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSpecial ? 'mt-1' : ''}`}>
      {label}
    </span>
  </button>
);

export default App;
