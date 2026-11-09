import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import api from '../api/client';
import CheckoutSteps from '../components/CheckoutSteps';

const PlaceOrderPage = () => {
  const navigate = useNavigate();
  const cart = useCartStore();

  // Calculate prices
  const subtotal = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = subtotal > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * subtotal).toFixed(2));
  const totalPrice = (Number(subtotal) + Number(shippingPrice) + Number(taxPrice)).toFixed(2);

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const { data } = await api.post('/api/orders', orderData);
      return data;
    },
    onSuccess: (data) => {
      cart.clearCart();
      navigate(`/order/${data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });

  const placeOrderHandler = () => {
    createOrderMutation.mutate({
      orderItems: cart.cartItems,
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice: subtotal,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  };

  return (
    <>
      <Helmet>
        <title>Place Order - SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <CheckoutSteps step1 step2 step3 step4 />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-black mb-4">Shipping</h2>
              <p className="mb-2">
                <span className="font-bold">Address: </span>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-black mb-4">Payment Method</h2>
              <p>
                <span className="font-bold">Method: </span>
                {cart.paymentMethod}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-black mb-4">Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                      <div className="flex-1">
                        <Link to={`/product/${item.product}`} className="font-bold hover:underline">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-black mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{taxPrice}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              {createOrderMutation.isError && (
                <div className="mt-4 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {createOrderMutation.error?.response?.data?.message || 'Error placing order'}
                </div>
              )}

              <button
                type="button"
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                disabled={cart.cartItems.length === 0 || createOrderMutation.isPending}
                onClick={placeOrderHandler}
              >
                {createOrderMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
