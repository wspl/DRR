import Router from 'koa-router';
import Project from './project';

const router = Router();

const projectCache = {};

router.get('/', function *(next) {
  this.body = 'Hello!';
});

router.put('/project/:projectName', function *(next) {
  if (!Project.isExist(this.params.projectName)) {
    const newProject = new Project(this.params.projectName);
    newProject.setConfig(this.request.body);
    projectCache[this.params.projectName] = newProject;
    this.body = {
      success: 'Project created successful.'
    }
  } else {
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
    //for (let i = 0; i < 100000; i += 1) {
      taskID = projectCache[this.params.projectName].newTask(this.request.body);
    //}
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

router.get('/tasks/:projectName/:taskID', function *(next) {
  try {
    if (Project.isExist(this.params.projectName)) {
      if (!projectCache[this.params.projectName]) {
        projectCache[this.params.projectName] = new Project(this.params.projectName);
      }

      const start = new Date;
      let result;
      //for (let i = 0; i < 2500000; i += 1) {
        result = projectCache[this.params.projectName].getTask(this.params.taskID);
      //}
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

router.get('/tasks/:projectName', function *(next) {
  try {
    if (Project.isExist(this.params.projectName)) {
        if (!projectCache[this.params.projectName]) {
          projectCache[this.params.projectName] = new Project(this.params.projectName);
        }

        const start = new Date;
        let result = projectCache[this.params.projectName].getAllTasks(this.params.taskID);
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

export default router;
