import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import this
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // Replace "YOUR_GOOGLE_CLIENT_ID_HERE" with your actual Client ID
  <GoogleOAuthProvider clientId="132583128544-4esetkno1146mfmdoa9phdvd9rt2j4nm.apps.googleusercontent.com">
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);