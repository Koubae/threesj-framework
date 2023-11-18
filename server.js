import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const PORT = 8000;
const httpServer = http.createServer(requestResponseHandler);
httpServer.listen(PORT, () => {
  console.log('Node.JS static file server is listening on port ' + PORT);
})
function requestResponseHandler(req, res){
  console.log(`Request came: ${req.url}`);
  if(req.url === '/'){
    sendResponse('index.html', 'text/html', res)
  }else{
    sendResponse(req.url, getContentType(req.url), res);
  }
}

function sendResponse(url, contentType, res){
  if (url.includes('index.html') || url.includes('index.js') || url.includes('main.css')) {
    url = path.join("web", url);
  }

  let file = path.join(process.cwd(), url);
  fs.readFile(file, (err, content) => {
    if(err){
      res.writeHead(404);
      res.write(`File '${file}' Not Found!`);
      res.end();
      console.log(`Response: 404 ${file}, err`);
    }else{
      res.writeHead(200, {'Content-Type': contentType});
      res.write(content);
      res.end();
      console.log(`Response: 200 ${file}`);
    }
  })
}


function getContentType(url){
  switch (path.extname(url)) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    default:
      return 'application/octate-stream';
  }
}