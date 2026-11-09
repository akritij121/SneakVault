import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import useCartStore from '../store/cartStore';

const WishlistPage = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCartStore();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/wishlist');
      return data;
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      await api.post('/api/users/wishlist', { productId });
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to remove from wishlist');
    },
  });

  const handleAddToCart = (product) => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty: 1,
      size: product.sizes?.[0], // Default to first size if available
    });
    toast.success('Added to cart!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist - SNKRSTR</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8">My Wishlist</h1>

        {wishlist?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
            <Link to="/" className="text-primary hover:underline font-bold">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist?.map((product) => (
              <div key={product._id} className="bg-card border border-border rounded-lg overflow-hidden group">
                <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-secondary/30">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold truncate mb-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      }).format(product.price)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.countInStock === 0}
                        className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromWishlistMutation.mutate(product._id)}
                        className="p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive/20 transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
