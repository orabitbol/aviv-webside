/// <reference types="vite/client" />

// כדי לאפשר שימוש ב-import.meta.env יש להגדיר ב-tsconfig.json:
// "module": "esnext" או "es2020"
export async function redirectToHypPayment({
  amount,
  orderId,
  customerName = '',
  customerId = '000000000',
  info = 'רכישה באתר',
  successUrl,
  errorUrl,
}: {
  amount: number | string;
  orderId: number | string;
  customerName?: string;
  customerId?: string;
  info?: string;
  successUrl?: string;
  errorUrl?: string;
}) {
  const apiBase = import.meta.env.VITE_API_URL || '';
  const signRes = await fetch(`${apiBase}/api/hypay-sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, orderId, customerName, customerId, info, successUrl, errorUrl })
  });

  const signText = await signRes.text();
  const payParams = {};
  signText.split('&').forEach(p => {
    const [k, v] = p.split('=');
    if (k) payParams[k] = decodeURIComponent(v || '');
  });

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://pay.hyp.co.il/p/';
  Object.entries(payParams).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
