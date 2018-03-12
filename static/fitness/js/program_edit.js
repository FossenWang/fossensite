$(function () {
    formatTrainingToField();
    $("#program-form").submit(trainingToJSON);
});

//将json格式的训练内容格式化为HTML表单字段
function formatTrainingToField(){
    var training_days = JSON.parse($("#id_training").val());
    var result = "";
    for (i in training_days){
        var td = training_days[i];
        var training_sets = td["sets"];
        var s_ts = "";
        for (j in training_sets){
            s_ts += formatSets(training_sets[j]);
            /*var rest = formatRest(ts["rest"]);
            s_ts +=('<div class="sets" data-type="{}"><span class="number badge">{}</span>'
            + ' <span class="exercises" data-id="{}" data-enumber="{}">动作占位</span>'
            + ' <input type="number" min=1 max=100 name="minreps" value="{}">'
            + ' ~ <input type="number" min=1 max=100 name="maxreps" value="{}">'
            + ' RM × <input type="number" min=1 max=100 name="sets" value="{}"> 组'
            + '&emsp;休息: <input type="number" min=0 max=59 name="restmin" value="{}"> min'
            + ' <input type="number" min=0 max=59 name="restsec" value="{}"> s</div>')
            .format(ts['type'], ts["number"], ts['exercises'], ts['enumber'], ts["minreps"], ts["maxreps"], ts["sets"], rest[0], rest[1]);*/
        }
        result += ('<div class="day flex-center"><div class="name">第 <span>{}</span> 天 <input value="{}"></div>'
        + '{}<button type="button" class="btn btn-secondary add-sets">添加动作</button></div>')
        .format(td["number"], td["name"], s_ts);
    }
    result += '<button type="button" class="btn btn-secondary add-day">添加训练日</button>'
    $(".training").html(result);
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
            sets.push({
                "number":number,
                "type":type,
                "exercises":exercises,
                "enumber":enumber,
                "minreps":minreps,
                "maxreps":maxreps,
                "sets":sets_number,
                "rest":rest,
            });
        });
        training_days.push({"number":number, "name":name, "sets":sets});
    });
    $("#id_cycle").val(training_days.length);
    training = JSON.stringify(training_days);
    $("#id_training").val(training);
    console.log(training);
    $(".training").html("");
}

//将trainingsets转化为HTML表单
function formatSets(ts){
    var rest = formatRest(ts["rest"]);
    return ('<div class="sets" data-type="{}"><span class="number badge">{}</span>'
    + ' <span class="exercises" data-id="{}" data-enumber="{}">动作占位</span>'
    + ' <input type="number" min=1 max=100 name="minreps" value="{}">'
    + ' ~ <input type="number" min=1 max=100 name="maxreps" value="{}">'
    + ' RM × <input type="number" min=1 max=100 name="sets" value="{}"> 组'
    + '&emsp;休息: <input type="number" min=0 max=59 name="restmin" value="{}"> min'
    + ' <input type="number" min=0 max=59 name="restsec" value="{}"> s</div>')
    .format(ts['type'], ts["number"], ts['exercises'], ts['enumber'], ts["minreps"], ts["maxreps"], ts["sets"], rest[0], rest[1]);  
}

//将秒数转为[分,秒]
function formatRest(second){
    return [parseInt(second/60), second%60];
}
//将(分,秒)转为秒
function toSecond(min, sec){
    return String(parseInt(min)*60+parseInt(sec))
}