import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const username = String(form.get('username') || '');
    const password = String(form.get('password') || '');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = '/recipes';
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-neutral-800">Author Login</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Username</label>
          <input name="username" type="text" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Password</label>
          <input name="password" type="password" required className="w-full border rounded px-3 py-2" />
        </div>
        <button disabled={loading} className="w-full bg-neutral-900 text-white rounded py-2 disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="pt-2 text-center">
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-800">
            ← Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}


