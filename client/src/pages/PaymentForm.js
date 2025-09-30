import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment, confirmPaymentRes } from '../services/api';

const stripePublishableKey = 'pk_test_51S7EZZ3Bl87gtNv7WUrqH2gaXGTAjue6QYcixRwUefYtfKlLSZoPBl7LpbIDXV6Fc0lV96ropMk6fjzQX2ipQD1500bx764R13';
const stripePromise = loadStripe(stripePublishableKey);

function PaymentForm({ amountCents, displayAmount, currency = 'EUR', type, items, deliveryInfo, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe n\'est pas initialisé.');
      return;
    }
    setLoading(true);
    setError(null);

    // Filtrer et préparer les items
    const filteredItems = items.map(item => ({
      _id: item._id,
      name: item.name || item.title,
      price: item.price,
      quantity: item.quantity || 1,
      artisanId: item.artisanId,
    }));

   const payload = {
  amount_cents: amountCents,          // << envoyer les cents
  currency,                           // << ajouter la devise
  type,
  items: filteredItems,
  ...(type === 'cart' ? { deliveryInfo } : {})
};// Inclure deliveryInfo uniquement pour cart
    console.log('Payload sent to createPaymentIntent:', JSON.stringify(payload, null, 2));

    try {
      const response = await createPaymentIntent(payload);
      console.log('Response from createPaymentIntent:', response.data);
      const { clientSecret } = response.data;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
       const confirmPayload = {
  paymentIntentId: result.paymentIntent.id,
  status: 'succeeded',
  amount_cents: amountCents,          // << envoyer les cents
  currency,                           // (optionnel mais propre)
  type,
  items: filteredItems,
  ...(type === 'cart' ? { deliveryInfo } : {}),
};
        console.log('Payload sent to confirm:', JSON.stringify(confirmPayload, null, 2));

        let confirmResponse;
        if (type === 'cart') {
          confirmResponse = await confirmPayment(confirmPayload);
        } else if (type === 'reservation') {
          confirmResponse = await confirmPaymentRes(confirmPayload);
        } else {
          throw new Error('Type de paiement non pris en charge');
        }

        console.log('Response from confirm:', confirmResponse.data);
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError('Erreur lors du paiement.');
      console.error('Payment Error:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #d4a373', borderRadius: '10px' }}>
      <h2 style={{ color: '#8a5a44', textAlign: 'center' }}>Paiement Stripe</h2>
     <p style={{ color: '#8a5a44', textAlign: 'center' }}>
  Total : {new Intl.NumberFormat(
    currency === 'TND' ? 'fr-TN' : 'en-US',
    { style: 'currency', currency }
  ).format(Number(displayAmount || 0))}
</p>
      <CardElement options={{ style: { base: { fontSize: '16px', color: '#3a2f1a' } } }} />
      {error && <p style={{ color: '#a94442', textAlign: 'center', margin: '10px 0' }}>{error}</p>}
      <button type="submit" disabled={!stripe || !elements || loading} style={{ padding: '10px 20px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px', width: '100%', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Traitement...' : 'Payer maintenant'}
      </button>
    </form>
  );
}

export default function PaymentWrapper(props) {
  return <Elements stripe={stripePromise}><PaymentForm {...props} /></Elements>;
}