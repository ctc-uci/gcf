#!/usr/bin/env node
import { execSync } from "child_process";

const args = process.argv.slice(2);

if (args.includes("--server")) {
  console.log("Running server tests...");
  execSync("cd server && yarn run test", { stdio: "inherit" });
} else if (args.includes("--client")) {
  console.log("Running client tests...");
  execSync("cd client && yarn run test", { stdio: "inherit" });
} else {
  console.log("Usage: yarn test --server or yarn test --client");
  process.exit(1);
}
