// const Koa = require('koa');
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from "koa-helmet";
import morgan from 'koa-morgan';
import fs from "fs";
import http from 'http';
import cors from 'koa2-cors';
import throng from 'throng';

import { processStart } from './utils';
import createWebSocket from './sockets';

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

if (process.env.NODE_ENV === 'development') {
	// 知道 dyno 有多少 process 可以使用
	const WORKERS = process.env.WEB_CONCURRENCY || 1;

	// 支援cluster
	throng({
		workers: WORKERS,
		lifetime: Infinity // 假如一個 worker 死掉了它會自己再爬起來
	}, processStart);
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => console.log(`已啟動PORT: ${PORT}!`));