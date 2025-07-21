/// <reference types="vite/client" />

export function redirectToHypPayment({
  amount,
  orderId,
  customerName = '',
  customerId = '000000000',
  info = 'רכישה באתר',
  masof = '',
  passP = '',
  successUrl = '',
  errorUrl = '',
  authType = 'passp', // ברירת מחדל: passp
  ...rest
}) {
  // מומלץ להגדיר ב-.env: VITE_TERMINAL_NUMBER, VITE_HYP_PASSWORD, VITE_HYP_SUCCESS_URL, VITE_HYP_ERROR_URL
  const formAction = 'https://icom.yaad.net/p/';
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formAction;

  const params: Record<string, any> = {
    action: 'pay',
    Masof: masof || import.meta.env.VITE_TERMINAL_NUMBER || '',
    Amount: amount,
    Info: info,
    UTF8: 'True',
    Sign: 'True',
    UTF8out: 'True',
    ClientName: customerName,
    UserId: customerId,
    Order: orderId,
    SuccessUrl: successUrl || import.meta.env.VITE_HYP_SUCCESS_URL || '',
    ErrorUrl: errorUrl || import.meta.env.VITE_HYP_ERROR_URL || '',
    ...rest // allow extra params if needed
  };

  // רק אם authType הוא passp, הוסף את PassP
  if (authType === 'passp') {
    params.PassP = passP || import.meta.env.VITE_HYP_PASSWORD || '';
  }

  // אל תשלח REFERRER בשום מצב

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}