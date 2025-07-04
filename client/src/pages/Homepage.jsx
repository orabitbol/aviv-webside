import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Leaf, Shield, Truck } from "lucide-react";

export default function Homepage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.filter(c => c.is_active !== false));
    } catch (error) {
      console.error('שגיאה בטעינת קטגוריות:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Leaf className="w-6 h-6 text-green-600" />,
      title: "איכות פרימיום",
      description: "אגוזים וזרעים שנבחרו בקפידה מחוות אורגניות מאושרות"
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "טריות מובטחת",
      description: "נארז טרי מדי יום לשמירה על טעמים וחומרים מזינים טבעיים"
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      title: "משלוח מהיר",
      description: "משלוח מהיר לאזור הדרום תוך 2-3 ימים"
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-orange-500/5 to-green-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ברוכים הבאים ל-
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600"> NutHub</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              גלו את המבחר המשובח ביותר של אגוזים וזרעי פרימיום, שנבצרו בקפידה מחוות מהימנות.
              כל מוצר ארוז בטוב טבעי, ומספק טעם וערך תזונתי יוצאי דופן
              ישר לדלתכם.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center items-center">
              <Link to={createPageUrl("Products")}>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  קנו עכשיו
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-orange-500">
                <span className="text-sm font-medium">דירוג לקוחות 4.9/5</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white to-gray-50 rounded-full flex items-center justify-center shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            חקרו את 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600"> הקטגוריות </span>
            שלנו
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            משקדים פריכים ועד זרעים עתירי חלבון, גלו את המבחר שלנו
            של אגוזים וזרעים מובחרים.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center flex-wrap gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex justify-center flex-wrap gap-x-12 gap-y-8">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={createPageUrl(`Products?category=${category.slug}`)}
                className="group flex flex-col items-center gap-4 text-center w-40"
              >
                <div className="relative w-40 h-40">
                  <img 
                    src={category.image_url || `https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop&q=80`}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-full shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 border-4 border-white"
                  />
                   <div className="absolute inset-0 bg-black/10 rounded-full group-hover:bg-black/0 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">אין קטגוריות זמינות כרגע.</p>
          </div>
        )}
      </section>
    </div>
  );
}