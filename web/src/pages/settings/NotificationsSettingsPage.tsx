import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Save, MessagesSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const CHANNEL_OPTIONS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'slack', label: 'Slack', icon: MessagesSquare },
  { key: 'inapp', label: 'In-app', icon: Bell },
];

const EVENT_OPTIONS = [
  'test_run.completed',
  'test_run.failed',
  'bug.created',
  'bug.status_changed',
  'agent.completed',
  'weekly_report',
];

export default function NotificationsSettingsPage() {
  const [channels, setChannels] = useState<string[]>(['email']);
  const [events, setEvents] = useState<string[]>(['test_run.completed', 'test_run.failed']);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-1">Channels</h3>
          <p className="text-sm text-muted-foreground mb-4">Where should notifications be delivered?</p>

          <div className="space-y-3">
            {CHANNEL_OPTIONS.map((channel) => {
              const Icon = channel.icon;
              const checked = channels.includes(channel.key);
              return (
                <label
                  key={channel.key}
                  className="flex items-center gap-3 px-4 py-3 bg-secondary/30 border border-border rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setChannels((c) => toggle(c, channel.key))}
                    className="accent-primary"
                  />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{channel.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-1">Events</h3>
          <p className="text-sm text-muted-foreground mb-4">Which events should trigger notifications?</p>

          <div className="space-y-3">
            {EVENT_OPTIONS.map((event) => {
              const checked = events.includes(event);
              return (
                <label
                  key={event}
                  className="flex items-center gap-3 px-4 py-3 bg-secondary/30 border border-border rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setEvents((e) => toggle(e, event))}
                    className="accent-primary"
                  />
                  <span className="text-sm font-mono">{event}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => toast.success('Preferences saved (demo)')}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-600/90 text-white rounded-lg text-sm font-medium"
      >
        <Save className="w-4 h-4" />
        Save preferences
      </button>
    </motion.div>
  );
}