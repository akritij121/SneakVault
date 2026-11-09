import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Sun, Moon, Menu, LayoutDashboard, X, LogOut } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { useState } from 'react';
import BackendStatusAlert from './BackendStatusAlert';
import api from '../api/client';
import toast from 'react-hot-toast';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { cartItems } = useCartStore();
  const { userInfo, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
      setKeyword('');
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/users/logout');
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300 flex flex-col">
      <BackendStatusAlert />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Search & Mobile Menu */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-transparent focus-within:border-primary/20 transition-all">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-40 focus:w-60 transition-all placeholder:text-muted-foreground"
            />
          </form>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-2xl font-black tracking-tighter uppercase select-none">
            SNKR<span className="text-primary">STR</span>
          </h1>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link to="/wishlist" className="p-2 hover:bg-accent rounded-full transition-colors hidden lg:block">
            <Heart className="w-5 h-5" />
          </Link>

          <Link to="/cart" className="p-2 hover:bg-accent rounded-full transition-colors relative hidden lg:block">
            <ShoppingBag className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-2">
              {userInfo.isAdmin && (
                <Link 
                  to="/admin/dashboard" 
                  className="p-2 hover:bg-accent rounded-full transition-colors hidden lg:block"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}
              <Link to="/profile" className="p-2 hover:bg-accent rounded-full transition-colors hidden lg:block" title="Profile">
                <User className="w-5 h-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-accent rounded-full transition-colors hidden lg:block"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="p-2 hover:bg-accent rounded-full transition-colors hidden lg:block">
              <User className="w-5 h-5" />
            </Link>
          )}
          <div className="relative lg:hidden">
            <button 
              className="p-2 hover:bg-accent rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 flex flex-col gap-1 z-50">
                <Link 
                  to="/" 
                  className="px-4 py-2 hover:bg-accent text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/wishlist" 
                  className="px-4 py-2 hover:bg-accent text-sm font-medium flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                  <Heart className="w-4 h-4" />
                </Link>
                <Link 
                  to="/cart" 
                  className="px-4 py-2 hover:bg-accent text-sm font-medium flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                </Link>
                
                <div className="h-px bg-border my-1" />

                {userInfo ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="px-4 py-2 hover:bg-accent text-sm font-medium flex items-center justify-between"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                      <User className="w-4 h-4" />
                    </Link>
                    {userInfo.isAdmin && (
                      <Link 
                        to="/admin/dashboard" 
                        className="px-4 py-2 hover:bg-accent text-sm font-medium flex items-center justify-between text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                        <LayoutDashboard className="w-4 h-4" />
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 hover:bg-accent text-sm font-medium flex items-center justify-between text-destructive"
                    >
                      Logout
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="px-4 py-2 hover:bg-accent text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}

                <div className="h-px bg-border my-1" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
