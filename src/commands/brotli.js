import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { checkThatExist, checkThatNotExist } from "../helpers.js";
import { MESSAGES } from '../messages.js';

const ACTION_TYPE = {
    COMPRESS: 'compress',
    DECOMPRESS: 'decompress'
}

const implementBrotli = async (pathToSrc, pathToDest, action) => {
    await checkThatExist(pathToSrc);
    await checkThatNotExist(pathToDest);
    const brotli = action === ACTION_TYPE.DECOMPRESS ? createBrotliDecompress() : createBrotliCompress();
    const srcStream = createReadStream(pathToSrc);
    const destStream = createWriteStream(pathToDest);
    await pipeline(srcStream, brotli, destStream);
    console.log(MESSAGES.operationSuccessful);
};

export const compress = async (...args) => {
    await implementBrotli(...args, ACTION_TYPE.COMPRESS);
};

export const decompress = async (...args) => {
    await implementBrotli(...args, ACTION_TYPE.DECOMPRESS);
};