// pages/Brands/BrandList.jsx
import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { videoService } from '../../services/videoService'
import { useVideoStore } from '../../store/videoStore'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import DataTable from '../../components/UI/DataTable'
import BrandForm from '../../components/Forms/BrandForm'

const BrandList = () => {
  const { brands, setBrands, addBrand, updateBrand, deleteBrand } = useVideoStore()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await videoService.getAllBrands()
      setBrands(response.brands || [])
    } catch (error) {
      toast.error('Failed to fetch brands')
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBrand = async (formData) => {
    try {
      setFormLoading(true)
      
      // Check if logo is a string (URL) or File
      const logo = formData.get('logo')
      if (logo && typeof logo === 'string' && logo.startsWith('data:')) {
        // Remove logo if it's a data URL
        formData.delete('logo')
      }
      
      const response = await videoService.createBrand(formData)
      
      if (response.success) {
        addBrand(response.brand)
        setShowModal(false)
        toast.success('Brand created successfully')
        
        // Refresh the brands list
        await fetchBrands()
      } else {
        toast.error(response.message || 'Failed to create brand')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create brand')
      console.error('Error creating brand:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateBrand = async (formData) => {
    try {
      setFormLoading(true)
      
      // Check if logo is a string (URL) or File
      const logo = formData.get('logo')
      if (logo && typeof logo === 'string' && logo.startsWith('data:')) {
        // Remove logo if it's a data URL (not a file)
        formData.delete('logo')
      }
      
      const response = await videoService.updateBrand(editingBrand._id, formData)
      
      if (response.success) {
        updateBrand(editingBrand._id, response.brand)
        setShowModal(false)
        setEditingBrand(null)
        toast.success('Brand updated successfully')
        
        // Refresh the brands list
        await fetchBrands()
      } else {
        toast.error(response.message || 'Failed to update brand')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update brand')
      console.error('Error updating brand:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return

    try {
      const response = await videoService.deleteBrand(brandId)
      
      if (response.success) {
        deleteBrand(brandId)
        toast.success('Brand deleted successfully')
        
        // Refresh the brands list
        await fetchBrands()
      } else {
        toast.error(response.message || 'Failed to delete brand')
      }
    } catch (error) {
      toast.error('Failed to delete brand')
      console.error('Error deleting brand:', error)
    }
  }

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      render: (brand) => {
        if (!brand) return null
        
        return (
          <div className="flex-shrink-0">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name || 'Brand logo'}
                className="h-10 w-10 rounded-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `
                    <div class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                  `
                }}
              />
            ) : (
              <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        )
      },
      cellClassName: 'w-16'
    },
    {
      key: 'name',
      header: 'Brand Name',
      render: (brand) => {
        if (!brand) return null
        return (
          <div>
            <div className="font-medium text-gray-900">{brand.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{brand.email || ''}</div>
          </div>
        )
      }
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (brand) => {
        if (!brand) return null
        return (
          <div>
            <div className="text-sm text-gray-900">{brand.phone || 'N/A'}</div>
            <div className="text-sm text-gray-500">{brand.address || ''}</div>
          </div>
        )
      }
    },
    {
      key: 'description',
      header: 'Description',
      render: (brand) => {
        if (!brand) return null
        return brand.description ? (
          <div className="max-w-xs truncate">{brand.description}</div>
        ) : (
          <span className="text-gray-400 italic">No description</span>
        )
      }
    },
    {
      key: 'videoCount',
      header: 'Videos',
      render: (brand) => {
        if (!brand) return null
        return <span className="font-medium">{brand.videoCount || 0}</span>
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (brand) => {
        if (!brand) return null
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditingBrand(brand)
                setShowModal(true)
              }}
              className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDeleteBrand(brand._id)}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage brands and their advertising content
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBrand(null)
            setShowModal(true)
          }}
          icon={Plus}
        >
          Add Brand
        </Button>
      </div>

      {/* Brands Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(brands) ? brands : []}
        loading={loading}
        emptyMessage="No brands found. Add your first brand to get started."
      />

      {/* Add/Edit Brand Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingBrand(null)
        }}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
        size="lg"
      >
        <BrandForm
          brand={editingBrand}
          onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand}
          onCancel={() => {
            setShowModal(false)
            setEditingBrand(null)
          }}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}

export default BrandList