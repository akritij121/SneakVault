import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2, AlertCircle, Check, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../api/client';
import useAuthStore from '../store/authStore';

const OrderPage = () => {
  const { id: orderId } = useParams();
  const queryClient = useQueryClient();
  const { userInfo } = useAuthStore();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/api/orders/${orderId}`);
      return data;
    },
  });

  const { data: clientId } = useQuery({
    queryKey: ['paypalClientId'],
    queryFn: async () => {
      const { data } = await api.get('/api/config/paypal');
      return data;
    },
  });

  useEffect(() => {
    if (!error && !isLoading && clientId) {
      const loadPayPalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'INR',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadPayPalScript();
        }
      }
    }
  }, [order, isLoading, error, paypalDispatch, clientId]);

  const payOrderMutation = useMutation({
    mutationFn: async (details) => {
      const { data } = await api.put(`/api/orders/${orderId}/pay`, details);
      return data;
    },
    onSuccess: () => {
      toast.success('Order is paid');
      queryClient.invalidateQueries(['order', orderId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment failed');
    },
  });

  const deliverOrderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put(`/api/orders/${orderId}/deliver`);
      return data;
    },
    onSuccess: () => {
      toast.success('Order delivered');
      queryClient.invalidateQueries(['order', orderId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Delivery failed');
    },
  });

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      payOrderMutation.mutate(details);
    });
  }

  function onError(err) {
    toast.error(err.message);
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  const deliverHandler = () => {
    deliverOrderMutation.mutate();
  };

  return (
    <>
      <Helmet>
        <title>Order Details - SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-destructive py-20">
            <AlertCircle className="w-5 h-5" />
            <p>{error.response?.data?.message || 'Error loading order'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-black mb-4">Shipping</h2>
                <p className="mb-4">
                  <span className="font-bold">Name: </span> {order.user.name}
                </p>
                <p className="mb-4">
                  <span className="font-bold">Email: </span>{' '}
                  <a href={`mailto:${order.user.email}`} className="hover:underline">
                    {order.user.email}
                  </a>
                </p>
                <p className="mb-4">
                  <span className="font-bold">Address: </span>
                  {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-md flex items-center gap-2">
                    <Check className="w-4 h-4" /> Delivered on {order.deliveredAt.substring(0, 10)}
                  </div>
                ) : (
                  <div className="bg-red-500/10 text-red-600 px-4 py-2 rounded-md flex items-center gap-2">
                    <X className="w-4 h-4" /> Not Delivered
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-black mb-4">Payment Method</h2>
                <p className="mb-4">
                  <span className="font-bold">Method: </span> {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-md flex items-center gap-2">
                    <Check className="w-4 h-4" /> Paid on {order.paidAt.substring(0, 10)}
                  </div>
                ) : (
                  <div className="bg-red-500/10 text-red-600 px-4 py-2 rounded-md flex items-center gap-2">
                    <X className="w-4 h-4" /> Not Paid
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-black mb-4">Order Items</h2>
                {order.orderItems.length === 0 ? (
                  <p>Order is empty</p>
                ) : (
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
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
                    <span>₹{order.itemsPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{order.shippingPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{order.taxPrice}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.totalPrice}</span>
                  </div>
                </div>

                {!order.isPaid && (
                  <div className="mt-4 space-y-3">
                    {/* User Payment (Test Mode) */}
                    <button
                      onClick={() => {
                        const details = {
                          id: `TEST_PAYMENT_${Date.now()}`,
                          status: 'COMPLETED',
                          update_time: new Date().toISOString(),
                          email_address: order.user.email,
                        };
                        payOrderMutation.mutate(details);
                      }}
                      className="w-full bg-primary text-primary-foreground py-2 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      disabled={payOrderMutation.isPending}
                    >
                      {payOrderMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Pay Now (Test Mode)'
                      )}
                    </button>
                    
                    {/* Admin Mark as Paid */}
                    {userInfo && userInfo.isAdmin && (
                      <button
                        onClick={() => {
                          const details = {
                            id: `ADMIN_PAYMENT_${Date.now()}`,
                            status: 'COMPLETED',
                            update_time: new Date().toISOString(),
                            email_address: 'admin@example.com',
                          };
                          payOrderMutation.mutate(details);
                        }}
                        className="w-full bg-secondary text-secondary-foreground py-2 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        disabled={payOrderMutation.isPending}
                      >
                        Mark As Paid (Admin)
                      </button>
                    )}
                  </div>
                )}

                {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <button
                    onClick={deliverHandler}
                    className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    disabled={deliverOrderMutation.isPending}
                  >
                    {deliverOrderMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Mark As Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderPage;
