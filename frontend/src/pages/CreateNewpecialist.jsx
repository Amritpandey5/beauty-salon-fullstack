import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { specialistsApi } from '../api/specialists.api'
import Loader from '../components/Loader'

const defaultAvailability = [
  { dayOfWeek: 0, isWorking: true, startTime: '09:00 AM', endTime: '09:00 PM' },
  { dayOfWeek: 1, isWorking: true, startTime: '09:00 AM', endTime: '09:00 PM' },
  { dayOfWeek: 2, isWorking: true, startTime: '09:00 AM', endTime: '09:00 PM' },
  { dayOfWeek: 3, isWorking: true, startTime: '09:00 AM', endTime: '09:00 PM' },
  { dayOfWeek: 4, isWorking: true, startTime: '09:00 AM', endTime: '09:00 PM' },
  { dayOfWeek: 5, isWorking: true, startTime: '10:00 AM', endTime: '11:00 PM' },
  { dayOfWeek: 6, isWorking: true, startTime: '10:00 AM', endTime: '11:00 PM' },
]

export default function CreateSpecialistPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    specialties: '',
    services: '',
    isActive: true,
    sortOrder: 0,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const payload = {
        name: form.name,
        role: form.role,
        bio: form.bio,
        image: form.image,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),

        specialties: form.specialties
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),

        services: form.services
          .split(',')
          .map(id => id.trim())
          .filter(Boolean),

        availability: defaultAvailability,
      }

      await specialistsApi.create(payload)

      addToast('Specialist created successfully', 'success')
      navigate('/about')

    } catch (err) {
      addToast(err.message || 'Failed to create specialist', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-obsidian-950 p-6">

      <div className="max-w-2xl mx-auto bg-white dark:bg-obsidian-900 border border-obsidian-200 dark:border-obsidian-700/50 p-6">

        <h1 className="font-display text-2xl text-obsidian-900 dark:text-ivory-100 mb-6">
          Create Specialist
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">Role</label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* BIO */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="input-field"
              rows={4}
              maxLength={500}
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">Image URL</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* SPECIALTIES */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">
              Specialties (comma separated)
            </label>
            <input
              name="specialties"
              value={form.specialties}
              onChange={handleChange}
              className="input-field"
              placeholder="Balayage, Highlights"
            />
          </div>

          {/* SERVICES IDS */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">
              Service IDs (comma separated)
            </label>
            <input
              name="services"
              value={form.services}
              onChange={handleChange}
              className="input-field"
              placeholder="serviceId1, serviceId2"
            />
          </div>

          {/* SORT ORDER */}
          <div>
            <label className="text-xs uppercase text-obsidian-500">Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* ACTIVE */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <label className="text-sm text-obsidian-600 dark:text-ivory-300">
              Active Specialist
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating...' : 'Create Specialist'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full border border-obsidian-300 dark:border-obsidian-600 text-obsidian-700 dark:text-ivory-300"
            >
              Cancel
            </button>

          </div>

        </form>
      </div>

      {loading && <Loader fullScreen />}
    </div>
  )
}