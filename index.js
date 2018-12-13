let bodyParser = require('body-parser');
let express = require('express');
let Sequelize = require('sequelize');

let app = express();
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
    isActive: {type: Sequelize.BOOLEAN}
}, {
    freezeTableName: true
});

Todo.sync();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));

let activeTabItems = function(activeTab, curPage, perPage) {
    let options = {
        limit: +perPage,
        offset: perPage * (curPage - 1),
        attributes: ['id', 'isActive', 'value'],
        order: [['createdAt', 'DESC']]
    };

    if (activeTab === 'all')
        return Todo.findAll(options);
    if (activeTab === 'active') {
        options.where = {isActive: true};
        return Todo.findAll(options)
    }
    if (activeTab === 'completed') {
        options.where = {isActive: false};
        return Todo.findAll(options)
    }
};

let countTab = function(activeTab){
    if (activeTab === 'all')
        return Todo.count();
    if (activeTab === 'active') {
        return Todo.count({where :{isActive: true}})
    }
    if (activeTab === 'completed') {
        return Todo.count({where :{isActive: false}})
    }
};

let complCount = function () {
    return Todo.count({where: {isActive: false}})
};

let actCount = function () {
    return Todo.count({where: {isActive: true}})
};

let data = {};
app.use((req, res, next) => {
    actCount()
        .then(act => data.activeItems = act)
        .then(() => {
            complCount().then(compl => {
                data.completedItems = compl;
                next();
            })
        })

});

app.put("/todo", (req, res) => {
    Todo.update({isActive: false}, {where: {isActive:true}}).then(()=>res.send())
});

app.put("/todo/:id/makeCompl", (req, res) => {
    Todo.findById(req.params.id).then(item => {
        item.update({isActive: false}).then(()=>res.send())
    })
});

app.put("/todo/:id/change", (req, res) => {
    Todo.findById(req.params.id).then(item => {
        item.update({value: req.body.value}).then(()=>res.send())
    })
});
app.delete("/todo", (req, res) => {
    Todo.destroy({where: {}, truncate: true}).then(()=>res.send())
});

app.delete("/todo/:id", (req, res) => {
    Todo.findById(req.params.id).then(item => {
        item.destroy().then(() => res.send())
    })
});

app.get("/todo", (req, res)=>{
    let acTab = req.query.activeTab;
    let curPage = req.query.currentPage;
    let perPage = req.query.perPage;
    let lastPage = 0;
    countTab(acTab)
        .then(count => {
            if (count === 0) return 1;
            return Math.ceil(count/perPage)
        })
        .then(pages => {
            if (curPage > pages) curPage = pages;
            lastPage = +pages;
        })
        .then(() => activeTabItems(acTab, curPage, perPage).then(items => {
            data.portion = items;
            data.currentPage = curPage;
            data.lastPage = lastPage;
            res.send(data);
            })
        )
});

app.post("/todo", function (req, res) {
    if (!req.body) return res.sendStatus(400);
    Todo.create({value: req.body.value, isActive: true}).then(() => res.send());
});

app.listen(3000, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log('server is listening');
});