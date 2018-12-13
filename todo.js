const express = require('express');
const Sequelize = require('sequelize');

let productRouter = express.Router();
let data = {};

let sequelize = new Sequelize('todoes', 'root', 'aq1sw2de3fr4', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

let Todo = sequelize.define('todo', {
  value: Sequelize.STRING,
  isActive: { type: Sequelize.BOOLEAN }
}, {
  freezeTableName: true
});

Todo.sync();

productRouter.use('/', (req, res, next) => {
  actCount()
    .then(act => data.activeItems = act)
    .then(() => {
      complCount().then(compl => {
        data.completedItems = compl;
        next();
      })
    })
});

productRouter.put('/:id/makeCompl', (req, res) => {
  Todo.findById(req.params.id).then(item => {
    item.update({ isActive: false }).then(() => res.send())
  })
});

productRouter.put('/:id/change', (req, res) => {
  Todo.findById(req.params.id).then(item => {
    item.update({ value: req.body.value }).then(() => res.send())
  })
});

productRouter.put('/', (req, res) => {
  Todo.update({ isActive: false }, { where: { isActive: true } }).then(() => res.send())
});

productRouter.delete('/:id', (req, res) => {
  Todo.findById(req.params.id).then(item => {
    item.destroy().then(() => res.send())
  })
});

productRouter.delete('/', (req, res) => {
  Todo.destroy({ where: {}, truncate: true }).then(() => res.send())
});

productRouter.get('/', (req, res) => {
  let acTab = req.query.activeTab;
  let curPage = req.query.currentPage;
  let perPage = req.query.perPage;
  let lastPage = 1;

  countTab(acTab)
    .then(count => {
      if (count === 0) lastPage = 1;
      else {
        let pages = Math.ceil(count / perPage);
        if (curPage > pages) curPage = pages;
        lastPage = +pages
      }
    })
    .then(() => activeTabItems(acTab, curPage, perPage)
      .then(items => {
        data.portion = items;
        data.currentPage = curPage;
        res.send(data);
      })
    )
});

productRouter.post('/', function(req, res) {
  if (!req.body) return res.sendStatus(400);
  Todo.create({ value: req.body.value, isActive: true }).then(() => res.send());
});

function activeTabItems(activeTab, curPage, perPage) {
  let options = {
    limit: +perPage,
    offset: perPage * (curPage - 1),
    attributes: ['id', 'isActive', 'value'],
    order: [['createdAt', 'DESC']]
  };

  if (activeTab === 'all') {
    return Todo.findAll(options);
  }
  if (activeTab === 'active') {
    options.where = { isActive: true };
    return Todo.findAll(options)
  }
  if (activeTab === 'completed') {
    options.where = { isActive: false };
    return Todo.findAll(options)
  }
}

let countTab = function(activeTab) {
  if (activeTab === 'active') {
    return actCount()
  }
  if (activeTab === 'completed') {
    return complCount()
  }
  return Todo.count();
};

function complCount() {
  return Todo.count({ where: { isActive: false } })
}

function actCount() {
  return Todo.count({ where: { isActive: true } })
}

module.exports = productRouter;