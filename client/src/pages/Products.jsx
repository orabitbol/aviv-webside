import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast, Toaster } from "sonner";
import { getApiBaseUrl } from "@/lib/utils";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData(currentPage);
    checkUrlCategory();
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const loadData = async (page = 1) => {
    try {
      let url = `${getApiBaseUrl()}/api/products?page=${page}&limit=${ITEMS_PER_PAGE}`;
      // אפשר להוסיף כאן פרמטרים לסינון/חיפוש בעתיד
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUrlCategory = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('category');
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const productToCart = { ...product, product_id: product._id, id: product._id };
    const existingItem = cart.find(item =>
      (item.product_id === product._id || item.id === product._id) &&
      (item.selectedWeight === product.selectedWeight)
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...productToCart, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} נוסף לסל!`);
    window.dispatchEvent(new Event('storage'));
  };

  function ProductCard({ product, addToCart }) {
    const [selectedWeight, setSelectedWeight] = useState(product.base_weight || 100);
    const price = ((product.base_price || 0) * (selectedWeight / (product.base_weight || 100))).toFixed(2);
    const minWeight = product.base_weight || 100;
    const step = product.weight_step || 50;
    const isOutOfStock = product.is_active === false;
    let imageSrc = product.image || product.image_url || 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop&q=80';
    if (product.image && product.image.startsWith('/uploads')) {
      imageSrc = `${getApiBaseUrl()}${product.image}`;
    }
    return (
      <div className={`flex flex-col items-center p-6 transition-all duration-300 ${isOutOfStock ? 'opacity-60 grayscale' : ''} rounded-3xl`}
        style={isOutOfStock ? { pointerEvents: 'none' } : {}}>
        <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-lg bg-white flex items-center justify-center mb-4 relative">
          <img
            src={imageSrc}
            alt={product.name}
            className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
          />
          {isOutOfStock && (
            <span className="absolute top-2 left-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            </span>
          )}
        </div>
        <div className="text-xl font-bold text-primary mb-2">{product.name}</div>
        <div className="text-muted text-sm mb-2">{product.description}</div>
        {isOutOfStock && (
          <div className="mb-4 flex flex-col items-center">
            <span className="inline-block bg-gradient-to-r from-red-400 to-yellow-300 text-white text-base font-extrabold rounded-full px-6 py-2 shadow-lg tracking-wide animate-pulse">
              נגמר המלאי
            </span>
            <span className="text-xs text-gray-500 mt-2">המוצר יחזור בקרוב</span>
          </div>
        )}
        {!isOutOfStock && (
          <>
            <div className="flex items-center gap-4 mb-2">
              <button
                className="w-14 h-14 rounded-full border-2 border-primary text-primary text-2xl flex items-center justify-center hover:bg-primary hover:text-white transition"
                onClick={() => setSelectedWeight(w => Math.max(minWeight, w - step))}
                disabled={selectedWeight <= minWeight}
                aria-label="הפחת משקל"
              >
                <Minus className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold">{selectedWeight} גרם</span>
              <button
                className="w-14 h-14 rounded-full border-2 border-primary text-primary text-2xl flex items-center justify-center hover:bg-primary hover:text-white transition"
                onClick={() => setSelectedWeight(w => w + step)}
                aria-label="הוסף משקל"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            {/* מחיר רגיל ומחיר הנחה */}
            {product.discountPrice ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-gray-400 line-through">₪{((product.base_price || 0) * (selectedWeight / (product.base_weight || 100))).toFixed(2)}</span>
                <span className="text-xl font-extrabold text-success">₪{(product.discountPrice * (selectedWeight / (product.base_weight || 100))).toFixed(2)}</span>
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">מבצע</span>
              </div>
            ) : (
              <div className="text-lg font-bold text-success mb-2">₪{price} ל-{selectedWeight} גרם</div>
            )}
            <Button
              size="sm"
              onClick={() => addToCart({ ...product, selectedWeight, price: Number(product.discountPrice ? (product.discountPrice * (selectedWeight / (product.base_weight || 100))).toFixed(2) : price) })}
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white font-bold shadow-lg transition-all"
            >
              <ShoppingCart className="ml-2 w-4 h-4" />
              הוסף לסל
            </Button>
          </>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Toaster richColors />
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
          מוצרי <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">פרימיום</span>
        </h1>
        <p className="text-lg text-muted">
          גלו את מבחר האגוזים והזרעים המובחרים שלנו
        </p>
      </div>

      {/* Filters */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-border">
        <div className="flex flex-col md:flex-row-reverse gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <Input 
              placeholder="חיפוש מוצרים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 border-border focus:border-primary rounded-full bg-surface text-text placeholder:text-muted"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 border-border focus:border-primary rounded-full bg-surface text-text">
              <SelectValue placeholder="מיון לפי" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">שם (א-ת)</SelectItem>
              <SelectItem value="price_low">מחיר (מהנמוך לגבוה)</SelectItem>
              <SelectItem value="price_high">מחיר (מהגבוה לנמוך)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 border-border focus:border-primary rounded-full bg-surface text-text">
              <SelectValue placeholder="כל הקטגוריות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} addToCart={addToCart} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">הקודם</span>
                &lt;
              </Button>
              <span className="text-sm">עמוד {currentPage} מתוך {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">הבא</span>
                &gt;
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted text-lg">לא נמצאו מוצרים תואמים.</p>
        </div>
      )}
    </div>
  );
}