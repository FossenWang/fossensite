$(function () {
    formatTrainingToField();
    $("#program-form").submit(trainingToJSON);
});

//将json格式的训练内容格式化为HTML表单字段
function formatTrainingToField(){
    var training_days = JSON.parse($("#id_training").val());
    var result = "";
    for (i in training_days){
        result += formatDay(training_days[i]);
    }
    result += '<button type="button" class="btn btn-secondary add-day">添加训练日</button>'
    $(".training").html(result);
    //绑定点击事件
    dayOnClick($(".training"));
    $(".training .add-day").click(addTrainingDay);
}

//将trainingsets转化为HTML表单
function formatSets(ts){
    var rest = formatRest(ts["rest"]);
    return ('<div class="sets" data-type="{}"><span class="number badge">{}</span>'
    + ' <span class="exercises" data-ids="{}" data-enumber="{}">动作占位</span>'
    + '<br>&emsp;<input type="number" min=1 max=100 name="minreps" value="{}">'
    + ' ~ <input type="number" min=1 max=100 name="maxreps" value="{}">'
    + ' RM × <input type="number" min=1 max=100 name="sets" value="{}"> 组'
    + '<br>&emsp;休息: <input type="number" min=0 max=59 name="restmin" value="{}"> min'
    + ' <input type="number" min=0 max=59 name="restsec" value="{}"> s'
    + '&emsp;<button type="button" class="delete-sets btn btn-light">×</button></div>')
    .format(ts['type'], ts["number"], ts['exercises'], ts['enumber'], ts["minreps"], ts["maxreps"], ts["sets"], rest[0], rest[1]);  
}
function formatDay(td){
    var s_ts = "";
    var ts = td["sets"];
    for (j in ts){
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
function trainingToJSON(){
    var training_days = [];
    $(".training>.day").each(function(){
        var number = $(this).children('.name').children('span').text();
        var name = $(this).children('.name').children('input').val();
        var sets = [];
        $(this).children(".sets").each(function(){
            var type = $(this).attr("data-type");
            var number = $(this).children(".number").text();
            var exercises = $(this).children(".exercises").attr("data-id");
            var enumber = $(this).children(".exercises").attr("data-enumber");
            var minreps = $(this).children("input[name=minreps]").val();
            var maxreps = $(this).children("input[name=maxreps]").val();
            var sets_number = $(this).children("input[name=sets]").val();
            var rest = toSecond($(this).children("input[name=restmin]").val(),$(this).children("input[name=restsec]").val());
            sets.push(new TrainingSets(number,type,exercises,enumber,minreps,maxreps,sets_number,rest));
        });
        training_days.push({"number":number, "name":name, "sets":sets});
    });
    $("#id_cycle").val(training_days.length);
    var training = JSON.stringify(training_days);
    $("#id_training").val(training);
    $(".training").html("");
}

//将秒数转为[分,秒]
function formatRest(second){
    return [parseInt(second/60), second%60];
}
//将(分,秒)转为秒
function toSecond(min, sec){
    return String(parseInt(min)*60+parseInt(sec))
}

//添加一个训练日
function addTrainingDay(){
    var prev_day = $(this).prev(".day");
    var number;
    if (prev_day.length==0){
        number = 1;
    }else{
        number = parseInt(prev_day.children(".name").children("span").text())+1;
    }
    var td = new TrainingDay(number,'训练日',NaN);
    var f_day = formatDay(td);
    $(this).before(f_day);
    $(this).prev(".day").children(".add-sets").click(addTrainingSets);
    $(this).prev(".day").find(".delete-day").click(deleteTrainingDay);
}
//删除训练日
function deleteTrainingDay(){
    var this_day = $(this).parent().parent();
    var n = parseInt($(this).siblings("span").text());
    this_day.nextUntil(".add-day").each(function(){
        $(this).children(".name").children("span").text(n++);
    })
    this_day.remove();
}
function moveDayUp(){
    var this_day = $(this).parent().parent();
    var n = parseInt($(this).siblings("span").text());
    var prev_day = this_day.prev(".day");
    if (prev_day.length>0){
        prev_day.children(".name").children("span").text(n);
        $(this).siblings("span").text(n-1);
        var this_day_html = this_day.html();
        var prev_day_html = prev_day.html();
        this_day.html(prev_day_html);
        prev_day.html(this_day_html);
        $("body").animate({ scrollTop: prev_day.offset().top - 100 }, 500);
        dayOnClick(this_day);
        dayOnClick(prev_day);
    }
}
function moveDayDown(){
    var this_day = $(this).parent().parent();
    var n = parseInt($(this).siblings("span").text());
    var next_day = this_day.next(".day");
    if (next_day.length>0){
        next_day.children(".name").children("span").text(n);
        $(this).siblings("span").text(n+1);
        var this_day_html = this_day.html();
        var next_day_html = next_day.html();
        this_day.html(next_day_html);
        next_day.html(this_day_html);
        $("body").animate({ scrollTop: next_day.offset().top - 100 }, 500);
        dayOnClick(this_day);
        dayOnClick(next_day);
    }}
//添加训练动组
function addTrainingSets(){
    var prev_sets = $(this).prev(".sets");
    var number;
    if (prev_sets.length==0){
        number = 1;
    }else{
        number = parseInt(prev_sets.children(".number").text())+1;
    }
    var new_sets = new TrainingSets(number,"weightsets","",1,8,12,5,120);
    var f_sets = formatSets(new_sets);
    $(this).before(f_sets);
    $(this).prev(".sets").children(".delete-sets").click(deleteTrainingSets);
}
//删除训练组
function deleteTrainingSets(){
    var n = $(this).siblings(".number").text();
    var this_sets = $(this).parent();
    this_sets.nextUntil(".add-sets").each(function(){
        $(this).children(".number").text(n++);
    })
    this_sets.remove();
}

function dayOnClick(day){
    day.find(".add-sets").click(addTrainingSets);
    day.find(".delete-sets").click(deleteTrainingSets);
    day.find(".delete-day").click(deleteTrainingDay);
    day.find(".day-up").click(moveDayUp);
    day.find(".day-down").click(moveDayDown);
}
//训练组对象
function TrainingSets(number,type,exercises,enumber,minreps,maxreps,sets_number,rest){
    this.number=number;
    this.type=type;
    this.exercises=exercises;
    this.enumber=enumber;
    this.minreps=minreps;
    this.maxreps=maxreps;
    this.sets=sets_number;
    this.rest=rest;
}
//训练日对象
function TrainingDay(number,name,sets){
    this.number=number;
    this.name=name;
    this.sets=sets;
}