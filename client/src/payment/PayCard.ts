export function redirectToHypPayment({ amount, orderId }) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://hyp.co.il/'; 
  
    const params = {
      terminalNumber: '0010322115',
      user: 'SlxJi',
      password: 'O112233r!',
      sum: amount,
      int_in: orderId,
      successUrl: 'https://www.agalapitz.co.il/orderconfirmation', 
      errorUrl: 'https://yourdomain.com/payment/error',
      passP: 'hyp1234'
    };
  
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
  
    document.body.appendChild(form);
    form.submit();
  }