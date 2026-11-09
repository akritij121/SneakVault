import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../api/client';

const UserEditPage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/users/${userId}`);
      return data;
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser) => {
      const { data } = await api.put(`/api/users/${userId}`, updatedUser);
      return data;
    },
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', userId]);
      navigate('/admin/userlist');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const submitHandler = (e) => {
    e.preventDefault();
    updateUserMutation.mutate({ name, email, isAdmin });
  };

  return (
    <>
      <Helmet>
        <title>Edit User - Admin SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <Link to="/admin/userlist" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        <h1 className="text-2xl font-black mb-8">Edit User</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive">Error loading user</div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="isAdmin" className="text-sm font-medium cursor-pointer">
                Is Admin
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update User
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default UserEditPage;
