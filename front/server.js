import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';
import Log from '../utils/log';

const log = new Log('SERVER');
const app = koa();

app.use(bodyParser());
app.use(router.routes())

app.listen(3456, (err) => {
  log.i('DRR is running...')
  if (!err) {
    log.s('DRR is listening on 3456.');
  } else {
    log.e('Cannot bind the port 3456');
  }
});
