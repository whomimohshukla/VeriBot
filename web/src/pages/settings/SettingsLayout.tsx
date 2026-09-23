import { NavLink, Outlet } from 'react-router-dom';
import Layout from '../../components/Layout';

const settingsNav = [
  { to: '/settings/profile', label: 'Profile', end: true },
  { to: '/settings/organization', label: 'Organization' },
  { to: '/settings/members', label: 'Members' },
  { to: '/settings/integrations', label: 'Integrations' },
  { to: '/settings/webhooks', label: 'Webhooks' },
  { to: '/settings/api-keys', label: 'API Keys' },
  { to: '/settings/billing', label: 'Billing' },
  { to: '/settings/notifications', label: 'Notifications' },
];

export default function SettingsLayout() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, organization, and workspace preferences
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8">
        {settingsNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium border border-transparent transition-colors ${
                isActive
                  ? 'bg-secondary text-foreground border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </Layout>
  );
}