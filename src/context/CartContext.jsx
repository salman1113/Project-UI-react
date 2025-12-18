import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { AuthContext, useAxios } from "./AuthContext";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const api = useAxios(); 
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH CART ---
  const loadCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/cart/");
      const formattedCart = res.data.map(item => ({
        ...item.product,       
        cart_item_id: item.id, // This is crucial for deletion
        quantity: item.quantity
      }));
      setCart(formattedCart);
    } catch (err) {
      console.error("Failed to load cart", err);
      if (err.response?.status === 401) setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user, api]);

  // Initial Load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // --- ADD TO CART (UPDATED ERROR HANDLING) ---
  const addToCart = useCallback(async (product, event) => {
    if (event?.preventDefault) event.preventDefault();

    if (!user) {
      toast.warn("Please login to add items");
      return;
    }

    const isItemInCart = cart.some((item) => item.id === product.id);

    try {
      // 1. Optimistic Update (UI വേഗത്തിൽ മാറാൻ)
      setCart((prev) => {
        const exists = prev.find((item) => item.id === product.id);
        if (exists) {
            return prev.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item);
        }
        return [...prev, { ...product, quantity: 1 }];
      });

      // 2. API Call
      await api.post("/cart/", {
        product_id: product.id,
        quantity: 1
      });
      
      if (isItemInCart) {
        toast.info("Item quantity updated");
      } else {
        toast.success("Added to cart");
      }
      
      // 3. Refresh to sync with server
      await loadCart(); 

    } catch (err) {
      console.error("Add to cart error:", err);
      
      // 👇 IMPORTANT: ബാക്കെൻഡിൽ നിന്നുള്ള എറർ മെസ്സേജ് കാണിക്കുന്നു
      const errorMsg = err.response?.data?.error || "Failed to add item";
      toast.error(errorMsg);

      await loadCart(); // Revert to server state on error
    }
  }, [user, api, cart, loadCart]);

  // --- REMOVE FROM CART ---
  const removeFromCart = useCallback(async (productId, event) => {
    if (event?.preventDefault) event.preventDefault();

    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem?.cart_item_id) {
        await loadCart(); 
        return;
    }

    try {
      setCart(prev => prev.filter(item => item.id !== productId));
      await api.delete(`/cart/${cartItem.cart_item_id}/`);
      toast.success("Removed from cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove");
      loadCart();
    }
  }, [cart, api, loadCart]);

  // --- CLEAR CART ---
  const clearCart = useCallback(async (event) => {
    if (event?.preventDefault) event.preventDefault();
    
    const previousCart = [...cart];
    setCart([]); 

    try {
      const deletePromises = previousCart.map(item => 
        item.cart_item_id ? api.delete(`/cart/${item.cart_item_id}/`) : Promise.resolve()
      );

      await Promise.all(deletePromises);
      // toast.success("Cart cleared"); // Optional

    } catch (err) {
      console.error("Clear cart error:", err);
      toast.error("Failed to clear cart fully");
      setCart(previousCart); 
    }
  }, [cart, api]);

  // --- INCREMENT ---
  const incrementQty = useCallback((productId, event) => {
    const product = cart.find(item => item.id === productId);
    if(product) addToCart(product, event); 
  }, [cart, addToCart]);

  // --- DECREMENT ---
  const decrementQty = useCallback(async (productId, event) => {
    if (event?.preventDefault) event.preventDefault();

    const item = cart.find(i => i.id === productId);
    if (!item) return;

    if (item.quantity === 1) {
      removeFromCart(productId);
      return;
    }

    try {
      setCart(prev => prev.map(i => i.id === productId ? {...i, quantity: i.quantity - 1} : i));
      
      await api.post("/cart/", {
        product_id: productId,
        quantity: -1 
      });
    } catch (err) {
      console.error(err);
      loadCart();
    }
  }, [cart, api, removeFromCart, loadCart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  }, [cart]);

  const contextValue = useMemo(() => ({
    loading,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    incrementQty,
    decrementQty,
    totalPrice,
  }), [loading, cart, addToCart, removeFromCart, clearCart, incrementQty, decrementQty, totalPrice]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};