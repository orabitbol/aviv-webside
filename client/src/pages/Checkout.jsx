import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getApiBaseUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CreditCard, MapPin, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { FaCreditCard, FaBoxOpen } from 'react-icons/fa';
import { SiBit } from 'react-icons/si';

const SOUTHERN_CITIES = [
  "באר שבע", "אילת", "ערד", "דימונה", "נתיבות", "אופקים", "שדרות", "אשקלון", "אשדוד", "קריית גת", "קריית מלאכי"
];

const STEPS = [
  { id: 1, name: "משלוח", icon: MapPin },
  { id: 2, name: "תשלום", icon: CreditCard },
  { id: 3, name: "אישור", icon: Check }
];

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    shipping_address: "", shipping_city: "", shipping_region: "דרום",
    payment_method: "", notes: ""
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate(createPageUrl("Cart"));
    } else {
      setCartItems(cart);
    }
  }, []);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const getTotalPrice = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const validateShipping = () => {
    const required = ['customer_name', 'customer_email', 'customer_phone', 'shipping_address', 'shipping_city'];
    if (required.some(field => !formData[field])) {
      toast.error('אנא מלא את כל שדות המשלוח');
      return false;
    }
    if (!formData.customer_email.includes('@')) {
      toast.error('אנא הזן כתובת דוא"ל חוקית');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateShipping()) return;
    if (step === 2 && !formData.payment_method) {
      toast.error('אנא בחר אמצעי תשלום');
      return;
    }
    setStep(s => s + 1);
  };
  
  const handlePrevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const totalAmount = getTotalPrice() + 5.99;
      const orderData = {
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        address: formData.shipping_address,
        phone: formData.customer_phone,
        total: totalAmount,
        status: "pending"
      };
      const orderItemsData = cartItems.map(item => ({
        product_id: item.product_id || item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        selectedWeight: item.selectedWeight,
        base_weight: item.base_weight,
        base_price: item.base_price,
        image: item.image || item.image_url
      }));
      const orderRes = await fetch(`${getApiBaseUrl()}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          items: orderItemsData
        })
      });
      const orderResult = await orderRes.json();
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      toast.success('ההזמנה בוצעה בהצלחה!');
      navigate(createPageUrl("OrderConfirmation"), {
        state: {
          order: orderResult.order,
          items: orderResult.items
        }
      });
    } catch (error) {
      console.error('שגיאה בעיבוד ההזמנה:', error);
      toast.error('שגיאה בעיבוד ההזמנה. אנא נסה שוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-12 pb-32">
      <Toaster richColors />
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">תשלום</span>
        </h1>
        {/* Step Indicator */}
        <div className="flex flex-col sm:flex-row items-center max-w-2xl mx-auto">
          {STEPS.map((s, index) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.id ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-muted'}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className={`mt-2 text-xs text-center font-medium ${step >= s.id ? 'text-primary' : 'text-muted'}`}>{s.name}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-2 rounded-full bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Card className="border-2 border-border shadow-2xl bg-surface/90 backdrop-blur-md rounded-2xl">
        <CardContent className="p-4 sm:p-8 text-right">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">פרטי משלוח</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="customer_email">דוא&quot;ל *</Label><Input id="customer_email" type="email" value={formData.customer_email} onChange={(e) => handleInputChange('customer_email', e.target.value)} required /></div>
                <div><Label htmlFor="customer_name">שם מלא *</Label><Input id="customer_name" value={formData.customer_name} onChange={(e) => handleInputChange('customer_name', e.target.value)} required /></div>
              </div>
              <div><Label htmlFor="customer_phone">טלפון *</Label><Input id="customer_phone" type="tel" value={formData.customer_phone} onChange={(e) => handleInputChange('customer_phone', e.target.value)} required /></div>
              <div><Label htmlFor="shipping_address">כתובת *</Label><Input id="shipping_address" value={formData.shipping_address} onChange={(e) => handleInputChange('shipping_address', e.target.value)} required /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>אזור</Label><Input value="דרום" disabled className="bg-gray-100" /></div>
                <div>
                  <Label htmlFor="shipping_city">עיר *</Label>
                  <Select value={formData.shipping_city} onValueChange={(value) => handleInputChange('shipping_city', value)}><SelectTrigger><SelectValue placeholder="בחר עיר" /></SelectTrigger><SelectContent>{SOUTHERN_CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div><Label htmlFor="notes">הערות למשלוח</Label><Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">אמצעי תשלום</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                {[
                  {
                    value: 'Credit Card',
                    label: 'כרטיס אשראי',
                    icon: <FaCreditCard className="w-10 h-10 text-primary mx-auto" />,
                    desc: 'תשלום מאובטח בכרטיס אשראי',
                  },
                  {
                    value: 'Bit',
                    label: 'Bit',
                    icon: <SiBit className="w-10 h-10 text-blue-500 mx-auto" />,
                    desc: 'תשלום מהיר דרך אפליקציית Bit',
                  },
                  {
                    value: 'PayBox',
                    label: 'PayBox',
                    icon: <FaBoxOpen className="w-10 h-10 text-green-500 mx-auto" />,
                    desc: 'תשלום קל דרך PayBox',
                  },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleInputChange('payment_method', opt.value)}
                    className={`group w-full rounded-2xl border-2 p-6 flex flex-col items-center shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50
                      ${formData.payment_method === opt.value ? 'border-primary bg-primary/10 scale-105 shadow-2xl' : 'border-border bg-white hover:bg-primary/5'}`}
                  >
                    {opt.icon}
                    <div className="mt-4 text-lg font-bold text-primary group-hover:text-accent">{opt.label}</div>
                    <div className="text-sm text-muted mt-2">{opt.desc}</div>
                    {formData.payment_method === opt.value && (
                      <div className="mt-4 text-green-600 font-bold flex items-center gap-2"><Check className="w-5 h-5" />נבחר</div>
                    )}
                  </button>
                ))}
              </div>
              <div><Label htmlFor="notes">הערות להזמנה (אופציונלי)</Label><Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">אישור ההזמנה שלך</h2>
              <div className="grid md:grid-cols-2 gap-6">
                 <div>
                  <h3 className="font-semibold mb-2">אמצעי תשלום:</h3>
                  <p>{formData.payment_method}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">כתובת למשלוח:</h3>
                  <p>{formData.customer_name}</p>
                  <p>{formData.shipping_address}</p>
                  <p>{formData.shipping_city}, {formData.shipping_region}</p>
                </div>
              </div>
              <Separator />
              <h3 className="font-semibold">סיכום הזמנה:</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <p>₪{(item.price * item.quantity).toFixed(2)}</p>
                  <p>{item.name} ({item.selectedWeight || item.weight || item.base_weight || 100} גרם)</p>
                </div>
              ))}
              <Separator />
              <div className="text-left space-y-2">
                <p>₪{getTotalPrice().toFixed(2)} :סה"כ ביניים</p>
                <p>₪5.99 :משלוח</p>
                <p className="text-lg font-bold"><span className="text-green-600">₪{(getTotalPrice() + 5.99).toFixed(2)}</span> :סה"כ</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center">
             {step < 3 ? (
              <Button onClick={handleNextStep} className="bg-gradient-to-r from-primary to-accent text-white rounded-full">הבא <ArrowLeft className="w-4 h-4 mr-2" /></Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isProcessing} className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full">
                {isProcessing ? 'מעבד...' : 'בצע הזמנה'}
              </Button>
            )}
            {step > 1 ? (
              <Button variant="outline" onClick={handlePrevStep} className="rounded-full">חזור<ArrowRight className="w-4 h-4 ml-2" /></Button>
            ) : <div />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}