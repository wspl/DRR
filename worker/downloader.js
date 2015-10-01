import request from 'request';
import fs from 'fs';
import url from 'url';
import path from 'path';
import mkdirp from 'mkdirp';

let wouldExit = false;

let config, task, id , fileName, localPath, sourceUrl;
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
  id = task.id;

  const defaultName = id + path.extname(url.parse(task.content.src).pathname);

  //console.log(task);

  fileName = task.content.file_name || defaultName;

  config.targets.forEach((val) => {
    targets[val.target] = val;
  });

  const folder = task.content.folder ? `/${task.content.folder}/` : '/';
  const targetDir = targets.local.path + folder;

  localPath = targetDir + fileName;
  sourceUrl = task.content.src;

  mkdirp(targetDir, download);
}

function download () {
  console.log('Saving to: ' + localPath);
  try {
    const stream = request(sourceUrl, { timeout: 5000 }).on('error', (err) => {
      process.send({ fail: task, error: err });
    }).pipe(fs.createWriteStream(localPath)).on('finish', () => {
      process.send({ fin: task });
    });
  } catch (e) {
    process.send({ fail: task, error: e });
  }
}
