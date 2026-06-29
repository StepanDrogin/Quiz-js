import { spawn } from "node:child_process";

const processes = [
  spawn("npm", ["run", "dev:api"], {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, PORT: process.env.PORT || "3000" }
  }),
  spawn("npm", ["run", "dev:client", "--", "--port", "5173"], {
    shell: true,
    stdio: "inherit"
  })
];

function stopAll(exitCode = 0) {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(exitCode);
}

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll(code);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
