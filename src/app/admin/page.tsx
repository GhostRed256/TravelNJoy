'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, Search, RefreshCw, LogOut, MessageCircle,
  Car as CarIcon, TrendingUp, DollarSign, Users, Eye, X, Upload,
  CheckCircle2, AlertCircle, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Car, CarStatus, FuelType, TransmissionType } from '@/types/car';
import { DEMO_CARS, formatPrice, formatMileage, generateId } from '@/lib/utils';
import Link from 'next/link';

const EMPTY_CAR: Partial<Car> = {
  make: '', model: '', year: new Date().getFullYear(), price: 0,
  mileage: 0, fuel: 'petrol', transmission: 'manual', color: '',
  description: '', images: [], status: 'available', features: [], engine: '', owners: 1,
  ownerName: '', condition: '', carType: '',
  buyerName: '', buyerAadhar: '', buyerPan: '', buyerAddress: '', soldDate: '',
  registrationNo: '', chassisNo: '', engineNo: '', dateOfProcurement: '',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>(DEMO_CARS as Car[]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Partial<Car>>(EMPTY_CAR);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (!res.ok) router.push('/admin/login');
    } catch { router.push('/admin/login'); }
  }, [router]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheets/cars');
      if (res.ok) {
        const data = await res.json();
        if (data.cars?.length > 0) setCars(data.cars);
      }
    } catch { /* use demo */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    fetchCars();
  }, [checkAuth, fetchCars]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const openNew = () => {
    setEditingCar({ ...EMPTY_CAR, id: generateId(), createdAt: new Date().toISOString() });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar({ ...car });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCar.make || !editingCar.model) {
      toast.error('Make and Model are required');
      return;
    }
    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/sheets/cars/${editingCar.id}` : '/api/sheets/cars';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCar),
      });

      if (res.ok) {
        toast.success(isEditing ? 'Car updated!' : 'Car added!');
        setShowModal(false);
        fetchCars();
      } else {
        // Update locally for demo
        if (isEditing) {
          setCars(prev => prev.map(c => c.id === editingCar.id ? editingCar as Car : c));
        } else {
          setCars(prev => [...prev, editingCar as Car]);
        }
        toast.success(isEditing ? 'Car updated (demo)!' : 'Car added (demo)!');
        setShowModal(false);
      }
    } catch {
      toast.error('Error saving car');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sheets/cars/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        // Delete locally for demo
        setCars(prev => prev.filter(c => c.id !== id));
        toast.success('Car deleted (demo)!');
      } else {
        toast.success('Car deleted!');
        fetchCars();
      }
    } catch {
      setCars(prev => prev.filter(c => c.id !== id));
      toast.success('Car deleted (demo)!');
    }
    setDeleteConfirm(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/sheets/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setEditingCar(prev => ({ ...prev, images: [...(prev.images || []), url] }));
        toast.success('Image uploaded!');
      } else {
        // Use local URL for demo
        const localUrl = URL.createObjectURL(file);
        setEditingCar(prev => ({ ...prev, images: [...(prev.images || []), localUrl] }));
        toast.success('Image added (demo mode)');
      }
    } catch {
      toast.error('Upload failed');
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setEditingCar(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (i: number) => {
    setEditingCar(prev => ({ ...prev, features: (prev.features || []).filter((_, idx) => idx !== i) }));
  };

  const filtered = cars.filter(c =>
    `${c.make} ${c.model} ${c.year} ${c.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: cars.length,
    available: cars.filter(c => c.status === 'available').length,
    sold: cars.filter(c => c.status === 'sold').length,
    totalValue: cars.filter(c => c.status === 'available').reduce((s, c) => s + c.price, 0),
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-max px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-purple-400 font-medium uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="text-3xl font-bold font-[var(--font-outfit)] text-white">
              Car <span className="gradient-text">Records</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/chat" className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-purple-300 hover:bg-purple-600/10 transition-all border border-purple-900/30 text-sm font-medium">
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-purple-900/30 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: CarIcon, label: 'Total Cars', value: stats.total, color: 'text-purple-400' },
            { icon: CheckCircle2, label: 'Available', value: stats.available, color: 'text-green-400' },
            { icon: Users, label: 'Sold', value: stats.sold, color: 'text-red-400' },
            { icon: DollarSign, label: 'Inventory Value', value: formatPrice(stats.totalValue), color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass rounded-2xl p-5 border border-purple-900/30">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-bold text-white font-[var(--font-outfit)]">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search cars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-12 h-11"
            />
          </div>
          <button onClick={fetchCars} className="flex items-center gap-2 px-4 h-11 glass border border-purple-900/30 rounded-xl text-purple-300 hover:bg-purple-600/10 transition-all text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 px-5 h-11">
            <Plus className="w-5 h-5" />
            Add Car
          </button>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-purple-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Mileage</th>
                  <th>Fuel</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg overflow-hidden bg-purple-900/20 flex-shrink-0">
                          <Image
                            src={car.images[0] || '/car-sedan.png'}
                            alt={car.model}
                            width={48}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{car.make} {car.model}</p>
                          <p className="text-xs text-gray-500">{car.color} · {car.transmission}</p>
                        </div>
                      </div>
                    </td>
                    <td>{car.year}</td>
                    <td className="font-semibold text-purple-300">{formatPrice(car.price)}</td>
                    <td>{formatMileage(car.mileage)}</td>
                    <td className="capitalize">{car.fuel}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        car.status === 'available' ? 'status-available' :
                        car.status === 'sold' ? 'status-sold' : 'status-reserved'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/cars/${car.id}`} className="p-1.5 glass rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openEdit(car)} className="p-1.5 glass rounded-lg text-purple-400 hover:bg-purple-500/10 transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === car.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(car.id)} className="p-1.5 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-xs">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 glass rounded-lg text-gray-400">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(car.id)} className="p-1.5 glass rounded-lg text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <CarIcon className="w-12 h-12 text-purple-900 mx-auto mb-3" />
              <p className="text-gray-500">No cars found. Add your first car!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-dark rounded-2xl border border-purple-900/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-purple-900/20">
              <h2 className="text-xl font-bold text-white font-[var(--font-outfit)]">
                {isEditing ? 'Edit Car' : 'Add New Car'}
              </h2>
              <button onClick={() => setShowModal(false)} className="glass rounded-lg p-2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Make & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Make *</label>
                  <input value={editingCar.make} onChange={e => setEditingCar(p => ({ ...p, make: e.target.value }))} className="input-dark" placeholder="Toyota" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Model *</label>
                  <input value={editingCar.model} onChange={e => setEditingCar(p => ({ ...p, model: e.target.value }))} className="input-dark" placeholder="Camry" />
                </div>
              </div>

              {/* Year, Price, Mileage */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Year</label>
                  <input type="number" value={editingCar.year} onChange={e => setEditingCar(p => ({ ...p, year: +e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Price (₹)</label>
                  <input type="number" value={editingCar.price} onChange={e => setEditingCar(p => ({ ...p, price: +e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Mileage (km)</label>
                  <input type="number" value={editingCar.mileage} onChange={e => setEditingCar(p => ({ ...p, mileage: +e.target.value }))} className="input-dark" />
                </div>
              </div>

              {/* Fuel, Transmission, Owners */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Fuel</label>
                  <div className="relative">
                    <select value={editingCar.fuel} onChange={e => setEditingCar(p => ({ ...p, fuel: e.target.value as FuelType }))} className="select-dark">
                      {['petrol','diesel','electric','hybrid','cng'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Transmission</label>
                  <div className="relative">
                    <select value={editingCar.transmission} onChange={e => setEditingCar(p => ({ ...p, transmission: e.target.value as TransmissionType }))} className="select-dark">
                      {['manual','automatic','cvt'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Owners</label>
                  <input type="number" min={1} value={editingCar.owners} onChange={e => setEditingCar(p => ({ ...p, owners: +e.target.value }))} className="input-dark" />
                </div>
              </div>

              {/* Color, Engine, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Color</label>
                  <input value={editingCar.color} onChange={e => setEditingCar(p => ({ ...p, color: e.target.value }))} className="input-dark" placeholder="Pearl White" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Engine</label>
                  <input value={editingCar.engine} onChange={e => setEditingCar(p => ({ ...p, engine: e.target.value }))} className="input-dark" placeholder="2.5L 4-cyl" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Status</label>
                  <div className="relative">
                    <select value={editingCar.status} onChange={e => setEditingCar(p => ({ ...p, status: e.target.value as CarStatus }))} className="select-dark">
                      {['available','reserved','sold'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Owner, Condition, Type */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Owner Name</label>
                  <input value={editingCar.ownerName} onChange={e => setEditingCar(p => ({ ...p, ownerName: e.target.value }))} className="input-dark" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Condition</label>
                  <input value={editingCar.condition} onChange={e => setEditingCar(p => ({ ...p, condition: e.target.value }))} className="input-dark" placeholder="Excellent" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Car Type</label>
                  <input value={editingCar.carType} onChange={e => setEditingCar(p => ({ ...p, carType: e.target.value }))} className="input-dark" placeholder="SUV / Sedan" />
                </div>
              </div>

              {/* Procurement & Registration Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Registration No</label>
                  <input value={editingCar.registrationNo || ''} onChange={e => setEditingCar(p => ({ ...p, registrationNo: e.target.value }))} className="input-dark" placeholder="MH01AB1234" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Chassis No</label>
                  <input value={editingCar.chassisNo || ''} onChange={e => setEditingCar(p => ({ ...p, chassisNo: e.target.value }))} className="input-dark" placeholder="..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Engine No</label>
                  <input value={editingCar.engineNo || ''} onChange={e => setEditingCar(p => ({ ...p, engineNo: e.target.value }))} className="input-dark" placeholder="..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Procurement Date</label>
                  <input type="date" value={editingCar.dateOfProcurement || ''} onChange={e => setEditingCar(p => ({ ...p, dateOfProcurement: e.target.value }))} className="input-dark" />
                </div>
              </div>

              {/* Buyer Details (Only if Sold) */}
              {editingCar.status === 'sold' && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-4">
                  <h3 className="text-sm font-semibold text-red-400">Buyer Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Buyer Name</label>
                      <input value={editingCar.buyerName || ''} onChange={e => setEditingCar(p => ({ ...p, buyerName: e.target.value }))} className="input-dark bg-black/40" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Buyer PAN</label>
                      <input value={editingCar.buyerPan || ''} onChange={e => setEditingCar(p => ({ ...p, buyerPan: e.target.value }))} className="input-dark bg-black/40" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Buyer Aadhar</label>
                      <input value={editingCar.buyerAadhar || ''} onChange={e => setEditingCar(p => ({ ...p, buyerAadhar: e.target.value }))} className="input-dark bg-black/40" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Sold Date</label>
                      <input type="date" value={editingCar.soldDate || ''} onChange={e => setEditingCar(p => ({ ...p, soldDate: e.target.value }))} className="input-dark bg-black/40" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Buyer Address</label>
                    <input value={editingCar.buyerAddress || ''} onChange={e => setEditingCar(p => ({ ...p, buyerAddress: e.target.value }))} className="input-dark bg-black/40" placeholder="Full Address" />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Description</label>
                <textarea value={editingCar.description} onChange={e => setEditingCar(p => ({ ...p, description: e.target.value }))} rows={3} className="input-dark resize-none" placeholder="Describe the car..." />
              </div>

              {/* Features */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeature()} className="input-dark flex-1 py-2" placeholder="Add feature..." />
                  <button onClick={addFeature} className="btn-primary px-4 py-2 text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingCar.features || []).map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 glass rounded-full text-xs text-purple-300">
                      {f}
                      <button onClick={() => removeFeature(i)} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Photos</label>
                <label className="flex items-center gap-3 px-4 py-3 glass border border-dashed border-purple-900/50 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors">
                  <Upload className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Upload photo (JPG, PNG, WebP)</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {(editingCar.images || []).length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {(editingCar.images || []).map((img, i) => (
                      <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden group">
                        <Image src={img} alt="" fill className="object-cover" />
                        <button
                          onClick={() => setEditingCar(p => ({ ...p, images: (p.images || []).filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-purple-900/20 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-ghost px-6 py-2.5">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {isEditing ? 'Save Changes' : 'Add Car'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
