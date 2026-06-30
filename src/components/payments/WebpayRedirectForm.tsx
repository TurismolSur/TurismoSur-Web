'use client';

import { useEffect, useRef } from 'react';

interface WebpayRedirectFormProps {
  actionUrl: string;
  token: string;
}

export function WebpayRedirectForm({ actionUrl, token }: WebpayRedirectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} action={actionUrl} method="post" className="space-y-4 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 text-slate-100 shadow-2xl shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">WebPay Plus</p>
      <h1 className="text-2xl font-bold">Redirigiendo a la pasarela de integración</h1>
      <p className="text-sm text-slate-300">Si la redirección no ocurre automáticamente, presiona el botón para continuar.</p>
      <input type="hidden" name="token_ws" value={token} />
      <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
        Ir a pagar con WebPay
      </button>
    </form>
  );
}
