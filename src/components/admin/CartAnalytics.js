export default function CartAnalytics({ data }) {
    if (!data) return <p>No analytics data.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Carts</h3>
          <p className="text-3xl font-bold">{data.totalCarts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Carts</h3>
          <p className="text-3xl font-bold">{data.totalActiveCarts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Items</h3>
          <p className="text-3xl font-bold">{data.totalItems}</p>
        </div>
      </div>
    );
  }