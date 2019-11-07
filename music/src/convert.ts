import * as path from "path";
import * as fs from "fs";
import { spawn } from "promisify-child-process";
import { promisify } from "util";
import { ensureDir } from 'fs-extra';
import pLimit from 'p-limit';

const INPUT_PATH = "/storage/music/cloud_music";
const OUTPUT_PATH = "/storage/music/aac_music";
const TMP_PATH = "/tmp/enfw-tools/music";
const MUSIC_TYPE = new Set([".mp3", ".flac", ".ape", ".wav"]);
const NUM_PROCESSORS = 4;


function purename(filepath: string): string {
    return path.basename(filepath, path.extname(filepath));
}

async function ensureRemove(filepath: string) {
    if (await promisify(fs.exists)(filepath)) {
        const stat = await promisify(fs.lstat)(filepath);
        if (stat.isDirectory()) {
            await promisify(fs.rmdir)(filepath);
        } else {
            await promisify(fs.unlink)(filepath);
        }
    }
}

async function decode(inputPath: string, outputPath: string) {
    console.info(`[decode]: decoding ${inputPath} to ${outputPath}...`);
    await ensureRemove(outputPath);
    const task = 'ffmpeg';
    const options = [
        "-i",
        inputPath,
        "-vn",
        "-sn",
        "-v",
        "0",
        "-c:a",
        "pcm_s16le",
        "-f",
        "wav",
        outputPath
    ];
    console.info(`[decode]: ${task} ${options.join(' ')}`);
    await spawn(
        task, options,
    );
}

async function encode(inputPath: string, outputPath: string) {
    console.info(`[encode]: encoding ${inputPath} to ${outputPath}...`);
    await ensureRemove(outputPath);
    const task = 'neroAacEnc';
    const options = [
        // "-2pass",
     "-lc", "-br", "256000", "-if", 
    inputPath, "-of",  outputPath];
    console.info(`[encode]: ${task} ${options.join(' ')}`);
    await spawn(
        task,
        options,
    );
}

async function removeTemp(tempPath: string) {
    console.info(`[clear]: clear temp file ${tempPath}`);
    await promisify(fs.unlink)(tempPath);
}

async function convert(inputPath: string, outputPath: string) {
    const name = purename(inputPath);
    const tempPath = path.join(TMP_PATH, name + ".wav");
    await decode(inputPath, tempPath);
    await encode(tempPath, outputPath);
    await removeTemp(tempPath);
}

async function main() {
    const files = fs.readdirSync(INPUT_PATH).filter(file => MUSIC_TYPE.has(path.extname(file)));
    await ensureDir(TMP_PATH);
    const limit = pLimit(NUM_PROCESSORS-1);
    const tasks = files.map(f=>{
        const name = purename(f);
        const inputPath = path.join(INPUT_PATH, f);
        const outputPath = path.join(OUTPUT_PATH, name + '.aac');
        return limit(() => convert(inputPath, outputPath));
    })
    return await Promise.all(tasks);
}

main().then(() => { });
