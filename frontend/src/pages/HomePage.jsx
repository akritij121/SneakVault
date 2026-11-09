import { useState } from 'react';

import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, Loader2, Search } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';




const HomePage = () => {
  const { keyword: urlKeyword } = useParams();
  const [searchParams] = useSearchParams();
  const pageNumber = searchParams.get('page') || 1;
  const navigate = useNavigate();

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(urlKeyword || '');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search/${searchKeyword}`);
    } else {
      navigate('/');
    }
  };

  const { data: filterData } = useQuery({
    queryKey: ['filters'],
    queryFn: async () => {
      const { data } = await api.get('/api/products/filters');
      return data;
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', urlKeyword, pageNumber, selectedBrands, selectedPriceRange, selectedSize],
    queryFn: async () => {
      const { data } = await api.get('/api/products', {
        params: { keyword: urlKeyword, pageNumber },
      });
      return data;
    },
  });

  // Generate dynamic price ranges
  const generatePriceRanges = (maxPrice) => {
    if (!maxPrice) return [];
    const ranges = [
      { label: 'Under ₹5,000', min: 0, max: 5000 },
      { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
      { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
    ];
    
    if (maxPrice > 20000) {
      ranges.push({ label: 'Over ₹20,000', min: 20000, max: maxPrice + 1000 });
    }
    
    return ranges;
  };

  const dynamicPriceRanges = generatePriceRanges(filterData?.maxPrice);
  const dynamicBrands = filterData?.brands || [];
  const dynamicSizes = filterData?.sizes || [];

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Filter products client-side
  const filteredProducts = data?.products?.filter((product) => {
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const priceMatch =
      !selectedPriceRange ||
      (product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max);
    const sizeMatch = !selectedSize || product.sizes?.includes(selectedSize);
    return brandMatch && priceMatch && sizeMatch;
  });

  return (
    <>
      <Helmet>
        <title>Shop Sneakers - SNKRSTR</title>
        <meta name="description" content="Browse our premium collection of exclusive sneakers" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-black text-lg mb-6 flex items-center gap-2 font-outfit">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h2>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-sm mb-3">Brand</h3>
                  <div className="space-y-2">
                    {dynamicBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-sm mb-3">Price</h3>
                  <div className="space-y-2">
                    {dynamicPriceRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPriceRange?.label === range.label}
                          onChange={() => setSelectedPriceRange(range)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <h3 className="font-bold text-sm mb-3">Size (US)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {dynamicSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                        className={`px-3 py-2 text-sm rounded-md border ${
                          selectedSize === size
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-input hover:border-primary'
                        } transition-colors`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedBrands.length > 0 || selectedPriceRange || selectedSize) && (
                  <button
                    onClick={() => {
                      setSelectedBrands([]);
                      setSelectedPriceRange(null);
                      setSelectedSize(null);
                    }}
                    className="w-full mt-6 text-sm text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Search & Filter Toggle */}
            <div className="lg:hidden mb-6 flex gap-3">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search sneakers..." 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-card border border-border pl-9 pr-4 py-2 rounded-md text-sm focus:border-primary outline-none"
                />
              </form>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>

            {/* Mobile Filter Drawer */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-background border-l border-border p-6 shadow-xl flex flex-col gap-6 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h2 className="font-black text-lg flex items-center gap-2 font-outfit">
                      <SlidersHorizontal className="w-5 h-5" />
                      Filters
                    </h2>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 hover:bg-accent rounded-full"
                    >
                      <span className="sr-only">Close</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>

                  {/* Brand Filter */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3">Brand</h3>
                    <div className="space-y-2">
                      {dynamicBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 rounded border-input"
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3">Price</h3>
                    <div className="space-y-2">
                      {dynamicPriceRanges.map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="price"
                            checked={selectedPriceRange?.label === range.label}
                            onChange={() => setSelectedPriceRange(range)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Size Filter */}
                  <div>
                    <h3 className="font-bold text-sm mb-3">Size (US)</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {dynamicSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                          className={`px-3 py-2 text-sm rounded-md border ${
                            selectedSize === size
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-input hover:border-primary'
                          } transition-colors`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedBrands.length > 0 || selectedPriceRange || selectedSize) && (
                    <button
                      onClick={() => {
                        setSelectedBrands([]);
                        setSelectedPriceRange(null);
                        setSelectedSize(null);
                      }}
                      className="w-full mt-6 text-sm text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-md font-bold"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-black mb-2">
                {urlKeyword ? `Search Results for "${urlKeyword}"` : 'All Sneakers'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {filteredProducts?.length || 0} products found
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-destructive">Failed to load products</p>
              </div>
            )}

            {/* Product Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredProducts?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default HomePage;
