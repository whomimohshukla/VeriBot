import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import { PageLoader } from '../../components/ui';
import { KeyRound, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me(),
  });

  const [form, setForm] = useState({ name: '', avatar: '' });
  const [formInitialized, setFormInitialized] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (me && !formInitialized) {
      setForm({ name: me.name ?? '', avatar: me.avatar ?? '' });
      setFormInitialized(true);
    }
  }, [me, formInitialized]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; avatar: string }) => usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully! 🎉');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersApi.changePassword(data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(form);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (isLoading && !me) {
    return <PageLoader label="Loading profile..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full  from-red-600 to-red-700 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Your name"
              disabled={updateProfileMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="text"
              value={me?.email ?? ''}
              readOnly
              disabled
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 opacity-60"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avatar URL</label>
            <input
              type="text"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://example.com/avatar.png"
              disabled={updateProfileMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">Optional</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-600/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="text-sm text-muted-foreground">Use at least 8 characters</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              disabled={changePasswordMutation.isPending}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="At least 8 characters"
              minLength={8}
              disabled={changePasswordMutation.isPending}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmNewPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Re-enter new password"
              disabled={changePasswordMutation.isPending}
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}