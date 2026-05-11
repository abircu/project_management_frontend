import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const linkClass = ({ isActive }) =>
  cn(
    'px-3 py-2 rounded-md text-sm font-medium transition',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-foreground hover:bg-accent'
  );

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <LayoutGrid className="size-5" />
          <h1 className="text-lg font-bold mr-4">PM System</h1>
          <NavLink to="/projects" className={linkClass}>Projects</NavLink>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
