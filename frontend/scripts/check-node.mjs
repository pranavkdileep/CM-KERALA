// Runs before dev, build and start. Next.js 16 crashes on every request under Node 27 alpha
// (headers.hasOwnProperty is not a function), so stop early with a clear fix instead.
const major = Number(process.versions.node.split(".")[0]);
const verified = 24;

if (major < 22 || major >= 27) {
  console.error(
    [
      "",
      `This project needs Node 22 to 26. Node ${verified} is the verified version.`,
      `You are running Node ${process.versions.node}.`,
      "",
      "Fix: from the frontend folder run",
      "  nvm use        (reads .nvmrc, which selects Node 24)",
      "  npm run dev",
      "",
      "To make Node 24 the default for every terminal: nvm alias default 24",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
