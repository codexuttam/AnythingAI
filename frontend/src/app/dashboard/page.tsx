'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    Plus,
    Trash2,
    CheckCircle,
    Circle,
    LayoutDashboard,
    Settings as SettingsIcon,
    User as UserIcon,
    Search,
    Clock,
    CheckSquare,
    Sparkles,
    ShieldCheck,
    Quote,
    Sun,
    Moon,
    Camera,
    StickyNote,
    Zap,
    ChevronRight,
    Edit3,
    Activity
} from 'lucide-react';
import { ANONYMOUS_QUOTES } from '@/lib/quotes';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    user: any;
    createdAt: string;
}

interface TaskActivity {
    id: string;
    type: 'created' | 'completed' | 'deleted' | 'system';
    text: string;
    time: string;
}

interface PomodoroState {
    minutes: number;
    seconds: number;
    isActive: boolean;
    mode: 'work' | 'break';
}

const TiltCard = ({ children, className, compact = false }: { children: React.ReactNode, className?: string, compact?: boolean }) => {
    return (
        <motion.div
            whileHover={{
                rotateX: 1,
                rotateY: -1,
                translateZ: 10,
                scale: 1.01
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`glass-card ${compact ? 'compact-card' : ''} ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'tasks' | 'activities' | 'settings'>('tasks');
    const [randomQuote, setRandomQuote] = useState('');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Profile Extra States
    const [bio, setBio] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Productivity Features
    const [quickNotes, setQuickNotes] = useState('');

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [isProMode, setIsProMode] = useState(false);
    const [pomodoro, setPomodoro] = useState<PomodoroState>({ minutes: 25, seconds: 0, isActive: false, mode: 'work' });
    const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [completionRate, setCompletionRate] = useState(0);

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedActivities = localStorage.getItem('activities');
        const storedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        const storedBio = localStorage.getItem('userBio');
        const storedImg = localStorage.getItem('userImg');
        const storedNotes = localStorage.getItem('quickNotes');

        if (!token) {
            router.push('/login');
            return;
        }
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedActivities) setActivities(JSON.parse(storedActivities));
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        }
        if (storedBio) setBio(storedBio);
        if (storedImg) setProfileImage(storedImg);
        if (storedNotes) setQuickNotes(storedNotes);

        const storedPro = localStorage.getItem('isProMode') === 'true';
        setIsProMode(storedPro);

        const quote = ANONYMOUS_QUOTES[Math.floor(Math.random() * ANONYMOUS_QUOTES.length)];
        setRandomQuote(quote);

        fetchTasks();
    }, [router]);

    useEffect(() => {
        if (tasks.length > 0) {
            const completed = tasks.filter(t => t.status === 'completed').length;
            setCompletionRate(Math.round((completed / tasks.length) * 100));
        } else {
            setCompletionRate(0);
        }
    }, [tasks]);

    useEffect(() => {
        let timer: any;
        if (pomodoro.isActive) {
            timer = setInterval(() => {
                if (pomodoro.seconds > 0) {
                    setPomodoro(prev => ({ ...prev, seconds: prev.seconds - 1 }));
                } else if (pomodoro.minutes > 0) {
                    setPomodoro(prev => ({ ...prev, minutes: prev.minutes - 1, seconds: 59 }));
                } else {
                    clearInterval(timer);
                    const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
                    setPomodoro({
                        minutes: nextMode === 'work' ? 25 : 5,
                        seconds: 0,
                        isActive: false,
                        mode: nextMode
                    });
                    toast.success(nextMode === 'work' ? 'Break over! Focus time.' : 'Mission segment complete. Take a break.');
                    addActivity('system', `Pomodoro session: ${pomodoro.mode} finished.`);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [pomodoro.isActive, pomodoro.minutes, pomodoro.seconds, pomodoro.mode]);

    useEffect(() => {
        localStorage.setItem('activities', JSON.stringify(activities));
    }, [activities]);

    useEffect(() => {
        localStorage.setItem('quickNotes', quickNotes);
    }, [quickNotes]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const toggleProMode = () => {
        const next = !isProMode;
        setIsProMode(next);
        localStorage.setItem('isProMode', String(next));
        toast.success(next ? 'Neural Overclock Enabled' : 'Standard Protocol Restored');
    };

    const togglePomodoro = () => {
        setPomodoro(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const resetPomodoro = () => {
        setPomodoro({
            minutes: pomodoro.mode === 'work' ? 25 : 5,
            seconds: 0,
            isActive: false,
            mode: pomodoro.mode
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfileImage(base64String);
                localStorage.setItem('userImg', base64String);
                toast.success('Matrix avatar updated');
            };
            reader.readAsDataURL(file);
        }
    };

    const saveBio = () => {
        localStorage.setItem('userBio', bio);
        setIsEditingBio(false);
        toast.success('Profile identity updated');
    };

    const addActivity = (type: TaskActivity['type'], text: string) => {
        const newActivity: TaskActivity = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 15));
    };

    const brainstormTask = (title: string) => {
        const suggestions = [
            "Break down into 3-phase execution",
            "Identify potential security vulnerabilities",
            "Optimize for high-concurrency scenarios",
            "Implement automated regression testing",
            "Review architectural compliance"
        ];
        const random = suggestions[Math.floor(Math.random() * suggestions.length)];
        toast(`Quantum Insight: ${random}`, {
            icon: '🧠',
            duration: 4000
        });
        addActivity('system', `AI Analysis for "${title}": ${random}`);
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                localStorage.clear();
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/tasks', {
                title: newTitle,
                description: newDesc,
                priority: taskPriority
            });
            setTasks([response.data.data, ...tasks]);
            addActivity('created', `Created task: ${newTitle} [${taskPriority.toUpperCase()}]`);
            setNewTitle('');
            setNewDesc('');
            setTaskPriority('medium');
            toast.success('Objective deployed');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Deployment failed');
        }
    };

    const handleToggleStatus = async (task: Task) => {
        try {
            const newStatus = task.status === 'pending' ? 'completed' : 'pending';
            const response = await api.put(`/tasks/${task._id}`, { status: newStatus });
            setTasks(tasks.map((t) => (t._id === task._id ? response.data.data : t)));
            addActivity('completed', `${newStatus === 'completed' ? 'Finalized' : 'Reopened'} objective: ${task.title}`);
            toast.success(newStatus === 'completed' ? 'Objective Secured' : 'Objective Reopened');
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleDeleteTask = async (id: string, title: string) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter((t) => t._id !== id));
            addActivity('deleted', `Purged task: ${title}`);
            toast.success('Unit purged');
        } catch (error) {
            toast.error('Purge failed');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
            />
        </div>
    );

    return (
        <div className="min-h-screen flex transition-colors duration-500 overflow-hidden bg-background">
            {/* Compact Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 glass-card m-4 rounded-[2rem] p-6 border-card-border h-[calc(100vh-2rem)] sticky top-4 z-20 overflow-hidden">
                {isProMode && (
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
                    />
                )}
                <div className="flex items-center gap-3 mb-8 px-2 relative z-10">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg"
                    >
                        <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-xl font-black tracking-tight text-foreground uppercase italic leading-none">Anything AI</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'tasks', icon: CheckSquare, label: 'Workspace' },
                        { id: 'activities', icon: Clock, label: 'Timeline' },
                        { id: 'settings', icon: SettingsIcon, label: 'Profile' }
                    ].map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === item.id
                                ? 'bg-primary/10 text-primary border border-primary/20 neon-border'
                                : 'text-muted hover:bg-hover-bg'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
                            {item.label}
                        </motion.button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-card-border/50">
                        <button
                            onClick={toggleProMode}
                            className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold text-xs transition-all ${isProMode
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'text-muted hover:bg-hover-bg'}`}
                        >
                            <Zap className={`w-4 h-4 ${isProMode ? 'fill-amber-500' : ''}`} />
                            {isProMode ? 'NEURAL LINK: ON' : 'ENABLE PRO MODE'}
                        </button>
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-card-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative group">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-black text-white text-xs">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => setActiveTab('settings')}>
                                <Edit3 className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full p-3 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white transition-all rounded-xl text-xs font-bold"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Disconnect
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:pl-2 overflow-y-auto scrollbar-hide relative bg-background">
                <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-2 tracking-tight flex items-center gap-3">
                            {activeTab === 'tasks' ? 'Operational Hub' : activeTab === 'activities' ? 'Audit Logs' : 'Entity Profile'}
                            {activeTab === 'tasks' && <ChevronRight className="w-6 h-6 text-primary animate-pulse" />}
                        </h1>
                        <p className="text-muted text-sm font-medium">
                            {activeTab === 'tasks' ? 'Execute mission protocols.' :
                                activeTab === 'activities' ? 'Historical session data.' :
                                    'Manage your digital presence.'}
                        </p>
                    </div>

                    <div className="flex md:flex-col lg:flex-row items-center gap-6">
                        {/* Mission Progress */}
                        <div className="hidden sm:flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                            <div className="relative w-12 h-12">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        className="text-white/5 stroke-current"
                                        strokeWidth="3"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: completionRate / 100 }}
                                        className="text-primary stroke-current"
                                        strokeWidth="3"
                                        strokeDasharray="100, 100"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-foreground">{completionRate}%</span>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Efficiency</p>
                                <p className="text-xs font-bold text-foreground">Mission Status</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheme}
                                className="p-3 bg-white/5 rounded-2xl border border-white/5 text-foreground hover:bg-primary/10 hover:border-primary/20 transition-all"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </motion.button>

                            {activeTab === 'tasks' && (
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Query knowledge..."
                                        className="pl-11 pr-4 py-3 rounded-2xl glass-input text-foreground text-sm font-medium w-48 lg:w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'tasks' && (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            {/* Quote Banner */}
                            <TiltCard className="p-5 border-l-4 border-l-primary flex items-center gap-6 relative overflow-hidden group" compact>
                                <Quote className="absolute -right-4 -bottom-4 w-20 h-20 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <p className="text-base font-bold text-foreground leading-snug">
                                        "{randomQuote}"
                                    </p>
                                    <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest">Mr. Anonymous // Transmission received</p>
                                </div>
                            </TiltCard>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                {/* Left Column: Action & Notes */}
                                <div className="xl:col-span-4 space-y-6">
                                    <TiltCard className="p-6 rounded-[2rem] border-card-border" compact>
                                        <h2 className="text-lg font-black text-foreground mb-6 flex items-center gap-3">
                                            <Edit3 className="w-4 h-4 text-primary" />
                                            Define Task
                                        </h2>
                                        <form onSubmit={handleCreateTask} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                className="w-full px-4 py-3 rounded-xl glass-input text-foreground font-medium text-sm"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                required
                                            />
                                            <textarea
                                                placeholder="Description"
                                                className="w-full px-4 py-3 rounded-xl glass-input text-foreground h-24 resize-none font-medium text-sm"
                                                value={newDesc}
                                                onChange={(e) => setNewDesc(e.target.value)}
                                                required
                                            ></textarea>

                                            <div className="flex gap-2">
                                                {(['low', 'medium', 'high'] as const).map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setTaskPriority(p)}
                                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${taskPriority === p
                                                            ? (p === 'high' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : p === 'medium' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-emerald-500/20 border-emerald-500 text-emerald-500')
                                                            : 'bg-white/5 border-transparent text-slate-500'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>

                                            <button type="submit" className="w-full py-3.5 rounded-xl btn-primary text-white font-black text-sm">
                                                Deploy Objective
                                            </button>
                                        </form>
                                    </TiltCard>

                                    {isProMode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <TiltCard className="p-6 rounded-[2rem] border-card-border overflow-hidden relative" compact>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                                <h2 className="text-lg font-black text-foreground mb-6 flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    Neural Focus
                                                </h2>
                                                <div className="text-center mb-6">
                                                    <span className="text-5xl font-black text-foreground tracking-tighter tabular-nums">
                                                        {pomodoro.minutes}:{pomodoro.seconds < 10 ? `0${pomodoro.seconds}` : pomodoro.seconds}
                                                    </span>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">
                                                        {pomodoro.mode === 'work' ? 'Protocol: Deep Work' : 'Protocol: Recovery'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={togglePomodoro}
                                                        className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${pomodoro.isActive ? 'bg-rose-500/10 text-rose-500' : 'bg-primary text-white'}`}
                                                    >
                                                        {pomodoro.isActive ? 'PAUSE MISSION' : 'START MISSION'}
                                                    </button>
                                                    <button
                                                        onClick={resetPomodoro}
                                                        className="p-3 bg-white/5 rounded-xl text-foreground hover:bg-white/10"
                                                    >
                                                        <Activity className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TiltCard>
                                        </motion.div>
                                    )}

                                    <TiltCard className="p-6 rounded-[2rem] border-card-border bg-gradient-to-br from-card-bg to-transparent" compact>
                                        <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-3">
                                            <StickyNote className="w-4 h-4 text-secondary" />
                                            Quick Notes
                                        </h2>
                                        <textarea
                                            value={quickNotes}
                                            onChange={(e) => setQuickNotes(e.target.value)}
                                            placeholder="Scratchpad for random data..."
                                            className="w-full bg-transparent border-none focus:ring-0 text-foreground text-sm h-32 scrollbar-hide font-medium"
                                        />
                                        <div className="flex justify-end">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Auto-saving...</span>
                                        </div>
                                    </TiltCard>
                                </div>

                                {/* Right Column: Unit Timeline */}
                                <div className="xl:col-span-8 space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                                            Operational Grid
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                {filteredTasks.length} UNITS
                                            </span>
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                                {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPriorityFilter(p)}
                                                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${priorityFilter === p ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-foreground'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={fetchTasks}
                                                className="p-2 hover:bg-white/5 rounded-xl text-muted hover:text-primary transition-all"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {isProMode && tasks.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                        >
                                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Health Score</p>
                                                <p className="text-2xl font-black text-foreground">98.4<small className="text-xs opacity-50">%</small></p>
                                            </div>
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Neural Load</p>
                                                <p className="text-2xl font-black text-foreground">Low</p>
                                            </div>
                                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Latency</p>
                                                <p className="text-2xl font-black text-foreground">14<small className="text-xs opacity-50">ms</small></p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {filteredTasks.length === 0 ? (
                                        <div className="glass-card rounded-[2rem] p-16 text-center border-dashed border-card-border">
                                            <Zap className="w-8 h-8 text-slate-700 mx-auto mb-4 animate-pulse" />
                                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Zero latency detected</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredTasks.map((task, index) => (
                                                <motion.div
                                                    key={task._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <TiltCard className="rounded-[1.5rem] p-5 group hover:border-primary/30 flex flex-col h-full bg-hover-bg/30" compact>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleToggleStatus(task)}
                                                                    className={`transition-all ${task.status === 'completed' ? 'text-emerald-400' : 'text-slate-600 hover:text-primary'}`}
                                                                >
                                                                    {task.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                                </button>
                                                                {task.priority && (
                                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' :
                                                                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                                                            'bg-emerald-500/10 text-emerald-500'
                                                                        }`}>
                                                                        {task.priority}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteTask(task._id, task.title)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-rose-500/10 text-rose-500 rounded-lg"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className={`text-sm font-black mb-1 line-clamp-1 ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-foreground'}`}>
                                                                {task.title}
                                                            </h3>
                                                            <p className={`text-xs text-slate-500 line-clamp-2 leading-relaxed ${task.status === 'completed' ? 'opacity-40' : ''}`}>
                                                                {task.description}
                                                            </p>
                                                        </div>
                                                        <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] text-slate-600 font-black tracking-widest uppercase italic">{task.user?.name || 'Agent'}</span>
                                                                {isProMode && (
                                                                    <button
                                                                        onClick={() => brainstormTask(task.title)}
                                                                        className="p-1 hover:bg-primary/10 text-primary rounded-lg transition-all"
                                                                        title="Quantum Brainstorm"
                                                                    >
                                                                        <Sparkles className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                                                        </div>
                                                    </TiltCard>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'activities' && (
                        <motion.div
                            key="activities"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl"
                        >
                            <TiltCard className="rounded-[2rem] p-6 space-y-4">
                                {activities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No records found</p>
                                    </div>
                                ) : (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-4 p-4 bg-hover-bg rounded-2xl border border-card-border">
                                            <div className={`p-2 rounded-lg ${activity.type === 'created' ? 'bg-primary/10 text-primary' :
                                                activity.type === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {activity.type === 'created' ? <Plus className="w-4 h-4" /> :
                                                    activity.type === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                                                        <Trash2 className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-foreground text-sm font-bold">{activity.text}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </TiltCard>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto xl:mx-0"
                        >
                            <TiltCard className="rounded-[2.5rem] p-8 space-y-8">
                                {/* Profile Editor */}
                                <div className="flex flex-col items-center gap-6 pb-8 border-b border-card-border">
                                    <div className="relative group">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-[2.5rem] object-cover border-2 border-primary/20 shadow-2xl" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                                                {user?.name?.charAt(0)}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -right-2 -bottom-2 p-3 bg-primary rounded-xl text-white shadow-xl hover:scale-110 transition-transform"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-foreground mb-1">{user?.name}</h3>
                                        <p className="text-slate-500 font-medium text-sm mb-4">{user?.email}</p>

                                        <div className="space-y-3">
                                            {isEditingBio ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                        className="w-full glass-input rounded-xl p-3 text-sm text-foreground h-24 resize-none"
                                                        placeholder="Describe your digital identity..."
                                                    />
                                                    <button onClick={saveBio} className="px-4 py-2 bg-primary text-white text-xs font-black rounded-lg">SAVE IDENTITY</button>
                                                </div>
                                            ) : (
                                                <div className="group cursor-pointer" onClick={() => setIsEditingBio(true)}>
                                                    <p className="text-slate-400 text-sm italic max-w-xs mx-auto">
                                                        {bio || "Enter a description for your profile..."}
                                                    </p>
                                                    <Edit3 className="w-3 h-3 text-primary mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-primary" />
                                        Interface Customization
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                                            className={`p-5 rounded-2xl cursor-pointer border transition-all ${theme === 'dark' ? 'bg-primary/10 border-primary shadow-lg' : 'bg-hover-bg border-card-border'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Moon className="w-4 h-4 text-primary" />
                                                {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                            </div>
                                            <p className="font-black text-sm text-foreground">ULTRA DARK</p>
                                        </div>
                                        <div
                                            onClick={() => { if (theme !== 'light') toggleTheme(); }}
                                            className={`p-5 rounded-2xl cursor-pointer border transition-all ${theme === 'light' ? 'bg-primary/10 border-primary shadow-lg' : 'bg-hover-bg border-card-border'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Sun className="w-4 h-4 text-amber-500" />
                                                {theme === 'light' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                            </div>
                                            <p className="font-black text-sm text-foreground">NEON LIGHT</p>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
