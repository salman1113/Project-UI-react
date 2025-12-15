import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { AuthContext, useAxios } from "./AuthContext";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const api = useAxios(); 
  const [wishlist, setWishlist] = useState([]);

  // --- FETCH WISHLIST ---
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.get("/wishlist/");
      
      // Transform: Bind relationship ID (id) to product details
      const formattedWishlist = res.data.map(item => ({
          ...item.product,
          wishlist_item_id: item.id // This ID is needed to delete
      }));

      setWishlist(formattedWishlist);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      if (err.response?.status === 401) setWishlist([]);
    }
  }, [user, api]);

  // Initial Load
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // --- ADD TO WISHLIST ---
  const addToWishlist = async (product, event) => {
    if (event?.preventDefault) event.preventDefault();

    if (!user) {
        toast.warn("Please login first");
        return;
    }

    // Check locally to prevent duplicate calls
    if (wishlist.some(item => item.id === product.id)) {
        toast.info("Already in wishlist");
        return;
    }

    try {
      setWishlist(prev => [...prev, product]); // Optimistic Update
      
      await api.post("/wishlist/", {
        product_id: product.id
      });
      
      toast.success("Added to wishlist");
      // IMPORTANT: Refresh to get the real 'wishlist_item_id' for subsequent deletion
      await fetchWishlist(); 

    } catch (err) {
      console.error("Failed to add to wishlist", err);
      toast.error("Failed to add");
      fetchWishlist(); // Revert on error
    }
  };

  // --- REMOVE FROM WISHLIST ---
  const removeFromWishlist = async (productId, event) => {
    if (event?.preventDefault) event.preventDefault();

    const itemToRemove = wishlist.find(item => item.id === productId);
    
    // If we don't have the relationship ID (rare case if sync is fast), verify data
    if (!itemToRemove?.wishlist_item_id) {
        console.warn("Missing wishlist_item_id, refreshing...");
        await fetchWishlist(); 
        return;
    }

    try {
      setWishlist(prev => prev.filter(item => item.id !== productId)); // Optimistic

      await api.delete(`/wishlist/${itemToRemove.wishlist_item_id}/`);
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
      toast.error("Failed to remove");
      fetchWishlist(); // Revert
    }
  };

  // --- CLEAR WISHLIST (Fixed to delete from Server) ---
  const clearWishlist = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    
    const previousList = [...wishlist];
    setWishlist([]); // Clear UI

    try {
        const deletePromises = previousList.map(item => 
            item.wishlist_item_id ? api.delete(`/wishlist/${item.wishlist_item_id}/`) : Promise.resolve()
        );
        
        await Promise.all(deletePromises);
        toast.success("Wishlist cleared");
    } catch (err) {
        console.error("Failed to clear wishlist", err);
        setWishlist(previousList); // Revert
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};