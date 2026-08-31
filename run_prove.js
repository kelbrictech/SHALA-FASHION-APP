const http = require('http');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.join(__dirname, 'client');
  const port = 8080;
  const server = http.createServer((req, res) => {
    const requested = req.url === '/' ? '/tests/index.html' : req.url;
    const file = path.normalize(path.join(root, requested));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      const ext = path.extname(file);
      const type = ext === '.js' ? 'text/javascript' : ext === '.html' ? 'text/html' : 'text/plain';
      res.writeHead(200, {'Content-Type': type}); res.end(data);
    });
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));

  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const consoleLogs=[];
  page.on('console', msg => consoleLogs.push({type:msg.type(),text:msg.text()}));
  await page.goto(`http://127.0.0.1:${port}/tests/index.html`, {waitUntil:'networkidle0',timeout:30000});
  await page.waitForFunction(() => document.title.includes('PASS /') || document.title.includes('FAIL'), {timeout:30000});

  const results=await page.$$eval('#results > div', nodes => nodes.map(n => n.innerText));
  const heading=await page.$eval('#results h2', n => n.innerText);
  const outDir=path.join(__dirname,'prove-artifacts'); fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'results.txt'), heading+'\n'+results.join('\n'));
  fs.writeFileSync(path.join(outDir,'console.log.json'),JSON.stringify(consoleLogs,null,2));
  fs.writeFileSync(path.join(outDir,'page.html'),await page.content());
  await page.screenshot({path:path.join(outDir,'screenshot.png'),fullPage:true});
  const summary={heading,total:results.length,passed:results.filter(x=>x.includes('PASS')).length,failed:results.filter(x=>x.includes('FAIL')).length,results};
  fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify(summary,null,2));

  await browser.close(); await new Promise(resolve => server.close(resolve));
  console.log(heading);
  if (summary.failed || summary.total !== 26) process.exit(1);
})().catch(err => { console.error(err); process.exit(1); });
