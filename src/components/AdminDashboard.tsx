/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Check, 
  Trash2, 
  UserPlus, 
  X, 
  Plus, 
  Phone, 
  ArrowLeft, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Ustadz, User } from '../types';

interface AdminDashboardProps {
  onBackToHome: () => void;
  lang: 'id' | 'en';
}

export default function AdminDashboard({ onBackToHome, lang }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'ustadz'>('users');
  
  // States for User Approval
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchText, setUserSearchText] = useState('');

  // States for Ustadz CRUD
  const [scholars, setScholars] = useState<Ustadz[]>([]);
  const [scholarsLoading, setScholarsLoading] = useState(true);
  const [newScholarName, setNewScholarName] = useState('');
  const [newScholarPhone, setNewScholarPhone] = useState('');
  const [scholarError, setScholarError] = useState('');
  const [scholarSuccess, setScholarSuccess] = useState('');

  // Sync Users & Simulated Users Collections
  useEffect(() => {
    setUsersLoading(true);
    let unsubUsers: (() => void) | null = null;
    let unsubSimulated: (() => void) | null = null;
    
    let realUsers: User[] = [];
    let simulatedUsers: User[] = [];

    const mergeAndSetUsers = () => {
      const mergedMap = new Map<string, User>();
      
      // Load simulated users first
      simulatedUsers.forEach(u => {
        if (u.email) {
          mergedMap.set(u.email.toLowerCase(), u);
        }
      });
      
      // Load real users (real overrides simulated if same email)
      realUsers.forEach(u => {
        if (u.email) {
          mergedMap.set(u.email.toLowerCase(), u);
        }
      });

      const finalUsers = Array.from(mergedMap.values()).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setRegisteredUsers(finalUsers);
    };

    // 1. Sync real authenticated users
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unsubUsers = onSnapshot(q, (snapshot) => {
        const fetched: User[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data();
          fetched.push({
            id_user: snap.id,
            name: data.name || 'Anonymous',
            email: data.email || '',
            role: data.role || 'User',
            approved: data.approved || false,
            uid: data.uid || snap.id,
            createdAt: data.createdAt || ''
          });
        });
        realUsers = fetched;
        mergeAndSetUsers();
        setUsersLoading(false);
      }, (error) => {
        console.warn("Real users fetch restricted or offline (permission denied/iframe):", error);
        realUsers = [];
        mergeAndSetUsers();
        setUsersLoading(false);
      });
    } catch (err) {
      console.warn("Failed to subscribe to real users:", err);
    }

    // 2. Sync simulated/offline users
    try {
      const qSim = query(collection(db, 'simulated_users'), orderBy('createdAt', 'desc'));
      unsubSimulated = onSnapshot(qSim, (snapshot) => {
        const fetched: User[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data();
          fetched.push({
            id_user: snap.id,
            name: data.name || 'Anonymous',
            email: data.email || '',
            role: data.role || 'User',
            approved: data.approved || false,
            uid: data.uid || snap.id,
            createdAt: data.createdAt || '',
            isSimulated: true // Identify simulated fallback user
          } as any);
        });
        simulatedUsers = fetched;
        mergeAndSetUsers();
      }, (error) => {
        console.error("Error reading simulated users in admin:", error);
      });
    } catch (err) {
      console.error("Failed to query simulated users:", err);
    }

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubSimulated) unsubSimulated();
    };
  }, []);

  // Sync Ustadz Collection
  useEffect(() => {
    setScholarsLoading(true);
    const q = query(collection(db, 'ustadz'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Ustadz[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
         fetched.push({
          id: snap.id,
          name: data.name || '',
          phone: data.phone || '',
          createdAt: data.createdAt || ''
        });
      });
      setScholars(fetched);
      setScholarsLoading(false);
    }, (error) => {
      console.error("Error reading ustadz in admin:", error);
      setScholarsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle registration approval status
  const toggleUserApproval = async (user: User) => {
    try {
      if (user.email === 'ekowirsabits@gmail.com') {
        alert(lang === 'id' ? 'Master Admin tidak bisa ditarik status persetujuannya!' : 'Master Admin cannot be disapproved.');
        return;
      }
      const nextApproved = !user.approved;
      
      if ((user as any).isSimulated) {
        const userRef = doc(db, 'simulated_users', user.id_user);
        await setDoc(userRef, { approved: nextApproved }, { merge: true });
      } else {
        const userRef = doc(db, 'users', user.id_user);
        await setDoc(userRef, { approved: nextApproved }, { merge: true });
      }

      // Also mirror/update simulated collection in case of crossover login
      try {
        const altRef = doc(db, 'simulated_users', user.id_user);
        await setDoc(altRef, { approved: nextApproved }, { merge: true });
      } catch (e) {}

    } catch (err) {
      console.error("Failed to update user approval:", err);
      alert("Error updating user status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Reject and delete registration request
  const handleRejectUser = async (user: User) => {
    if (user.email === 'ekowirsabits@gmail.com') {
      alert(lang === 'id' ? 'Master Admin tidak dapat ditolak!' : 'Master Admin cannot be rejected.');
      return;
    }
    const confirmMessage = lang === 'id' 
      ? `Apakah Anda yakin ingin MENOLAK dan MENGHAPUS pendaftaran akun oleh ${user.name} (${user.email})?`
      : `Are you sure you want to REJECT and DELETE the user account registration of ${user.name} (${user.email})?`;
      
    if (!window.confirm(confirmMessage)) return;

    try {
      if ((user as any).isSimulated) {
        const userRef = doc(db, 'simulated_users', user.id_user);
        await deleteDoc(userRef);
      } else {
        const userRef = doc(db, 'users', user.id_user);
        await deleteDoc(userRef);
      }

      // Also clean up alternative mirrored record
      try {
        const altRef = doc(db, 'simulated_users', user.id_user);
        await deleteDoc(altRef);
      } catch (e) {}
    } catch (err) {
      console.error("Failed to reject user:", err);
      alert("Error rejecting user: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Add new Ustadz
  const handleAddScholar = async (e: React.FormEvent) => {
    e.preventDefault();
    setScholarError('');
    setScholarSuccess('');

    if (!newScholarName.trim() || !newScholarPhone.trim()) {
      setScholarError(lang === 'id' ? 'Harap lengkapi nama dan nomor WA.' : 'Please enter both name and WA phone.');
      return;
    }

    // Standardize WA phone number (allow numbers, strip + spaces etc)
    let cleanPhone = newScholarPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('62') && cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone;
    }

    if (cleanPhone.length < 9) {
      setScholarError(lang === 'id' ? 'Format nomor WhatsApp tidak valid.' : 'Invalid WhatsApp phone format.');
      return;
    }

    try {
      const uId = Math.random().toString(36).substring(2, 11);
      await setDoc(doc(db, 'ustadz', uId), {
        id: uId,
        name: newScholarName.trim(),
        phone: cleanPhone,
        createdAt: new Date().toISOString()
      });

      setNewScholarName('');
      setNewScholarPhone('');
      setScholarSuccess(lang === 'id' ? 'Ustadz berhasil ditambahkan!' : 'Scholar added successfully!');
    } catch (err) {
      console.error("Failed to add scholar:", err);
      setScholarError("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Remove Ustadz
  const handleRemoveScholar = async (id: string, name: string) => {
    if (!window.confirm(lang === 'id' ? `Hapus ustadz ${name}?` : `Delete ustadz ${name}?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'ustadz', id));
    } catch (err) {
      console.error("Failed to delete scholar:", err);
      alert("Error deleting scholar: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Filtering users based on search
  const filteredUsers = registeredUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchText.toLowerCase())
  );

  return (
    <div className="bg-[#0c0d10] text-[#EAE6E1] min-h-screen flex flex-col font-sans relative">
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top sticky brand bar */}
      <nav className="bg-[#0c0d10] border-b border-[#C5A059]/15 h-16 flex items-center px-4 sm:px-6 md:px-16 justify-between z-15 relative gap-3">
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={onBackToHome}>
          <img 
            alt="Warisku Logo" 
            className="h-8 w-auto rounded-full object-contain bg-black/35 border border-[#C5A059]/30" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv9Kj4CxubLiWNwOzqn4Ncf0iWGwnw_w1u3D_-X21BzNxQ-hCb6Di-BeLJgcjTseqTLQBVy6HdG8Msg7iFZLJ4VI1WTUmH_evQZbSzjZzTlFeCkbR5dW2eu6H0JjrzHJfPCfmkWfYlLqsp0iy9LcVXiGJYtp33kuEFJ6vSQjHkni_0M6O9N2fiKw9Jggpkt-UmK7qSkpKwsWR5YcyH78B85AjBwVQQzMBIycJ3Ym2xDmAc5rqnLacLrmq4y0gPnFDtxgBhwPJyxiU"
          />
          <span className="font-semibold text-lg text-[#C5A059] font-serif uppercase tracking-wider">Warisku Admin</span>
        </div>

        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-[#C5A059] hover:text-[#EAE6E1] transition-all bg-[#16171a] border border-[#C5A059]/20 px-4 py-2 rounded-full cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? 'Kebali ke Beranda' : 'Back to Home'}</span>
        </button>
      </nav>

      {/* Main Admin Section */}
      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto w-full z-10 relative">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-[#EAE6E1] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#C5A059]" />
              {lang === 'id' ? 'Dashboard Kontrol Admin' : 'Admin Control Dashboard'}
            </h1>
            <p className="text-xs text-[#A69F96]">
              {lang === 'id' ? 'Kelola pendaftaran akun pengguna dan daftarkan ustadz syariah untuk tanya jawab.' : 'Approve registered users and handle the scholars list for questions.'}
            </p>
          </div>

          {/* Tab Button Toggles */}
          <div className="flex bg-[#111215] p-1 rounded-xl border border-[#C5A059]/15">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users' 
                  ? 'bg-[#C5A059] text-[#0c0d10]' 
                  : 'text-[#CFCAC4] hover:text-[#C5A059]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'id' ? 'Persetujuan Akun' : 'User Approval'}</span>
              <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-[#0c0d10]/15 text-black' : 'bg-black/40 text-[#C5A059]'}`}>
                {registeredUsers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ustadz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ustadz' 
                  ? 'bg-[#C5A059] text-[#0c0d10]' 
                  : 'text-[#CFCAC4] hover:text-[#C5A059]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'id' ? 'Kelola Pilihan Ustadz' : 'Manage Scholars'}</span>
              <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${activeTab === 'ustadz' ? 'bg-[#0c0d10]/15 text-black' : 'bg-black/40 text-[#C5A059]'}`}>
                {scholars.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1 Content: Account Approvals */}
        {activeTab === 'users' && (
          <div className="bg-[#111215] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/15 shadow-2xl">
            <div className="flex flex-col sm:flex-row shadow-sm sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold font-serif text-[#EAE6E1] flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#C5A059]" />
                {lang === 'id' ? 'Daftar Registrasi Akun' : 'Account Registrations'}
              </h2>

              {/* Simple search bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder={lang === 'id' ? 'Cari nama atau email...' : 'Search name or email...'}
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-[#16171a] border border-[#C5A059]/20 rounded-xl focus:ring-1 focus:ring-[#C5A059] focus:outline-none text-[#EAE6E1]"
                />
              </div>
            </div>

            {usersLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <span className="inline-block w-8 h-8 border-4 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin" />
                <p className="text-xs text-[#A69F96] tracking-widest uppercase font-mono font-bold animate-pulse">Loading list...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-gray-500 bg-[#16171a]/30 rounded-2xl border border-dashed border-[#C5A059]/10">
                <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm font-medium">{lang === 'id' ? 'Tidak ada akun pendaftaran ditemukan.' : 'No registered users found.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#C5A059]/15 text-[#A69F96] text-[10px] tracking-wider uppercase font-mono">
                      <th className="py-3 px-2 font-semibold">{lang === 'id' ? 'Nama' : 'Name'}</th>
                      <th className="py-3 px-2 font-semibold">{lang === 'id' ? 'Email' : 'Email'}</th>
                      <th className="py-3 px-2 font-semibold">{lang === 'id' ? 'Tanggal Daftar' : 'Registered Date'}</th>
                      <th className="py-3 px-2 font-semibold text-center">{lang === 'id' ? 'Role' : 'Role'}</th>
                      <th className="py-3 px-2 font-semibold text-center">{lang === 'id' ? 'Status' : 'Status'}</th>
                      <th className="py-3 px-2 font-semibold text-right w-36">{lang === 'id' ? 'Aksi Kontrol' : 'Aksi'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id_user} className="border-b border-[#C5A059]/10 hover:bg-[#16171a]/40 transition-all">
                        <td className="py-4 px-2 text-sm font-bold text-[#EAE6E1]">{user.name}</td>
                        <td className="py-4 px-2 text-xs font-mono text-[#CFCAC4]">{user.email}</td>
                        <td className="py-4 px-2 text-xs text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        <td className="py-4 px-2 text-center">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            user.role === 'Admin' 
                              ? 'bg-red-950/40 text-red-400 border border-red-900/30' 
                              : 'bg-neutral-800 text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center">
                          {user.approved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-900/30">
                              <CheckCircle2 className="w-3 h-3" />
                              {lang === 'id' ? 'Setuju' : 'Approved'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/20">
                              <AlertCircle className="w-3 h-3" />
                              {lang === 'id' ? 'Pending' : 'Pending'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex gap-1.5 justify-end items-center">
                            {user.approved ? (
                              <button
                                onClick={() => toggleUserApproval(user)}
                                disabled={user.email === 'ekowirsabits@gmail.com'}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 cursor-pointer bg-[#c53939]/10 text-red-400 hover:bg-[#c53939]/25 border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                                title={lang === 'id' ? 'Cabut persetujuan akun' : 'Revoke user approval'}
                              >
                                {lang === 'id' ? 'Cabut Akses' : 'Revoke'}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => toggleUserApproval(user)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all border shrink-0 cursor-pointer bg-emerald-950/30 text-emerald-400 hover:bg-emerald-500 hover:text-black border-emerald-500/20 shadow-md flex items-center gap-1"
                                  title={lang === 'id' ? 'Setujui & aktifkan pendaftaran' : 'Approve and activate account'}
                                >
                                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500 group-hover:text-black" />
                                  <span>ACC</span>
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 cursor-pointer bg-red-950/30 text-red-400 hover:bg-red-500 hover:text-black border-red-500/20 shadow-md flex items-center gap-1"
                                  title={lang === 'id' ? 'Tolak & hapus pendaftaran' : 'Reject and delete registry'}
                                >
                                  <X className="w-3.5 h-3.5 shrink-0 text-red-500" />
                                  <span>{lang === 'id' ? 'Tolak' : 'Reject'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2 Content: Manage Scholars */}
        {activeTab === 'ustadz' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left side: Add form scholar */}
            <div className="lg:col-span-1 bg-[#111215] rounded-3xl p-6 border border-[#C5A059]/15 shadow-2xl">
              <h3 className="text-lg font-bold font-serif text-[#EAE6E1] mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C5A059]" />
                {lang === 'id' ? 'Tambah Ustadz Baru' : 'Add New Scholar'}
              </h3>

              <form onSubmit={handleAddScholar} className="space-y-4">
                {scholarError && (
                  <div className="p-3 bg-red-950/30 text-red-400 text-xs rounded-xl border border-red-900/35 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{scholarError}</span>
                  </div>
                )}

                {scholarSuccess && (
                  <div className="p-3 bg-emerald-950/30 text-emerald-400 text-xs rounded-xl border border-emerald-900/35 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{scholarSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#CFCAC4] mb-1.5">
                    {lang === 'id' ? 'Nama Lengkap Ustadz / Gelar' : 'Scholar Name & Title'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ustadz K.H. Ahmad Fauzi, Lc."
                    value={newScholarName}
                    onChange={(e) => setNewScholarName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none placeholder:text-gray-600 text-[#EAE6E1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CFCAC4] mb-1.5">
                    {lang === 'id' ? 'Nomor WhatsApp (Format: 628xxxx)' : 'WA Phone (e.g., 628xxxx)'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="628123456789"
                      value={newScholarPhone}
                      onChange={(e) => setNewScholarPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-[#C5A059] focus:outline-none placeholder:text-gray-600 text-[#EAE6E1]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                    {lang === 'id' ? 'Gunakan kode negara (62). Contoh: 6281234xxx.' : 'Always specify country code prefix (e.g. 62).'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] rounded-xl font-black shadow-md hover:opacity-95 text-xs uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Daftarkan Ustadz' : 'Add Scholar'}</span>
                </button>
              </form>
            </div>

            {/* Right side: Scholars grid display */}
            <div className="lg:col-span-2 bg-[#111215] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/15 shadow-2xl space-y-6">
              <h3 className="text-lg font-bold font-serif text-[#EAE6E1] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C5A059]" />
                {lang === 'id' ? 'Pilihan Ustadz yang Tersedia' : 'Registered Scholar List'}
              </h3>

              {scholarsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <span className="inline-block w-8 h-8 border-4 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 tracking-wider">Loading scholars...</p>
                </div>
              ) : scholars.length === 0 ? (
                <div className="py-16 text-center text-gray-500 bg-[#16171a]/30 rounded-2xl border border-dashed border-[#C5A059]/10">
                  <Phone className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-medium">{lang === 'id' ? 'Belum ada ustadz terdaftar. Silakan tambah di panel sebelah.' : 'No scholars listed yet. Add one from left panel.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scholars.map((sch) => (
                    <div 
                      key={sch.id} 
                      className="bg-[#16171a] p-4 rounded-2xl border border-[#C5A059]/10 relative group hover:border-[#C5A059]/40 hover:shadow-lg transition-all"
                    >
                      <button
                        onClick={() => handleRemoveScholar(sch.id, sch.name)}
                        className="absolute top-3 right-3 text-red-400 hover:bg-red-950/20 p-1.5 rounded-full transition-colors cursor-pointer"
                        title={lang === 'id' ? 'Hapus Ustadz' : 'Delete Scholar'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#EAE6E1] pr-6">{sch.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-mono pt-1">
                          <Phone className="w-3.5 h-3.5 text-[#C5A059]/60 shrink-0" />
                          <span>+{sch.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
