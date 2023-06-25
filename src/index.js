import os from 'os';
import { App } from "./app.js";

const greeting = (username) => {
    console.log(`Welcome to the File Manager, ${username}!`);
};

const goodbye = (username) => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
};

let username = "Anonymous";
const args = process.argv.slice(2);
const lastArg = args[args.length - 1];

if (lastArg && lastArg.includes("--username=")) {
    username = lastArg.replace("--username=", "").trim() || "Modest user";
}

greeting(username);
process.on("exit", () => goodbye(username));
const app = new App(os.homedir());
await app.start();