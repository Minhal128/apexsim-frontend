import { redirect } from 'next/navigation';

export default function DashboardTradeRedirectPage() {
  redirect('/dashboard/market');
}
