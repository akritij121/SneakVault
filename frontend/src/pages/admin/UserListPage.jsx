import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Loader2, AlertCircle, Check, X, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../api/client';

const UserListPage = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/api/users');
      return data;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Users - Admin SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-black mb-8">Users</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-destructive py-20">
            <AlertCircle className="w-5 h-5" />
            <p>{error.response?.data?.message || 'Error loading users'}</p>
          </div>
        ) : users?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No users found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">NAME</th>
                  <th className="p-4 font-bold">EMAIL</th>
                  <th className="p-4 font-bold text-center">ADMIN</th>
                  <th className="p-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{user._id}</td>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">
                      <a href={`mailto:${user.email}`} className="hover:underline">
                        {user.email}
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      {user.isAdmin ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/user/${user._id}/edit`}
                          className="p-2 hover:bg-accent rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default UserListPage;
