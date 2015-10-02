import fs from 'fs';
import zlib from 'zlib';
import async from 'async';
import Log from '../utils/log';

const log = new Log('PROJECT');
const projectCache = new Map();

export default class Project {
  constructor (name) {
    if (projectCache.has(name)) {
      projectCache
    }
    this.name = name;
    this.my = {
      config:  {},
      tasks: []
    };
    this.taskIndexer = {};
    this.dbPath = `./projects/${this.name}.pro`;
    this.writeQueue = async.queue((task, callback) => {
      //console.log('written');
      const buf = zlib.deflateSync(JSON.stringify(this.my));
      fs.writeFile(this.dbPath, buf, callback);
    }, 1);
  }
  checkCache () {
    if (!this.isCached) {
      //console.log('checkCache!');
      try {
        this.isCached = true;
        const buf = zlib.inflateSync(fs.readFileSync(this.dbPath));
        this.my = JSON.parse(buf.toString());
        this.my.tasks.forEach((task, i, self) => {
          this.taskIndexer[task.id] = i;
        })
      } catch (e) {
        fs.writeFileSync(this.dbPath, zlib.deflateSync(JSON.stringify(this.my)));
      }
    }
  }
  persistCache (id) {
    this.writeQueue.push(id, () => {});
  }
  getAllTasks () {
    this.checkCache();
    return this.my.tasks;
  }
  getTask (id) {
    this.checkCache();
    return this.my.tasks[this.taskIndexer[id]];
  }
  fin (id) {
    this.checkCache();
    this.my.tasks[this.taskIndexer[id]].fin = true;
    this.persistCache(id);
    return id;
  }
  newTask (task) {
    this.checkCache();
    const dict = '0123456789QAZWSXEDCRFVTGBYHNUJMIKOLP';
    let id = '';
    for(let i = 0; i < 16; i += 1) {
      id += dict[Math.ceil(Math.random() * 35)];
    }
    this.taskIndexer[id] = this.my.tasks.length;
    this.my.tasks[this.my.tasks.length] = {
      id: id,
      fin: false,
      content: task
    }
    this.persistCache(id);
    return {
      id: id,
      total: this.my.tasks.length
    };
  }
  setConfig (config) {
    this.checkCache();
    this.my.config = config;
    log.s(`A new project is created with config: ${config}`);
    this.persistCache();
  }
  getConfig () {
    this.checkCache();
    return this.my.config;
  }
  clear () {
    this.checkCache();
    this.taskIndexer = {};
    this.my.tasks = [];
    this.persistCache();
  }
  static destroy (name) {
    return fs.unlinkSync(`./projects/${name}.pro`);
  }
  static isExist (name) {
    try {
      fs.statSync(`./projects/${name}.pro`);
      return true;
    } catch (e) {
      return false;
    }
  }
}
