import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from "react-icons/fa";
import PropTypes from "prop-types";
import { getPhoneNumber } from "@/lib/utils";
export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [cartCount, setCartCount] = React.useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  React.useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const isAdminPanel = location.pathname.includes("/admin-panel");

  const mainClasses = isAdminPanel
    ? "min-h-screen bg-gray-50"
    : "min-h-screen bg-[#fdfaf6]";

  return (
    <div className={mainClasses} dir="rtl">
      {!isAdminPanel ? (
        <>
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-orange-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center gap-4">
                  <Link to={createPageUrl("Cart")}>
                    <Button
                      variant="outline"
                      className="relative border-orange-200 hover:bg-orange-50 h-11 px-4"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-600 text-xs text-white rounded-full">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>

                <nav className="hidden md:flex items-center gap-10">
                  <Link
                    to={createPageUrl("Homepage")}
                    className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                      currentPageName === "Homepage"
                        ? "text-orange-500"
                        : "text-gray-700"
                    }`}
                  >
                    דף הבית
                  </Link>
                  <Link
                    to={createPageUrl("Products")}
                    className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                      currentPageName === "Products"
                        ? "text-orange-500"
                        : "text-gray-700"
                    }`}
                  >
                    מוצרים
                  </Link>
                </nav>

                <Link
                  to={createPageUrl("Homepage")}
                  className="flex items-center gap-3 group"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 text-right">
                      NutHub
                    </h1>
                    <p className="text-xs text-orange-500 -mt-1 tracking-wider">
                      אגוזים וזרעים מובחרים
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Floating WhatsApp Button */}
          <a
            href={`https://wa.me/${getPhoneNumber()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 md:w-20 md:h-20 transition-all duration-200"
            aria-label="צ'אט וואטסאפ"
          >
            <FaWhatsapp className="w-10 h-10 md:w-12 md:h-12" />
          </a>

          {/* Footer */}
          <footer className="bg-green-800 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
                <div>
                  <h4 className="font-semibold mb-4">יצירת קשר</h4>
                  <div className="space-y-2 text-green-200 text-sm">
                    <p>info@nuthub.com 📧</p>
                    <p>(555) 123-4567 📞</p>
                    <p>משלוחים לאזור הדרום בלבד 📍</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">קישורים מהירים</h4>
                  <div className="space-y-2">
                    <Link
                      to={createPageUrl("Homepage")}
                      className="block text-green-200 hover:text-white text-sm transition-colors"
                    >
                      דף הבית
                    </Link>
                    <Link
                      to={createPageUrl("Products")}
                      className="block text-green-200 hover:text-white text-sm transition-colors"
                    >
                      מוצרים
                    </Link>
                    <Link
                      to={createPageUrl("Cart")}
                      className="block text-green-200 hover:text-white text-sm transition-colors"
                    >
                      סל קניות
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-end gap-3 mb-4">
                    <h3 className="text-lg font-bold">NutHub</h3>
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-green-200 text-sm">
                    אגוזים וזרעים באיכות פרימיום מהחוות הטובות ביותר. מביאים את
                    הטוב שבטבע לשולחן שלכם.
                  </p>
                </div>
              </div>

              <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200 text-sm">
                <p>
                  &copy; {new Date().getFullYear()} NutHub. כל הזכויות שמורות.
                </p>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
  currentPageName: PropTypes.string,
};
