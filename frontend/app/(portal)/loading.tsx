export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-64 animate-pulse rounded bg-line" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-line-soft" />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-lg bg-line-soft" />
    </div>
  );
}
