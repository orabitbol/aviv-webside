import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Filter, Star } from "lucide-react";
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
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          מוצרי <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">פרימיום</span>
        </h1>
        <p className="text-lg text-gray-600">
          גלו את מבחר האגוזים והזרעים המובחרים שלנו
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row-reverse gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="חיפוש מוצרים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 border-orange-300 focus:border-orange-500"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 border-orange-300 focus:border-orange-500">
              <SelectValue placeholder="מיון לפי" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">שם (א-ת)</SelectItem>
              <SelectItem value="price_low">מחיר (מהנמוך לגבוה)</SelectItem>
              <SelectItem value="price_high">מחיר (מהגבוה לנמוך)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 border-orange-300 focus:border-orange-500">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => (
            <div key={product._id} className="group text-center flex flex-col items-center">
              <div className="relative w-48 h-48">
                <img 
                  src={product.image_url || `https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop&q=80`}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-full shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 border-4 border-white"
                />
                 {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                    <Badge variant="destructive" className="absolute top-2 left-2">אזל מהמלאי</Badge>
                  )}
              </div>
              <div className="mt-4 flex-grow flex flex-col items-center">
                 <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 h-10 line-clamp-2">
                    {product.description || "אגוזים וזרעים באיכות פרימיום"}
                  </p>
                  <div className="flex items-center justify-center gap-4 my-2">
                     <span className="text-xs text-gray-500">{product.weight}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 ml-1">4.9</span>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                  </div>
              </div>
              <div className="mt-auto w-full">
                  <span className="text-xl font-bold text-green-600">
                    ₪{product.price?.toFixed(2)}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    {product.stock_quantity === 0 ? 'אזל מהמלאי' : 'הוספה לסל'}
                    <ShoppingCart className="w-4 h-4 mr-1" />
                  </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">לא נמצאו מוצרים התואמים את החיפוש.</p>
        </div>
      )}
    </div>
  );
}