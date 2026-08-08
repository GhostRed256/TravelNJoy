'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, Search, RefreshCw, LogOut, MessageCircle,
  Car as CarIcon, TrendingUp, DollarSign, Users, Eye, X, Upload,
  CheckCircle2, AlertCircle, ChevronDown, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Car, CarStatus, FuelType, TransmissionType } from '@/types/car';
import { DEMO_CARS, generateId, formatPrice, formatMileage, getVehicleId } from '@/lib/utils';
import { INDIAN_CAR_BRANDS, POPULAR_INDIAN_MODELS } from '@/lib/constants';
import Link from 'next/link';

const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'muv_mpv', 'crossover', 'pickup', 'other'] as const;

function createEmptyCar(): Partial<Car> {
  return {
    make: '', modelVariant: '', yearOfManufacture: new Date().getFullYear(), quotingPrice: 0,
    odometer: 0, fuel: 'petrol', transmission: 'manual', color: '',
    description: '', images: [], status: 'available', features: [], engine: '', owners: 1,
    rcName: '', condition: '', carType: '', bodyType: 'sedan',
    buyerName: '', buyerEmail: '', buyerAadhar: '', buyerPAN: '', buyerAddress: '', soldDate: '',
    registrationNo: '', chassisNo: '', engineNo: '', acquisitionDate: '',
    docRC: '', docInsurance: '', docPUC: '', docNOC: '', docSellerPAN: '', docSellerAadhar: '',
    docBuyerPAN: '', docBuyerAadhar: '', docVehicleDetails: ''
  };
}

