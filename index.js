const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const helmet = require("koa-helmet");
const morgan = require('koa-morgan');
const fs = require('fs');
const http = require('http');
const cors = require('koa2-cors');
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
app.use(cors({
	origin: function(ctx) {
		return 'https://goingdownstairs.netlify.com';
	},
	exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
	maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// req body編譯
app.use(bodyParser());
// 設定安全相關的http-header
app.use(helmet());
// app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.use(async ctx => {
	ctx.body = "This is down_stairs server";
});

// websocket
const server = http.createServer(app.callback());
createWebSocket(server);

let port = 4000;

server.listen(port, async () => console.log(`已啟動PORT: ${port}!`));