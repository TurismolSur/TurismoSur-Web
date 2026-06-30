import { notFound } from 'next/navigation';
import { WebpayRedirectForm } from '@/components/payments/WebpayRedirectForm';

interface WebpayRedirectPageProps {
  searchParams: Promise<{
    token?: string;
    url?: string;
  }>;
}

export default async function WebpayRedirectPage({ searchParams }: WebpayRedirectPageProps) {
  const params = await searchParams;

  if (!params.token || !params.url) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <WebpayRedirectForm actionUrl={params.url} token={params.token} />
    </main>
  );
}
