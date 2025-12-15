import { ShoppingCart, User, Package } from 'lucide-react';

export default function CartsList({ carts }) {
  return (
    <div className="space-y-4">
      {carts.map(cart => (
        <div key={cart._id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <User size={20} />
              <div>
                <p className="font-semibold">{cart.user?.name || 'Guest'}</p>
                <p className="text-sm text-gray-600">{cart.user?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="flex items-center">
                <Package className="mr-2" size={16} />
                {cart.items.length} items
              </p>
              <p className="text-sm text-gray-600">
                Updated: {new Date(cart.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {/* List items in the cart */}
          <div className="mt-4 border-t pt-4">
            {cart.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span>{item.product?.name || 'Product'}</span>
                <span>Qty: {item.quantity} × ${item.price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}