import childProcess from 'child_process';
import Queue from './queue';
import Log from '../utils/log';

const log = new Log('WORKERS');
const args = process.argv.slice(2);

const queue = new Queue(args[0]);
const processNum = args[1];

const downloaders = [];

let downloadersFinished = 0;

let config = {};

setInterval(() => {
  if (downloaders.length === downloadersFinished) {
    queue.updateTasks((err, isUpdated, nConfig) => {
      if (isUpdated) {
        config = nConfig;
        log.i('New tasks is found!');
        downloadersFinished = 0;
        runDownloaders(processNum, config);
      } else {
        log.i('Tasks queue is empty.');
      }
    });
  }
}, 10000)

function forkDownloader(index) {
  downloaders[index] = 'init';
  let firstTask = queue.nextTask();
  if (firstTask) {
    // Enable a worker with the first task.
    downloaders[index] = childProcess.fork('entries/entry_downloader', [index]);
    downloaders[index].send({ new: firstTask, config: config });
    // Watching the request from worker.
    downloaders[index].on('message', (m) => {
      if (m.fin) {
        log.s(`(P-${index+1}) Task ${m.fin.id} is finished.`);
        // Task of worker has done.
        queue.finTask(m.fin.id, (err, rs) => {
          startNextTask(index);
        });
      } else if (m.fail) {
        // Task throw a error.
        taskFailure(index, m);
      }
    });
  } else {
    log.i(`(P-${index+1}) No tasks.`)
    downloadersFinished += 1;
  }
}

function startNextTask(index) {
  let nextTask = queue.nextTask();
  if (nextTask) {
    // If the next task is exist, processing next task.
    downloaders[index].send({ new: nextTask, config: config });
  } else {
    // All tasks of this worker were done, worker exit.
    downloaders[index].send({ exit: 1 });
    downloadersFinished += 1;
  }
}

function taskFailure (index, m) {
  // Counting the retrying frequency.
  m.fail['retry'] += 1;
  if (m.fail['retry'] <= 5) {
    // If the retrying frequency is smaller than three times,
    // moving it to the last of queue, and waiting for next retrying.
    log.f(`(P-${index+1}) Task ${m.fail.id} is failed. Retrying: ${m.fail['retry']}`);
    queue.returnTask(m.fail);
    downloaders[index].send({ new: queue.nextTask(), config: config });
  } else {
    // Retrying frequency is more than three times,
    // giving up this task.
    log.e(`(P-${index+1}) Task ${m.fail.id} is failed: Cannot download: ${m.fail.content.src}`);
    queue.finTask(m.fail.id, (err, rs) => {
      startNextTask(index);
    });
  }
}

function runDownloaders(amount) {
  for (let i = 0; i < amount; i +=1) {
    forkDownloader(i, config);
  }
}

queue.loadProject((err, nConfig) => {
  config = nConfig;
  runDownloaders(processNum, config);
});
