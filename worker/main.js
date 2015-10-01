import childProcess from 'child_process';
import Queue from './queue';

const args = process.argv.slice(2);

const queue = new Queue(args[0]);
const processNum = args[1];

const downloaders = [];
let downloadersFinished = 0;

setInterval(() => {
  if (downloaders.length === downloadersFinished) {
    queue.updateTasks((err, isUpdated, config) => {
      if (isUpdated) {
        console.log('New tasks is found!');
        downloadersFinished = 0;
        runDownloaders(processNum, config);
      } else {
        console.log('Tasks queue is empty.');
      }
    });
  }
}, 10000)

function forkDownloader(index, config) {
  downloaders[index] = 'init';
  let firstTask = queue.nextTask();
  if (firstTask) {
    downloaders[index] = childProcess.fork('entries/entry_downloader');
    downloaders[index].send({ new: firstTask, config: config });
    downloaders[index].on('message', (m) => {
      if (m.fin) {
        queue.finTask(m.fin.id, (err, rs) => {
          console.log(index + ') ' + rs.id);
          let nextTask = queue.nextTask();
          if (nextTask) {
            downloaders[index].send({ new: nextTask, config: config });
          } else {
            console.log(index + ') Finished!');
            downloaders[index].send({ exit: 1 });
            downloadersFinished += 1;
          }
        });
      } else if (m.fail) {
        console.log(index + ') Failed, will retry: ' + m.fail.id);
        queue.returnTask(m.fail);
        downloaders[index].send({ new: queue.nextTask(), config: config });
      }
    });
  } else {
    console.log(index + ') No Task!');
    downloadersFinished += 1;
  }
}

function runDownloaders(amount, config) {
  for (let i = 0; i < amount; i +=1) {
    forkDownloader(i, config);
  }
}

queue.loadProject((err, config) => {
  runDownloaders(processNum, config);
});