import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<{ file: File; base64: string }> {
  try {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true
    };
    const compressedFile = await imageCompression(file, options);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ file: compressedFile, base64: e.target?.result as string });
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Compression error, falling back to original:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ file, base64: e.target?.result as string });
      reader.readAsDataURL(file);
    });
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Partial<Car>>(createEmptyCar());
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadConfirm, setUploadConfirm] = useState<{ name: string; url: string } | null>(null);
  const [unlinkedPhotos, setUnlinkedPhotos] = useState<string[]>([]);
  const [assigningPhoto, setAssigningPhoto] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const fetchUnlinkedPhotos = async () => {
    try {
      const res = await fetch('/api/unlinked');
      if (res.ok) {
        const data = await res.json();
        setUnlinkedPhotos(data.images || []);
      }
    } catch { /* ignore */ }
  };

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        if (typeof window !== 'undefined') localStorage.setItem('admin_session', 'authenticated');
        setAuthChecked(true);
        fetchCars();
        fetchUnlinkedPhotos();
        return;
      }
      if (typeof window !== 'undefined') localStorage.removeItem('admin_session');
      router.replace('/admin/login');
    } catch {
      if (typeof window !== 'undefined') localStorage.removeItem('admin_session');
      router.replace('/admin/login');
    }
  }, [router]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars || []);
      }
    } catch {
      console.error('Failed to fetch cars');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session');
    }
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Auto-save draft whenever user changes new car details (Hooks MUST be before conditional return)
  useEffect(() => {
    if (showModal && !isEditing && editingCar) {
      const hasContent = editingCar.make || editingCar.modelVariant || editingCar.quotingPrice || (editingCar.images && editingCar.images.length > 0) || editingCar.description;
      if (hasContent) {
        try {
          const now = new Date().toISOString();
          localStorage.setItem('admin_car_draft', JSON.stringify({ car: editingCar, savedAt: now }));
        } catch { /* ignore */ }
      }
    }
  }, [showModal, isEditing, editingCar]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin glow" />
      </div>
    );
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem('admin_car_draft');
    } catch { /* ignore */ }
    setDraftSavedAt(null);
    setEditingCar({ ...createEmptyCar(), id: generateId(), createdAt: new Date().toISOString() });
    toast.success('Draft cleared! Starting fresh.');
  };

  const openNew = () => {
    setIsEditing(false);
    let restored = false;
    try {
      const raw = localStorage.getItem('admin_car_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.car && (parsed.car.make || parsed.car.modelVariant || (parsed.car.images && parsed.car.images.length > 0) || parsed.car.quotingPrice)) {
          setEditingCar(parsed.car);
          setDraftSavedAt(parsed.savedAt);
          restored = true;
          toast.success('Restored your unsaved car draft!');
        }
      }
    } catch { /* ignore */ }

    if (!restored) {
      setEditingCar({ ...createEmptyCar(), id: generateId(), createdAt: new Date().toISOString() });
      setDraftSavedAt(null);
    }
    setShowModal(true);
  };

  const openEdit = async (car: Car) => {
    // Optimistically open modal with current data
    setEditingCar({ ...car });
    setIsEditing(true);
    setShowModal(true);
    
    // Fetch fresh data in case a customer just booked it
    try {
      const res = await fetch(`/api/cars?filter=all`);
      if (res.ok) {
        const data = await res.json();
        if (data.cars) setCars(data.cars);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingCar.make || !editingCar.modelVariant) {
      toast.error('Make and Model & Variant are required');
      return;
    }
    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/cars/${editingCar.id}` : '/api/cars';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCar),
      });

      if (res.ok) {
        toast.success(isEditing ? 'Car updated!' : 'Car added!');
        if (!isEditing) {
          try { localStorage.removeItem('admin_car_draft'); } catch { /* ignore */ }
          setDraftSavedAt(null);
        }
        setShowModal(false);
        fetchCars();
      } else {
        let errMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch { /* ignore */ }

        if (res.status === 503) {
          toast.error('⚠️ Firestore not ready. Please check console.', { duration: 8000 });
        } else {
          toast.error(`Failed to save: ${errMsg}`);
        }
      }
    } catch {
      toast.error('Error saving car');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      setCars(prev => prev.filter(c => c.id !== id));
      toast.success('Car deleted!');
      fetchCars();
    } catch {
      setCars(prev => prev.filter(c => c.id !== id));
      toast.success('Car deleted!');
    }
    setDeleteConfirm(null);
  };

  const handleCloseModal = () => {
    const hasData = editingCar.make || editingCar.modelVariant || (editingCar.images && editingCar.images.length > 0);
    if (hasData) {
      if (!window.confirm('Are you sure you want to exit? Any unsaved car details or uploads will be lost.')) {
        return;
      }
    }
    setShowModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Car, isImageArray = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadProgress(0);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const rawFile = files[i];
      try {
        const { file: compressedFile } = await compressImage(rawFile);
        const pct = Math.round(((i + 0.5) / files.length) * 100);
        setUploadProgress(pct);

        const formData = new FormData();
        formData.append('file', compressedFile);

        const url: string = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload');
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.url) resolve(data.url);
                else reject(new Error(data.error || 'No URL returned'));
              } catch { reject(new Error('Invalid response')); }
            } else {
              let errMsg = `Upload failed (${xhr.status})`;
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.error) errMsg = `${errMsg}: ${data.error}`;
                if (data.details) errMsg = `${errMsg} - ${JSON.stringify(data.details)}`;
              } catch { /* ignore */ }
              reject(new Error(errMsg));
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(formData);
        });

        newUrls.push(url);
      } catch (err: any) {
        console.error(err);
        toast.error(`Upload error (${rawFile.name}): ${err.message || 'Failed'}`);
      }
    }

    if (newUrls.length > 0) {
      if (isImageArray) {
        setEditingCar(prev => ({ ...prev, images: [...(prev.images || []), ...newUrls] }));
      } else {
        setEditingCar(prev => ({ ...prev, [field]: newUrls[0] }));
      }
      toast.success(`Uploaded ${newUrls.length} file(s)!`);
    }

    setUploadProgress(null);
    e.target.value = '';
  };

  const handleAssignPhoto = async (photoUrl: string, targetCarId: string) => {
    if (!targetCarId) return;
    setAssigningPhoto(photoUrl);
    try {
      const res = await fetch('/api/unlinked/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: photoUrl, carId: targetCarId })
      });
      if (res.ok) {
        toast.success('Photo assigned and synced!');
        setUnlinkedPhotos(prev => prev.filter(p => p !== photoUrl));
        fetchCars();
      } else {
        const err = await res.json();
        toast.error(`Failed to assign: ${err.error}`);
      }
    } catch (err: any) {
      toast.error('Network error assigning photo');
    }
    setAssigningPhoto(null);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setEditingCar(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (i: number) => {
    setEditingCar(prev => ({ ...prev, features: (prev.features || []).filter((_, idx) => idx !== i) }));
  };

  const filtered = cars.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const featuresStr = (c.features || []).join(' ');
    const priceStr = c.quotingPrice?.toString() || '';
    const searchString = [
      c.make, c.modelVariant, c.yearOfManufacture, c.status,
      c.registrationNo, c.color, c.fuel, c.transmission, c.bodyType,
      c.rcName, c.chassisNo, c.engineNo, c.buyerName,
      c.description, c.carType, c.engine, featuresStr, priceStr
    ].filter(Boolean).join(' ').toLowerCase();
    return searchString.includes(q);
  });

  const stats = {
    total: cars.length,
    available: cars.filter(c => c.status === 'available').length,
    sold: cars.filter(c => c.status === 'sold').length,
    totalValue: cars.filter(c => c.status === 'available').reduce((s, c) => s + (c.quotingPrice || 0), 0),
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
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-purple-900/30 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Unassigned Photos Inbox */}
        {unlinkedPhotos.length > 0 && (
          <div className="mb-8 p-5 glass border border-yellow-500/30 rounded-2xl bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Unassigned Photos Inbox</h2>
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">{unlinkedPhotos.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {unlinkedPhotos.map(photoUrl => (
                <div key={photoUrl} className="relative rounded-xl overflow-hidden group border border-purple-900/30 bg-black/40 p-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                    <Image src={photoUrl} alt="Unassigned" fill className="object-cover" />
                  </div>
                  <select
                    className="w-full text-xs bg-black border border-purple-900/50 rounded p-1 text-white mb-2 focus:outline-none focus:border-purple-500"
                    onChange={(e) => {
                      if (e.target.value) handleAssignPhoto(photoUrl, e.target.value);
                    }}
                    value=""
                    disabled={assigningPhoto === photoUrl}
                  >
                    <option value="" disabled>Assign to car...</option>
                    {cars.map(c => (
                      <option key={c.id} value={c.id}>
                        {getVehicleId(c, cars)} - {c.make} {c.modelVariant}
                      </option>
                    ))}
                  </select>
                  {assigningPhoto === photoUrl && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reg no, make, model, color, buyer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark !pl-12 h-11"
              />
          </div>
          <button type="button" onClick={fetchCars} className="flex items-center gap-2 px-4 h-11 glass border border-purple-900/30 rounded-xl text-purple-300 hover:bg-purple-600/10 transition-all text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={openNew} className="btn-primary flex items-center gap-2 px-5 h-11">
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
                  <th>ID</th>
                  <th>Car</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Odometer</th>
                  <th>Fuel</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <span className="text-xs font-mono font-bold bg-purple-900/40 text-purple-300 px-2 py-1 rounded border border-purple-700/30">
                        {getVehicleId(car, cars)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg overflow-hidden bg-purple-900/20 flex-shrink-0">
                          <Image
                            src={car.images?.[0] || '/car-sedan.png'}
                            alt={car.modelVariant || ''}
                            width={48}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{car.make} {car.modelVariant}</p>
                          <p className="text-xs text-gray-500">{car.color} · {car.transmission} {car.bodyType ? `· ${car.bodyType.replace('_', '/')}` : ''}</p>
                          {(() => {
                            const missing = [];
                            if (!car.images || car.images.length === 0) missing.push('Photos');
                            if (!car.docRC) missing.push('RC');
                            if (!car.docInsurance) missing.push('Insurance');
                            if (!car.docPUC) missing.push('PUC');
                            if (missing.length === 0) return null;
                            return (
                              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-medium bg-red-900/10 px-1.5 py-0.5 rounded border border-red-500/20 inline-flex">
                                <AlertCircle className="w-3 h-3" /> Missing: {missing.join(', ')}
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td>{car.yearOfManufacture}</td>
                    <td className="font-semibold text-purple-300">{formatPrice(car.quotingPrice)}</td>
                    <td>{formatMileage(car.odometer)}</td>
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
                        <button type="button" onClick={() => openEdit(car)} className="p-1.5 glass rounded-lg text-purple-400 hover:bg-purple-500/10 transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === car.id ? (
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => handleDelete(car.id)} className="p-1.5 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-xs">
                              Confirm
                            </button>
                            <button type="button" onClick={() => setDeleteConfirm(null)} className="p-1.5 glass rounded-lg text-gray-400">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setDeleteConfirm(car.id)} className="p-1.5 glass rounded-lg text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
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
      <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
          onClick={handleCloseModal}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="glass-dark rounded-2xl border border-purple-900/40 w-full max-w-3xl my-auto max-h-[92vh] flex flex-col overflow-hidden shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-purple-900/30 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white font-[var(--font-outfit)]">
                  {isEditing ? 'Edit Car' : 'Add New Car'}
                </h2>
                {!isEditing && draftSavedAt && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-xs text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Draft Saved</span>
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-0.5 rounded transition-colors ml-1 font-medium"
                    >
                      Clear Draft
                    </button>
                  </div>
                )}
              </div>
              <button type="button" onClick={handleCloseModal} className="glass rounded-lg p-2 text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Primary Info */}
              <div className="space-y-4">
                <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Primary Info</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Make (Brand) *</label>
                    <select
                      value={INDIAN_CAR_BRANDS.includes(editingCar.make as any) ? editingCar.make : (editingCar.make ? 'Other' : '')}
                      onChange={e => {
                        const val = e.target.value;
                        if (val !== 'Other') {
                          setEditingCar(p => ({ ...p, make: val }));
                        }
                      }}
                      className="input-dark mb-2"
                    >
                      <option value="">Select Brand (30+ Indian Brands)...</option>
                      {INDIAN_CAR_BRANDS.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value="Other">Other / Custom Brand...</option>
                    </select>
                    {(!INDIAN_CAR_BRANDS.includes(editingCar.make as any) || editingCar.make === '') && (
                      <input
                        value={editingCar.make || ''}
                        onChange={e => setEditingCar(p => ({ ...p, make: e.target.value }))}
                        className="input-dark text-sm"
                        placeholder="Type custom brand name..."
                        list="car-makes"
                      />
                    )}
                    <datalist id="car-makes">
                      {INDIAN_CAR_BRANDS.map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Model & Variant *</label>
                    <input value={editingCar.modelVariant || ''} onChange={e => setEditingCar(p => ({ ...p, modelVariant: e.target.value }))} className="input-dark" placeholder="e.g. Swift ZXi / Creta SX" list="car-models" />
                    <datalist id="car-models">
                      {POPULAR_INDIAN_MODELS.map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Reg. Number</label>
                    <input value={editingCar.registrationNo || ''} onChange={e => setEditingCar(p => ({ ...p, registrationNo: e.target.value }))} className="input-dark" placeholder="MH01AB1234" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Year of Mfg</label>
                    <input type="number" value={editingCar.yearOfManufacture || 2024} onChange={e => setEditingCar(p => ({ ...p, yearOfManufacture: +e.target.value }))} className="input-dark" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Quoting Price (₹)</label>
                    <input type="number" value={editingCar.quotingPrice || ''} onChange={e => setEditingCar(p => ({ ...p, quotingPrice: +e.target.value }))} className="input-dark" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Odometer (km)</label>
                    <input type="number" value={editingCar.odometer || ''} onChange={e => setEditingCar(p => ({ ...p, odometer: +e.target.value }))} className="input-dark" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Body Type</label>
                    <div className="relative">
                      <select value={editingCar.bodyType || 'sedan'} onChange={e => setEditingCar(p => ({ ...p, bodyType: e.target.value as any }))} className="select-dark">
                        {BODY_TYPES.map(b => <option key={b} value={b}>{b.replace('_', '/')}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs & Condition */}
              <div className="space-y-4">
                <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Specs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Fuel</label>
                    <div className="relative">
                      <select value={editingCar.fuel || 'petrol'} onChange={e => setEditingCar(p => ({ ...p, fuel: e.target.value as FuelType }))} className="select-dark">
                        {['petrol','diesel','electric','hybrid','cng','e10','e20','pure petrol'].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Transmission</label>
                    <div className="relative">
                      <select value={editingCar.transmission || 'manual'} onChange={e => setEditingCar(p => ({ ...p, transmission: e.target.value as TransmissionType }))} className="select-dark">
                        {['manual','automatic','cvt'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Color</label>
                    <input value={editingCar.color || ''} onChange={e => setEditingCar(p => ({ ...p, color: e.target.value }))} className="input-dark" placeholder="Pearl White" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Engine</label>
                    <input value={editingCar.engine || ''} onChange={e => setEditingCar(p => ({ ...p, engine: e.target.value }))} className="input-dark" placeholder="2.5L" />
                  </div>
                </div>
              </div>

              {/* Admin & Seller Details */}
              <div className="space-y-4 p-4 rounded-xl border border-purple-900/30 bg-purple-900/5">
                <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Seller & Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Status</label>
                    <div className="relative">
                      <select value={editingCar.status || 'available'} onChange={e => setEditingCar(p => ({ ...p, status: e.target.value as CarStatus }))} className="select-dark">
                        {['available','reserved','sold'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Acquisition Date</label>
                    <input type="date" value={editingCar.acquisitionDate || ''} onChange={e => setEditingCar(p => ({ ...p, acquisitionDate: e.target.value }))} className="input-dark" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">RC Name (Seller)</label>
                    <input value={editingCar.rcName || ''} onChange={e => setEditingCar(p => ({ ...p, rcName: e.target.value }))} className="input-dark" placeholder="Seller Name" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Owners</label>
                    <input type="number" min={1} value={editingCar.owners || 1} onChange={e => setEditingCar(p => ({ ...p, owners: +e.target.value }))} className="input-dark" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Chassis No</label>
                    <input value={editingCar.chassisNo || ''} onChange={e => setEditingCar(p => ({ ...p, chassisNo: e.target.value }))} className="input-dark" placeholder="..." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Engine No</label>
                    <input value={editingCar.engineNo || ''} onChange={e => setEditingCar(p => ({ ...p, engineNo: e.target.value }))} className="input-dark" placeholder="..." />
                  </div>
                </div>

                {/* Seller Docs Upload - Large Touch Areas */}
                <div className="mt-4">
                  <label className="text-xs text-purple-300 font-semibold block mb-3 uppercase tracking-wider">Seller Documents</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'docRC', label: 'RC Copy' },
                      { key: 'docInsurance', label: 'Insurance' },
                      { key: 'docPUC', label: 'PUC' },
                      { key: 'docNOC', label: 'NOC / Hypo' },
                      { key: 'docSellerPAN', label: 'Seller PAN' },
                      { key: 'docSellerAadhar', label: 'Seller Aadhar' },
                      { key: 'docVehicleDetails', label: 'Vehicle Details' }
                    ].map(doc => (
                      <div key={doc.key} className="relative rounded-xl border border-purple-900/40 bg-black/50 p-3 flex flex-col justify-between items-center min-h-[90px] w-full text-center">
                        {editingCar[doc.key as keyof Car] ? (
                          <div className="flex flex-col items-center justify-between w-full h-full gap-1">
                            <div className="flex items-center gap-1 text-green-400 font-medium text-xs">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span>{doc.label}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 w-full pt-1 border-t border-purple-900/30">
                              <a href={editingCar[doc.key as keyof Car] as string} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors">
                                View
                              </a>
                              <label className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-xs cursor-pointer transition-colors">
                                Replace
                                <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, doc.key as keyof Car)} className="hidden" />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-900/10 rounded-lg transition-all">
                            <Upload className="w-6 h-6 mb-1 text-purple-400" />
                            <span className="text-xs font-medium text-white">{doc.label}</span>
                            <span className="text-[10px] text-gray-500">Tap to upload</span>
                            <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, doc.key as keyof Car)} className="hidden" />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buyer Details (Only if Sold) */}
              {editingCar.status === 'sold' && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-4">
                  <h3 className="text-sm font-semibold text-red-400">Buyer Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Buyer Name</label>
                      <input value={editingCar.buyerName || ''} onChange={e => setEditingCar(p => ({ ...p, buyerName: e.target.value }))} className="input-dark bg-black/40" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Buyer Email</label>
                      <input type="email" value={editingCar.buyerEmail || ''} onChange={e => setEditingCar(p => ({ ...p, buyerEmail: e.target.value }))} className="input-dark bg-black/40" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Buyer PAN</label>
                      <input value={editingCar.buyerPAN || ''} onChange={e => setEditingCar(p => ({ ...p, buyerPAN: e.target.value }))} className="input-dark bg-black/40" />
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
                  
                  {/* Buyer Docs Upload */}
                  <div className="mt-4">
                    <label className="text-xs text-red-300 font-semibold block mb-3 uppercase tracking-wider">Buyer Documents</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'docBuyerPAN', label: 'Buyer PAN' },
                        { key: 'docBuyerAadhar', label: 'Buyer Aadhar' }
                      ].map(doc => (
                        <div key={doc.key} className="relative rounded-xl border border-red-900/40 bg-black/50 p-3 flex flex-col justify-between items-center min-h-[90px] w-full text-center">
                          {editingCar[doc.key as keyof Car] ? (
                            <div className="flex flex-col items-center justify-between w-full h-full gap-1">
                              <div className="flex items-center gap-1 text-green-400 font-medium text-xs">
                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{doc.label}</span>
                              </div>
                              <div className="flex items-center justify-center gap-2 w-full pt-1 border-t border-red-900/30">
                                <a href={editingCar[doc.key as keyof Car] as string} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors">
                                  View
                                </a>
                                <label className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs cursor-pointer transition-colors">
                                  Replace
                                  <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, doc.key as keyof Car)} className="hidden" />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all">
                              <Upload className="w-6 h-6 mb-1 text-red-400" />
                              <span className="text-xs font-medium text-white">{doc.label}</span>
                              <span className="text-[10px] text-gray-500">Tap to upload</span>
                              <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, doc.key as keyof Car)} className="hidden" />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Description</label>
                <textarea value={editingCar.description || ''} onChange={e => setEditingCar(p => ({ ...p, description: e.target.value }))} rows={3} className="input-dark resize-none" placeholder="Describe the car..." />
              </div>

              {/* Features */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeature()} className="input-dark flex-1 py-2" placeholder="Add feature..." />
                  <button type="button" onClick={addFeature} className="btn-primary px-4 py-2 text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingCar.features || []).map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 glass rounded-full text-xs text-purple-300">
                      {f}
                      <button type="button" onClick={() => removeFeature(i)} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Car Images Upload - 100% Touch Friendly Area */}
              <div>
                <label className="text-xs text-purple-300 font-semibold block mb-2 uppercase tracking-wider">Car Photos (Public)</label>
                <label className="flex flex-col items-center justify-center gap-3 w-full p-8 sm:p-10 border-2 border-dashed border-purple-500/50 rounded-2xl bg-purple-950/30 hover:bg-purple-900/40 cursor-pointer transition-all active:scale-[0.99] group text-center min-h-[140px]">
                  <div className="w-14 h-14 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Upload className="w-7 h-7 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">Tap ANYWHERE inside this box to add car photos</p>
                    <p className="text-xs text-gray-300 mt-1">Supports JPG, PNG, WebP — You can select multiple photos at once!</p>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={e => handleFileUpload(e, 'images', true)} className="hidden" />
                </label>
                {(editingCar.images || []).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                    {(editingCar.images || []).map((img, i) => (
                      <div key={i} className="relative aspect-video rounded-xl overflow-hidden group border border-purple-900/30 bg-black/40">
                        <Image src={img} alt="" fill className="object-cover" />
                        
                        {/* Cover Photo Button */}
                        <button
                          onClick={() => {
                            if (i === 0) return;
                            setEditingCar(p => {
                              const imgs = [...(p.images || [])];
                              const selected = imgs.splice(i, 1)[0];
                              imgs.unshift(selected); // move to front
                              return { ...p, images: imgs };
                            });
                          }}
                          className={`absolute top-1 left-1 p-1 rounded-full text-white transition-opacity shadow-md ${i === 0 ? 'bg-yellow-500/90' : 'bg-black/50 hover:bg-yellow-500/70'}`}
                          title={i === 0 ? "This is the Cover Photo" : "Set as Cover Photo"}
                        >
                          <Star className={`w-4 h-4 ${i === 0 ? 'fill-white' : ''}`} />
                        </button>

                        <button
                          onClick={() => setEditingCar(p => ({ ...p, images: (p.images || []).filter((_, idx) => idx !== i) }))}
                          className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 rounded-full text-white transition-opacity shadow-md"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {i === 0 && (
                          <div className="absolute bottom-0 inset-x-0 bg-yellow-500/90 text-black text-[9px] font-bold text-center py-0.5">
                            COVER PHOTO
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-purple-900/30 flex gap-3 justify-end sticky bottom-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
              <button type="button" onClick={handleCloseModal} className="btn-ghost px-6 py-2.5">Cancel</button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {isEditing ? 'Save Changes' : 'Add Car'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Global Upload Progress Overlay */}
      {uploadProgress !== null && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-purple-900/40 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="mb-4 text-purple-400">
              <Upload className="w-10 h-10 mx-auto animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Uploading...</h3>
            <div className="w-full bg-black/50 rounded-full h-3 mb-2 border border-purple-900/30 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
          </div>
        </div>
      )}

      {/* Upload Confirmation Toast */}
      {uploadConfirm && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-green-500/30 shadow-lg shadow-green-900/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Upload Complete</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{uploadConfirm.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

