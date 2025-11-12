import path from "path";
import { fileURLToPath } from "url";

import concurrently from "concurrently";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define absolute paths for client and server
const clientPath = path.resolve(__dirname, "client");
const serverPath = path.resolve(__dirname, "server");

const { result } = concurrently(
  [
    { command: `yarn run dev`, name: "client", cwd: clientPath },
    { command: `yarn run start`, name: "server", cwd: serverPath },
  ],
  {
    prefix: "name",
    prefixColors: ["cyan", "magenta"],
    killOthers: ["failure"],
  }
);

function success() {
  console.info("All processes completed successfully.");
}

function failure(err: unknown) {
  console.error("An error occurred (all processes killed):", err);
}

result.then(success, failure);
