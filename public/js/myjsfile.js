var currentpage = 1;
var lastpage = 1;
var pghlp = 1; //Количество элементов

//Добавление элемента по кнопке
$(function () {
    $(document).on('click', '#btn-add', function () {
        //Присваиваем текст из поля ввода переменной str
        let str = $('#input-txt').val();

        //Если что-то было написано, то добавляем элемент
        if (str.length >= 1) {
            //Код, который будем добавлять
            let code = '\
    <div class="row" style="margin-top: 15px" data-status="active">\
        <div class="col-md-1" style="padding-right: 0; text-align: right"> <span class="glyphicon glyphicon-hourglass" style="font-size: 15px; cursor:pointer"></span></div>\
        <input type="text" class="col-md-10" value="' + str + '" disabled>\
        <div class="col-md-1" style="padding-left: 0; cursor: pointer"><span class="glyphicon glyphicon-remove"></span></div>\
    </div> ';
            //Добавляем во вкладку "ВСЕ" и "АКТИВНЫЕ" и очищаем поле ввода
            $('#add-place').after(code);
            $('#add-place-active').after(code);
            $('#input-txt').val('');
        }
    })
});

//Добавление элемента по Enter
$('#input-txt').keydown(function (event) {
    //Если нажат Enter - делаем то же, что и при нажатии на кнопку добавления
    if (event.which == 13) {
        event.preventDefault();
        $('#btn-add').trigger('click');
    }
});

//Выполнение задания по кнопке
$(function () {
    $(document).on('click', 'div[data-status="active"] .glyphicon-hourglass', function () {
        let index = $(this).parent().parent().index('div[data-status="active"]');
        index = index % ($('div[data-status="active"]').last().index());
        let selector = 'div[data-status="active"]:eq(' + index + ')';


        $('#all ' + selector).find('.glyphicon-hourglass').attr('class', 'glyphicon glyphicon-ok');

        $('#add-place-compl').after('<div class="row" style="margin-top: 15px" data-status="complete">' + $('#all ' + selector).html() + '</div>');
        $('#all ' + selector).attr('data-status', 'complete');
        $('#active ' + selector).remove();
    });
});

//Удаление задания
$(function () {
    $(document).on('click', ' .glyphicon-remove', function () {
        let status = $(this).parent().parent().attr('data-status');
        let index = $(this).parent().parent().index('div[data-status="' + status + '"]');
        index = index % ($('div[data-status="' + status + '"]').last().index());
        let selector = 'div[data-status="' + status + '"]:eq(' + index + ')';
        if (status == 'active') {
            $('#active ' + selector).remove();
            $('#all ' + selector).remove();
        }
        else {
            let text = $(this).parent().parent().find('input').val();
            $('#completed').find('input[value = "' + text + '"]').parent().remove();
            $('#all').find('input[value = "' + text + '"]').parent().remove();
        }

        pghlp--;

    })
});

//Изменение задания по двойному клику
$(function () {
    $(document).on('dblclick', 'input[value!=""]', function () {
        $(this).removeAttr('disabled');
        $(this).focusout(function () {
            $(this).attr('disabled', 'true')
        });
    })
});

//Счётчик активных и завершенных заданий
$(function () {
    $(document).on('click', '', function () {
        let count = $('div[data-status="complete"]').last().index();
        if (count != -1) {
            $('#compl').text(count);
        }
        else {
            $('#compl').text(0)
        }
        count = $('div[data-status="active"]').last().index();
        if (count != -1) {
            $('#act').text(count);
        }
        else {
            $('#act').text(0)
        }

        let tabid = $('.tab-content .active').attr('id');

        pghlp = $('#' + tabid + ' [data-status]').last().index();
        if (tabid == 'all') {pghlp = pghlp -1;}
        if (pghlp%5 == 0) {
            lastpage = pghlp / 5;
        }
        else {
            lastpage = (pghlp - pghlp % 5) / 5 + 1;
        }
        $('#last-page').text(lastpage);
        if (currentpage > lastpage) {
            $('#current-page').text(lastpage);
        }

        $('#' + tabid + ' [data-status]').css('display', 'none');
        if (currentpage === lastpage && pghlp%5 != 0){
            for (let i = 5*(currentpage-1); i < 5*(currentpage-1) + pghlp%5; i++){
                $('#' + tabid + ' [data-status]:eq(' + i + ')').css('display', 'block')
            }
        }
        else {
            for (let i = 5*(currentpage-1); i < 5*(currentpage-1) + 5; i++){
                $('#' + tabid + ' [data-status]:eq(' + i + ')').css('display', 'block')
            }
        }
    })
});

//Кнопка "выполнить все"
$(function () {
    $(document).on('click', '#compl-all-btn', function () {
        $('#all').find('.glyphicon-hourglass').trigger('click');
        // alert('click');
    })
});

//Кнопка "удалить все"
$('#delete-all-btn').click(function () {
    $('.glyphicon-remove').trigger('click');
});

//Следующая страница
$('.glyphicon-menu-right').click(function () {
    if (currentpage != lastpage) {
        currentpage++;
    }
    $('#current-page').text(currentpage);
});

//Предыдущая страница
$('.glyphicon-menu-left').click(function () {
    if (currentpage != 1) {
        currentpage--;
    }
    $('#current-page').text(currentpage);
});