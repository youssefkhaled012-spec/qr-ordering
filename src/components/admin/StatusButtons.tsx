'use client';

export default function StatusButtons({ orderId, current }: { orderId: string; current: string }) {
  async function setStatus(status: 'preparing' | 'ready' | 'done') {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert('Failed to update');
    } else {
      // refresh the page data
      location.reload();
    }
  }

  return (
    <div className="flex gap-2">
      <button className="rounded border px-2 py-1 text-sm" onClick={() => setStatus('preparing')}
        disabled={current === 'preparing'}>Preparing</button>
      <button className="rounded border px-2 py-1 text-sm" onClick={() => setStatus('ready')}
        disabled={current === 'ready'}>Ready</button>
      <button className="rounded border px-2 py-1 text-sm" onClick={() => setStatus('done')}
        disabled={current === 'done'}>Done</button>
    </div>
  );
}
