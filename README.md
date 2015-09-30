# dist-remote-res

A simple REST server for distrubuting remote resources to local storage and cloud storages.

## What's this?

I was writting a spider via pyspider when I want to download the images in the articles. I found that I have to import a request&download module in order to save these images. However, my pyspider was running in docker and it's weird to mount a directory to outside system or another docker. So the idea was occurred to me, which can downloading some  static resources independently, reusable and easy to control the target (e.g. outdrive, dropbox, aws ...).

## Usage

### Create a project

`PUT http://127.0.0.1:3456/project`

####Parameters
`name` - [String]
The name of the project that you want to create.

`targets` - [ JSON Array ]
The targets you want to save downloaded resources.

Example:
```json
{
  "name": "project1",
  "targets": [{
    "target": "local",
    "path": "/home/spiders/project1/resources"
  },{
    "target": "onedrive",
    "sign_in_code": "one-time sign-in code here",
    "path": "/spiders/project1/resources"
  }]
}
```

### Query a project

`GET http://127.0.0.1:3456/project/:project_name`


### Delete a project

`DELETE http://127.0.0.1:3456/project/:project_name`


### Modify a project

`PUT http://127.0.0.1:3456/project/:project_name`

The parameters is similar to *create a project*.

### Add a task

`PUT http://127.0.0.1:3456/tasks/:project_name`

`src` - [String]
Source url

### Add tasks

`PUT http://127.0.0.1:3456/tasks/:project_name`

`src` - [ JSON Array ]

Example:
```json
["https://cdn.example.com/attachments/1.jpg", "https://cdn.example.com/attachments/2.jpg", "https://cdn.example.com/attachments/3.jpg"]
```

### Query all tasks

`GET http://127.0.0.1:3456/tasks/:project_name/all`

Get informations of all tasks from a project.

### Query a task

`GET http://127.0.0.1:3456/tasks/:project_name/:id`

Get information of a task from a project.
