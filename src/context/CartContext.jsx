import { createContext, useEffect, useState, useCallback, useMemo, useContext } from "react";
import { AuthContext, useAxios } from "./AuthContext";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, tokens } = useContext(AuthContext);
  const api = useAxios(); 
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- FETCH CART ---
  const loadCart = useCallback(async () => {
    // 🔥 FIX: User-ഉം Valid Token-ഉം ഉണ്ടെങ്കിൽ മാത്രം API വിളിക്കുക
    if (!user || !tokens?.access) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/cart/");
      
      const formattedCart = res.data.map(item => ({
        ...item.product,       
        cart_item_id: item.id,
        quantity: item.quantity
      }));
      setCart(formattedCart);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, [user, tokens, api]);

  // Initial Load Effect
  useEffect(() => {
    if (user && tokens?.access) { // ✅ tokens.access ഉണ്ടെങ്കിൽ മാത്രം
        loadCart();
    } else {
        setCart([]); // ലോഗൗട്ട് ആയാൽ കാർട്ട് ക്ലിയർ ചെയ്യും
    }
  }, [user, tokens, loadCart]);

  // --- ADD TO CART ---
  const addToCart = useCallback(async (product, event) => {
    if (event?.preventDefault) event.preventDefault();

    if (!user || !tokens?.access) {
      toast.warn("Please login to add items");
      return;
    }

    const isItemInCart = cart.some((item) => item.id === product.id);

    try {
      // Optimistic UI Update
      setCart((prev) => {
        const exists = prev.find((item) => item.id === product.id);
        if (exists) {
            return prev.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item);
        }
        return [...prev, { ...product, quantity: 1 }];
      });

      await api.post("/cart/", {
        product_id: product.id,
        quantity: 1
      });
      
      if (isItemInCart) toast.info("Item quantity updated");
      else toast.success("Added to cart");

    } catch (err) {
      console.error("Add to cart error:", err);
      const errorMsg = err.response?.data?.error || "Failed to add item";
      toast.error(errorMsg);
      await loadCart(); // Revert on error
    }
  }, [user, tokens, api, cart, loadCart]);

  // --- REMOVE FROM CART ---
  const removeFromCart = useCallback(async (productId, event) => {
    if (event?.preventDefault) event.preventDefault();

    const cartItem = cart.find(item => item.id === productId);
    const previousCart = [...cart];
    setCart(prev => prev.filter(item => item.id !== productId));

    if (!cartItem?.cart_item_id) {
        await loadCart(); 
        return;
    }

    try {
      await api.delete(`/cart/${cartItem.cart_item_id}/`);
      toast.success("Removed from cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove");
      setCart(previousCart);
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
    } catch (err) {
      console.error("Clear cart error:", err);
      setCart(previousCart); 
    }
  }, [cart, api]);

  // --- INCREMENT & DECREMENT ---
  const incrementQty = useCallback((productId, event) => {
    const product = cart.find(item => item.id === productId);
    if(product) addToCart(product, event); 
  }, [cart, addToCart]);

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
      await api.post("/cart/", { product_id: productId, quantity: -1 });
    } catch (err) {
      console.error(err);
      await loadCart();
    }
  }, [cart, api, removeFromCart, loadCart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  }, [cart]);

  const contextValue = useMemo(() => ({
    loading, cart, addToCart, removeFromCart, clearCart, incrementQty, decrementQty, totalPrice, loadCart
  }), [loading, cart, addToCart, removeFromCart, clearCart, incrementQty, decrementQty, totalPrice, loadCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};