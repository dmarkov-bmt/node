
class View {
    constructor(){
        this.$addPlace = $('#add-place');
        this.$btnAdd = $('#btn-add');
        this.$inputTxt = $('#input-txt');
        this.$templ = $('#item-template');
        this.$todoPlace = $('#todo-place');
    }
    render (info) {
        let tmpl = _.template(this.$templ.html());
        let data = {item: info.portion};
        this.$addPlace.html(tmpl(data));
        this.$inputTxt.val('');

        $('#compl').text(info.completedItems);
        $('#act').text(info.activeItems);
        $('#current-page').text(info.currentPage);
        $('#last-page').text(info.lastPage);
    }
}

class Model {
    constructor(){
        this.mainUrl = '/todo';
    }

    addItem(value) {
        if (value.trim()) {
            return $.post(this.mainUrl, {value: value})
        }
    }

    removeItem(id) {
        return $.ajax({
            url: `${this.mainUrl}/${id}`,
            type: "DELETE"
        })
    }

    deleteAll(){
        return $.ajax({
            url: `${this.mainUrl}`,
            type: "DELETE"
        })
    }

    changeItem(id, value){
        return $.ajax({
            url: `${this.mainUrl}/${id}/change`,
            type: "PUT",
            data: {value: value}
        })
    }

    makeCompl(id) {
        return $.ajax({
            url: `${this.mainUrl}/${id}/makeCompl`,
            type: "PUT"
        })
    }

    makeComplAll() {
        return $.ajax({
            url: `${this.mainUrl}`,
            type: "PUT"
        })
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.state = {
            portion: [],
            lastPage: 1,
            currentPage: 1,
            activeTab: 'all',
            perPage: 5,
            activeItems: 0,
            completedItems: 0
        };
    }
    init() {

        this.events();
    }

    events(){
        this.view.$btnAdd.click(() => {
            this.model.addItem(this.view.$inputTxt.val())
                .then((err) => {
                    if (err) alert(err);
                    this.render();
                });
        });

        this.view.$inputTxt.keydown((event) => {
            if (event.which == 13) {
                event.preventDefault();
                this.model.addItem(this.view.$inputTxt.val())
                    .then((err) => {
                        if (err) alert(err);
                        this.render();
                    });
             }
        });

        $('#todo-place').on('click', '.glyphicon-hourglass', (event) => {
            let id = $(event.currentTarget).attr('data-id');
            this.model.makeCompl(id)
                .then((err) => {
                    if (err) alert(err);
                    this.render();
                });
        });

        $('#compl-all-btn').on('click', () => {
            this.model.makeComplAll()
                .then((err) => {
                    if (err) alert(JSON.stringify(err));
                    this.render();
                });
        });

        $('#todo-place').on('click', '.glyphicon-remove', (event) => {
            let id = $(event.currentTarget).attr('data-id');
            this.model.removeItem(id)
                .then((err) => {
                    if (err) alert(JSON.stringify(err));
                    this.render();
                });
        });

        $('#delete-all-btn').on('click', () => {
            this.model.deleteAll()
                .then((err) => {
                    if (err) alert(err);
                    this.render();
                });
        });

        $('#todo-place').on('dblclick', 'input[disabled]', (event) => {
            $(event.currentTarget).removeAttr('disabled');
            $(event.currentTarget).focusout((event) => {
                let val = $(event.currentTarget).val();
                let id = $(event.currentTarget).attr('data-id');
                this.model.changeItem(+id, val)
                    .then((err) => {
                        if (err) alert(err);
                        this.render();
                    });
            });
        });

        $('.glyphicon-menu-left').on('click', () => {
            if (this.state.currentPage > 1){this.state.currentPage--}
            this.render();
        });

        $('.glyphicon-menu-right').on('click', () => {
            if (this.state.currentPage < this.state.lastPage){this.state.currentPage++}
            this.render();
        });

        $('.nav-tabs li a').on('click', (event) => {
            this.state.activeTab = ($(event.currentTarget).attr('id'));
            this.view.$todoPlace.removeClass();
            this.view.$todoPlace.addClass('tab-pane active bg-' + this.state.activeTab);
            this.render();
        })
    }
    render(){
        $.get(`${this.model.mainUrl}?activeTab=${this.state.activeTab}&currentPage=${this.state.currentPage}&perPage=${this.state.perPage}`)
            .then(data =>{
                this.state.portion = data.portion;
                this.state.lastPage = data.lastPage;
                this.state.currentPage = data.currentPage;
                this.state.activeItems = data.activeItems;
                this.state.completedItems = data.completedItems;
                return this.state;
            })
            .then(data =>{
                this.view.render(data);
            });
    }
}

$(function () {
    const view = new View();
    const model = new Model();
    const controller = new Controller(model, view);
    controller.init();
});