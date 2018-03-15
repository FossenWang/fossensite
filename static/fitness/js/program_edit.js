//定义全局变量
var editing_exercises;//修改中的一组动作
var seleted_e_ids = [];//选中的动作
var e_modal_body;//动作模态框

$(function () {
    e_modal_body = $('#exercises-modal .modal-body');
    formatTrainingToField();
    $("#program-form").submit(trainingToJSON);
});

//将json格式的训练内容格式化为HTML表单字段
function formatTrainingToField() {
    var training_days = JSON.parse($("#id_training").val());
    var result = "";
    for (i in training_days) {
        result += formatDay(training_days[i]);
    }
    result += '<button type="button" class="btn btn-secondary add-day">添加训练日</button>'
    $(".training").html(result);
    getExerciseList(initializeExercise);
    //绑定点击事件
    dayOnClick($(".training"));
    $(".training .add-day").click(addTrainingDay);
}
//初始化动作相关部件
function initializeExercise(data) {
    var all_exercises = data.exercise_list;
    $('.exercises').each(function () {
        //格式化动作按钮
        var ids = $(this).attr("data-ids");
        var enumber = $(this).attr("data-enumber");
        $(this).append(formatExercises(ids, enumber, all_exercises));
        $(this).click(clickOnExercises);
    });
    //填充动作列表模态框
    var s_modal_body = '';
    for (i in all_exercises) {
        var e = all_exercises[i];
        s_modal_body += ('<button type="button" class="btn btn-light" '
            + 'data-id={} data-muscle-id={} data-equipment_id={}>{}</button>&emsp;')
            .format(e.id, e.muscle_id, e.equipment_id, e.name);
    }
    e_modal_body.html(s_modal_body);
    e_modal_body.find('button').click(function () {
        //点击要选择的动作
        var id = $(this).attr("data-id");
        console.log(seleted_e_ids);
        if ($(this).hasClass('active')) {
            console.log(seleted_e_ids.indexOf(id));
            seleted_e_ids.splice(seleted_e_ids.indexOf(id), 1);
        } else {
            seleted_e_ids.push(id);
        }
        $(this).toggleClass('active');
        console.log(seleted_e_ids);
    });
    $('#exercises-modal .modal-footer .confirm').click(confirmSelectedExercises);
}
//点击要修改的训练组动作
function clickOnExercises() {
    e_modal_body.find("button.active").each(function () { $(this).removeClass("active"); });
    seleted_e_ids.splice(0);
    editing_exercises = $(this);
    var ed_ids = editing_exercises.attr('data-ids');
    if (ed_ids!=""){seleted_e_ids = ed_ids.split(",");}
    console.log(editing_exercises.attr('data-idsadad'),seleted_e_ids);
    for (i in seleted_e_ids) {
        e_modal_body.find("[data-id={}]".format(seleted_e_ids[i])).addClass("active");
    }
}
//确认选择的动作
function confirmSelectedExercises() {
    var name;
    if (seleted_e_ids.length > 0) {
        e_modal_body.find("button.active").each(function () {
            if ($(this).attr("data-id") == seleted_e_ids[0]) {
                name = $(this).text();
            }
            $(this).removeClass('active');
        });
        var ids = seleted_e_ids.join(',');
        editing_exercises.attr('data-ids', ids);
        editing_exercises.children('button').text(name);
    }
    $(this).next().click();
}
//格式化动作
function formatExercises(ids, enumber, all_exercises) {
    var none_e = '<button type="button" class="btn btn-light" data-toggle="modal" data-target="#exercises-modal">暂无</button>';
    if (ids == '') { return none_e; }
    var id = ids.split(',')[0];
    var e;
    for (i in all_exercises) {
        if (all_exercises[i].id == id) {
            e = all_exercises[i]; break;
        }
    }
    if (e == undefined) { return none_e; }
    return '<button type="button" class="btn btn-light" data-toggle="modal" data-target="#exercises-modal">{}</button>'.format(e.name);
}
//将trainingsets转化为HTML表单
function formatSets(ts) {
    var rest = formatRest(ts["rest"]);
    return ('<div class="sets" data-type="{}"><span class="number badge">{}</span>'
        + '&emsp;<span class="exercises" data-ids="{}" data-enumber="{}"></span>'
        + '<br>&emsp;<input type="number" min=1 max=100 name="minreps" value="{}">'
        + ' ~ <input type="number" min=1 max=100 name="maxreps" value="{}">'
        + ' RM × <input type="number" min=1 max=100 name="sets" value="{}"> 组'
        + '<br>&emsp;休息: <input type="number" min=0 max=59 name="restmin" value="{}"> min'
        + ' <input type="number" min=0 max=59 name="restsec" value="{}"> s'
        + '&emsp;<button type="button" class="delete-sets btn btn-light">×</button></div>')
        .format(ts['type'], ts["number"], ts['exercises'], ts['enumber'], ts["minreps"], ts["maxreps"], ts["sets"], rest[0], rest[1]);
}
//将trainingDay转化为HTML表单
function formatDay(td) {
    var s_ts = "";
    var ts = td["sets"];
    for (j in ts) {
        s_ts += formatSets(ts[j]);
    }
    return ('<div class="day flex-center"><div class="name">第 <span>{}</span> 天 <input value="{}">'
        + '&emsp;<br><button type="button" class="day-up btn btn-light">∧</button>'
        + ' <button type="button" class="day-down btn btn-light">∨</button>'
        + ' <button type="button" class="delete-day btn btn-light">×</button></div>'
        + '{}<button type="button" class="btn btn-secondary add-sets">添加动作</button></div>')
        .format(td["number"], td["name"], s_ts);
}
//将HTML格式的训练内容格式化为json
function trainingToJSON() {
    var training_days = [];
    $(".training>.day").each(function () {
        var number = $(this).children('.name').children('span').text();
        var name = $(this).children('.name').children('input').val();
        var sets = [];
        $(this).children(".sets").each(function () {
            var type = $(this).attr("data-type");
            var number = $(this).children(".number").text();
            var exercises = $(this).children(".exercises").attr("data-ids");
            var enumber = $(this).children(".exercises").attr("data-enumber");
            var minreps = $(this).children("input[name=minreps]").val();
            var maxreps = $(this).children("input[name=maxreps]").val();
            var sets_number = $(this).children("input[name=sets]").val();
            var rest = toSecond($(this).children("input[name=restmin]").val(), $(this).children("input[name=restsec]").val());
            sets.push(new TrainingSets(number, type, exercises, enumber, minreps, maxreps, sets_number, rest));
        });
        training_days.push({ "number": number, "name": name, "sets": sets });
    });
    $("#id_cycle").val(training_days.length);
    var training = JSON.stringify(training_days);
    $("#id_training").val(training);
    $(".training").html("");
}
//将秒数转为[分,秒]
function formatRest(second) {
    return [parseInt(second / 60), second % 60];
}
//将(分,秒)转为秒
function toSecond(min, sec) {
    return String(parseInt(min) * 60 + parseInt(sec))
}
//添加一个训练日
function addTrainingDay() {
    var prev_day = $(this).prev(".day");
    var number;
    if (prev_day.length == 0) {
        number = 1;
    } else {
        number = parseInt(prev_day.children(".name").children("span").text()) + 1;
    }
    var td = new TrainingDay(number, '训练日', NaN);
    var f_day = formatDay(td);
    $(this).before(f_day);
    $(this).prev(".day").children(".add-sets").click(addTrainingSets);
    $(this).prev(".day").find(".delete-day").click(deleteTrainingDay);
}
//删除训练日
function deleteTrainingDay() {
    var this_day = $(this).parent().parent();
    var n = parseInt($(this).siblings("span").text());
    this_day.nextUntil(".add-day").each(function () {
        $(this).children(".name").children("span").text(n++);
    })
    this_day.animate({ height: 0, margin: 0, padding: 0 }, 500, function () { this_day.remove() });
}
//训练日上移
function moveDayUp() {
    var this_day = $(this).parent().parent();
    var n = parseInt($(this).siblings("span").text());
    var prev_day = this_day.prev(".day");
    if (prev_day.length > 0) {
        prev_day.children(".name").children("span").text(n);
        $(this).siblings("span").text(n - 1);
        var this_day_html = this_day.html();
        var prev_day_html = prev_day.html();
        this_day.html(prev_day_html);
        prev_day.html(this_day_html);
        $("body").animate({ scrollTop: prev_day.offset().top - 100 }, 500);
        dayOnClick(this_day);
        dayOnClick(prev_day);
    }
}
//训练日下移
function moveDayDown() {
    var this_day = $(this).parent().parent();
    var n = parseInt($(this).siblings("span").text());
    var next_day = this_day.next(".day");
    if (next_day.length > 0) {
        next_day.children(".name").children("span").text(n);
        $(this).siblings("span").text(n + 1);
        var this_day_html = this_day.html();
        var next_day_html = next_day.html();
        this_day.html(next_day_html);
        next_day.html(this_day_html);
        $("body").animate({ scrollTop: next_day.offset().top - 100 }, 500);
        dayOnClick(this_day);
        dayOnClick(next_day);
    }
}
//添加训练组
function addTrainingSets() {
    var prev_sets = $(this).prev(".sets");
    var number;
    if (prev_sets.length == 0) {
        number = 1;
    } else {
        number = parseInt(prev_sets.children(".number").text()) + 1;
    }
    var new_sets = new TrainingSets(number, "weightsets", "", 1, 8, 12, 5, 120);
    var f_sets = formatSets(new_sets);
    $(this).before(f_sets);
    $(this).prev(".sets").children(".delete-sets").click(deleteTrainingSets);
    var new_exercises = $(this).prev(".sets").children('.exercises');
    getExerciseList(function (data) {
        var ids = new_exercises.attr("data-ids");
        var enumber = new_exercises.attr("data-enumber");
        new_exercises.append(formatExercises(ids, enumber, data.exercise_list));
        new_exercises.click(clickOnExercises);
    });
}
//删除训练组
function deleteTrainingSets() {
    var n = $(this).siblings(".number").text();
    var this_sets = $(this).parent();
    this_sets.nextUntil(".add-sets").each(function () {
        $(this).children(".number").text(n++);
    })
    this_sets.animate({ height: 0, margin: 0 }, 500, function () { this_sets.remove() });
}
//训练日元素中的点击时间
function dayOnClick(day) {
    day.find(".add-sets").click(addTrainingSets);
    day.find(".delete-sets").click(deleteTrainingSets);
    day.find(".delete-day").click(deleteTrainingDay);
    day.find(".day-up").click(moveDayUp);
    day.find(".day-down").click(moveDayDown);
}
//训练组对象
function TrainingSets(number, type, exercises, enumber, minreps, maxreps, sets_number, rest) {
    this.number = number;
    this.type = type;
    this.exercises = exercises;
    this.enumber = enumber;
    this.minreps = minreps;
    this.maxreps = maxreps;
    this.sets = sets_number;
    this.rest = rest;
}
//训练日对象
function TrainingDay(number, name, sets) {
    this.number = number;
    this.name = name;
    this.sets = sets;
}