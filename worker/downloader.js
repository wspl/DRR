import fs from 'fs';
import url from 'url';
import path from 'path';
import mkdirp from 'mkdirp';
import request from 'request';

import Log from '../utils/log';

const log = new Log('WORKER-' + process.argv.slice(2)[0]);
let wouldExit = false;

let config, task, id , fileName, localPath, sourceUrl, targetDir, folder;
let targets = {};

process.on('message', (m) => {
  if (m.new) {
    task = m.new;
    config = m.config;
    initTask();
  } else if (m.exit) {
    process.exit();
  }
});

function initTask() {
  if (isNaN(task['retry'])) {
    task['retry'] = 0;
  }

  id = task.id;

  const defaultName = id + path.extname(url.parse(task.content.src).pathname);

  fileName = task.content.file_name || defaultName;

  config.targets.forEach((val) => {
    targets[val.target] = val;
  });

  folder = task.content.folder ? `/${task.content.folder}/` : '/';
  targetDir = targets.local.path + folder;

  localPath = targetDir + fileName;
  sourceUrl = task.content.src;

  mkdirp(targetDir, download);
}

function download () {
  try {
    const stream = request(sourceUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36
        (KHTML, like Gecko) Chrome/44.0.2403.69 Safari/537.36 QQBrowser/9.0.2617.400`
      }
    }).on('error', (err) => {
      process.send({ fail: task, error: err });
    }).pipe(fs.createWriteStream(localPath)).on('finish', () => {
      process.send({ fin: task });
    });
  } catch (e) {
    process.send({ fail: task, error: e });
  }
}
