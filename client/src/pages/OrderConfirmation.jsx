import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, MapPin, ArrowLeft } from "lucide-react";
import React from "react";

export default function OrderConfirmation() {
  const location = useLocation();
  const { order, items } = location.state || {};

  // קטע חדש: הדפסת כל הפרמטרים מה-URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    if (Object.keys(obj).length > 0) {
      console.log("פרמטרים מה-URL (YaadPay redirect):", obj);
    }
  }, []);
  console.log("order: ", order);
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">הזמנה לא נמצאה</h1>
          <p className="text-muted mb-8">לא הצלחנו למצוא את ההזמנה שחיפשת.</p>
          <Link to={createPageUrl("Homepage")}>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full font-bold shadow-xl transition-all">
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // חישוב ערכים בטוחים לתצוגה
  const shipping = typeof order.shipping === "number" ? order.shipping : 5.99;
  const subtotal =
    order.total && shipping
      ? order.total - shipping
      : Array.isArray(items)
        ? items.reduce((sum, item) => sum + (item.total_price || 0), 0)
        : 0;
  const total = order.total || subtotal + shipping;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-12 pb-32 text-right">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
          ההזמנה{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-primary">
            אושרה!
          </span>
        </h1>
        <p className="text-lg text-muted">
          תודה על הזמנתך. קיבלנו את הזמנתך ונעבד אותה בהקדם.
        </p>
      </div>

      {/* Order Details */}
      <div className="space-y-6">
        {/* Order Information */}
        <Card className="border-2 border-border shadow-xl bg-surface/90 backdrop-blur-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2 text-primary">
              פרטי הזמנה
              <Package className="w-5 h-5 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-text mb-2">פרטי לקוח</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    {order.customerName} :
                    <span className="font-medium">שם</span>
                  </p>
                  <p>
                    {order.customerEmail} :
                    <span className="font-medium">דוא&quot;ל</span>
                  </p>
                  <p>
                    {order.phone} :<span className="font-medium">טלפון</span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-2">פרטי הזמנה</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    {order.order_number} :
                    <span className="font-medium">מספר הזמנה</span>
                  </p>
                  <p>
                    {new Date(order.createdAt).toLocaleDateString()} :
                    <span className="font-medium">תאריך</span>
                  </p>
                  <p>
                    <span className="ml-2 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                      {order.status}
                    </span>
                    :<span className="font-medium">סטטוס</span>
                  </p>
                  <p>
                    <span className="text-success font-bold">
                      ₪{order.total?.toFixed(2)}
                    </span>{" "}
                    :<span className="font-medium">סה&quot;כ</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card className="border-2 border-border shadow-xl bg-surface/90 backdrop-blur-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2 text-primary">
              פרטי משלוח
              <MapPin className="w-5 h-5 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-text mb-2">פרטי הזמנה</h3>
                <div className="text-sm text-muted">
                  <p>{order.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-2 border-border shadow-xl bg-surface/90 backdrop-blur-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-primary">פריטים בהזמנה</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-xl overflow-hidden shadow border border-border">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-2 text-right font-bold text-text">
                      שם מוצר
                    </th>
                    <th className="px-4 py-2 text-right font-bold text-text">
                      כמות
                    </th>
                    <th className="px-4 py-2 text-right font-bold text-text">
                      גרמים
                    </th>
                    <th className="px-4 py-2 text-right font-bold text-text">
                      מחיר ל-100 גרם
                    </th>
                    <th className="px-4 py-2 text-right font-bold text-text">
                      סה&quot;כ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(items) &&
                    items.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="hover:bg-accent/10 transition"
                      >
                        <td className="px-4 py-2 text-text flex items-center gap-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-full object-cover border border-border shadow"
                            />
                          )}
                          {item.product_name || "—"}
                        </td>
                        <td className="px-4 py-2 text-text">{item.quantity}</td>
                        <td className="px-4 py-2 text-text">
                          {item.weight} גרם
                        </td>
                        <td className="px-4 py-2 text-text">
                          ₪
                          {item.unit_price?.toFixed(2) ||
                            item.base_price?.toFixed(2)}{" "}
                          / {item.base_weight || 100} גרם
                        </td>
                        <td className="px-4 py-2 text-success font-bold">
                          ₪{item.total_price?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  {Array.isArray(items) && items.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="text-left font-bold">
                          סה"כ ביניים (מוצרים):
                        </td>
                        <td className="text-success font-bold">
                          ₪{subtotal.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="text-left font-bold">
                          משלוח:
                        </td>
                        <td className="text-primary font-bold">
                          ₪{shipping.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="text-left font-bold text-lg">
                          סה"כ לתשלום (כולל משלוח):
                        </td>
                        <td className="text-success font-bold text-lg">
                          ₪{total.toFixed(2)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
          <Link to={createPageUrl("Homepage")}>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full font-bold shadow-xl">
              <ArrowLeft className="mr-2 w-4 h-4" />
              חזרה לדף הבית
            </Button>
          </Link>
          <Link to={createPageUrl("Products")}>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 rounded-full font-bold"
            >
              המשך קניות
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
