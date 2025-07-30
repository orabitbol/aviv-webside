/// <reference types="vite/client" />
import { getApiBaseUrl } from "@/lib/utils";

export async function redirectToHypPayment({
  amount,
  orderId,
  customerName = "",
  customerId = "000000000",
  info = "רכישה באתר",

}: {
  amount: number | string;
  orderId: number | string;
  customerName?: string;
  customerId?: string;
  info?: string;

}) {
  const cleanAmount = Number(amount);
  const payload = {
    amount: Number.isFinite(cleanAmount) ? cleanAmount : amount,
    orderId,
    customerName,
    customerId,
    info,
  };

  const apiBase = getApiBaseUrl(); // חייב להצביע לשרת ה‑Express
  debugger;
  const res = await fetch(`${apiBase}/api/hypay-sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  console.log("res", res);
  debugger;
  const text = (await res.text()).trim();
  if (!res.ok || !text) {
    throw new Error(`HYP sign failed: HTTP ${res.status} ${text}`);
  }
  // בדוק רק Error= כדי לא לטעות עם ErrorUrl=
  if (/(^|&)Error=/.test(text)) {
    throw new Error(text);
  }

  const payParams: Record<string, string> = Object.fromEntries(
    text.split("&").map(pair => {
      const [k, v = ""] = pair.split("=");
      return [k, decodeURIComponent(v)];
    })
  );

  if (!payParams.action) payParams.action = "pay";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://pay.hyp.co.il/p/";
  form.acceptCharset = "UTF-8";

  Object.entries(payParams).forEach(([k, v]) => {
    if (v == null) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
