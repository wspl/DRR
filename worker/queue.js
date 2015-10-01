import request from 'request';

export default class Queue {
  constructor (name) {
    this.name = name;
    this.tasks = [];
  }
  loadProject (callback) {
    request.get(`http://127.0.0.1:3456/tasks/${this.name}`, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const project = JSON.parse(body);
        project.result.forEach((val) => {
          if (!val.fin) {
            this.tasks.push(val);
          }
        })
        callback(null, project.config);
      } else {
        callback(err || res.statusCode)
      }
    })
  }
  updateTasks (callback) {
    this.tasks = [];
    let isUpdated = false;
    request.get(`http://127.0.0.1:3456/tasks/${this.name}`, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const project = JSON.parse(body);
        project.result.forEach((val, index) => {
          if (!val.fin) {
            isUpdated = true;
            this.tasks.push(val);
          }
        })
        callback(null, isUpdated, project.config);
      } else {
        callback(err || res.statusCode);
      }
    })
  }
  nextTask () {
    const task = this.tasks[0];
    this.tasks.splice(0, 1);
    return task;
  }
  returnTask (task) {
    this.tasks.push(task);
  }
  finTask (id, callback) {
    request.del(`http://127.0.0.1:3456/tasks/${this.name}/${id}`, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        callback(null, JSON.parse(body));
      } else {
        callback(err || res.statusCode);
      }
    });
  }
}
