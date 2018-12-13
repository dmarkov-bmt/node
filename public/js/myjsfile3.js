class View {
  constructor() {
    this.$addPlace = $('#add-place');
    this.$btnAdd = $('#btn-add');
    this.$inputTxt = $('#input-txt');
    this.$templ = $('#item-template');
    this.$todoPlace = $('#todo-place');
  }

  render(info) {
    const tmpl = _.template(this.$templ.html());
    const data = { item: info.portion };
    this.$addPlace.html(tmpl(data));
    this.$inputTxt.val('');

    $('#compl').text(info.completedItems);
    $('#act').text(info.activeItems);
    $('#current-page').text(info.currentPage);
    $('#last-page').text(info.lastPage);
  }
}

class Model {
  constructor() {
    this.mainUrl = '/todo';
  }

  addItem(value) {
    if (value.trim()) {
      return $.post(this.mainUrl, { value: value })
    }
  }

  removeItem(id) {
    return $.ajax({
      url: `${this.mainUrl}/${id}`,
      type: 'DELETE'
    })
  }

  deleteAll() {
    return $.ajax({
      url: `${this.mainUrl}`,
      type: 'DELETE'
    })
  }

  changeItem(id, value) {
    return $.ajax({
      url: `${this.mainUrl}/${id}/change`,
      type: 'PUT',
      data: { value: value }
    })
  }

  makeCompl(id) {
    return $.ajax({
      url: `${this.mainUrl}/${id}/makeCompl`,
      type: 'PUT'
    })
  }

  makeComplAll() {
    return $.ajax({
      url: `${this.mainUrl}`,
      type: 'PUT'
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
    this.render();
    this.events();
  }

  events() {
    this.view.$btnAdd.click(async () => {
      await this.model.addItem(this.view.$inputTxt.val());
      this.render();
    });
    this.view.$inputTxt.keydown(async (event) => {
      if (event.which === 13) {
        event.preventDefault();
        await this.model.addItem(this.view.$inputTxt.val());
        this.render();
      }
    });

    $('#todo-place').on('click', '.glyphicon-hourglass', async (event) => {
      let id = $(event.currentTarget).attr('data-id');
      await this.model.makeCompl(id);
      this.render();
    });
    $('#compl-all-btn').on('click', async () => {
      await this.model.makeComplAll();
      this.render();
    });
    $('#todo-place').on('click', '.glyphicon-remove', async (event) => {
      let id = $(event.currentTarget).attr('data-id');
      await this.model.removeItem(id);
      this.render();
    });
    $('#delete-all-btn').on('click', async () => {
      await this.model.deleteAll();
      this.render();
    });
    $('#todo-place').on('dblclick', 'input[disabled]', (event) => {
      $(event.currentTarget).removeAttr('disabled');
      $(event.currentTarget).focusout(async (event) => {
        let val = $(event.currentTarget).val();
        let id = $(event.currentTarget).attr('data-id');
        await this.model.changeItem(+id, val);
        this.render();
      });
    });
    $('.glyphicon-menu-left').on('click', () => {
      if (this.state.currentPage > 1) {this.state.currentPage--}
      this.render();
    });

    $('.glyphicon-menu-right').on('click', () => {
      if (this.state.currentPage < this.state.lastPage) {this.state.currentPage++}
      this.render();
    });

    $('.nav-tabs li a').on('click', (event) => {
      this.state.activeTab = ($(event.currentTarget).attr('id'));
      this.view.$todoPlace.removeClass();
      this.view.$todoPlace.addClass('tab-pane active bg-' + this.state.activeTab);
      this.render();
    })
  }

  async render() {
    let data = await $.get(`${this.model.mainUrl}?activeTab=${this.state.activeTab}&currentPage=${this.state.currentPage}&perPage=${this.state.perPage}`);
    this.state.portion = data.portion;
    this.state.lastPage = data.lastPage;
    this.state.currentPage = data.currentPage;
    this.state.activeItems = data.activeItems;
    this.state.completedItems = data.completedItems;

    this.view.render(this.state);
  }
}

$(function() {
  const view = new View();
  const model = new Model();
  const controller = new Controller(model, view);
  controller.init();
});