import Navbar from '@/components/dashboard/NavbarLogic';

export const metadata = {
  title: 'APEXSIM | Professional Trading Platform',
  description: 'Experience professional trading with APEXSIM.',
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#181818]">
      <Navbar />
      <main className="pt-17.5">
        {children}
      </main>
    </div>
  );
}