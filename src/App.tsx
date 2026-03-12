/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useParams,
  Navigate
} from 'react-router-dom';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  getDocFromServer,
  addDoc,
  orderBy,
  limit,
  or,
  and
} from 'firebase/firestore';
import { auth, db, storage, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile, UserRole, SERVICE_CATEGORIES, ChatRoom, Message } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  Search, 
  User as UserIcon, 
  LogOut, 
  MapPin, 
  Star, 
  Briefcase, 
  ChevronRight,
  Plus,
  Settings,
  ArrowLeft,
  MessageCircle,
  Phone,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Camera,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ user, profile }: { user: User | null, profile: UserProfile | null }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
            LocalPro
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/chats" className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                <MessageCircle size={22} />
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100/50 hover:bg-slate-100 transition-all border border-slate-200/50"
              >
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-bold text-slate-700 hidden sm:inline">
                  {profile?.displayName || user.displayName?.split(' ')[0]}
                </span>
              </Link>
              <button 
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signInWithGoogle()}
              className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

const Home = ({ user }: { user: User | null }) => {
  const [pros, setPros] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPros([]);
      setLoading(false);
      return;
    }

    const path = 'users';
    const q = query(
      collection(db, path), 
      where('role', '==', 'pro')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const proList = snapshot.docs.map(doc => doc.data() as UserProfile);
      setPros(proList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredPros = pros.filter(pro => {
    const matchesSearch = pro.displayName.toLowerCase().includes(search.toLowerCase()) || 
                         pro.category?.toLowerCase().includes(search.toLowerCase()) ||
                         pro.bio?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || pro.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden bg-white">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-xs font-black mb-8 border border-brand-100 uppercase tracking-widest">
            <Zap size={14} />
            <span>India's Trusted Service Network</span>
          </div>
          
          <h1 className="text-6xl sm:text-8xl font-black font-display text-slate-900 mb-8 tracking-tight leading-[0.9] text-balance">
            Expert Help, <br />
            <span className="text-brand-600 italic">Right at Your Door.</span>
          </h1>
          
          <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Connect with verified local professionals for plumbing, painting, electrical work, and more. 
            Simple, fast, and reliable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => signInWithGoogle()}
              className="w-full sm:w-auto px-12 py-6 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-2xl shadow-brand-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-xl group"
            >
              Find a Professional
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => signInWithGoogle()}
              className="w-full sm:w-auto px-12 py-6 bg-white text-slate-900 font-black rounded-2xl border-2 border-slate-100 hover:border-brand-200 transition-all flex items-center justify-center gap-3 text-xl"
            >
              Register as a Pro
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-slate-900">10k+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Verified Pros</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-slate-900">50k+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Happy Clients</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-slate-900">4.8/5</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Avg Rating</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-slate-900">24/7</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Search Header */}
      <div className="bg-slate-900 pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white font-display mb-4 tracking-tight">
              What service are you looking for?
            </h2>
            <p className="text-slate-400 font-medium text-lg">
              Find trusted professionals in your neighborhood.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-[2rem] p-2 shadow-2xl">
                <Search className="ml-6 text-slate-400" size={24} />
                <input 
                  type="text" 
                  placeholder="Search for 'Plumber', 'Painter', 'Electrician'..."
                  className="flex-1 px-6 py-5 bg-transparent border-none focus:ring-0 text-lg font-bold text-slate-900 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="hidden sm:flex px-10 py-5 bg-brand-600 text-white font-black rounded-[1.5rem] hover:bg-brand-700 transition-all items-center gap-2">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {/* Category Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-20">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 border-2",
              !selectedCategory ? "bg-brand-600 border-brand-600 text-white shadow-2xl shadow-brand-200 scale-105" : "bg-white border-slate-100 text-slate-600 hover:border-brand-200"
            )}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", !selectedCategory ? "bg-white/20" : "bg-slate-50")}>
              <Zap size={24} />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">All</span>
          </button>
          {SERVICE_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 border-2",
                selectedCategory === cat ? "bg-brand-600 border-brand-600 text-white shadow-2xl shadow-brand-200 scale-105" : "bg-white border-slate-100 text-slate-600 hover:border-brand-200"
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedCategory === cat ? "bg-white/20" : "bg-slate-50")}>
                {cat === 'Plumbing' && <Zap size={24} />}
                {cat === 'Electrical' && <Zap size={24} />}
                {cat === 'Painting' && <Zap size={24} />}
                {cat === 'Cleaning' && <Zap size={24} />}
                {cat === 'Carpentry' && <Zap size={24} />}
                {cat === 'Appliances' && <Zap size={24} />}
              </div>
              <span className="text-sm font-black uppercase tracking-widest">{cat}</span>
            </button>
          ))}
        </div>

        {/* Results Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight">
                {selectedCategory ? `${selectedCategory} Experts` : 'Recommended Professionals'}
              </h3>
              <p className="text-slate-500 font-medium">Verified experts near your location.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-brand-600 font-black text-sm uppercase tracking-widest cursor-pointer hover:gap-3 transition-all">
              View All <ChevronRight size={18} />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-50 rounded-[2.5rem] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredPros.length > 0 ? (
                  filteredPros.map((pro, index) => (
                    <motion.div
                      key={pro.uid}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link 
                        to={`/pro/${pro.uid}`}
                        className="group block bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-3xl hover:shadow-brand-100/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="relative">
                            <img 
                              src={pro.photoURL || `https://ui-avatars.com/api/?name=${pro.displayName}`} 
                              alt={pro.displayName} 
                              className="w-20 h-20 rounded-[1.5rem] object-cover shadow-xl border-4 border-white"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-full border-4 border-white flex items-center justify-center">
                              <ShieldCheck size={12} className="text-white" />
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-accent-500 font-black">
                              <Star size={16} fill="currentColor" />
                              {pro.rating || '5.0'}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                              {pro.reviewCount || 0} Reviews
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-tight mb-1">
                            {pro.displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <MapPin size={14} className="text-brand-400" />
                            {pro.location || 'Local Area'}
                          </div>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8 h-10 font-medium">
                          {pro.bio || "Expert professional ready to help with your home service needs."}
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-4 py-3 bg-slate-50 text-slate-900 font-black rounded-xl text-xs uppercase tracking-widest text-center group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                            {pro.category}
                          </div>
                          <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-200 group-hover:scale-110 transition-transform">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
                  >
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Search size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No experts found</h3>
                    <p className="text-slate-400 font-medium">Try searching for something else or browse all categories.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-4">How LocalPro Works</h3>
            <p className="text-slate-500 font-medium">Simple steps to get your job done.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Search Service', desc: 'Browse through verified professionals in your area.', icon: <Search size={32} /> },
              { step: '02', title: 'Chat & Consult', desc: 'Discuss your requirements and get instant quotes.', icon: <MessageCircle size={32} /> },
              { step: '03', title: 'Get it Done', desc: 'Meet the pro, get the work done, and pay securely.', icon: <Zap size={32} /> },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-[120px] font-black text-slate-50 absolute -top-20 -left-4 pointer-events-none group-hover:text-brand-50 transition-colors duration-500">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-3">{item.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSetup = ({ user, profile, onUpdate }: { user: User, profile: UserProfile | null, onUpdate: () => void }) => {
  const [role, setRole] = useState<UserRole>(profile?.role || 'client');
  const [category, setCategory] = useState(profile?.category || '');
  const [displayName, setDisplayName] = useState(profile?.displayName || user.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || user.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `profiles/${user.uid}`);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (role === 'pro' && (!category || !phoneNumber)) {
      alert('Professionals must provide their occupation and phone number.');
      return;
    }

    setSaving(true);
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        photoURL,
        role,
        category: role === 'pro' ? category : null,
        phoneNumber: role === 'pro' ? phoneNumber : null,
        bio,
        location,
        createdAt: profile?.createdAt || serverTimestamp(),
        rating: profile?.rating || 5.0,
        reviewCount: profile?.reviewCount || 0
      });
      onUpdate();
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-3xl shadow-slate-200/50 border border-slate-100 p-10 md:p-16"
      >
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-3 font-display">Complete your profile</h2>
          <p className="text-slate-500 font-medium">Tell us a bit more about how you'll use LocalPro.</p>
        </div>

        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
              <img 
                src={photoURL || `https://ui-avatars.com/api/?name=${displayName}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-brand-700 transition-colors active:scale-90">
              <Camera size={20} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">Profile Picture</p>
        </div>
        
        <div className="space-y-10">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
              I am a...
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setRole('client')}
                className={cn(
                  "group p-8 rounded-[2rem] border-4 transition-all duration-300 text-left relative overflow-hidden",
                  role === 'client' ? "border-brand-600 bg-brand-50/50" : "border-slate-50 bg-slate-50/30 hover:border-slate-100"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  role === 'client' ? "bg-brand-600 text-white" : "bg-white text-slate-400 group-hover:text-brand-600"
                )}>
                  <UserIcon size={24} />
                </div>
                <span className={cn("text-xl font-black block mb-1", role === 'client' ? "text-brand-900" : "text-slate-900")}>Customer</span>
                <p className="text-sm text-slate-500 font-medium">I'm looking for local experts to help me.</p>
                {role === 'client' && <div className="absolute top-4 right-4 text-brand-600"><Plus size={24} className="rotate-45" /></div>}
              </button>
              
              <button 
                onClick={() => setRole('pro')}
                className={cn(
                  "group p-8 rounded-[2rem] border-4 transition-all duration-300 text-left relative overflow-hidden",
                  role === 'pro' ? "border-brand-600 bg-brand-50/50" : "border-slate-50 bg-slate-50/30 hover:border-slate-100"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  role === 'pro' ? "bg-brand-600 text-white" : "bg-white text-slate-400 group-hover:text-brand-600"
                )}>
                  <Briefcase size={24} />
                </div>
                <span className={cn("text-xl font-black block mb-1", role === 'pro' ? "text-brand-900" : "text-slate-900")}>Partner</span>
                <p className="text-sm text-slate-500 font-medium">I'm a professional offering my services.</p>
                {role === 'pro' && <div className="absolute top-4 right-4 text-brand-600"><Plus size={24} className="rotate-45" /></div>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  placeholder="e.g. London, UK"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {role === 'pro' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Occupation</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none font-bold text-slate-900 appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select your trade...</option>
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="tel" 
                    placeholder="+44 7700 900000"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Bio / About</label>
            <textarea 
              rows={4}
              placeholder={role === 'pro' ? "Describe your expertise and why clients should hire you..." : "Tell us a bit about yourself..."}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none font-bold text-slate-900 resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
          >
            {saving ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Complete Setup
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProDetail = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const [pro, setPro] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchPro = async () => {
      const path = `users/${id}`;
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPro(docSnap.data() as UserProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };
    fetchPro();
  }, [id]);

  const handleStartChat = async () => {
    if (!user || !pro) return;
    setStartingChat(true);
    
    // Check if chat already exists
    const chatsPath = 'chats';
    try {
      const chatId = [user.uid, pro.uid].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          id: chatId,
          participants: [user.uid, pro.uid],
          updatedAt: serverTimestamp()
        });
      }
      
      navigate(`/chat/${chatId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, chatsPath);
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white min-h-screen">
      <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold animate-pulse">Loading profile...</p>
    </div>
  );

  if (!pro) return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
        <X size={40} className="text-slate-200" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">Expert not found</h2>
      <button 
        onClick={() => navigate('/')}
        className="px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Banner */}
      <div className="h-64 sm:h-80 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-8 left-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={18} />
            Back to Search
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="flex flex-col sm:flex-row items-start gap-8 mb-10">
                <div className="relative">
                  <img 
                    src={pro.photoURL || `https://ui-avatars.com/api/?name=${pro.displayName}`} 
                    alt={pro.displayName} 
                    className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-600 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                
                <div className="flex-1 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display tracking-tight leading-tight">
                      {pro.displayName}
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-xs font-black uppercase tracking-widest">
                      {pro.category}
                    </div>
                    <div className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} />
                      {pro.location || 'Local Area'}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900">{pro.rating || '5.0'}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900">{pro.reviewCount || 0}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reviews</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-emerald-500">100%</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 font-display">About the Professional</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                    {pro.bio || "Expert professional ready to help with your home service needs. Dedicated to providing high-quality work and excellent customer service."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Background Checked</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Identity Verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Quick Response</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Usually within 2h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section Placeholder */}
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-8 font-display">Recent Reviews</h3>
              <div className="space-y-8">
                {[1, 2].map(i => (
                  <div key={i} className="pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">Verified Customer</h5>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">2 weeks ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-accent-500">
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                      "Excellent service! Arrived on time and did a fantastic job. Very professional and polite. Highly recommended for anyone looking for quality work."
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-8">
            <div className="sticky top-24">
              <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-3xl shadow-slate-900/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[80px] opacity-20"></div>
                
                <h3 className="text-xl font-black mb-8 font-display tracking-tight">Contact Expert</h3>
                
                <div className="space-y-4 mb-8">
                  <button 
                    onClick={handleStartChat}
                    disabled={startingChat}
                    className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg shadow-xl shadow-brand-900/20"
                  >
                    {startingChat ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MessageCircle size={24} />
                        Chat Now
                      </>
                    )}
                  </button>
                  
                  {pro.phoneNumber && (
                    <a 
                      href={`tel:${pro.phoneNumber}`}
                      className="w-full py-5 bg-white/10 text-white border-2 border-white/10 font-black rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      <Phone size={24} />
                      Call Professional
                    </a>
                  )}
                </div>

                <div className="space-y-6 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Available</span>
                    <span className="text-emerald-400 font-black text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      Right Now
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Service Area</span>
                    <span className="font-black text-sm">{pro.location || 'Local'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Member Since</span>
                    <span className="font-black text-sm">
                      {pro.createdAt?.toDate ? pro.createdAt.toDate().toLocaleDateString() : '2024'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100">
                <div className="flex items-center gap-3 mb-4 text-brand-700">
                  <ShieldCheck size={24} />
                  <h4 className="font-black uppercase tracking-widest text-xs">LocalPro Guarantee</h4>
                </div>
                <p className="text-brand-900/60 text-xs font-medium leading-relaxed">
                  We verify every professional on our platform to ensure you get the best service possible. Your satisfaction is our priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatRoomView = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !user) return;

    const messagesPath = `chats/${id}/messages`;
    const q = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, messagesPath);
    });

    // Fetch other user info
    const fetchOtherUser = async () => {
      const chatRef = doc(db, 'chats', id);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const participants = chatSnap.data().participants as string[];
        const otherId = participants.find(p => p !== user.uid);
        if (otherId) {
          const userSnap = await getDoc(doc(db, 'users', otherId));
          if (userSnap.exists()) {
            setOtherUser(userSnap.data() as UserProfile);
          }
        }
      }
    };
    fetchOtherUser();

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !id) return;

    const messagesPath = `chats/${id}/messages`;
    const msg = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', id, 'messages'), {
        text: msg,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'chats', id), {
        updatedAt: serverTimestamp(),
        lastMessage: msg
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, messagesPath);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white min-h-screen">
      <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold animate-pulse">Loading conversation...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/chats')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
          >
            <ArrowLeft size={20} />
          </button>
          {otherUser && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}`} 
                  alt={otherUser.displayName} 
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm leading-tight">{otherUser.displayName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {otherUser.role === 'pro' ? otherUser.category : 'Customer'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {otherUser?.phoneNumber && (
            <a 
              href={`tel:${otherUser.phoneNumber}`}
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
            >
              <Phone size={20} />
            </a>
          )}
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center py-8">
            <div className="inline-block px-4 py-2 bg-slate-200/50 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Conversation Started
            </div>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex items-end gap-3",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
              >
                {!isMe && (
                  <img 
                    src={otherUser?.photoURL || `https://ui-avatars.com/api/?name=${otherUser?.displayName}`} 
                    className="w-8 h-8 rounded-lg object-cover mb-1"
                    alt=""
                  />
                )}
                <div className={cn(
                  "max-w-[75%] space-y-1",
                  isMe ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm font-medium shadow-sm",
                    isMe 
                      ? "bg-brand-600 text-white rounded-br-none" 
                      : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 sm:p-6">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-center gap-4"
        >
          <button 
            type="button"
            className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
          >
            <Plus size={24} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none font-medium text-slate-900"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 disabled:bg-slate-300"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatList = ({ user }: { user: User }) => {
  const [chats, setChats] = useState<(ChatRoom & { otherUser?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      
      const chatsWithUsers = await Promise.all(chatList.map(async (chat) => {
        const otherId = chat.participants.find(p => p !== user.uid);
        if (otherId) {
          const userSnap = await getDoc(doc(db, 'users', otherId));
          if (userSnap.exists()) {
            return { ...chat, otherUser: userSnap.data() as UserProfile };
          }
        }
        return chat;
      }));

      setChats(chatsWithUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white min-h-screen">
      <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold animate-pulse">Loading chats...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-2">Messages</h1>
          <p className="text-slate-500 font-medium">Connect with experts and clients directly.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-2xl text-brand-600 font-black text-xs uppercase tracking-widest">
          <ShieldCheck size={16} />
          Secure Chat
        </div>
      </div>

      <div className="space-y-4">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="w-full flex items-center gap-5 p-5 bg-white rounded-[2.5rem] border border-slate-100 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-100/20 transition-all text-left group relative overflow-hidden"
            >
              <div className="relative">
                <img 
                  src={chat.otherUser?.photoURL || `https://ui-avatars.com/api/?name=${chat.otherUser?.displayName}`} 
                  alt={chat.otherUser?.displayName} 
                  className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                    {chat.otherUser?.displayName || 'Unknown User'}
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ml-4">
                    {chat.updatedAt?.toDate ? chat.updatedAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-medium truncate pr-8">
                    {chat.lastMessage || 'Start a conversation...'}
                  </p>
                  {chat.lastMessage && (
                    <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="p-2 text-slate-200 group-hover:text-brand-600 group-hover:translate-x-1 transition-all">
                <ChevronRight size={20} />
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No messages yet</h3>
            <p className="text-slate-400 font-medium mb-10 max-w-xs mx-auto">Start a conversation with an expert to get your project moving.</p>
            <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 active:scale-95">
              Browse Experts
              <ArrowLeft size={20} className="rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading LocalPro...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <Navbar user={user} profile={profile} />
          
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/pro/:id" element={<ProDetail user={user} />} />
              <Route path="/chats" element={user ? <ChatList user={user} /> : <Navigate to="/" />} />
              <Route path="/chat/:id" element={user ? <ChatRoomView user={user} /> : <Navigate to="/" />} />
              <Route 
                path="/profile" 
                element={
                  user ? (
                    <ProfileSetup 
                      user={user} 
                      profile={profile} 
                      onUpdate={() => fetchProfile(user.uid)} 
                    />
                  ) : (
                    <div className="text-center py-20">
                      <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
                      <button 
                        onClick={() => signInWithGoogle()}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                      >
                        Sign In with Google
                      </button>
                    </div>
                  )
                } 
              />
            </Routes>
          </main>

          {/* Mobile Bottom Nav */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-100 px-6 py-3 flex justify-around items-center z-50">
            <Link to="/" className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
              <Search size={24} />
            </Link>
            {user && (
              <>
                <Link to="/chats" className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                  <MessageCircle size={24} />
                </Link>
                <Link to="/profile" className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                  <UserIcon size={24} />
                </Link>
              </>
            )}
            {!user && (
              <button onClick={() => signInWithGoogle()} className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                <UserIcon size={24} />
              </button>
            )}
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
