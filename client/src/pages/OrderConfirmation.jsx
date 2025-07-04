import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
// import { OrderItem } from "@/api/entities"; // נמחק
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, MapPin, CreditCard, ArrowLeft, Mail, Phone } from "lucide-react";

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const orderNumber = new URLSearchParams(window.location.search).get('order');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?order_number=${orderNumber}`);
        const data = await res.json();
        setOrder(data[0] || null);
      } catch (error) {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!order) return;
      try {
        const res = await fetch(`/api/order-items/order/${order._id}`);
        const data = await res.json();
        setOrderItems(data);
      } catch (error) {
        setOrderItems([]);
      }
    };
    fetchOrderItems();
  }, [order]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען פרטי הזמנה...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">הזמנה לא נמצאה</h1>
          <p className="text-gray-600 mb-8">לא הצלחנו למצוא את ההזמנה שחיפשת.</p>
          <Link to={createPageUrl("Homepage")}>
            <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white">
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          ההזמנה <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-500">אושרה!</span>
        </h1>
        <p className="text-lg text-gray-600">
          תודה על הזמנתך. קיבלנו את הזמנתך ונעבד אותה בהקדם.
        </p>
      </div>

      {/* Order Details */}
      <div className="space-y-6">
        {/* Order Information */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              פרטי הזמנה
              <Package className="w-5 h-5 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                <h3 className="font-semibold text-gray-900 mb-2">פרטי לקוח</h3>
                <div className="space-y-1 text-sm">
                  <p>{order.customerName} :<span className="font-medium">שם</span></p>
                  <p>{order.customerEmail} :<span className="font-medium">דוא"ל</span></p>
                  <p>{order.phone} :<span className="font-medium">טלפון</span></p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">פרטי הזמנה</h3>
                <div className="space-y-1 text-sm">
                  <p>{order.order_number} :<span className="font-medium">מספר הזמנה</span></p>
                  <p>{new Date(order.createdAt).toLocaleDateString()} :<span className="font-medium">תאריך</span></p>
                  <p>
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      {order.status}
                    </span>
                    :<span className="font-medium">סטטוס</span> 
                  </p>
                  <p><span className="text-green-600 font-bold">₪{order.total?.toFixed(2)}</span> :<span className="font-medium">סה"כ</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              פרטי משלוח
              <MapPin className="w-5 h-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">פרטי הזמנה</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle>פריטים בהזמנה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="text-left">
                    <p className="font-semibold">₪{item.subtotal?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">₪{item.price?.toFixed(2)} ליחידה</p>
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                    <p className="text-sm text-gray-600">כמות: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
          <Link to={createPageUrl("Homepage")}>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full">
               <ArrowLeft className="mr-2 w-4 h-4" />
              חזרה לדף הבית
            </Button>
          </Link>
          <Link to={createPageUrl("Products")}>
            <Button variant="outline" className="w-full sm:w-auto border-orange-300 hover:bg-orange-50 rounded-full">
              המשך קניות
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}