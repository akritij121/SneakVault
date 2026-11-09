import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, X, Check, Package } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../../api/client';

const OrderListPage = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/api/orders');
      return data;
    },
  });

  return (
    <>
      <Helmet>
        <title>Orders - Admin SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-black mb-8">Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-destructive py-20">
            <AlertCircle className="w-5 h-5" />
            <p>{error.response?.data?.message || 'Error loading orders'}</p>
          </div>
        ) : orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No orders found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">USER</th>
                  <th className="p-4 font-bold">DATE</th>
                  <th className="p-4 font-bold">TOTAL</th>
                  <th className="p-4 font-bold text-center">PAID</th>
                  <th className="p-4 font-bold text-center">DELIVERED</th>
                  <th className="p-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{order._id}</td>
                    <td className="p-4 font-medium">{order.user && order.user.name}</td>
                    <td className="p-4">{order.createdAt.substring(0, 10)}</td>
                    <td className="p-4">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {order.isPaid ? (
                        <div className="flex flex-col items-center">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-[10px] text-muted-foreground">{order.paidAt.substring(0, 10)}</span>
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {order.isDelivered ? (
                        <div className="flex flex-col items-center">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-[10px] text-muted-foreground">{order.deliveredAt.substring(0, 10)}</span>
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/order/${order._id}`}
                        className="inline-block bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderListPage;
