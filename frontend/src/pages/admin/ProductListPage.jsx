import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Package, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../api/client';
import ProductForm from '../../components/ProductForm';

const ProductListPage = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const page = pageNumber || 1;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      const { data } = await api.get(`/api/products?pageNumber=${page}`);
      return data;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const { data } = await api.post('/api/products', productData);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Product created');
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const createProductHandler = (data) => {
    createProductMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Products - Admin SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black">Products</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create Product
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-destructive py-20">
            <AlertCircle className="w-5 h-5" />
            <p>{error.response?.data?.message || 'Error loading products'}</p>
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No products found</p>
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">NAME</th>
                    <th className="p-4 font-bold">PRICE</th>
                    <th className="p-4 font-bold">CATEGORY</th>
                    <th className="p-4 font-bold">BRAND</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.products.map((product) => (
                    <tr key={product._id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-muted-foreground">{product._id}</td>
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">₹{product.price.toLocaleString()}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">{product.brand}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/product/${product._id}/edit`}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteHandler(product._id)}
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
            
            {/* Pagination could be added here if needed, reusing logic from HomePage */}
          </>
        )}

        {/* Create Product Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-xl font-black">Create New Product</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <ProductForm 
                  onSubmit={createProductHandler} 
                  isLoading={createProductMutation.isPending} 
                  submitLabel="Create Product"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductListPage;
