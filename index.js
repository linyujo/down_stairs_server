const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const helmet = require("koa-helmet");
const morgan = require('koa-morgan');
const fs = require('fs');
const http = require('http');
const createWebSocket = require('./sockets/index');

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' })

const app = new Koa();

/** 
在此可組合各種 Middleware
**/
app.use(async (ctx, next) => {
	const start_time = Date.now();
	await next();
	const ms = Date.now() - start_time;
	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
app.use(morgan('combined', {
	stream: accessLogStream,
}))

// req body編譯
app.use(bodyParser());
// 設定安全相關的http-header
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// websocket
const server = http.createServer(app.callback());
createWebSocket(server);

app.use(async (ctx) => {
	ctx.body = 'Hello Koa2';
});

server.listen(4000, () => console.log(`已啟動PORT: ${4000}!`));