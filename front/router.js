import childProcess from 'child_process';
import Router from 'koa-router';
import Project from './project';
import Log from '../utils/log';

const router = Router();
const log = new Log('REST-API');

const projectCache = {};

router.get('/', function *(next) {
  this.body = 'Hello!';
});

router.put('/project/:projectName', function *(next) {
  try {
    if (!Project.isExist(this.params.projectName)) {
      const newProject = new Project(this.params.projectName);
      const config = this.request.body;
      newProject.setConfig(config);
      projectCache[this.params.projectName] = newProject;
      this.body = {
        success: 'Project created successful.'
      }
    } else {
      throw 'Project already exists.';
    }
  } catch (e) {
    this.body = {
      error: 'Project already exists.'
    }
  }
});

router.delete('/project/:projectName', function *(next) {
  try {
    Project.destroy(this.params.projectName);
    delete projectCache[this.params.projectName];
    this.body = {
      success: 'Project removed successful.'
    }
  } catch (e) {
    this.body = {
      error: e.message
    }
  }
});

router.put('/tasks/:projectName', function *(next) {
  try {
    if (!projectCache[this.params.projectName]) {
      projectCache[this.params.projectName] = new Project(this.params.projectName);
    }

    const start = new Date;
    let taskID;
    if (this.request.body.length) {
      taskID = [];
      this.request.body.forEach((val) => {
        taskID.push(projectCache[this.params.projectName].newTask(val));
      })
    } else {
      taskID = projectCache[this.params.projectName].newTask(this.request.body);
    }
    const ms = new Date - start;

    this.body = {
      success: 'Task(s) added successful.',
      exec_time: ms + 'ms',
      task_id: taskID
    }
  } catch (e) {
    this.body = {
      error: e.message
    }
  }
});

router.put('/tasks/:projectName/:taskID', function *(next) {
  try {
    if (!projectCache[this.params.projectName]) {
      projectCache[this.params.projectName] = new Project(this.params.projectName);
    }

    const start = new Date;
    let taskID = projectCache[this.params.projectName].fin(this.params.taskID);
    const ms = new Date - start;

    this.body = {
      success: 'Task(s) finished!',
      exec_time: ms + 'ms',
      task_id: taskID
    }
  } catch (e) {
    this.body = {
      error: e.message
    }
  }
});

router.get('/tasks/:projectName/:taskID', function *(next) {
  try {
    if (Project.isExist(this.params.projectName)) {
      if (!projectCache[this.params.projectName]) {
        projectCache[this.params.projectName] = new Project(this.params.projectName);
      }

      const start = new Date;
      let result = projectCache[this.params.projectName].getTask(this.params.taskID);
      const ms = new Date - start;

      this.body = {
        success: 'Task(s) got successful.',
        exec_time: ms + 'ms',
        result: result
      }
    } else {
      throw 'Project does not exist.'
    }
  } catch (e) {
    this.body = {
      error: e.message
    }
  }
});

router.delete('/tasks/:projectName/:taskID', function *(next) {
  try {
    if (Project.isExist(this.params.projectName)) {
      if (!projectCache[this.params.projectName]) {
        projectCache[this.params.projectName] = new Project(this.params.projectName);
      }

      const start = new Date;
      let result = projectCache[this.params.projectName].fin(this.params.taskID);
      const ms = new Date - start;

      this.body = {
        success: 'Task(s) finished.',
        exec_time: ms + 'ms',
        id: result
      }
    } else {
      throw 'Project does not exist.'
    }
  } catch (e) {
    this.body = {
      error: e.message
    }
  }
});

router.get('/tasks/:projectName', function *(next) {
  try {
    if (Project.isExist(this.params.projectName)) {
        if (!projectCache[this.params.projectName]) {
          projectCache[this.params.projectName] = new Project(this.params.projectName);
        }

        const start = new Date;
        let result = projectCache[this.params.projectName].getAllTasks(this.params.taskID);
        let config = projectCache[this.params.projectName].getConfig(this.params.taskID);
        const ms = new Date - start;

        this.body = {
          success: 'Task(s) got successful.',
          exec_time: ms + 'ms',
          config: config,
          result: result
        }
    } else {
      throw 'Project does not exist.'
    }
  } catch (e) {
    this.body = {
      error: e.message
    }
  }
});


const workers = {};

router.post('/worker/:projectName/start', function *(next) {
  workers[this.params.projectName] = childProcess.fork('entries/entry_worker', [this.params.projectName, 4]);
  this.body = 'Forked: ' + this.params.projectName;
})

router.post('/worker/:projectName/start/:processNum', function *(next) {
  workers[this.params.projectName] = childProcess.fork('entries/entry_worker', [this.params.projectName, this.params.processNum]);
  this.body = 'Forked: ' + this.params.projectName;
})

router.post('/worker/:projectName/stop', function *(next) {
  workers[this.params.projectName].kill();
  this.body = 'Stopped: ' + this.params.projectName;
})

export default router;
