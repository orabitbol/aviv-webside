import Layout from "./Layout.jsx";

import Homepage from "./Homepage";

import Products from "./Products";

import Cart from "./Cart";

import Checkout from "./Checkout";

import OrderConfirmation from "./OrderConfirmation";

import AdminPanel from "./admin-panel";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Homepage: Homepage,
    
    Products: Products,
    
    Cart: Cart,
    
    Checkout: Checkout,
    
    OrderConfirmation: OrderConfirmation,
    
    AdminPanel: AdminPanel,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Homepage />} />
                
                
                <Route path="/Homepage" element={<Homepage />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/OrderConfirmation" element={<OrderConfirmation />} />
                
                <Route path="/admin-panel" element={<AdminPanel />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}