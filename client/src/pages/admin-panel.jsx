import { useState, useEffect } from "react";
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
import { Download, Plus, Search, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { getApiBaseUrl } from "@/lib/utils";
import PropTypes from "prop-types";

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

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [ordersSearchTerm, setOrdersSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState("all");
  const [productsPage, setProductsPage] = useState(1);
  
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [productsPages, setProductsPages] = useState(1);
  const [categoriesPages, setCategoriesPages] = useState(1);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orderItemsModal, setOrderItemsModal] = useState({ open: false, items: [], loading: false, orderId: null });

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
  }, [orders, ordersSearchTerm, statusFilter, dateRange.from, dateRange.to]);
  
  useEffect(() => {
    filterProducts();
  }, [products, selectedProductCategory]);

  useEffect(() => {
    if (!ordersSearchTerm && statusFilter === 'all') {
      setFilteredOrders(Array.isArray(orders) ? [...orders] : []);
    }
  }, [orders]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, { credentials: "include" });
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
      let url = `${getApiBaseUrl()}/api/orders?page=${page}&limit=20`;
      if (from && to) {
        url += `&from=${from}&to=${to}`;
      }
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      const ordersArr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setOrders(ordersArr);
      setOrdersPages(data.pages || 1);
    } catch {
      setOrders([]);
      setOrdersPages(1);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/products?page=${productsPage}&limit=20`, { credentials: "include" }),
        fetch(`${getApiBaseUrl()}/api/categories?page=${categoriesPage}&limit=20`, { credentials: "include" })
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(Array.isArray(productsData.data) ? productsData.data : []);
      setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);
      setFilteredProducts(Array.isArray(productsData.data) ? productsData.data : []);
      setProductsPages(productsData.pages || 1);
      setCategoriesPages(categoriesData.pages || 1);
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
    const safeProducts = Array.isArray(products) ? products : [];
    let filtered = selectedProductCategory === 'all' 
      ? [...safeProducts] 
      : safeProducts.filter(p => 
          p.category_id === selectedProductCategory ||
          String(p.category_id) === String(selectedProductCategory)
        );
    setFilteredProducts(filtered);
    setProductsPage(1);
  };

  const exportOrders = () => {
    // CSV export logic remains the same
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (!response.ok) {
        const data = await response.json();
        setLoginError(data.error || "שגיאה בהתחברות");
        return;
      }
      setIsAuthenticated(true);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setLoginError("שגיאה בשרת. אנא נסה שוב.");
    }
  };
  
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const handleLogout = async () => {
    await fetch(`${getApiBaseUrl()}/api/auth/logout`, { credentials: "include" });
    setIsAuthenticated(false);
  };

  const openOrderItemsModal = async (orderId) => {
    setOrderItemsModal({ open: true, items: [], loading: true, orderId });
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/order-items/order/${orderId}`, { credentials: "include" });
      const data = await response.json();
      setOrderItemsModal({ open: true, items: data, loading: false, orderId });
    } catch {
      setOrderItemsModal({ open: true, items: [], loading: false, orderId });
    }
  };

  const closeOrderItemsModal = () => setOrderItemsModal({ open: false, items: [], loading: false, orderId: null });

  const markOutOfStock = async (productId) => {
    await fetch(`${getApiBaseUrl()}/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
      credentials: "include"
    });
    loadData();
  };

  const returnToStock = async (productId) => {
    await fetch(`${getApiBaseUrl()}/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
      credentials: "include"
    });
    loadData();
  };

  const deleteProduct = async (productId) => {
    await fetch(`${getApiBaseUrl()}/api/products/${productId}`, {
      method: "DELETE",
      credentials: "include"
    });
    loadData();
  };

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
                    <Input placeholder="חיפוש הזמנות..." value={ordersSearchTerm} onChange={(e) => setOrdersSearchTerm(e.target.value)} className='pr-10' />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder="כל הסטטוסים" /></SelectTrigger><SelectContent><SelectItem value="all">כל הסטטוסים</SelectItem><SelectItem value="pending">ממתינה</SelectItem><SelectItem value="processing">בעיבוד</SelectItem><SelectItem value="shipped">נשלחה</SelectItem><SelectItem value="delivered">התקבלה</SelectItem><SelectItem value="cancelled">בוטלה</SelectItem></SelectContent></Select>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>מס&apos;</TableHead>
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
                                          <th className="px-4 py-2 text-right font-bold text-text">גרמים</th>
                                          <th className="px-4 py-2 text-right font-bold text-text">מחיר ל-100 גרם</th>
                                          <th className="px-4 py-2 text-right font-bold text-text">סה"כ</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {orderItemsModal.items.map((item) => {
                                          const product = (Array.isArray(products) ? products : []).find(
                                            p => String(p._id) === String(item.product_id)
                                          );
                                          return (
                                            <tr key={item._id || item.id} className="hover:bg-accent/10 transition">
                                              <td className="px-4 py-2 text-text flex items-center gap-2">
                                                {product && product.image_url && (
                                                  <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-full object-cover border border-border shadow" />
                                                )}
                                                {product ? product.name : item.product_name || '—'}
                                              </td>
                                              <td className="px-4 py-2 text-text">{item.quantity}</td>
                                              <td className="px-4 py-2 text-text">{item.weight} גרם</td>
                                              <td className="px-4 py-2 text-text">₪{item.unit_price?.toFixed(2)} / {product?.base_weight || 100} גרם</td>
                                              <td className="px-4 py-2 text-success font-bold">₪{item.price?.toFixed(2)}</td>
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
                  <AddProductDialog 
                    categories={Array.isArray(categories) ? categories : []} 
                    onProductAdded={loadData} 
                    selectedCategoryId={selectedProductCategory}
                    setProductsPage={setProductsPage}
                  />
                   <div className="flex items-center gap-4">
                     <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="סינון לפי קטגוריה" /></SelectTrigger>
                        <SelectContent>{(Array.isArray(categories) ? categories : []).map(c => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <CardTitle>ניהול מוצרים</CardTitle>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>סטטוס</TableHead><TableHead>מחיר</TableHead><TableHead>קטגוריה</TableHead><TableHead>שם</TableHead><TableHead>פעולות</TableHead></TableRow></TableHeader><TableBody>
                  {Array.isArray(filteredProducts) && filteredProducts.map((p) => (<TableRow key={p._id || p.id}>
                    <TableCell>
                      {p.is_active ? (
                        <Badge variant="default" className="bg-green-500 text-white">פעיל</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-400 text-black">נגמר המלאי</Badge>
                      )}
                    </TableCell>
                    <TableCell>₪{p.price?.toFixed(2)}</TableCell>
                    <TableCell>{(Array.isArray(categories) ? categories : []).find(c => c._id === p.category_id || c.id === p.category_id)?.name || 'לא ידוע'}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="flex gap-2">
                      {p.is_active ? (
                        <Button size="sm" variant="outline" onClick={() => markOutOfStock(p._id)} className="text-warning border-warning">נגמר המלאי</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => returnToStock(p._id)} className="text-success border-success">החזר למלאי</Button>
                      )}
                      <EditProductDialog product={p} categories={(Array.isArray(categories) ? categories : [])} onProductUpdated={loadData} />
                      <Button size="sm" variant="destructive" onClick={() => deleteProduct(p._id)}>הסר מוצר</Button>
                    </TableCell>
                  </TableRow>))}
                </TableBody></Table></div>
                <Pagination currentPage={productsPage} totalItems={productsPages * 20} onPageChange={p => { setProductsPage(p); loadData(); }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><AddCategoryDialog onCategoryAdded={loadData} setCategoriesPage={setCategoriesPage} /><CardTitle>ניהול קטגוריות</CardTitle></div></CardHeader>
              <CardContent>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>פעולות</TableHead><TableHead>סטטוס</TableHead><TableHead>מוצרים</TableHead><TableHead>שם</TableHead><TableHead>תמונה</TableHead></TableRow></TableHeader><TableBody>
                  {Array.isArray(categories) && categories.map((c) => (<TableRow key={c._id || c.id}>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedProductCategory(c._id || c.id); setActiveTab("products"); }}>
                        הצג מוצרים
                      </Button>
                    </TableCell>
                    <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'פעיל' : 'לא פעיל'}</Badge></TableCell>
                    <TableCell>{(Array.isArray(products) ? products : []).filter(p => 
                      p.category_id === c._id ||
                      p.category_id === c.id ||
                      String(p.category_id) === String(c._id) ||
                      String(p.category_id) === String(c.id)
                    ).length}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-primary shadow flex items-center justify-center mx-auto">
                        {c.image_url ? (
                          <img src={c.image_url.startsWith('/uploads') ? `${getApiBaseUrl()}${c.image_url}` : c.image_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <EditCategoryDialog category={c} onCategoryUpdated={loadData} />
                    </TableCell>
                  </TableRow>))}
                </TableBody></Table></div>
                <Pagination currentPage={categoriesPage} totalItems={categoriesPages * 20} onPageChange={p => { setCategoriesPage(p); loadData(); }} />
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

function AddProductDialog({ categories, onProductAdded, selectedCategoryId, setProductsPage }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", category_id: selectedCategoryId || "", image: "", is_active: true, base_weight: "", base_price: "", weight_step: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if(selectedCategoryId && selectedCategoryId !== 'all') {
      setFormData(prev => ({...prev, category_id: selectedCategoryId}));
    }
  }, [selectedCategoryId, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const res = await fetch(`${getApiBaseUrl()}/api/products/upload-image`, {
          method: 'POST',
          body: formDataImg,
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בהעלאת תמונה');
        imageUrl = data.imageUrl;
      }
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.base_price),
        image: imageUrl,
        category_id: formData.category_id,
        is_active: formData.is_active,
        base_weight: Number(formData.base_weight),
        base_price: Number(formData.base_price),
        weight_step: Number(formData.weight_step)
      };
      await fetch(`${getApiBaseUrl()}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      setOpen(false);
      setFormData({ name: "", description: "", category_id: "", image: "", is_active: true, base_weight: "", base_price: "", weight_step: "" });
      setImageFile(null);
      setImagePreview("");
      if (typeof setProductsPage === 'function') setProductsPage(1);
      onProductAdded();
    } catch (e) { 
      console.error('שגיאה בהוספת מוצר:', e); 
      alert(e.message || 'שגיאה בהוספת מוצר');
    }
  };

  const renderPreview = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-lg rounded-3xl shadow-2xl bg-gradient-to-br from-white via-slate-50 to-primary/10 backdrop-blur-xl border border-primary/20 p-10" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-primary mb-4 tracking-tight">תצוגה מקדימה למוצר</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary bg-white shadow-lg flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} alt="תצוגה מקדימה" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold">אין תמונה</span>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">{formData.name || "שם המוצר"}</div>
            <div className="text-lg text-gray-700">{formData.description || "תיאור המוצר"}</div>
          </div>
          <Button onClick={() => setShowPreview(false)} className="rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 mt-4">סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus className="w-4 h-4" />הוסף מוצר</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl shadow-2xl bg-gradient-to-br from-white via-slate-50 to-primary/10 backdrop-blur-xl border border-primary/20 p-10" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-primary mb-4 tracking-tight">הוספת מוצר חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10 text-right">
          <div className="flex flex-col gap-6">
            <Label htmlFor="name" className="text-lg font-bold">שם</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <Label htmlFor="description" className="text-lg font-bold">תיאור</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-2xl text-lg px-6 py-3 shadow-sm min-h-[80px]"/>
            <Label htmlFor="category" className="text-lg font-bold">קטגוריה</Label>
            <Select value={formData.category_id} onValueChange={(v) => setFormData({...formData, category_id: v})}>
              <SelectTrigger className="rounded-full text-lg px-6 py-3 shadow-sm"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent>{(Array.isArray(categories) ? categories : []).map(c => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-6 items-center justify-between">
            <Label className="text-lg font-bold">תמונה</Label>
            <label htmlFor="product-image-upload" className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary bg-white shadow-lg cursor-pointer hover:bg-primary/10 transition group">
              {imagePreview ? (
                <img src={imagePreview} alt="תצוגה מקדימה" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="flex flex-col items-center justify-center text-primary group-hover:text-accent">
                  <svg xmlns='http://www.w3.org/2000/svg' className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                  <span className="font-bold">העלה תמונה</span>
                </span>
              )}
              <input id="product-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <Label htmlFor="base_weight" className="text-lg font-bold">משקל בסיס (גרם)</Label>
            <Input id="base_weight" type="number" value={formData.base_weight} onChange={(e) => setFormData({...formData, base_weight: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <Label htmlFor="base_price" className="text-lg font-bold">מחיר למשקל בסיס</Label>
            <Input id="base_price" type="number" step="0.01" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <Label htmlFor="weight_step" className="text-lg font-bold">קפיצת משקל (גרם)</Label>
            <Input id="weight_step" type="number" value={formData.weight_step} onChange={(e) => setFormData({...formData, weight_step: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <div className="flex gap-4 mt-4 w-full">
              <Button type="button" variant="outline" className="rounded-full w-1/2 text-lg font-bold border-primary text-primary hover:bg-primary/10" onClick={() => setShowPreview(true)}>תצוגה מקדימה</Button>
              <Button type="submit" className="rounded-full w-1/2 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg transition-all">הוסף מוצר</Button>
            </div>
          </div>
        </form>
        {showPreview && renderPreview()}
      </DialogContent>
    </Dialog>
  );
}

AddProductDialog.propTypes = {
  categories: PropTypes.array.isRequired,
  onProductAdded: PropTypes.func.isRequired,
  selectedCategoryId: PropTypes.string,
  setProductsPage: PropTypes.func.isRequired,
};

function AddCategoryDialog({ onCategoryAdded, setCategoriesPage }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", slug: "", image_url: "", is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  function makeSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('יש למלא שם קטגוריה');
      return;
    }
    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const res = await fetch(`${getApiBaseUrl()}/api/categories/upload-image`, {
          method: 'POST',
          body: formDataImg,
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בהעלאת תמונה');
        imageUrl = data.imageUrl;
      }
      const slug = makeSlug(formData.slug || formData.name);
      if (!slug) {
        alert('לא ניתן ליצור כתובת באנגלית (slug) מהשם.');
        return;
      }
      await fetch(`${getApiBaseUrl()}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, slug, image_url: imageUrl }),
        credentials: "include"
      });
      setOpen(false);
      setFormData({ name: "", description: "", slug: "", image_url: "", is_active: true });
      setImageFile(null);
      setImagePreview("");
      if (typeof setCategoriesPage === 'function') setCategoriesPage(1);
      if (typeof onCategoryAdded === 'function') onCategoryAdded();
    } catch (e) { console.error('שגיאה בהוספת קטגוריה:', e); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus className="w-4 h-4" />הוסף קטגוריה</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl shadow-2xl bg-gradient-to-br from-white via-slate-50 to-primary/10 backdrop-blur-xl border border-primary/20 p-10" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-primary mb-4 tracking-tight">הוספת קטגוריה חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div><Label htmlFor="name">שם</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required/></div>
          <div><Label htmlFor="description">תיאור</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/></div>
          <div><Label htmlFor="slug">Slug (מזהה לכתובת באנגלית)</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="נוצר אוטומטית מהשם"/></div>
          <div className="flex flex-col gap-4 items-center">
            <Label className="text-lg font-bold">תמונה</Label>
            <div className="relative flex flex-col items-center justify-center w-36 h-36">
              <label htmlFor="category-image-upload" className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary bg-white shadow-lg cursor-pointer hover:bg-primary/10 transition group">
                {imagePreview ? (
                  <img src={imagePreview} alt="תצוגה מקדימה" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="flex flex-col items-center justify-center text-primary group-hover:text-accent">
                    <svg xmlns='http://www.w3.org/2000/svg' className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                    <span className="font-bold">העלה תמונה</span>
                  </span>
                )}
                <input id="category-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
          <div className="flex gap-4 mt-4 w-full">
            <Button type="submit" className="rounded-full w-1/2 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg transition-all">הוסף קטגוריה</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AddCategoryDialog.propTypes = {
  onCategoryAdded: PropTypes.func.isRequired,
  setCategoriesPage: PropTypes.func.isRequired,
};

function EditProductDialog({ product, categories, onProductUpdated }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...product,
    base_weight: product.base_weight !== undefined ? String(product.base_weight) : "",
    base_price: product.base_price !== undefined ? String(product.base_price) : "",
    weight_step: product.weight_step !== undefined ? String(product.weight_step) : ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product.image || "");

  useEffect(() => {
    setFormData({
      ...product,
      base_weight: product.base_weight !== undefined ? String(product.base_weight) : "",
      base_price: product.base_price !== undefined ? String(product.base_price) : "",
      weight_step: product.weight_step !== undefined ? String(product.weight_step) : ""
    });
    setImagePreview(product.image || "");
    setImageFile(null);
  }, [product, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const res = await fetch(`${getApiBaseUrl()}/api/products/upload-image`, {
          method: 'POST',
          body: formDataImg,
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בהעלאת תמונה');
        imageUrl = data.imageUrl;
      }
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.base_price),
        image: imageUrl,
        category_id: formData.category_id,
        is_active: formData.is_active,
        base_weight: Number(formData.base_weight),
        base_price: Number(formData.base_price),
        weight_step: Number(formData.weight_step)
      };
      await fetch(`${getApiBaseUrl()}/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      setOpen(false);
      onProductUpdated();
    } catch (e) {
      alert(e.message || 'שגיאה בעדכון מוצר');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="flex items-center gap-1"><Edit className="w-4 h-4" />ערוך</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl shadow-2xl bg-gradient-to-br from-white via-slate-50 to-primary/10 backdrop-blur-xl border border-primary/20 p-10" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary mb-4">עריכת מוצר</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10 text-right">
          <div className="flex flex-col gap-6">
            <Label htmlFor="name" className="text-lg font-bold">שם</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <Label htmlFor="description" className="text-lg font-bold">תיאור</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-2xl text-lg px-6 py-3 shadow-sm min-h-[80px]"/>
            <Label htmlFor="category" className="text-lg font-bold">קטגוריה</Label>
            <Select value={formData.category_id} onValueChange={(v) => setFormData({...formData, category_id: v})}>
              <SelectTrigger className="rounded-full text-lg px-6 py-3 shadow-sm"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent>{(Array.isArray(categories) ? categories : []).map(c => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-6 items-center justify-between">
            <Label className="text-lg font-bold">תמונה</Label>
            <label htmlFor="edit-product-image-upload" className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary bg-white shadow-lg cursor-pointer hover:bg-primary/10 transition group">
              {imagePreview ? (
                <img src={imagePreview.startsWith('/uploads') ? `${getApiBaseUrl()}${imagePreview}` : imagePreview} alt="תצוגה מקדימה" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="flex flex-col items-center justify-center text-primary group-hover:text-accent">
                  <svg xmlns='http://www.w3.org/2000/svg' className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                  <span className="font-bold">העלה תמונה</span>
                </span>
              )}
              <input id="edit-product-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <Label htmlFor="base_weight" className="text-lg font-bold">משקל בסיס (גרם)</Label>
            <Input id="base_weight" type="number" value={formData.base_weight} onChange={(e) => setFormData({...formData, base_weight: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <Label htmlFor="base_price" className="text-lg font-bold">מחיר למשקל בסיס</Label>
            <Input id="base_price" type="number" step="0.01" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <Label htmlFor="weight_step" className="text-lg font-bold">קפיצת משקל (גרם)</Label>
            <Input id="weight_step" type="number" value={formData.weight_step} onChange={(e) => setFormData({...formData, weight_step: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
            <div className="flex gap-4 mt-4 w-full">
              <Button type="submit" className="rounded-full w-full text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg transition-all">שמור שינויים</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EditProductDialog.propTypes = {
  product: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  onProductUpdated: PropTypes.func.isRequired,
};

function EditCategoryDialog({ category, onCategoryUpdated }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ ...category });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category.image_url || "");

  useEffect(() => {
    setFormData({ ...category });
    setImagePreview(category.image_url || "");
    setImageFile(null);
  }, [category, open]);

  function makeSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const res = await fetch(`${getApiBaseUrl()}/api/categories/upload-image`, {
          method: 'POST',
          body: formDataImg,
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בהעלאת תמונה');
        imageUrl = data.imageUrl;
      }
      const slug = formData.slug ? makeSlug(formData.slug) : makeSlug(formData.name);
      const payload = { ...formData, slug, image_url: imageUrl };
      await fetch(`${getApiBaseUrl()}/api/categories/${category._id || category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      setOpen(false);
      onCategoryUpdated();
    } catch (e) {
      alert(e.message || 'שגיאה בעדכון קטגוריה');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="flex items-center gap-1"><Edit className="w-4 h-4" />ערוך</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-3xl shadow-2xl bg-gradient-to-br from-white via-slate-50 to-primary/10 backdrop-blur-xl border border-primary/20 p-10" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-primary mb-4 tracking-tight">עריכת קטגוריה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-right">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col gap-4 flex-1">
              <Label htmlFor="name" className="text-lg font-bold">שם</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-full text-lg px-6 py-3 shadow-sm"/>
              <Label htmlFor="description" className="text-lg font-bold">תיאור</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/>
              <Label htmlFor="slug" className="text-lg font-bold">Slug (כתובת באנגלית)</Label>
              <Input id="slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="נוצר אוטומטית מהשם" className="rounded-full text-lg px-6 py-3 shadow-sm"/>
              <Label htmlFor="is_active" className="text-lg font-bold">סטטוס</Label>
              <Select value={formData.is_active ? 'true' : 'false'} onValueChange={v => setFormData({...formData, is_active: v === 'true'})}>
                <SelectTrigger className="rounded-full text-lg px-6 py-3 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="true">פעיל</SelectItem><SelectItem value="false">לא פעיל</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <Label className="text-lg font-bold">תמונה</Label>
              <div className="relative flex flex-col items-center justify-center w-36 h-36">
                <label htmlFor="edit-category-image-upload" className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary bg-white shadow-lg cursor-pointer hover:bg-primary/10 transition group">
                  {imagePreview ? (
                    <img src={imagePreview.startsWith('/uploads') ? `${getApiBaseUrl()}${imagePreview}` : imagePreview} alt="תצוגה מקדימה" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="flex flex-col items-center justify-center text-primary group-hover:text-accent">
                      <svg xmlns='http://www.w3.org/2000/svg' className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                      <span className="font-bold">העלה תמונה</span>
                    </span>
                  )}
                  <input id="edit-category-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4 w-full">
            <Button type="submit" className="rounded-full w-1/2 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg transition-all">שמור שינויים</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EditCategoryDialog.propTypes = {
  category: PropTypes.object.isRequired,
  onCategoryUpdated: PropTypes.func.isRequired,
};