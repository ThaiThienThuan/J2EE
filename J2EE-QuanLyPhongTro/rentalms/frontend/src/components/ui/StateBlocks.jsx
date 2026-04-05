export function LoadingState({ label = "Dang tai du lieu..." }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[20px] border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-orange" />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({ message = "Khong tai duoc du lieu." }) {
  return (
    <div className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-5 text-sm font-semibold text-red-700 shadow-soft">
      {message}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-6 py-10 text-center shadow-soft">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
        •
      </div>
      <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}
