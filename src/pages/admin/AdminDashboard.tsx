import React from 'react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow-sm border border-brand-dark/5">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark/60 mb-2">Total Sales</h3>
          <p className="text-3xl font-body font-medium">$0.00</p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-brand-dark/5">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark/60 mb-2">Active Products</h3>
          <p className="text-3xl font-body font-medium">0</p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-brand-dark/5">
          <h3 className="font-heading uppercase tracking-widest text-sm text-brand-dark/60 mb-2">Recent Orders</h3>
          <p className="text-3xl font-body font-medium">0</p>
        </div>
      </div>

      <div className="bg-white p-8 shadow-sm border border-brand-dark/5 mt-8">
        <h2 className="font-heading text-lg uppercase tracking-widest mb-4">Welcome to KLANÉ Admin</h2>
        <p className="text-brand-dark/70 font-body">
          Use the sidebar to navigate through your store's settings. 
          You can update the homepage text and video in the "Site Content" tab, 
          and manage your inventory in the "Products" tab.
        </p>
      </div>
    </div>
  )
}
