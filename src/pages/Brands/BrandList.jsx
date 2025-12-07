import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { videoService } from '../../services/videoService'
import { useVideoStore } from '../../store/videoStore'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import DataTable from '../../components/UI/DataTable'

const BrandForm = ({ brand, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: brand || {}
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Brand Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Brand name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone', { required: 'Phone number is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address *
        </label>
        <input
          type="text"
          id="address"
          {...register('address', { required: 'Address is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          Logo
        </label>
        <input
          type="file"
          id="logo"
          accept="image/*"
          {...register('logo')}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {brand ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </form>
  )
}

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

  const handleCreateBrand = async (data) => {
    try {
      setFormLoading(true)
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })

      const response = await videoService.createBrand(formData)
      addBrand(response.brand)
      setShowModal(false)
      toast.success('Brand created successfully')
    } catch (error) {
      toast.error('Failed to create brand')
      console.error('Error creating brand:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateBrand = async (data) => {
    try {
      setFormLoading(true)
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })

      const response = await videoService.updateBrand(editingBrand._id, formData)
      updateBrand(editingBrand._id, response.brand)
      setShowModal(false)
      setEditingBrand(null)
      toast.success('Brand updated successfully')
    } catch (error) {
      toast.error('Failed to update brand')
      console.error('Error updating brand:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteBrand = async (brandId) => {
    if (!confirm('Are you sure you want to delete this brand?')) return

    try {
      await videoService.deleteBrand(brandId)
      deleteBrand(brandId)
      toast.success('Brand deleted successfully')
    } catch (error) {
      toast.error('Failed to delete brand')
      console.error('Error deleting brand:', error)
    }
  }

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      render: (brand) => (
        <div className="flex-shrink-0">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
      ),
      cellClassName: 'w-16'
    },
    {
      key: 'name',
      header: 'Brand Name',
      render: (brand) => (
        <div>
          <div className="font-medium text-gray-900">{brand.name}</div>
          <div className="text-sm text-gray-500">{brand.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (brand) => (
        <div>
          <div className="text-sm text-gray-900">{brand.phone}</div>
          <div className="text-sm text-gray-500">{brand.address}</div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (brand) => brand.description || 'No description'
    },
    {
      key: 'videoCount',
      header: 'Videos',
      render: (brand) => {
        // This would need to be calculated from videos data
        return '0'
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (brand) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingBrand(brand)
              setShowModal(true)
            }}
            className="text-primary-600 hover:text-primary-900 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleDeleteBrand(brand._id)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
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
        data={brands}
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