const perPage = 5;

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
        let data = {item: info.items};
        this.$addPlace.html(tmpl(data));
        this.$inputTxt.val('');

        $('#compl').text(info.completeds);
        $('#act').text(info.actives);
        $('#current-page').text(info.currentPage);
        $('#last-page').text(info.lastPage);
    }
}

class Model {
    constructor(){

    }

    addItem(value) {
        if (value.trim()) {this.itemsList.unshift({value: value, isActive: true, id: this.id++});}
    }
    removeItem(id) {
        let index = this.itemsList.findIndex(i => i.id === id);
        this.itemsList.splice(index, 1);
    }
    deleteAll(){
        this.itemsList = [];
    }
    changeItem(id, value){
        let index = this.itemsList.findIndex(i => i.id === id);
        this.itemsList[index].value = value;
    }
    activeTabList(activeTab){
        if (activeTab === 'active') {return this.itemsList.filter(word => word.isActive)}
        if (activeTab === 'completed'){return this.itemsList.filter(word => !word.isActive)}
        if (activeTab === 'all') {return this.itemsList}
    }
    itemsOnPage(itemsList) {
            return itemsList.slice(ITEMS_ON_PAGE*(this.currentPage -1), ITEMS_ON_PAGE*this.currentPage) || [];
    }
    infoPage(activeTab){
        let info = {};
        info.completeds = this.activeTabList('completed').length ;
        info.actives =  this.activeTabList('active').length ;
        let itemsCount = this.activeTabList(activeTab).length;
        if (itemsCount % ITEMS_ON_PAGE === 0 && itemsCount > 0){this.setLastPage(itemsCount / ITEMS_ON_PAGE)}
        else {this.setLastPage((itemsCount - itemsCount%ITEMS_ON_PAGE)/ ITEMS_ON_PAGE + 1)}
        if (this.currentPage > this.lastPage) this.setCurPage(this.lastPage);
        info.currentPage = this.currentPage;
        info.lastPage = this.lastPage;
        return info;
    }
    makeCompl(id){
        this.itemsList.forEach(function (elem) {if (elem.id === id) elem.isActive = false;});
    }
    makeComplAll () {
        this.itemsList.forEach(function (elem) {elem.isActive = false;});
    }
    saveLocalStorage() {
        localStorage.setItem('itemsList', JSON.stringify(this.itemsList));
        localStorage.setItem('curPage', this.currentPage);
        localStorage.setItem('lastPage', this.lastPage);
        localStorage.setItem('id', this.id);
        localStorage.setItem('activeTab', this.activeTab);
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
            activeTab: 'all'
        };
    }
    init() {

        this.events();
    }
    events(){
        this.view.$btnAdd.click(() => {
            this.model.addItem(this.view.$inputTxt.val());
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
            this.model.saveLocalStorage();
        });

        this.view.$inputTxt.keydown((event) => {
            if (event.which == 13) {
                event.preventDefault();
                this.model.addItem(this.view.$inputTxt.val());
                this.view.updateInfo(this.model.infoPage(this.model.activeTab));
                this.view.render(this.itemsOnThePage(this.model.activeTab));
            }
        });

        $('#todo-place').on('click', '.glyphicon-hourglass', (event) => {
            let id = $(event.currentTarget).attr('data-id');
            this.model.makeCompl(+id);
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        });

        $('#compl-all-btn').on('click', () => {
            this.model.makeComplAll();
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        });

        $('#todo-place').on('click','.glyphicon-remove', (event) => {
            let id = $(event.currentTarget).attr('data-id');
            this.model.removeItem(+id);
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        });

        $('#delete-all-btn').on('click',() => {
            this.model.deleteAll();
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        });

        $('#todo-place').on('dblclick','input[disabled]', (event) => {
            $(event.currentTarget).removeAttr('disabled');
            $(event.currentTarget).focusout((event) => {
                let val = $(event.currentTarget).val();
                let id = $(event.currentTarget).attr('data-id');
                this.model.changeItem(+id, val);
                this.view.updateInfo(this.model.infoPage(this.model.activeTab));
                this.view.render(this.itemsOnThePage(this.model.activeTab));
            });
        });

        $('.glyphicon-menu-left').on('click', () => {
            if (this.model.currentPage > 1){this.model.setCurPage(this.model.currentPage - 1)}
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        });

        $('.glyphicon-menu-right').on('click', () => {
            if (this.model.currentPage < this.model.lastPage){this.model.setCurPage(this.model.currentPage + 1)}
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        });

        $('.nav-tabs li a').on('click', (event) => {
            this.model.setActiveTab($(event.currentTarget).attr('id'));
            this.view.$todoPlace.removeClass();
            this.view.$todoPlace.addClass('tab-pane active bg-' + this.model.activeTab);
            this.view.updateInfo(this.model.infoPage(this.model.activeTab));
            this.view.render(this.itemsOnThePage(this.model.activeTab));
        })
    }
    itemsOnThePage(activeTab) {
        this.model.saveLocalStorage();
        let activeTabListItems = this.model.activeTabList(activeTab);
        return this.model.itemsOnPage(activeTabListItems);
    }
}

$(function () {
    const view = new View();
    const model = new Model();
    const controller = new Controller(model, view);
    controller.init();
});