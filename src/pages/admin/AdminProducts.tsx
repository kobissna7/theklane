import React from 'react'
import { Button } from '../../components/ui/Button'
import { useToastStore } from '../../features/toast/toastStore'
import { convertToWebp } from '../../lib/image'

export default function AdminProducts() {
  const addToast = useToastStore(state => state.addToast)

  const handleImageUploadMock = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    addToast('info', 'Processing image (converting to webp)...')
    
    try {
      const webpFile = await convertToWebp(file)
      addToast('success', `Image converted to ${webpFile.name} (${(webpFile.size / 1024).toFixed(2)} KB)! Ready for Supabase upload.`)
      // In a real implementation, you would use supabase.storage.from('public-assets').upload(...) here
    } catch (err: any) {
      addToast('error', err.message || 'Failed to process image.')
    }
  }

  return (
    <div className="bg-white p-8 shadow-sm border border-brand-dark/5">
      <div className="flex justify-between items-center mb-6 border-b border-brand-dark/10 pb-4">
        <h2 className="font-heading text-xl uppercase tracking-widest">Manage Products</h2>
        <Button variant="primary" size="sm">Add New Product</Button>
      </div>

      <div className="bg-brand-neutral/30 p-6 rounded border border-brand-dark/5 mb-8">
        <h3 className="font-heading uppercase tracking-widest text-sm text-brand-secondary mb-2">WebP Image Upload Demo</h3>
        <p className="text-sm text-brand-dark/70 mb-4">
          Any image uploaded will be automatically compressed and converted to WebP format before being sent to Supabase. Try it out below.
        </p>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUploadMock}
          className="text-sm text-brand-dark/70 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-brand-dark hover:file:bg-brand-primary/80"
        />
      </div>

      <p className="text-brand-dark/50 text-sm italic">
        Product table integration coming soon. This view will list all products from Supabase and allow editing prices and assigning images.
      </p>
    </div>
  )
}
