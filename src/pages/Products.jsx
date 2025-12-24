import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiChevronDown, FiX, FiCheck, FiGrid } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // State Management
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dynamic Categories State
  const [availableCategories, setAvailableCategories] = useState(["All"]);

  // --- GET VALUES FROM URL ---
  const currentPage = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("ordering") || "";

  const productsPerPage = 8;

  // --- FETCH PRODUCTS & CATEGORIES ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { page: currentPage };
        if (search) params.search = search;
        if (category !== "All") params.category = category;
        if (sort) params.ordering = sort;

        const productRes = await axios.get("http://3.26.180.53/api/products/", { params });

        let fetchedProducts = [];
        if (productRes.data.results) {
          fetchedProducts = productRes.data.results;
          setProducts(fetchedProducts);
          setTotalPages(Math.ceil(productRes.data.count / productsPerPage));
        } else {
          fetchedProducts = productRes.data;
          setProducts(fetchedProducts);
        }

        const catsFromProducts = [...new Set(fetchedProducts.map(p => p.category))].filter(Boolean);
        setAvailableCategories(prev => [...new Set(["All", ...prev, ...catsFromProducts])]);

      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, search, category, sort]);

  // --- HELPER TO UPDATE URL ---
  const updateParams = (key, value) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value && value !== "All") current.set(key, value);
    else current.delete(key);

    if (key !== "page") current.set("page", "1");
    setSearchParams(current);
  };

  const clearFilters = () => {
    setSearchParams({});
    setIsFilterOpen(false);
  };

  const activeFiltersCount = [search, category !== "All", sort].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#001427] text-[#f2e8cf] font-sans selection:bg-[#f4d58d] selection:text-[#001427]">
      
      {/* 1. PREMIUM HERO HEADER */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden bg-gradient-to-b from-[#00080f] to-[#001427]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#f4d58d]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-block px-3 py-1 mb-4 rounded-full border border-[#f4d58d]/30 bg-[#f4d58d]/5 text-[#f4d58d] text-xs font-bold tracking-widest uppercase"
          >
            New Arrivals
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Premium Audio <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4d58d] to-[#bf0603]">Gear</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[#708d81] text-lg max-w-2xl mx-auto font-light"
          >
            Immerse yourself in superior sound quality.
          </motion.p>
        </div>
      </div>

      {/* 2. GLASSMORPHISM CONTROL BAR (Sticky) */}
      <div className="sticky top-0 z-40 px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#001c3d]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f4d58d] transition-colors" />
              <input
                type="text"
                placeholder="Search collection..."
                value={search}
                onChange={(e) => updateParams("search", e.target.value)}
                className="w-full bg-black/20 border border-white/5 pl-11 pr-4 py-3 rounded-xl text-white focus:outline-none focus:bg-black/40 focus:border-[#f4d58d]/50 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${
                  isFilterOpen || activeFiltersCount > 0 
                  ? "bg-[#f4d58d] text-[#001427] border-[#f4d58d] shadow-lg shadow-[#f4d58d]/20" 
                  : "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <FiFilter /> Filters 
                {activeFiltersCount > 0 && <span className="bg-[#bf0603] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">{activeFiltersCount}</span>}
                <FiChevronDown className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all" title="Clear All">
                  <FiX size={18} />
                </button>
              )}
            </div>
          </div>

          {/* 3. EXPANDABLE FILTER PANEL */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="overflow-hidden mt-2"
              >
                <div className="bg-[#001c3d] p-6 rounded-2xl border border-white/5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Category Chips */}
                  <div>
                    <h3 className="text-xs font-bold text-[#708d81] uppercase tracking-wider mb-4 flex items-center gap-2"><FiGrid /> Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => updateParams("category", cat)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                            category === cat
                              ? "bg-[#f4d58d] text-[#001427] border-[#f4d58d]"
                              : "bg-black/20 text-gray-400 border-transparent hover:bg-black/40 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <h3 className="text-xs font-bold text-[#708d81] uppercase tracking-wider mb-4 flex items-center gap-2"><FiFilter /> Sort By</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Default (Newest)", value: "" },
                        { label: "Price: Low to High", value: "price" },
                        { label: "Price: High to Low", value: "-price" }
                      ].map((opt) => (
                        <div 
                          key={opt.label} 
                          onClick={() => updateParams("ordering", opt.value)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                            sort === opt.value 
                            ? "bg-[#f4d58d]/10 border-[#f4d58d]/50" 
                            : "bg-black/20 border-transparent hover:bg-black/40"
                          }`}
                        >
                          <span className={`text-sm ${sort === opt.value ? "text-[#f4d58d] font-bold" : "text-gray-400"}`}>{opt.label}</span>
                          {sort === opt.value && <FiCheck className="text-[#f4d58d]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-white/5 border-t-[#f4d58d] rounded-full animate-spin mb-4"></div>
            <p className="text-[#708d81] text-sm tracking-widest uppercase animate-pulse">Loading Collection...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-white mb-2">Unable to load products</h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#f4d58d] text-black rounded-lg font-bold hover:bg-[#e0c070] transition">Try Again</button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-24">
             <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
             <p className="text-gray-400">Try adjusting your filters or search criteria.</p>
             <button onClick={clearFilters} className="mt-6 text-[#f4d58d] font-medium hover:underline">Clear all filters</button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 5. PREMIUM PAGINATION */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-24 flex justify-center items-center gap-2">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => {
                   const current = new URLSearchParams(Array.from(searchParams.entries()));
                   current.set("page", (idx + 1).toString());
                   setSearchParams(current);
                   window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${
                  currentPage === idx + 1 
                  ? "bg-[#f4d58d] text-[#001427] border-[#f4d58d] shadow-[0_0_15px_rgba(244,213,141,0.3)]" 
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;