import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Star } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkUrlCategory();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategories(categoriesData);
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

  const filterProducts = () => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return cat && product.category_id === cat._id;
      });
    }
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price_low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      filtered.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const productToCart = { ...product, product_id: product._id, id: product._id };
    const existingItem = cart.find(item => item.product_id === product._id || item.id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...productToCart, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} נוסף לסל!`);
    
    window.dispatchEvent(new Event('storage'));
  };

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
              {categories.map(category => (
                <SelectItem key={category._id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
            <div key={product._id} className="flex flex-col items-center p-6 bg-transparent">
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-lg bg-white flex items-center justify-center mb-4">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xl font-bold text-primary mb-2">{product.name}</div>
              <div className="text-muted text-sm mb-2">{product.description}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
              </div>
              <div className="text-lg font-bold text-success mb-2">₪{product.price?.toFixed(2)}</div>
              <Button
                size="sm"
                onClick={() => addToCart(product)}
                className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white font-bold shadow-lg transition-all"
              >
                <ShoppingCart className="ml-2 w-4 h-4" />
                הוסף לסל
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted text-lg">לא נמצאו מוצרים תואמים.</p>
        </div>
      )}
    </div>
  );
}