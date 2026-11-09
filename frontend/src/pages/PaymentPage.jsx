import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const { shippingAddress, savePaymentMethod } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shippingAddress?.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    savePaymentMethod(paymentMethod);
    navigate('/placeorder');
  };

  return (
    <>
      <Helmet>
        <title>Payment Method - SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <CheckoutSteps step1 step2 step3 />

        <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-black mb-6">Payment Method</h1>

          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <legend className="text-sm font-medium mb-4">Select Method</legend>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="PayPal"
                    name="paymentMethod"
                    value="PayPal"
                    checked={paymentMethod === 'PayPal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="PayPal" className="text-sm font-medium">
                    PayPal or Credit Card
                  </label>
                </div>
                {/* Add more payment methods here if needed */}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
