export default function PlaceholderPage({ title }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-orange">Coming soon</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          Tenant flows da duoc uu tien trong pha nay. Khu vuc nay se duoc bo sung o milestone tiep theo.
        </p>
      </div>
    </div>
  );
}
