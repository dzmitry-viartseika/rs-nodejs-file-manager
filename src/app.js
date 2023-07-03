import path from 'path';
import { createInterface } from 'readline/promises';
import { brotli, files, hash, nwd, sysInfo } from './commands/index.js';
import { getDirFromPath, isPathToFile, parseInput } from './helpers.js';
import { MESSAGES } from './messages.js';

export class App {
    constructor(startDir) {
        this._currentPath = startDir;
    }

    _resolvePath(p) {
        return path.resolve(this._currentPath, p);
    }

    async up() {
        const pathToUpperDir = this._resolvePath('..');
        this._currentPath = await nwd.cd(pathToUpperDir);
    }
    async cd(args) {
        const pathToDir = this._resolvePath(args[0]);
        this._currentPath = await nwd.cd(pathToDir);
    }
    async ls() {
        await nwd.ls(this._currentPath);
    }
    async cat([file]) {
        const pathToFile = this._resolvePath(file);
        await files.cat(pathToFile);
    }
    async add([file]) {
        const newFileName = this._resolvePath(file);
        await files.add(newFileName);
    }
    async rn([oldFile, newFile]) {
        const pathToFile = this._resolvePath(oldFile);
        const dir = getDirFromPath(pathToFile);
        const newPathToFile = path.resolve(dir, newFile);
        await files.rn(pathToFile, newPathToFile);
    }
    async cp([oldFile, newFile]) {
        const pathToOldFile = this._resolvePath(oldFile);
        const pathToNewFile = this._resolvePath(newFile);
        await files.cp(pathToOldFile, pathToNewFile);
    }
    async mv([oldFile, newFile]) {
        const pathToOldFile = this._resolvePath(oldFile);
        const pathToNewFile = this._resolvePath(newFile);
        await files.mv(pathToOldFile, pathToNewFile);
    }
    async rm([file]) {
        const pathToFile = this._resolvePath(file);
        await files.rm(pathToFile);
    }
    os([file]) {
        sysInfo(file);
    }
    async hash([file]) {
        const pathToFile = this._resolvePath(file);
        await hash(pathToFile);
    }
    async compress([src, dest]) {
        const pathToSrc = this._resolvePath(src);
        const pathToDest = this._resolvePath(dest);
        await brotli.compress(pathToSrc, pathToDest);
    }
    async decompress([src, dest]) {
        const pathToSrc = this._resolvePath(src);
        const pathToDest = this._resolvePath(dest);
        await brotli.decompress(pathToSrc, pathToDest);
    }
    [".exit"]() {
        process.exit();
    }

    validate(command, args) {
        switch (command) {
            case "up":
            case "ls":
            case ".exit":
                return true;

            case "cd":
            case "rm":
            case "os":
            case "hash":
            case "cat":
                if (args[0]) {
                    return true;
                }

            case "mv":
            case "cp":
            case "compress":
            case "decompress": {
                if (args[0] && args[1]) {
                    return true;
                }
            }
            case "add": {
                if (args[0] && isPathToFile(args[0])) {
                    return true;
                }
            }
            case "rn": {
                if (args[0] && args[1] && isPathToFile(args[1])) {
                    return true;
                }
            }
            default:
                return false;
        }
    }

    async start() {
        const rl = createInterface({ input: process.stdin, output: process.stdout });

        while (true) {
            const input = await rl.question(`You are currently in ${this._currentPath}\n`);
            const [command, ...args] = parseInput(input);
            if (this.validate(command, args)) {
                try {
                    await this[command](args);
                    console.log(MESSAGES.operationSuccessful);
                } catch (err) {
                    console.log(MESSAGES.operationFailed);
                }
            } else {
                console.log(MESSAGES.invalidInput);
            }
        }
    }
}