import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../api/client';
import ProductForm from '../../components/ProductForm';

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await api.get(`/api/products/${productId}`);
      return data;
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct) => {
      const { data } = await api.put(`/api/products/${productId}`, updatedProduct);
      return data;
    },
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', productId]);
      navigate('/admin/productlist');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  const submitHandler = (data) => {
    updateProductMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Edit Product - Admin SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/admin/productlist" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <h1 className="text-2xl font-black mb-8">Edit Product</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive">Error loading product</div>
        ) : (
          <ProductForm 
            initialData={product} 
            onSubmit={submitHandler} 
            isLoading={updateProductMutation.isPending} 
            submitLabel="Update Product"
          />
        )}
      </div>
    </>
  );
};

export default ProductEditPage;
