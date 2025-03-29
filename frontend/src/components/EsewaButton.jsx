// components/EsewaButton.js
import React from 'react';

const EsewaButton = ({ amount, transactionId, callbackUrl }) => {
  const handlePayment = () => {
    const path = process.env.REACT_APP_ESEWA_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    
    const params = {
      amount: amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transactionId,
      product_code: 'EPAYTEST',
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: callbackUrl,
      failure_url: `${callbackUrl}?status=failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: '', // Will be generated on backend
    };

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = path;

    Object.keys(params).forEach(key => {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];
      form.appendChild(hiddenField);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <button 
      onClick={handlePayment} 
      className="w-full h-[40px] bg-[#5a8f29] text-white rounded-md mt-4"
    >
      Pay with eSewa
    </button>
  );
};

export default EsewaButton;