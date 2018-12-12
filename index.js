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
    isActive: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    freezeTableName: true
});

Todo.sync({force: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));

let activeTabItems = function(activeTab, curPage, perPage) {
    let options = {
        limit: +perPage,
        offset: perPage * (curPage - 1),
        attributes: ['id', 'isActive', 'value'],
        order: [['updatedAt', 'DESC']]
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

app.put("/todo/:id/makeCompl", (req, res) => {
    Todo.findById(req.params.id).then(item => {
        item.update({isActive: false}).then(() => res.send())
    })
});


app.delete("/todo/:id", (req, res) => {
    Todo.findById(req.params.id).then(item => {
        item.destroy();
        res.send()
    })});

app.get("/todo", (req, res)=>{
    let acTab = req.query.activeTab;
    let curPage = req.query.currentPage;
    let perPage = req.query.perPage;
    Todo.count()
        .then(count => {
            return Math.ceil(count/perPage)
        })
        .then(lastPage => {
            if (curPage > lastPage) curPage = lastPage;
            //res.send(data);
        })
        .then(() => activeTabItems(acTab, curPage, perPage).then(items => {
            data.portion = items;
            data.currentPage = curPage;
            res.send(data);
            })
        )
});

app.post("/todo", function (req, res) {
    if (!req.body) return res.sendStatus(400);
    Todo.create({value: req.body.value}).then(() => res.send());
});

app.listen(3000, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log('server is listening');
});