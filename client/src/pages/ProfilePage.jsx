import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { User as UserIcon, Mail, Wallet, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    budget: user?.budget || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account information and preferences.</p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white dark:border-slate-800 shadow-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <UserIcon className="absolute left-4 top-[38px] text-slate-400" size={18} />
              <Input
                label="Full Name"
                className="pl-11"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="relative opacity-60">
              <Mail className="absolute left-4 top-[38px] text-slate-400" size={18} />
              <Input
                label="Email Address"
                className="pl-11"
                value={user?.email}
                disabled
              />
              <p className="mt-1.5 text-[11px] text-slate-400 ml-1">Email cannot be changed</p>
            </div>

            <div className="relative">
              <Wallet className="absolute left-4 top-[38px] text-slate-400" size={18} />
              <Input
                type="number"
                label="Monthly Budget ($)"
                className="pl-11"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
              <p className="mt-1.5 text-[11px] text-slate-400 ml-1">Setting a budget helps you track your progress</p>
            </div>

            <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <Calendar className="text-primary-600" size={18} />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Member since <span className="font-semibold text-slate-900 dark:text-slate-200">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full py-3" isLoading={loading}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
