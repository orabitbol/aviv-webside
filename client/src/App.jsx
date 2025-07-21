import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react";
function App() {
  return (
    <>
      <Pages />
      <Toaster />
      <Analytics />
    </>
  );
}

export default App 