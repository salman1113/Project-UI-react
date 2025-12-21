import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { AuthContext, useAxios } from "./AuthContext";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, tokens } = useContext(AuthContext);
  const api = useAxios(); 
  const [wishlist, setWishlist] = useState([]);

  // --- FETCH WISHLIST ---
  const fetchWishlist = useCallback(async () => {
    // 🔥 FIX: Check both user and valid token access
    if (!user || !tokens?.access) {
      setWishlist([]);
      return;
    }

    try {
      const res = await api.get("/wishlist/");
      const formattedWishlist = res.data.map(item => ({
          ...item.product,
          wishlist_item_id: item.id 
      }));
      setWishlist(formattedWishlist);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    }
  }, [user, tokens, api]);

  // Initial Load Effect
  useEffect(() => {
    if (user && tokens?.access) { // ✅ tokens.access ഉണ്ടെങ്കിൽ മാത്രം
        fetchWishlist();
    } else {
        setWishlist([]);
    }
  }, [user, tokens, fetchWishlist]);

  // --- ADD TO WISHLIST ---
  const addToWishlist = async (product, event) => {
    if (event?.preventDefault) event.preventDefault();

    if (!user || !tokens?.access) {
        toast.warn("Please login first");
        return;
    }

    if (wishlist.some(item => item.id === product.id)) {
        toast.info("Already in wishlist");
        return;
    }

    try {
      setWishlist(prev => [...prev, product]); 
      await api.post("/wishlist/", { product_id: product.id });
      toast.success("Added to wishlist");
    } catch (err) {
      console.error("Failed to add to wishlist", err);
      const errorMsg = err.response?.data?.error || "Failed to add";
      toast.error(errorMsg);
      await fetchWishlist();
    }
  };

  // --- REMOVE FROM WISHLIST ---
  const removeFromWishlist = async (productId, event) => {
    if (event?.preventDefault) event.preventDefault();
    const itemToRemove = wishlist.find(item => item.id === productId);
    const previousList = [...wishlist];
    setWishlist(prev => prev.filter(item => item.id !== productId)); 

    if (!itemToRemove?.wishlist_item_id) {
        await fetchWishlist(); 
        return;
    }

    try {
      await api.delete(`/wishlist/${itemToRemove.wishlist_item_id}/`);
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
      toast.error("Failed to remove");
      setWishlist(previousList);
    }
  };

  // --- CLEAR WISHLIST ---
  const clearWishlist = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    const previousList = [...wishlist];
    setWishlist([]); 

    try {
        const deletePromises = previousList.map(item => 
            item.wishlist_item_id ? api.delete(`/wishlist/${item.wishlist_item_id}/`) : Promise.resolve()
        );
        await Promise.all(deletePromises);
        toast.success("Wishlist cleared");
    } catch (err) {
        console.error("Failed to clear wishlist", err);
        setWishlist(previousList); 
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, setWishlist, addToWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};