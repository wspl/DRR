import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';

const app = koa();

app.use(bodyParser());

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('[FRONT] %s %s - %s ms', this.method, this.url, ms);
});

app.use(router.routes())

app.listen(3456);
