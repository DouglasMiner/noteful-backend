const express = require('express');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then((folders) => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;
    const newFolder = { name };
    console.log(newFolder);
    if (newFolder.name === null)
      return res
        .status(400)
        .json({
          error: { message: 'Missing name in request body' },
        });

    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then((data) => {
        console.log('folders-router line 30', data)
        let folder = {
          id: data.id,
          name: data.name
        }
        res.status(201).json(folder);
      })
      .catch(next);
  });

foldersRouter
  .route('/:note_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: 'folder doesn\'t exist' },
          });
        }
        res.folder = folder;
        next(res.folder);
      })
      .catch(next);
  })
  .get((req, res, next) => {
    let folder = res.folder;
    res.json(folder);
  })
  .delete((req, res, next) => {
    FoldersService
      .deleteFolder(req.app.get('db'), req.params.folder_id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;