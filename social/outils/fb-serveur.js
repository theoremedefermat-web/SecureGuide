const http=require('http'),fs=require('fs'),path=require('path');
http.createServer((q,s)=>{const p=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]).replace(/\.\./g,''));
fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);return s.end();}s.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':'image/png'});s.end(d);});}).listen(8765,'127.0.0.1');
