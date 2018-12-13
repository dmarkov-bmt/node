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

productRouter.use('/', async (req, res, next) => {
  data.activeItems = await actCount();
  data.completedItems = await complCount();
  next();
});

productRouter.put('/:id/makeCompl', async (req, res) => {
  let item = await Todo.findById(req.params.id);
  await item.update({isActive: false});
  res.send()
});

productRouter.put('/:id/change',async (req, res) => {
  let item = await Todo.findById(req.params.id);
  await item.update({ value: req.body.value });
  res.send();
});

productRouter.put('/',async (req, res) => {
  await Todo.update({ isActive: false }, { where: { isActive: true } });
  res.send();
});

productRouter.delete('/:id', async (req, res) => {
  Todo.findById(req.params.id).then(item => {
    item.destroy().then(() => res.send())
  })
});

productRouter.delete('/', async (req, res) => {
  await Todo.destroy({ where: {}, truncate: true });
  res.send();
});

productRouter.get('/', async (req, res) => {
  let acTab = req.query.activeTab;
  let curPage = req.query.currentPage;
  let perPage = req.query.perPage;

  let count = await countTab(acTab);
  if (count === 0) {
    data.lastPage = 1;
  }
  else {
    let pages = Math.ceil(count / perPage);
    if (curPage > pages) curPage = pages;
    data.lastPage = +pages
  }
  data.portion = await activeTabItems(acTab, curPage, perPage);
  data.currentPage = curPage;
  res.send(data);
});

productRouter.post('/',async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  await Todo.create({ value: req.body.value, isActive: true });
  res.send();
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

function countTab(activeTab) {
  if (activeTab === 'active') {
    return actCount()
  }
  if (activeTab === 'completed') {
    return complCount()
  }
  return Todo.count();
}

function complCount() {
  return Todo.count({ where: { isActive: false } })
}

function actCount() {
  return Todo.count({where: { isActive: true }})
}

module.exports = productRouter;