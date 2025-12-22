import React, { useEffect, useState } from "react";
import { useAxios } from "../../context/AuthContext";
import { FiEdit, FiTrash2, FiBox, FiSearch, FiUpload, FiEye, FiStar, FiX, FiCheck, FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminProducts = () => {
  const api = useAxios();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [formData, setFormData] = useState({
    name: "", description: "", price: "", count: "", category: "", isActive: true
  });

  const categories = ["Boat", "Apple", "Sony", "Bose", "Redmi"];

  const getMainImageUrl = (product) => {
    if (product?.images && product.images.length > 0) return product.images[0].url;
    return "https://placehold.co/200?text=No+Image";
  };

  const getAllImages = (product) => {
    if (product?.images && Array.isArray(product.images)) return product.images.map(img => img.url);
    return ["https://placehold.co/200?text=No+Image"];
  };

  useEffect(() => { fetchProducts(); }, [page, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/products/?page=${page}&search=${searchTerm}`);
      if (Array.isArray(res.data)) setProducts(res.data);
      else if (res.data.results) setProducts(res.data.results);
      else setProducts([]);
    } catch (error) { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await api.delete(`/admin/products/${id}/`);
        toast.success("Product deleted");
        fetchProducts();
      } catch (error) { toast.error("Delete failed"); }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        count: product.count || "",
        category: product.category || "",
        isActive: product.is_active ?? true 
      });

      const existing = (product.images || []).map(img => ({
        type: 'existing',
        id: img.id,
        preview: img.url
      }));
      setMediaList(existing);
    } else {
      setEditingProduct(null);
      setFormData({ name: "", description: "", price: "", count: "", category: "", isActive: true });
      setMediaList([]);
    }
    setDeletedImageIds([]);
    setImageUrlInput("");
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newItems = files.map(file => ({
        type: 'file',
        data: file,
        preview: URL.createObjectURL(file)
      }));
      setMediaList(prev => [...prev, ...newItems]);
    }
  };

  const handleAddUrl = () => {
    if (imageUrlInput.trim()) {
      setMediaList(prev => [...prev, { type: 'url', data: imageUrlInput, preview: imageUrlInput }]);
      setImageUrlInput("");
    }
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    const list = [...mediaList];
    const [selected] = list.splice(index, 1);
    list.unshift(selected);
    setMediaList(list);
    toast.info("Cover image updated! Save to apply.");
  };

  const removeImage = (index) => {
    const list = [...mediaList];
    const item = list[index];
    if (item.type === 'existing' && item.id) setDeletedImageIds(prev => [...prev, item.id]);
    list.splice(index, 1);
    setMediaList(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('count', formData.count);
    data.append('category', formData.category);
    data.append('is_active', String(formData.isActive));

    mediaList.forEach((item) => {
      if (item.type === 'file') data.append('uploaded_images', item.data);
      else if (item.type === 'url') data.append('image_urls', item.data);
    });

    deletedImageIds.forEach(id => data.append('deleted_image_ids', id));

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}/`, data, config);
        toast.success("Updated Successfully!");
      } else {
        await api.post("/admin/products/", data, config);
        toast.success("Created Successfully!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    }
  };

  return (
    <div className="space-y-8 p-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f4d58d] flex items-center gap-3">
            <FiBox className="text-[#bf0603]" /> Inventory Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your products and stock levels.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72 group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f4d58d] transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-[#001c3d] border border-[#708d81]/30 pl-10 pr-4 py-3 rounded-xl text-white outline-none focus:border-[#f4d58d] focus:ring-1 focus:ring-[#f4d58d]/50 transition-all shadow-sm" 
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()} 
            className="bg-gradient-to-r from-[#bf0603] to-[#8d0801] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-red-900/40 transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add New
          </motion.button>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a192f] text-[#708d81] text-xs uppercase tracking-widest font-semibold border-b border-[#708d81]/20">
              <tr>
                <th className="p-6">Product Details</th>
                <th className="p-6">Category</th>
                <th className="p-6">Price</th>
                <th className="p-6 text-center">Stock</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708d81]/10">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400 animate-pulse">Loading Inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-500">No products found. Add one to get started!</td></tr>
              ) : products.map((p) => (
                <motion.tr 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  key={p.id} 
                  className="hover:bg-[#f4d58d]/5 transition-colors group"
                >
                  <td className="p-5 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-white p-1 shadow-sm overflow-hidden flex-shrink-0">
                      <img src={getMainImageUrl(p)} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-[#f2e8cf] text-base group-hover:text-[#f4d58d] transition-colors">{p.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-gray-400 font-medium">
                    <span className="bg-[#001427] px-3 py-1 rounded-full border border-[#708d81]/20">{p.category}</span>
                  </td>
                  <td className="p-5 font-bold text-[#f4d58d] text-base">₹{Number(p.price).toLocaleString()}</td>
                  <td className="p-5 text-center">
                    <span className={`font-mono font-bold ${p.count < 5 ? 'text-red-400' : 'text-[#f2e8cf]'}`}>{p.count}</span>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider ${
                        p.is_active 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedProduct(p); setShowPreviewModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-[#f4d58d] hover:bg-[#f4d58d]/10 transition-all" title="View"><FiEye size={18} /></button>
                      <button onClick={() => openModal(p)} className="p-2 rounded-lg text-blue-400 hover:text-white hover:bg-blue-500/20 transition-all" title="Edit"><FiEdit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all" title="Delete"><FiTrash2 size={18} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#001c3d] w-full max-w-5xl rounded-3xl border border-[#708d81]/30 overflow-hidden flex flex-col md:flex-row max-h-[90vh] shadow-2xl"
            >
              {/* LEFT: MEDIA SECTION */}
              <div className="md:w-[35%] bg-[#001427] p-6 space-y-5 overflow-y-auto border-r border-[#708d81]/20">
                <h3 className="text-[#f4d58d] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <FiImage /> Media Gallery
                </h3>

                <div className="aspect-video rounded-xl bg-[#001c3d] border-2 border-dashed border-[#708d81]/30 flex flex-col items-center justify-center relative group hover:border-[#f4d58d] hover:bg-[#f4d58d]/5 transition-all cursor-pointer">
                  <FiUpload className="text-[#708d81] text-3xl mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-gray-400 font-bold group-hover:text-[#f2e8cf]">CLICK TO UPLOAD</span>
                  <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-[#001c3d] border border-[#708d81]/20 p-2.5 rounded-lg text-white text-xs outline-none focus:border-[#f4d58d]"
                  />
                  <button type="button" onClick={handleAddUrl} className="bg-[#708d81] hover:bg-[#5a7066] text-[#001427] px-4 rounded-lg font-bold text-xs transition-colors">ADD</button>
                </div>

                <div className="space-y-3 mt-2 pr-1 custom-scrollbar">
                  {mediaList.length === 0 && <p className="text-gray-600 text-xs text-center py-4 italic">No images added yet.</p>}
                  {mediaList.map((item, idx) => (
                    <div key={idx} className={`relative flex items-center gap-3 p-2.5 rounded-xl border transition-all ${idx === 0 ? 'border-[#f4d58d] bg-[#f4d58d]/10' : 'border-[#708d81]/10 bg-[#001c3d] hover:bg-[#00254d]'}`}>
                      <img src={item.preview} className="w-14 h-14 rounded-lg object-cover bg-white" alt="prev" />
                      <div className="flex-1 min-w-0">
                        {idx === 0 && <span className="text-[10px] font-black text-[#f4d58d] bg-[#f4d58d]/20 px-2 py-0.5 rounded mb-1 inline-block">COVER IMAGE</span>}
                        <p className="text-gray-400 text-[10px] truncate w-full">{item.type === 'file' ? item.data.name : 'External Link'}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {idx !== 0 && (
                          <button onClick={() => setAsCover(idx)} title="Set as Cover" className="p-1.5 text-gray-500 hover:text-[#f4d58d] hover:bg-[#f4d58d]/10 rounded-md transition-colors"><FiStar size={14} /></button>
                        )}
                        <button onClick={() => removeImage(idx)} title="Remove" className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><FiX size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: DETAILS SECTION */}
              <div className="md:w-[65%] p-8 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-[#708d81]/20 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#f2e8cf]">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                    <p className="text-gray-500 text-xs mt-1">Fill in the details below.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-[#708d81]/10 transition-colors"><FiX size={24} className="text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs text-[#708d81] font-bold uppercase tracking-wider ml-1">Product Name</label>
                    <input name="name" placeholder="e.g. Sony WH-1000XM5" required value={formData.name} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/30 p-4 rounded-xl text-white outline-none focus:border-[#f4d58d] focus:ring-1 focus:ring-[#f4d58d]/50 transition-all placeholder:text-gray-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs text-[#708d81] font-bold uppercase tracking-wider ml-1">Price (₹)</label>
                      <input name="price" type="number" placeholder="0.00" required value={formData.price} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/30 p-4 rounded-xl text-white outline-none focus:border-[#f4d58d] transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[#708d81] font-bold uppercase tracking-wider ml-1">Stock</label>
                      <input name="count" type="number" placeholder="0" required value={formData.count} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/30 p-4 rounded-xl text-white outline-none focus:border-[#f4d58d] transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs text-[#708d81] font-bold uppercase tracking-wider ml-1">Category</label>
                      <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/30 p-4 rounded-xl text-white outline-none focus:border-[#f4d58d] transition-all appearance-none cursor-pointer">
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    {/* ✅ VISIBILITY TOGGLE (Better UI) */}
                    <div className="space-y-1">
                      <label className="text-xs text-[#708d81] font-bold uppercase tracking-wider ml-1">Visibility</label>
                      <label className={`flex items-center justify-between w-full p-3.5 rounded-xl border cursor-pointer transition-all ${formData.isActive ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.isActive ? 'bg-green-500 border-green-500' : 'border-red-400'}`}>
                            {formData.isActive && <FiCheck size={14} className="text-black" />}
                          </div>
                          <span className={`text-sm font-bold ${formData.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {formData.isActive ? 'Product is Active' : 'Product is Hidden'}
                          </span>
                        </div>
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#708d81] font-bold uppercase tracking-wider ml-1">Description</label>
                    <textarea name="description" placeholder="Detailed product description..." rows="4" required value={formData.description} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/30 p-4 rounded-xl text-white outline-none resize-none focus:border-[#f4d58d] transition-all custom-scrollbar" />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#708d81]/20">
                    <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 px-6 py-3 font-bold rounded-xl hover:bg-[#001427] transition-colors">Cancel</button>
                    <button type="submit" className="bg-[#f4d58d] text-[#001427] font-black px-8 py-3 rounded-xl hover:bg-yellow-500 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95">
                      {editingProduct ? "UPDATE PRODUCT" : "PUBLISH PRODUCT"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREVIEW MODAL --- */}
      <AnimatePresence>
        {showPreviewModal && selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#001c3d] w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] shadow-2xl border border-[#708d81]/30">
              <div className="md:w-1/2 bg-white p-8 flex flex-col items-center justify-center relative">
                <img src={getMainImageUrl(selectedProduct)} className="max-w-full max-h-[400px] object-contain drop-shadow-xl" alt="Main" />
                <div className="absolute top-6 left-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider shadow-sm ${selectedProduct.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {selectedProduct.is_active ? '● ACTIVE' : '● HIDDEN'}
                    </span>
                </div>
                <div className="absolute bottom-6 flex gap-3 overflow-x-auto max-w-full px-6 custom-scrollbar-hide">
                  {getAllImages(selectedProduct).map((url, idx) => (
                    <img key={idx} src={url} className="w-16 h-16 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-blue-500 hover:scale-105 transition-all object-contain p-1"
                      onClick={(e) => e.target.parentElement.previousSibling.src = e.target.src} />
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 p-10 space-y-6 overflow-y-auto bg-[#001c3d]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#f4d58d] text-xs font-bold uppercase tracking-widest bg-[#f4d58d]/10 px-3 py-1 rounded-full mb-3 inline-block">{selectedProduct.category}</span>
                    <h2 className="text-3xl font-bold text-[#f2e8cf] leading-tight">{selectedProduct.name}</h2>
                  </div>
                  <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><FiX size={28} className="text-gray-400" /></button>
                </div>
                <div className="text-gray-300 text-base leading-relaxed opacity-90 border-l-2 border-[#708d81]/30 pl-4">
                  {selectedProduct.description}
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-[#f4d58d] text-4xl font-black">₹{Number(selectedProduct.price).toLocaleString()}</div>
                  <span className="text-gray-500 mb-1.5 text-sm font-medium">INR</span>
                </div>
                <div className="pt-6 border-t border-[#708d81]/20 grid grid-cols-2 gap-4">
                   <div className="bg-[#001427] p-4 rounded-xl border border-[#708d81]/20">
                      <p className="text-xs text-gray-500 uppercase font-bold">Stock Level</p>
                      <p className={`text-xl font-bold ${selectedProduct.count < 5 ? 'text-red-400' : 'text-white'}`}>{selectedProduct.count} units</p>
                   </div>
                   <div className="bg-[#001427] p-4 rounded-xl border border-[#708d81]/20">
                      <p className="text-xs text-gray-500 uppercase font-bold">Images</p>
                      <p className="text-xl font-bold text-white">{selectedProduct.images?.length || 0} files</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;