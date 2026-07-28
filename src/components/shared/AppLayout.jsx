import BottomNav from './BottomNav';
import DesktopSidebar from './DesktopSidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f17]">
      <DesktopSidebar />
      <div className="lg:ml-[225px] pt-12 pb-16 lg:pb-0 min-h-screen">
        <div className="max-w-[900px] mx-auto px-4 py-4">
          <main className="w-full">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
