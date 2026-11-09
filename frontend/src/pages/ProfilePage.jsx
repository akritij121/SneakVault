import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/client';

const ProfilePage = () => {
  const { userInfo, setUserInfo } = useAuthStore();
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const { data } = await api.get('/api/orders/myorders');
      return data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.put('/api/users/profile', {
        name,
        email,
        password: password || undefined,
      });
      setUserInfo(data);
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black mb-8">My Profile</h1>

          <div className="bg-card border border-border rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Orders Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-black mb-6">My Orders</h2>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : ordersError ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                {ordersError?.response?.data?.message || 'Failed to load orders'}
              </div>
            ) : orders?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground text-center">No orders yet</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="p-4 font-bold">ID</th>
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
                          <td className="p-4">{order.createdAt.substring(0, 10)}</td>
                          <td className="p-4">₹{order.totalPrice}</td>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
