import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useState, useEffect } from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const getItemKey = (item) => `${item.id || item.product_id}_${item.selectedWeight || item.weight || ''}`;

  const updateWeight = (productId, selectedWeight, newWeight) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === productId && (item.selectedWeight || item.weight) === selectedWeight) {
        const baseWeight = item.base_weight || 100;
        const basePrice = item.base_price || item.price || 0;
        const price = ((basePrice) * (newWeight / baseWeight));
        return { ...item, selectedWeight: newWeight, price: price };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (productId, selectedWeight) => {
    const updatedCart = cartItems.filter(item =>
      !(item.id === productId && (item.selectedWeight || item.weight) === selectedWeight)
    );
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

  const updateQuantity = (productId, selectedWeight, newQuantity) => {
    let updatedCart = cartItems.map(item => {
      if (item.id === productId && (item.selectedWeight || item.weight) === selectedWeight) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    updatedCart = updatedCart.filter(item => item.quantity > 0);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-text mb-4">סל הקניות שלך ריק</h1>
          <p className="text-muted mb-8">
            גלו את מבחר האגוזים והזרעים המובחרים שלנו
          </p>
          <Link to={createPageUrl("Products")}> 
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full font-bold shadow-xl transition-all">
              <ArrowLeft className="mr-2 w-4 h-4" />
              התחילו לקנות
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-12 pb-32">
      <Toaster richColors />
      <div className="mb-8 text-right">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
          סל <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">קניות</span>
        </h1>
        <p className="text-lg text-muted">
          {getTotalItems()}פריטים בסל שלך
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 lg:order-last">
          <Card className="border-2 border-border shadow-xl bg-surface/90 backdrop-blur-md rounded-2xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-text">סיכום הזמנה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold text-success">₪{getTotalPrice().toFixed(2)}</span>
                <span className="text-muted">סה"כ ({getTotalItems()} פריטים)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-primary">₪5.99</span>
                <span className="text-muted">משלוח</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-success">₪{(getTotalPrice() + 5.99).toFixed(2)}</span>
                  <span>סה"כ לתשלום</span>
                </div>
              </div>
              <Link to={createPageUrl("Checkout")} className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white py-3 text-lg rounded-full font-bold shadow-xl transition-all">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  מעבר לתשלום
                </Button>
              </Link>
              <Link to={createPageUrl("Products")} className="block">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 rounded-full font-bold">
                  המשך בקניות
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const minWeight = item.base_weight || 100;
            const step = item.weight_step || 50;
            return (
              <div
                key={getItemKey(item)}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 pt-12 bg-white rounded-3xl shadow-lg border border-gray-200 relative"
              >
                {/* כפתור מחיקה בפינה העליונה-שמאלית */}
                <button
                  onClick={() => removeItem(item.id, item.selectedWeight || item.weight)}
                  className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white shadow hover:bg-red-50 transition"
                  aria-label="הסר פריט"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                </button>
                {/* עמודה: תמונה + שם מוצר */}
                <div className="flex flex-col items-center w-24 sm:w-32 flex-shrink-0">
                  <span className="text-base sm:text-lg font-bold text-primary mb-2">{item.name}</span>
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow">
                    <img
                      src={item.image_url || `https://images.unsplash.com/photo-1508747703725-719777637510?w=100&h=100&fit=crop&q=80`}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                {/* עמודה: שינוי כמות */}

                {/* עמודה: עמודה: שינוי משקל */}
                <div className="flex flex-col items-center min-w-[120px] sm:min-w-[180px]">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateWeight(item.id, item.selectedWeight || item.weight, Math.max(minWeight, (item.selectedWeight || item.weight) - step))}
                      disabled={(item.selectedWeight || item.weight) <= minWeight}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-primary text-primary text-2xl flex items-center justify-center hover:bg-primary hover:text-white transition"
                      aria-label="הפחת משקל"
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    <span className="text-lg sm:text-2xl font-extrabold text-gray-900 mx-2">{item.selectedWeight ? item.selectedWeight : item.weight}</span>
                    <span className="text-sm sm:text-lg font-bold text-gray-500">גרם</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateWeight(item.id, item.selectedWeight || item.weight, (item.selectedWeight || item.weight) + step)}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-primary text-primary text-2xl flex items-center justify-center hover:bg-primary hover:text-white transition"
                      aria-label="הוסף משקל"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
                {/* עמודה: מחיר כולל */}
                <div className="flex flex-col items-end min-w-[90px] sm:min-w-[110px]">
                  <span className="text-xs sm:text-base">מחיר</span>
                  <span className="text-lg sm:text-xl font-extrabold text-primary">₪{item.price?.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}