import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Heart, Share2, Truck, ShieldCheck, RotateCcw, Loader2, ChevronLeft } from 'lucide-react';

import toast from 'react-hot-toast';
import api from '../api/client';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { cn } from '../lib/utils';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { addToCart } = useCartStore();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/products/${id}`);
      return data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await api.post(`/api/products/${id}/reviews`, reviewData);
      return data;
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      setRating(5);
      setComment('');
      queryClient.invalidateQueries(['product', id]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    },
  });

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/wishlist');
      return data;
    },
    enabled: !!userInfo,
  });

  const isInWishlist = wishlist?.some((item) => item._id === product?._id);

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/users/wishlist', { productId: product._id });
    },
    onSuccess: (data) => {
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update wishlist');
    },
  });

  const handleToggleWishlist = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    wishlistMutation.mutate();
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty,
      size: selectedSize,
    });
    toast.success('Added to cart!');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    reviewMutation.mutate({ rating, comment });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Product not found</p>
      </div>
    );
  }

  const images = [product.image, ...(product.images || [])].filter(Boolean).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{product.name} - SNKRSTR</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Image Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-secondary/30 rounded-lg overflow-hidden mb-4"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </motion.div>
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "aspect-square bg-secondary/30 rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage === idx ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.brand}</p>
            <h1 className="text-3xl font-black mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              {product.numReviews > 0 ? (
                <>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.numReviews} reviews)</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No reviews</span>
              )}
            </div>

            {/* Price */}
            <p className="text-4xl font-black mb-6">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Size Selector */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Select Size (US)</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2 rounded-md border transition-all",
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:border-primary"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className="text-sm">
                Status:{' '}
                <span className={product.countInStock > 0 ? 'text-green-500' : 'text-destructive'}>
                  {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className="p-3 border border-input rounded-md hover:bg-accent transition-colors"
              >
                <Heart className={cn("w-5 h-5", isInWishlist && "fill-red-500 text-red-500")} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-8">Customer Reviews</h2>

          {/* Review Form */}
          {userInfo && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h3 className="font-bold mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 cursor-pointer",
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {product.reviews?.length === 0 && <p className="text-muted-foreground">No reviews yet</p>}
            {product.reviews?.map((review) => (
              <div key={review._id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
