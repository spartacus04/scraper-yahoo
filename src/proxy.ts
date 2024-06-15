import { fetch, ProxyAgent } from 'undici';

const timeLimit = 120000;

const proxyEndPoint = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&proxy_format=protocolipport&format=text&timeout=10000';

const controller = new AbortController();

export const fetchProxies = async () => {
    return await new Promise<{ [key: string]: { statusCode: number, timeout: number } }>(async (resolve) => {
        console.log('Fetching proxies...');
        const data = await fetch(proxyEndPoint);

        const proxies = (await data.text()).split('\r\n').filter(proxy => proxy != '');

        console.log(`Fetched ${proxies.length} proxies! Testing them... (will take about 2 minutes)`);

        const fetchedProxies : { [key: string]: { statusCode: number, timeout: number } } = {};

        proxies.forEach(async url => {
            const start = Date.now();

            const statusCode = await fetch(
                "https://api.ipify.org",
                {
                    dispatcher: new ProxyAgent(url),
                    signal: controller.signal
                }
            ).then(res => res.status).catch(() => 400);

            const end = Date.now();
            const timeout = end - start;

            if(controller.signal.aborted) return;
            
            fetchedProxies[url] = { statusCode, timeout };
        });

        setTimeout(() => {
            controller.abort();
            resolve(fetchedProxies)
        }, timeLimit);
    });
}

export const filterProxies = (proxies: { [key: string]: { statusCode: number, timeout: number } }) => {
    const okProxies = Object.keys(proxies).filter(proxy => proxies[proxy].statusCode == 200);
    okProxies.sort((a, b) => proxies[a].timeout - proxies[b].timeout);

    return okProxies;
};