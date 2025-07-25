/// <reference types="vite/client" />

export async function redirectToHypPayment({ amount, orderId, customerName, customerId, info, successUrl, errorUrl }) {
  const signRes = await fetch('/api/hypay-sign', {
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