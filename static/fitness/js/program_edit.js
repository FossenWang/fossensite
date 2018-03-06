$(function () {
    formatTraining();
    trainingToJSON();
});

//将json格式的训练内容格式化为HTML
function formatTraining(){
    var training_days = JSON.parse($("#id_training").val());
    var result = "";
    for (i in training_days){
        var td = training_days[i];
        var training_sets = td["sets"];
        var s_ts = "";
        for (j in training_sets){
            var ts = training_sets[i];
            var rest = formatTime(ts["rest"]);
            s_ts +=('<div class="sets" data-type="{}">#<span class="number">{}</span> <span class="exercises" data-id="{}" data-enumber="{}">动作占位</span> '
            + '<input type="number" min=1 max=100 name="minreps" value="{}">'
            + ' ~ <input type="number" min=1 max=100 name="maxreps" value="{}">'
            + ' RM × <input type="number" min=1 max=100 name="sets" value="{}"> 组'
            + '&emsp;休息: <input type="number" min=0 max=59 name="restmin" value="{}"> min'
            + ' <input type="number" min=0 max=59 name="restsec" value="{}"> s</div>')
            .format(ts['type'], ts["number"], ts['exercises'], ts['enumber'], ts["minreps"], ts["maxreps"], ts["sets"], rest[0], rest[1]);
        }
        result += '<div class="day"><div class="name">Day <span>{}</span> <input value="{}"></div>{}</div>'
        .format(td["number"], td["name"], s_ts);
    }
    $(".training").html(result);
}

//将秒数转为[分,秒]
function formatTime(second){
    var time = [];
    time.push(parseInt(second/60));
    time.push(second%60);
    return time;
}
//将(分,秒)转为秒
function toSecond(min, sec){
    return parseInt(min)*60+parseInt(sec) + ''
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
        training = JSON.stringify(training_days);
        console.log(training);
    });
}
