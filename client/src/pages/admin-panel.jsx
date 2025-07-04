import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { DatePicker } from "@/components/ui/datepicker";

const ITEMS_PER_PAGE = 20;

function Pagination({ currentPage, totalItems, onPageChange }) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      <span className="text-sm">
        עמוד {currentPage} מתוך {totalPages}
      </span>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [ordersSearchTerm, setOrdersSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState("all");
  const [productsPage, setProductsPage] = useState(1);
  
  const [categoriesPage, setCategoriesPage] = useState(1);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orderItemsModal, setOrderItemsModal] = useState({ open: false, items: [], loading: false, orderId: null });

  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(ordersPage, dateRange.from, dateRange.to);
      loadData();
    }
  }, [isAuthenticated, ordersPage, dateRange.from, dateRange.to]);

  useEffect(() => {
    filterOrders();
  }, [orders, ordersSearchTerm, statusFilter, dateFilter]);
  
  useEffect(() => {
    filterProducts();
  }, [products, selectedProductCategory]);

  useEffect(() => {
    if (!ordersSearchTerm && statusFilter === 'all' && dateFilter === 'all') {
      setFilteredOrders(Array.isArray(orders) ? [...orders] : []);
    }
  }, [orders]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error();
      const user = await res.json();
      setIsAuthenticated(user.isAdmin);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async (page = 1, from = '', to = '') => {
    setOrdersLoading(true);
    try {
      let url = `/api/orders?page=${page}&limit=20`;
      if (from && to) {
        url += `&from=${from}&to=${to}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      const ordersArr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setOrders(ordersArr);
      setOrdersTotal(data.total || ordersArr.length);
      setOrdersPages(data.pages || 1);
    } catch (error) {
      setOrders([]);
      setOrdersTotal(0);
      setOrdersPages(1);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const ordersArr = Array.isArray(ordersData.data) ? ordersData.data : (Array.isArray(ordersData) ? ordersData : []);
      setOrders(ordersArr);
      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    }
  };

  const filterOrders = () => {
    let filtered = Array.isArray(orders) ? [...orders] : [];
    if (ordersSearchTerm) {
      filtered = filtered.filter(o => 
        (o.customerName && o.customerName.toLowerCase().includes(ordersSearchTerm.toLowerCase())) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(ordersSearchTerm.toLowerCase())) ||
        (o._id && o._id.toLowerCase().includes(ordersSearchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      filtered = filtered.filter(o => {
        const created = new Date(o.createdAt);
        return created >= fromDate && created <= toDate;
      });
    }
    setFilteredOrders(filtered);
    setOrdersPage(1);
  };
  
  const filterProducts = () => {
    let filtered = selectedProductCategory === 'all' 
      ? [...products] 
      : products.filter(p => p.category_id === selectedProductCategory);
    setFilteredProducts(filtered);
    setProductsPage(1);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });
      loadOrders(ordersPage);
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס הזמנה:', error);
    }
  };

  const exportOrders = () => {
    // CSV export logic remains the same
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "שגיאת התחברות");
        return;
      }
      window.location.reload();
    } catch (err) {
      setLoginError("שגיאת התחברות");
    }
  };
  
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { credentials: "include" });
    window.location.reload();
  };

  const openOrderItemsModal = async (orderId) => {
    setOrderItemsModal({ open: true, items: [], loading: true, orderId });
    try {
      const res = await fetch(`/api/order-items/order/${orderId}`);
      const data = await res.json();
      setOrderItemsModal({ open: true, items: data, loading: false, orderId });
    } catch {
      setOrderItemsModal({ open: true, items: [], loading: false, orderId });
    }
  };

  const closeOrderItemsModal = () => setOrderItemsModal({ open: false, items: [], loading: false, orderId: null });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">אזור ניהול</CardTitle>
            <p className="text-gray-600">יש להתחבר כדי לגשת לאזור הניהול</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 text-right">
              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input id="email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">סיסמה</Label>
                <Input id="password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">התחברות</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">אזור ניהול</h1>
          <p className="text-gray-600">ניהול הזמנות, מוצרים וקטגוריות</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">הזמנות</TabsTrigger>
            <TabsTrigger value="products">מוצרים</TabsTrigger>
            <TabsTrigger value="categories">קטגוריות</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button onClick={exportOrders} className="flex items-center gap-2">
                    ייצוא CSV
                    <Download className="w-4 h-4" />
                  </Button>
                   <CardTitle>ניהול הזמנות</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                  <div className="flex gap-2 items-center">
                    <span>מתאריך:</span>
                    <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} className="border rounded px-2 py-1" />
                    <span>עד:</span>
                    <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} className="border rounded px-2 py-1" />
                    <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: '', to: '' })}>נקה</Button>
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="חיפוש הזמנות..." value={ordersSearchTerm} onChange={(e) => setOrdersSearchTerm(e.target.value)} className="pr-10"/>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder="כל הסטטוסים" /></SelectTrigger><SelectContent><SelectItem value="all">כל הסטטוסים</SelectItem><SelectItem value="pending">ממתינה</SelectItem><SelectItem value="processing">בעיבוד</SelectItem><SelectItem value="shipped">נשלחה</SelectItem><SelectItem value="delivered">התקבלה</SelectItem><SelectItem value="cancelled">בוטלה</SelectItem></SelectContent></Select>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>מס'</TableHead>
                        <TableHead>תאריך</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead>סכום</TableHead>
                        <TableHead>שם לקוח</TableHead>
                        <TableHead>אימייל</TableHead>
                        <TableHead>טלפון</TableHead>
                        <TableHead>כתובת</TableHead>
                        <TableHead>מוצרים</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersLoading ? (
                        <TableRow><TableCell colSpan={9} className="text-center">טוען...</TableCell></TableRow>
                      ) : !Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="text-center">אין הזמנות להצגה</TableCell></TableRow>
                      ) : getPaginatedData(filteredOrders, ordersPage).map((order, idx) => (
                        <TableRow key={order._id || order.id}>
                          <TableCell>{order._id || order.id || (idx + 1 + (ordersPage - 1) * ITEMS_PER_PAGE)}</TableCell>
                          <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'd LLL, yyyy', { locale: he }) : '—'}</TableCell>
                          <TableCell><Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                          <TableCell>₪{order.total?.toFixed(2)}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.customerEmail}</TableCell>
                          <TableCell>{order.phone}</TableCell>
                          <TableCell>{order.address}</TableCell>
                          <TableCell>
                            <Dialog open={orderItemsModal.open && orderItemsModal.orderId === order._id} onOpenChange={v => !v && closeOrderItemsModal()}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openOrderItemsModal(order._id)}>
                                  הצג
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl" dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>מוצרים בהזמנה</DialogTitle>
                                </DialogHeader>
                                {orderItemsModal.loading ? (
                                  <div className="text-center py-8">טוען...</div>
                                ) : orderItemsModal.items.length === 0 ? (
                                  <div className="text-center py-8">אין מוצרים להזמנה זו</div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full rounded-xl overflow-hidden shadow border border-border">
                                      <thead className="bg-background">
                                        <tr>
                                          <th className="px-4 py-2 text-right font-bold text-text">שם מוצר</th>
                                          <th className="px-4 py-2 text-right font-bold text-text">כמות</th>
                                          <th className="px-4 py-2 text-right font-bold text-text">מחיר ליחידה</th>
                                          <th className="px-4 py-2 text-right font-bold text-text">סה"כ</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {orderItemsModal.items.map((item) => {
                                          const product = products.find(p => p._id === item.product_id);
                                          return (
                                            <tr key={item._id || item.id} className="hover:bg-accent/10 transition">
                                              <td className="px-4 py-2 text-text flex items-center gap-2">
                                                {product && product.image_url && (
                                                  <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-full object-cover border border-border shadow" />
                                                )}
                                                {product ? product.name : '—'}
                                              </td>
                                              <td className="px-4 py-2 text-text">{item.quantity}</td>
                                              <td className="px-4 py-2 text-text">₪{item.price?.toFixed(2)}</td>
                                              <td className="px-4 py-2 text-success font-bold">₪{(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                    disabled={ordersPage === 1 || ordersLoading}
                    className="mx-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="mx-2 text-sm">עמוד {ordersPage} מתוך {ordersPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOrdersPage(p => Math.min(ordersPages, p + 1))}
                    disabled={ordersPage === ordersPages || ordersLoading}
                    className="mx-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <AddProductDialog categories={categories} onProductAdded={loadData} selectedCategoryId={selectedProductCategory} />
                   <div className="flex items-center gap-4">
                     <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="סינון לפי קטגוריה" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">כל הקטגוריות</SelectItem>{categories.map(c => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <CardTitle>ניהול מוצרים</CardTitle>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>סטטוס</TableHead><TableHead>מלאי</TableHead><TableHead>מחיר</TableHead><TableHead>קטגוריה</TableHead><TableHead>שם</TableHead></TableRow></TableHeader><TableBody>
                  {Array.isArray(filteredProducts) && filteredProducts.map((p) => (<TableRow key={p._id || p.id}>
                    <TableCell><Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'פעיל' : 'לא פעיל'}</Badge></TableCell>
                    <TableCell>{p.stock_quantity}</TableCell><TableCell>₪{p.price?.toFixed(2)}</TableCell>
                    <TableCell>{categories.find(c => c.id === p.category_id)?.name || 'לא ידוע'}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                  </TableRow>))}
                </TableBody></Table></div>
                <Pagination currentPage={productsPage} totalItems={filteredProducts.length} onPageChange={setProductsPage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><AddCategoryDialog onCategoryAdded={loadData} /><CardTitle>ניהול קטגוריות</CardTitle></div></CardHeader>
              <CardContent>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>פעולות</TableHead><TableHead>סטטוס</TableHead><TableHead>מוצרים</TableHead><TableHead>שם</TableHead></TableRow></TableHeader><TableBody>
                  {Array.isArray(categories) && categories.map((c) => (<TableRow key={c._id || c.id}>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedProductCategory(c.id); setActiveTab("products"); }}>
                        הצג מוצרים
                      </Button>
                    </TableCell>
                    <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'פעיל' : 'לא פעיל'}</Badge></TableCell>
                    <TableCell>{products.filter(p => p.category_id === c.id).length}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                  </TableRow>))}
                </TableBody></Table></div>
                <Pagination currentPage={categoriesPage} totalItems={categories.length} onPageChange={setCategoriesPage} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isAuthenticated && (
          <Button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white mt-4">התנתק</Button>
        )}
      </div>
    </div>
  );
}

function AddProductDialog({ categories, onProductAdded, selectedCategoryId }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", category_id: "", image: "", weight: "", stock_quantity: "", is_active: true, base_weight: "", base_price: "", weight_step: "" });
  
  useEffect(() => {
    if(selectedCategoryId && selectedCategoryId !== 'all') {
      setFormData(prev => ({...prev, category_id: selectedCategoryId}));
    }
  }, [selectedCategoryId, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        category_id: formData.category_id,
        weight: formData.weight,
        stock_quantity: Number(formData.stock_quantity),
        is_active: formData.is_active,
        base_weight: Number(formData.base_weight),
        base_price: Number(formData.base_price),
        weight_step: Number(formData.weight_step)
      };
      await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setOpen(false);
      setFormData({ name: "", description: "", price: "", category_id: "", image: "", weight: "", stock_quantity: "", is_active: true, base_weight: "", base_price: "", weight_step: "" });
      onProductAdded();
    } catch (error) { console.error('שגיאה בהוספת מוצר:', error); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="flex items-center gap-2"><Plus className="w-4 h-4" />הוסף מוצר</Button></DialogTrigger><DialogContent className="max-w-md" dir="rtl"><DialogHeader><DialogTitle className="text-right">הוספת מוצר חדש</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4 text-right">
      <div><Label htmlFor="name">שם</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required/></div>
      <div><Label htmlFor="description">תיאור</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/></div>
      <div><Label htmlFor="price">מחיר</Label><Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required/></div>
      <div><Label htmlFor="category">קטגוריה</Label><Select value={formData.category_id} onValueChange={(v) => setFormData({...formData, category_id: v})}><SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label htmlFor="weight">משקל/גודל</Label><Input id="weight" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder='לדוגמה: 500ג, 1ק"ג'/></div>
      <div><Label htmlFor="stock">כמות במלאי</Label><Input id="stock" type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} required/></div>
      <div><Label htmlFor="image">כתובת תמונה</Label><Input id="image" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="https://..."/></div>
      <div><Label htmlFor="base_weight">משקל בסיס (גרם)</Label><Input id="base_weight" type="number" value={formData.base_weight} onChange={(e) => setFormData({...formData, base_weight: e.target.value})} required/></div>
      <div><Label htmlFor="base_price">מחיר למשקל בסיס</Label><Input id="base_price" type="number" step="0.01" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} required/></div>
      <div><Label htmlFor="weight_step">קפיצת משקל (גרם)</Label><Input id="weight_step" type="number" value={formData.weight_step} onChange={(e) => setFormData({...formData, weight_step: e.target.value})} required/></div>
      <Button type="submit" className="w-full">הוסף מוצר</Button></form></DialogContent></Dialog>
  );
}

function AddCategoryDialog({ onCategoryAdded }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", slug: "", image_url: "", is_active: true });

  function makeSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = formData.slug ? makeSlug(formData.slug) : makeSlug(formData.name);
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, slug })
      });
      setOpen(false);
      setFormData({ name: "", description: "", slug: "", image_url: "", is_active: true });
      onCategoryAdded();
    } catch (error) { console.error('שגיאה בהוספת קטגוריה:', error); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="flex items-center gap-2"><Plus className="w-4 h-4" />הוסף קטגוריה</Button></DialogTrigger><DialogContent className="max-w-md" dir="rtl"><DialogHeader><DialogTitle className="text-right">הוספת קטגוריה חדשה</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4 text-right">
      <div><Label htmlFor="name">שם</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required/></div>
      <div><Label htmlFor="description">תיאור</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/></div>
      <div><Label htmlFor="slug">Slug (מזהה לכתובת באנגלית)</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="נוצר אוטומטית מהשם"/></div>
      <div><Label htmlFor="image">כתובת תמונה</Label><Input id="image" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..."/></div>
      <Button type="submit" className="w-full">הוסף קטגוריה</Button></form></DialogContent></Dialog>
  );
}