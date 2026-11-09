import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      shippingAddress: {},
      paymentMethod: 'PayPal',
      
      addToCart: (item) => {
        const { cartItems } = get();
        const existItem = cartItems.find((x) => x.product === item.product);

        if (existItem) {
          set({
            cartItems: cartItems.map((x) =>
              x.product === existItem.product ? item : x
            ),
          });
        } else {
          set({ cartItems: [...cartItems, item] });
        }
      },

      removeFromCart: (id) => {
        set({
          cartItems: get().cartItems.filter((x) => x.product !== id),
        });
      },

      saveShippingAddress: (data) => {
        set({ shippingAddress: data });
      },

      savePaymentMethod: (data) => {
        set({ paymentMethod: data });
      },

      clearCart: () => {
        set({ cartItems: [] });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
