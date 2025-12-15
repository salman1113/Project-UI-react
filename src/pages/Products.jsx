import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { FiSearch, FiFilter, FiChevronDown, FiAlertCircle } from "react-icons/fi";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams(); // Hook for URL Params
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- GET VALUES FROM URL ---
  // If URL is /products?category=Sony&page=2, these variables will get those values.
  const currentPage = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("ordering") || ""; // We use 'ordering' key directly for Django

  const productsPerPage = 8;
  const categories = ["All", "Boat", "Apple", "Sony", "Bose", "Redmi"];

  // --- FETCH PRODUCTS ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct params directly from what we read from URL
        const params = {
          page: currentPage,
        };

        if (search) params.search = search;
        if (category !== "All") params.category = category;
        if (sort) params.ordering = sort;

        const response = await axios.get("http://localhost:8000/api/products/", { params });

        if (response.data.results) {
          setProducts(response.data.results);
          const totalCount = response.data.count;
          setTotalPages(Math.ceil(totalCount / productsPerPage));
        } else {
          setProducts(response.data);
        }

      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    // Debounce is tricky with URL params, usually we debounce the navigate function.
    // For simplicity, we fetch immediately when URL changes.
    fetchProducts();

  }, [currentPage, search, category, sort, retryCount]); // Depend on URL values

  // --- UPDATE URL HELPER ---
  const updateParams = (key, value) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (value && value !== "All") {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    
    // Reset to page 1 when filter changes (except when changing page itself)
    if (key !== "page") {
      current.set("page", "1");
    }

    setSearchParams(current);
  };

  // --- HANDLERS ---
  const handlePageChange = (pageNumber) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", pageNumber.toString());
    setSearchParams(current);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- ANIMATIONS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-12"
      style={{ background: "linear-gradient(to right, #000000ff 0%, #004e92 100%)" }}
    >
      <div className="text-center mb-16">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-[#f4d58d] mb-4"
        >
          GEAR UP FOR VICTORY
        </motion.h2>
        <p className="text-lg text-[#708d81] max-w-2xl mx-auto">
          Premium formulations for maximum performance
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="mb-12">
        <div className="relative max-w-xl mx-auto mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-[#708d81]" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateParams("search", e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-[#708d81] rounded-full text-[#f2e8cf] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#bf0603] bg-[#001427]"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#001427] border border-[#708d81] rounded-full text-[#f2e8cf]"
          >
            <FiFilter className="h-4 w-4" />
            <span>Filters</span>
            <FiChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full md:w-auto bg-[#001427] p-4 rounded-lg shadow-lg border border-[#708d81]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#f2e8cf] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => updateParams("category", e.target.value)}
                    className="block w-full px-3 py-2 border-[#708d81] rounded-md bg-[#001427] text-[#f2e8cf]"
                  >
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#f2e8cf] mb-1">Sort By</label>
                  <select
                    value={sort}
                    // Directly setting 'price' or '-price' to simplify backend mapping
                    onChange={(e) => updateParams("ordering", e.target.value)}
                    className="block w-full px-3 py-2 border-[#708d81] rounded-md bg-[#001427] text-[#f2e8cf]"
                  >
                    <option value="">Default</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bf0603]"></div>
        </div>
      )}
      
      {error && !loading && (
        <div className="text-center py-20">
          <FiAlertCircle className="h-8 w-8 text-[#bf0603] mx-auto mb-4" />
          <p className="text-[#f2e8cf] mb-4">{error}</p>
          <button onClick={() => setRetryCount(retryCount + 1)} className="px-4 py-2 bg-[#bf0603] rounded text-white">Retry</button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
         <div className="text-center py-20 text-[#708d81]">No products found matching your criteria.</div>
      )}

      {!loading && !error && products.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants} whileHover={{ y: -5 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-10 flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-4 py-2 rounded-md border ${currentPage === idx + 1 ? 'bg-[#bf0603] text-white' : 'bg-[#001427] text-white border-[#708d81]'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Products;