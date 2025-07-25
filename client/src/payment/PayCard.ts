/// <reference types="vite/client" />

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
  // עדיף להעביר לשרת כערך עשרוני נקי
  const cleanAmount = Number(amount);
  const payload = {
    amount: Number.isFinite(cleanAmount) ? cleanAmount : amount,
    orderId,
    customerName,
    customerId,
    info,
    successUrl,
    errorUrl,
  };

  const res = await fetch('/api/hypay-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = (await res.text()).trim();

  if (!res.ok || !text) {
    throw new Error(`HYP sign failed: HTTP ${res.status} ${text}`);
  }
  if (text.includes('Error=')) {
    // Hyp מחזירה מחרוזת שגיאה בפרמטרים
    throw new Error(text);
  }

  // המרה לפרמטרים
  const payParams: Record<string, string> = Object.fromEntries(
    text.split('&').map(pair => {
      const [k, v = ''] = pair.split('=');
      return [k, decodeURIComponent(v)];
    })
  );

  // ודא שיש action=pay
  if (!payParams.action) payParams.action = 'pay';

  // יצירת טופס ושליחה
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://pay.hyp.co.il/p/';
  form.acceptCharset = 'UTF-8';

  Object.entries(payParams).forEach(([k, v]) => {
    if (v == null) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
