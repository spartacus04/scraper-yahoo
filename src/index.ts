import { AGENTS, END_DATE, START_DATE, SYMBOLS, outputDir, toProcess } from './config';
import { filterProxies, fetchProxies } from './proxy';
import { fetch, ProxyAgent } from 'undici';
import fs from 'node:fs';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const errorMessages = [
    "404 Not Found: No data found, symbol may be delisted",
    "Edge: Not Found",
    "Too Many Requests",
    "<!DOCTYPE html>",
    "<html>",
    "dial tcp"
];

const userErrorMessages = [
    "400 Bad Request: Data doesn't exist for startDate"
];

const fetchPromise = async (url: string, outTemplate: string, customErrorMessages : string[] = []) => {
    let proxies = filterProxies(await fetchProxies());

    let totalProxies = proxies.length;

    const symbols = Array.from(SYMBOLS);
    const totalSymbols = symbols.length;
    let symbolCount = totalSymbols;

    console.log(`Found ${proxies.length} proxies!`);

    return await new Promise<void>((resolve) => {
        setInterval(async () => {
            while(proxies.length > 0 && symbols.length > 0) {
                const proxy = proxies.shift()!!;
                const symbol = symbols.shift()!!;
    
                (async () => {
                    try {
                        console.log(`[${proxy}] Downloading ${symbol}`)
    
                        const data = await fetch(
                            new URL(url.replace('${symbol}', symbol).replace('${START_DATE}', START_DATE.toString()).replace('${END_DATE}', END_DATE.toString())),
                            {
                                dispatcher: new ProxyAgent(proxy),
                                headers: {
                                    'User-Agent': AGENTS[Math.floor(Math.random() * AGENTS.length)]
                                }
                            }
                        );
    
                        const response = await data.text();
    
                        if(errorMessages.some(message => response.includes(message)) || customErrorMessages.some(message => response.includes(message)) || response == "") {
                            console.log(response);
                            throw new Error('Error downloading data');
                        }
    
                        symbolCount--;
    
                        if(userErrorMessages.some(message => response.includes(message))) {
                            console.log(`[${proxy}]Error downloading ${symbol}, skipping...`);
                            fs.appendFileSync('logs.txt', `[${symbol}] ${response}\n`);
                            proxies.push(proxy);
                            return;
                        }
                
                        console.log(`[${proxy}] Downloaded ${symbol}`);

                        const dir = `${outputDir}/${outTemplate.replaceAll('${symbol}', symbol).split('/').slice(0, -1).join('/')}`;
                        if(!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }

                        fs.writeFileSync(`${outputDir}/${outTemplate.replaceAll('${symbol}', symbol)}`, response);
    
                        await wait(3000);
    
                        proxies.push(proxy);
                    } catch(e : any) {
                        // handle econnreset
                        if(e.code == 'ECONNRESET') {
                            totalProxies++;
                            proxies.push(proxy);
                        }

                        console.log(e);
                        console.log(`[${proxy}]Error downloading ${symbol}, trying later...`);
                        symbols.push(symbol!!);
    
                        totalProxies--;
    
                        if(totalProxies == 0) {
                            console.log('No more proxies available, fetching new ones...');
    
                            proxies = filterProxies(await fetchProxies());
    
                            totalProxies = proxies.length;

                            console.log(`Found ${proxies.length} proxies!`);
                        }
                    }
                })();
            }
    
            if(symbolCount == 0) {
                console.log('Finished downloading all symbols!');
                resolve();
            }
        }, 1000)
    });
};

(async () => {
    console.log('You have 10 seconds to stop the script if you want to change the configuration...');
    console.log('Press CTRL + C to stop the script at any time...')

    await wait(10000);

    if(!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    if(!fs.existsSync('logs.txt')) {
        fs.writeFileSync('logs.txt', '');
    }

    for(const process of toProcess) {
        await fetchPromise(process.baseUrl, process.outTemplate, process.customErrorMessages || []);
    }
})();