'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LogOut, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    user: any;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (!token) {
            router.push('/login');
            return;
        }
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchTasks();
    }, [router]);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data.data);
        } catch (error: any) {
            toast.error('Failed to fetch tasks');
            if (error.response?.status === 401) router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/tasks', { title: newTitle, description: newDesc });
            setTasks([...tasks, response.data.data]);
            setNewTitle('');
            setNewDesc('');
            toast.success('Task created');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create task');
        }
    };

    const handleToggleStatus = async (task: Task) => {
        try {
            const newStatus = task.status === 'pending' ? 'completed' : 'pending';
            const response = await api.put(`/tasks/${task._id}`, { status: newStatus });
            setTasks(tasks.map((t) => (t._id === task._id ? response.data.data : t)));
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter((t) => t._id !== id));
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-400">Task Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {user?.name} ({user?.role})</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {/* Create Task Form */}
                <form onSubmit={handleCreateTask} className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-indigo-400" /> Create New Task
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Task Title"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Task Description"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold transition"
                        >
                            Add Task
                        </button>
                    </div>
                </form>

                {/* Task List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
                    {tasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No tasks found. Start by adding one!</p>
                    ) : (
                        tasks.map((task) => (
                            <div key={task._id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-start justify-between hover:border-indigo-500/50 transition shadow-md">
                                <div className="flex gap-4 items-start">
                                    <button
                                        onClick={() => handleToggleStatus(task)}
                                        className={`mt-1 transition ${task.status === 'completed' ? 'text-green-500' : 'text-gray-500 hover:text-indigo-400'}`}
                                    >
                                        {task.status === 'completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                                    </button>
                                    <div>
                                        <h3 className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-gray-400 mt-1">{task.description}</p>
                                        {user?.role === 'admin' && (
                                            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded mt-2 inline-block">
                                                User: {task.user?.name || 'Unknown'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="text-gray-500 hover:text-red-500 transition p-2"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
