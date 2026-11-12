export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded bg-line" />
      <div className="mt-8 h-72 animate-pulse rounded-lg bg-line-soft" />
    </div>
  );
}
