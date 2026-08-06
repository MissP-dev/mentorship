import BottomNav from './BottomNav';
import DesktopSidebar from './DesktopSidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DesktopSidebar />
      <div className="lg:ml-64">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
