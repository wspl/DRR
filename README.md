# dist-remote-res

A simple REST server for distrubuting remote resources to local storage and cloud storages.

## What's this?

I was trying to write a spider with pyspider, and then I plan to download images in articles. But I found that I have to import request&download module in order to save these images. However, my pyspider server was running in a docker container and it's weird to mount a directory to outside filesystem or another container. So the idea was occurred to me, which is reusable, easy to control the target (e.g. outdrive, dropbox, aws ...) and able to download static resources independently.

## Usage

### Create a project

`PUT http://127.0.0.1:3456/project/:project_name`

####Parameters
`project_name` - [String]
The name of the project that you want to create.

**Request body example:**
```json
{
  "name": "project1",
  "targets": [{
    "target": "local",
    "path": "./download/project1"
  },{
    "target": "onedrive",
    "sign_in_code": "one-time sign-in code here",
    "path": "/spiders/project1/resources"
  }]
}
```

### Delete a project

`DELETE http://127.0.0.1:3456/project/:project_name`


### Add a task

`PUT http://127.0.0.1:3456/tasks/:project_name`

**Request body example**
```json
{
  "src": "https://cdn.v2ex.co/avatar/0421/c02f/28966_normal.png?m=1409153157",
  "file_name": "28966.png", // optional
  "folder": "c02f" // optional
}
```

### Query all tasks

`GET http://127.0.0.1:3456/tasks/:project_name`

Get informations of all tasks from a project.

### Query a task

`GET http://127.0.0.1:3456/tasks/:project_name/:id`

Get information of a task from a project.

### Finish a task

`DELETE http://127.0.0.1:3456/tasks/:project_name/:id`

Finishing a task forcely.

### Launch a worker of project

`POST http://127.0.0.1:3456/worker/:project_name/start/:process_num`

`project_name` - [Integer]
The amount of downloader proecesses.

**WARNING:** DON'T LAUNCH A RUNNNING WORKER AGAIN.