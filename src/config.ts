import fs from 'node:fs';
import path from 'node:path';

// check if has a argument
let baseConfigPath;

if(process.argv.length < 3) {
    baseConfigPath = path.resolve(process.cwd());
} else {
    baseConfigPath = path.resolve(process.argv[2]);
}

if(!fs.existsSync(path.join(baseConfigPath, 'config.json'))) {
    console.error('config.json not found!');
    process.exit();
}

if(!fs.existsSync(path.join(baseConfigPath, 'symbols.txt'))) {
    console.error('symbols.txt not found!');
    process.exit();
}

const config = JSON.parse(fs.readFileSync(path.join(baseConfigPath, 'config.json'), 'utf-8'));

export const START_DATE = (() => {
    const mode = config.dates.profile;

    const profile = config.dates.profiles[mode];

    if(profile.type == "set") {
        return new Date(profile.startDate).getTime() / 1000;
    } else {
        return new Date().getTime() / 1000;
    }
})();

export const END_DATE = (() => {
    const mode = config.dates.profile;

    const profile = config.dates.profiles[mode];

    if(profile.type == "set") {
        return new Date(profile.endDate).getTime() / 1000;
    } else {
        const date = new Date();

        date.setFullYear(date.getFullYear() - (profile.years || 0));
        date.setMonth(date.getMonth() - (profile.months || 0));
        date.setDate(date.getDate() - (profile.days || 0));

        return date.getTime() / 1000;
    }
})();

export const outputDir = path.resolve(config.outputDir);

export const toProcess = config.profiles[config.mode] as {
    outTemplate: string,
    baseUrl: string,
    customErrorMessages: string[]|undefined,
}[];

if(!toProcess) {
    console.error('Invalid mode!');
    process.exit();
}

export const SYMBOLS = fs.readFileSync(path.join(baseConfigPath, 'symbols.txt'), 'utf-8').split('\r\n');
export const AGENTS = fs.readFileSync(path.join(baseConfigPath, 'agents.txt'), 'utf-8').split('\r\n');