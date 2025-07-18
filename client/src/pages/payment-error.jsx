import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, XCircle } from "lucide-react";

export default function PaymentError() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-error" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-error mb-4">התשלום נכשל</h1>
      <p className="text-lg text-muted mb-8">
        לא הצלחנו לעבד את התשלום שלך. ייתכן שהעסקה נדחתה או שחלה תקלה זמנית.<br />
        נסה שוב או בחר אמצעי תשלום אחר.
      </p>
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