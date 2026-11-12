export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-72 animate-pulse rounded bg-line" />
      <div className="mt-8 h-40 max-w-2xl animate-pulse rounded-lg bg-line-soft" />
    </div>
  );
}
