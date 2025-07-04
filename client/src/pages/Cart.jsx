import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
    toast.error('הפריט הוסר מהסל');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">סל הקניות שלך ריק</h1>
          <p className="text-gray-600 mb-8">
            גלו את מבחר האגוזים והזרעים המובחרים שלנו
          </p>
          <Link to={createPageUrl("Products")}>
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <ArrowLeft className="mr-2 w-4 h-4" />
              התחילו לקנות
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Toaster richColors />
      <div className="mb-8 text-right">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          סל <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">קניות</span>
        </h1>
        <p className="text-lg text-gray-600">
          {getTotalItems()} פריטים בסל שלך
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 lg:order-last">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm rounded-xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">סיכום הזמנה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold">₪{getTotalPrice().toFixed(2)}</span>
                <span className="text-gray-600">סה"כ ({getTotalItems()} פריטים)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">₪5.99</span>
                <span className="text-gray-600">משלוח</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-green-600">₪{(getTotalPrice() + 5.99).toFixed(2)}</span>
                  <span>סה"כ לתשלום</span>
                </div>
              </div>
              <Link to={createPageUrl("Checkout")} className="block">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  מעבר לתשלום
                </Button>
              </Link>
              <Link to={createPageUrl("Products")} className="block">
                <Button variant="outline" className="w-full border-orange-300 hover:bg-orange-50 rounded-full">
                  המשך בקניות
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="border-none shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row-reverse items-center gap-4">
                  <img 
                    src={item.image_url || `https://images.unsplash.com/photo-1508747703725-719777637510?w=100&h=100&fit=crop&q=80`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 text-center sm:text-right">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.weight || "איכות פרימיום"}</p>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      ₪{item.price?.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                     <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="rounded-full"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium text-lg">{item.quantity}</span>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-left w-24">
                    <p className="text-lg font-bold text-gray-900">
                      ₪{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}