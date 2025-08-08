import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, XCircle } from "lucide-react";

export default function PaymentError() {
  // בדוק אם יש פרמטרים מה-URL (מגיע מ-Hypay)
  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlParams = urlParams.has('Id') || urlParams.has('CCode') || urlParams.has('Amount');
  
  // הדפס פרמטרים לקונסול
  React.useEffect(() => {
    if (hasUrlParams) {
      const params = {};
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      console.log("Payment Error Parameters:", params);
    }
  }, [hasUrlParams]);

  // קבל פרטי השגיאה
  const ccode = urlParams.get('CCode');
  const amount = urlParams.get('Amount');
  const orderId = urlParams.get('Order');
  const customerName = urlParams.get('Fild1');
  
  // הודעת שגיאה מותאמת לפי CCode
  const getErrorMessage = (code) => {
    switch(code) {
      case '4':
        return 'הכרטיס אשראי נדחה על ידי הבנק. ייתכן שהכרטיס חסום או שהעסקה נחשבת לחשודה.';
      case '5':
        return 'הכרטיס אשראי פג תוקף.';
      case '6':
        return 'מספר כרטיס אשראי שגוי.';
      case '7':
        return 'CVV שגוי.';
      default:
        return 'לא הצלחנו לעבד את התשלום שלך. ייתכן שהעסקה נדחתה או שחלה תקלה זמנית.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-error" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-error mb-4">התשלום נכשל</h1>
      <p className="text-lg text-muted mb-8">
        {hasUrlParams ? getErrorMessage(ccode) : 'לא הצלחנו לעבד את התשלום שלך. ייתכן שהעסקה נדחתה או שחלה תקלה זמנית.'}
      </p>
      
      {/* הצג פרטי השגיאה אם יש */}
      {hasUrlParams && (
        <Card className="border-2 border-error/20 shadow-xl bg-surface/90 backdrop-blur-md rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div>
                <h3 className="font-semibold text-text mb-2">פרטי השגיאה</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">קוד שגיאה:</span> {ccode || 'לא צוין'}
                  </p>
                  <p>
                    <span className="font-medium">מספר הזמנה:</span> {orderId || 'לא צוין'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-2">פרטי התשלום</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">סכום:</span> 
                    <span className="text-error font-bold"> ₪{amount || '0'}</span>
                  </p>
                  <p>
                    <span className="font-medium">לקוח:</span> {customerName || 'לא צוין'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
        <Link to={createPageUrl("Checkout")}> 
          <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full font-bold shadow-xl">
            <ArrowLeft className="mr-2 w-4 h-4" />
            נסה שוב
          </Button>
        </Link>
        <Link to={createPageUrl("Homepage")}> 
          <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 rounded-full font-bold">
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    </div>
  );
} 