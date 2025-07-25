/// <reference types="vite/client" />

export async function redirectToHypPayment({
  amount,
  orderId,
  customerName = '',
  customerId = '000000000',
  info = 'רכישה באתר',
  masof = '',
  successUrl = '',
  errorUrl = '',
  ...rest
}) {
  // קריאה לערכים מה-env
  const KEY = import.meta.env.VITE_HYP_API_KEY || '';
  const PassP = import.meta.env.VITE_HYP_PASSP || '';
  const Masof = masof || import.meta.env.VITE_TERMINAL_NUMBER || '';
  const SuccessUrl = successUrl || import.meta.env.VITE_HYP_SUCCESS_URL || '';
  const ErrorUrl = errorUrl || import.meta.env.VITE_HYP_ERROR_URL || '';

  // שלב 1: בקשת חתימה (APISign)
  const signParams = {
    action: 'APISign',
    What: 'SIGN',
    KEY,
    PassP,
    Masof,
    Amount: amount,
    Info: info,
    UTF8: 'True',
    Sign: 'True',
    UTF8out: 'True',
    ClientName: customerName,
    UserId: customerId,
    Order: orderId,
    SuccessUrl,
    ErrorUrl,
    ...rest
  };
  // הדפסה לקונסול של הפרמטרים שנשלחים ל-Hypay (שלב החתימה)
  console.log('Hypay APISign params:', signParams);
  const signQuery = new URLSearchParams(signParams).toString();
  // קריאה ל-backend במקום ישירות ל-Hypay
  const signRes = await fetch(`/api/hypay-sign?${signQuery}`);
  const signText = await signRes.text();
  // הדפסה לקונסול של התשובה המלאה מה-backend (כולל שגיאות HTML)
  console.log('Hypay signText:', signText);
  // הפלט הוא מחרוזת פרמטרים (key1=val1&key2=val2...)
  const payParams = {};
  signText.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) payParams[key] = decodeURIComponent(value || '');
  });

  // הדפסה לקונסול של הפרמטרים שנשלחים ל-Hypay (שלב התשלום)
  console.log('Hypay PAY params:', payParams);

  // שלב 2: יצירת טופס תשלום
  const formAction = 'https://pay.hyp.co.il/p/';
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formAction;

  Object.entries(payParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value); // ודא שהערך הוא תמיד מחרוזת
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}