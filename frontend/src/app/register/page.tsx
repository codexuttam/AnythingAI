'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Loader2, Sparkles } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Decorative background blur */}
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90]
                }}
                transition={{ duration: 18, repeat: Infinity }}
                className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -90, 0]
                }}
                transition={{ duration: 22, repeat: Infinity }}
                className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                whileHover={{ rotateY: -5, rotateX: 5 }}
                className="max-w-md w-full glass-card p-12 rounded-[3rem] z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-secondary/10 mb-6 border border-secondary/20 shadow-xl shadow-secondary/5"
                    >
                        <Sparkles className="text-secondary w-10 h-10" />
                    </motion.div>
                    <h2 className="text-5xl font-black tracking-tighter text-white mb-3">
                        INITIALIZE
                    </h2>
                    <p className="text-slate-400 font-medium italic">Create your new digital identity</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                            <input
                                type="text"
                                required
                                className="w-full pl-14 pr-6 py-5 rounded-2xl glass-input text-white placeholder:text-slate-600 font-medium"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full pl-14 pr-6 py-5 rounded-2xl glass-input text-white placeholder:text-slate-600 font-medium"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full pl-14 pr-6 py-5 rounded-2xl glass-input text-white placeholder:text-slate-600 font-medium"
                                placeholder="Secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-secondary to-cyan-600 text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-secondary/20"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            'START SEQUENCE'
                        )}
                    </motion.button>
                </form>

                <div className="mt-10 text-center py-6 bg-white/5 border border-white/5 rounded-3xl transition-all hover:bg-white/10">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        Already Exist? {' '}
                        <Link href="/login" className="text-secondary hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
