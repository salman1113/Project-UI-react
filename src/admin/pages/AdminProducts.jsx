import React, { useEffect, useState } from "react";
import { useAxios } from "../../context/AuthContext";
import { FiEdit, FiTrash2, FiPlus, FiX, FiSearch, FiUpload, FiBox, FiEye, FiStar } from "react-icons/fi";
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
    if (product?.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return "https://placehold.co/200?text=No+Image";
  };

  const getAllImages = (product) => {
    if (product?.images && Array.isArray(product.images)) {
      return product.images.map(img => img.url);
    }
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
        isActive: product.isActive ?? true
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
      setMediaList(prev => [...prev, {
        type: 'url',
        data: imageUrlInput,
        preview: imageUrlInput
      }]);
      setImageUrlInput("");
    }
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    const list = [...mediaList];
    const [selected] = list.splice(index, 1);
    list.unshift(selected);
    setMediaList(list);
    toast.info("Cover image updated! (Save to apply)");
  };

  const removeImage = (index) => {
    const list = [...mediaList];
    const item = list[index];

    if (item.type === 'existing' && item.id) {
      setDeletedImageIds(prev => [...prev, item.id]);
    }

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
    data.append('isActive', String(formData.isActive));

    mediaList.forEach((item) => {
      if (item.type === 'file') {
        data.append('uploaded_images', item.data);
      } else if (item.type === 'url') {
        data.append('image_urls', item.data);
      }
    });

    deletedImageIds.forEach(id => data.append('deleted_image_ids', id));

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}/`, data, config);
        toast.success("Updated!");
      } else {
        await api.post("/admin/products/", data, config);
        toast.success("Created!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-[#f4d58d] flex items-center gap-2"><FiBox className="text-[#bf0603]" /> Inventory</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708d81]" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#001c3d] border border-[#708d81]/20 pl-10 pr-4 py-2 rounded-xl text-white outline-none" />
          </div>
          <button onClick={() => openModal()} className="bg-[#bf0603] text-white px-5 py-2 rounded-xl font-bold hover:scale-105 transition-all">+ Add</button>
        </div>
      </div>

      <div className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-[#001427] text-[#708d81] text-xs uppercase tracking-widest">
              <tr>
                <th className="p-5">Product</th>
                <th className="p-5">Category</th>
                <th className="p-5">Price</th>
                <th className="p-5 text-center">Stock</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708d81]/10">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse">Loading...</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-[#001427]/40 transition-colors">
                  <td className="p-5 flex items-center gap-4">
                    <img src={getMainImageUrl(p)} alt="" className="h-10 w-10 rounded bg-white object-contain" />
                    <p className="font-bold text-[#f2e8cf]">{p.name}</p>
                  </td>
                  <td className="p-5 text-sm text-gray-400">{p.category}</td>
                  <td className="p-5 font-bold text-[#f4d58d]">₹{Number(p.price).toLocaleString()}</td>
                  <td className="p-5 text-center">{p.count}</td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => { setSelectedProduct(p); setShowPreviewModal(true); }} className="p-2 text-[#708d81] hover:text-white"><FiEye size={18} /></button>
                    <button onClick={() => openModal(p)} className="p-2 text-blue-400 hover:text-white"><FiEdit size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-white"><FiTrash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#001c3d] w-full max-w-4xl rounded-3xl border border-[#708d81]/30 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

              <div className="md:w-1/3 bg-[#001427] p-6 space-y-4 overflow-y-auto">
                <h3 className="text-[#f4d58d] font-bold text-sm">Media Gallery</h3>

                <div className="aspect-video rounded-xl bg-[#001c3d] border-2 border-dashed border-[#708d81]/30 flex flex-col items-center justify-center relative group hover:border-[#f4d58d] transition-all">
                  <FiUpload className="text-[#708d81] text-2xl mb-1" />
                  <span className="text-[10px] text-[#708d81] font-bold">UPLOAD IMAGES</span>
                  <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste Image Link..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-[#001c3d] border border-[#708d81]/20 p-2 rounded-lg text-white text-xs outline-none"
                  />
                  <button type="button" onClick={handleAddUrl} className="bg-[#708d81] text-[#001427] px-3 rounded-lg font-bold text-xs">ADD</button>
                </div>

                <div className="space-y-2 mt-4">
                  {mediaList.length === 0 && <p className="text-gray-500 text-xs text-center">No images added</p>}

                  {mediaList.map((item, idx) => (
                    <div key={idx} className={`relative flex items-center gap-3 p-2 rounded-lg border ${idx === 0 ? 'border-[#f4d58d] bg-[#f4d58d]/10' : 'border-[#708d81]/20 bg-[#001c3d]'}`}>
                      <img src={item.preview} className="w-12 h-12 rounded object-cover" alt="prev" />
                      <div className="flex-1 min-w-0">
                        {idx === 0 && <span className="text-[10px] font-black text-[#f4d58d] bg-[#f4d58d]/20 px-1.5 py-0.5 rounded">COVER</span>}
                        <p className="text-gray-400 text-[10px] truncate">{item.type === 'file' ? item.data.name : 'Image'}</p>
                      </div>
                      <div className="flex gap-1">
                        {idx !== 0 && (
                          <button onClick={() => setAsCover(idx)} title="Set as Cover" className="p-1.5 text-gray-400 hover:text-[#f4d58d] hover:bg-white/10 rounded">
                            <FiStar size={14} />
                          </button>
                        )}
                        <button onClick={() => removeImage(idx)} title="Remove" className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded">
                          <FiX size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-2/3 p-6 space-y-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-[#f4d58d]">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                  <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input name="name" placeholder="Product Title" required value={formData.name} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/20 p-3 rounded-xl text-white outline-none focus:border-[#f4d58d]" />

                  <div className="grid grid-cols-2 gap-4">
                    <input name="price" type="number" placeholder="Price (₹)" required value={formData.price} onChange={handleInputChange} className="bg-[#001427] border border-[#708d81]/20 p-3 rounded-xl text-white outline-none focus:border-[#f4d58d]" />
                    <input name="count" type="number" placeholder="Stock Quantity" required value={formData.count} onChange={handleInputChange} className="bg-[#001427] border border-[#708d81]/20 p-3 rounded-xl text-white outline-none focus:border-[#f4d58d]" />
                  </div>

                  <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/20 p-3 rounded-xl text-white outline-none focus:border-[#f4d58d]">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>

                  <textarea name="description" placeholder="Product Description..." rows="5" required value={formData.description} onChange={handleInputChange} className="w-full bg-[#001427] border border-[#708d81]/20 p-3 rounded-xl text-white outline-none resize-none focus:border-[#f4d58d]" />

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#708d81]/10">
                    <button type="button" onClick={() => setShowModal(false)} className="text-[#708d81] px-6 py-2 font-bold rounded-xl hover:bg-[#001427]">Cancel</button>
                    <button type="submit" className="bg-[#f4d58d] text-[#001427] font-black px-8 py-2 rounded-xl hover:bg-yellow-500 shadow-lg transition-transform hover:scale-105">SAVE PRODUCT</button>
                  </div>
                </form>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreviewModal && selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#001c3d] w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              <div className="md:w-1/2 bg-white p-6 flex flex-col items-center justify-center relative">
                <img src={getMainImageUrl(selectedProduct)} className="max-w-full max-h-[400px] object-contain" alt="Main" />
                <div className="absolute bottom-4 flex gap-2 overflow-x-auto max-w-full px-4">
                  {getAllImages(selectedProduct).map((url, idx) => (
                    <img key={idx} src={url} className="w-12 h-12 rounded border bg-white cursor-pointer hover:border-blue-500"
                      onClick={(e) => e.target.parentElement.previousSibling.src = e.target.src} />
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 p-8 space-y-5 overflow-y-auto">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#f2e8cf]">{selectedProduct.name}</h2>
                    <p className="text-[#f4d58d] text-xs font-bold uppercase tracking-widest">{selectedProduct.category}</p>
                  </div>
                  <button onClick={() => setShowPreviewModal(false)}><FiX size={24} className="text-gray-400" /></button>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed">{selectedProduct.description}</div>
                <div className="text-[#f4d58d] text-3xl font-black">₹{Number(selectedProduct.price).toLocaleString()}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;