import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Star, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import useThemeStore from '../store/themeStore';
import useAuthStore from '../store/authStore';
import api from '../api/client';

const ProductCard = ({ product }) => {
  const { theme } = useThemeStore();
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!userInfo) return [];
      const { data } = await api.get('/api/users/wishlist');
      return data;
    },
    enabled: !!userInfo,
  });

  const isInWishlist = wishlist?.some((item) => item._id === product._id);

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/users/wishlist', { productId: product._id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update wishlist');
    },
  });

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    wishlistMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300",
        theme === 'dark' && "hover:border-neon-yellow hover:shadow-[0_0_20px_rgba(255,255,0,0.3)]"
      )}
    >
      <Link to={`/product/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-secondary/30">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.brand}</p>
              <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {product.numReviews > 0 ? (
              <>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3 h-3",
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({product.numReviews})</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-black">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>
            <button 
              className="p-2 hover:bg-accent rounded-full transition-colors"
              onClick={handleWishlistClick}
              disabled={wishlistMutation.isPending}
            >
              <Heart className={cn("w-4 h-4", isInWishlist && "fill-red-500 text-red-500")} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
