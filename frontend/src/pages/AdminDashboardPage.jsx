import { Helmet } from 'react-helmet-async';
import { BarChart3, Package, Users, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';

const AdminDashboardPage = () => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/api/orders/stats');
      return data;
    },
  });

  const stats = [
    { 
      label: 'Total Revenue', 
      value: statsData ? `₹${statsData.revenue.toLocaleString()}` : '...', 
      icon: DollarSign, 
      color: 'text-green-500' 
    },
    { 
      label: 'Total Orders', 
      value: statsData ? statsData.orders : '...', 
      icon: Package, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Total Products', 
      value: statsData ? statsData.products : '...', 
      icon: BarChart3, 
      color: 'text-purple-500' 
    },
    { 
      label: 'Total Users', 
      value: statsData ? statsData.users : '...', 
      icon: Users, 
      color: 'text-orange-500' 
    },
  ];

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-center py-20 text-red-500">Error loading stats</div>;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-3xl font-black mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-black text-xl mb-4">Manage Products</h2>
            <p className="text-muted-foreground text-sm mb-4">Add, edit, or remove products from your catalog</p>
            <Link to="/admin/productlist" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold hover:opacity-90 transition-opacity">
              View Products
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-black text-xl mb-4">Manage Orders</h2>
            <p className="text-muted-foreground text-sm mb-4">View and update order statuses</p>
            <Link to="/admin/orderlist" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold hover:opacity-90 transition-opacity">
              View Orders
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-black text-xl mb-4">Manage Users</h2>
            <p className="text-muted-foreground text-sm mb-4">View and manage user accounts</p>
            <Link to="/admin/userlist" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold hover:opacity-90 transition-opacity">
              View Users
            </Link>
          </div>
        </div>


      </div>
    </>
  );
};

export default AdminDashboardPage;
