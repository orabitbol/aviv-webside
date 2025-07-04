import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl, getApiBaseUrl } from "@/utils";
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
        <div className="absolute inset-0 bg-gradient-to-l from-primary/10 to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
              ברוכים הבאים ל-
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> NutHub</span>
            </h1>
            <p className="text-xl text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              גלו את המבחר המשובח ביותר של אגוזים וזרעים פרימיום, שנבחרו בקפידה מחוות מובחרות.
              כל מוצר ארוז בטוב טעם, ומספק טעם וערך תזונתי יוצאי דופן.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center items-center">
              <Link to={createPageUrl("Products")}> 
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-8 py-3 text-lg rounded-full shadow-xl transition-all">
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  קנו עכשיו
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-primary">
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
            <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-shadow bg-surface/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            חקרו את
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> הקטגוריות </span>
            שלנו
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            משקדים פריכים ועד זרעים עתירי חלבון, גלו את המבחר שלנו של אגוזים וזרעים מובחרים.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center flex-wrap gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 bg-muted rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex justify-center flex-wrap gap-x-12 gap-y-8">
            {categories.map((category) => {
              let imageSrc = category.image_url;
              if (imageSrc && imageSrc.startsWith('/uploads')) {
                imageSrc = `${getApiBaseUrl()}${imageSrc}`;
              }
              return (
                <Link 
                  key={category.id} 
                  to={createPageUrl(`Products?category=${category.slug}`)}
                  className="group flex flex-col items-center gap-4 text-center w-40"
                >
                  <div className="relative w-40 h-40">
                    {imageSrc ? (
                      <img 
                        src={imageSrc}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-full shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 border-4 border-surface"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-full bg-muted text-gray-400 text-4xl font-bold border-4 border-surface">
                        ?
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 rounded-full group-hover:bg-black/0 transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted text-lg">אין קטגוריות זמינות כרגע.</p>
          </div>
        )}
      </section>
    </div>
  );
}