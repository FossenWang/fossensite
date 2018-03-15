$(function () {
    formatTraining();
});

//将json格式的训练内容格式化为HTML
function formatTraining(){
    var training_days = JSON.parse($(".training").html());
    var result = "";
    for (i in training_days){
        var td = training_days[i];
        var training_sets = td["sets"];
        var s_ts = "";
        for (j in training_sets){
            var ts = training_sets[j];
            var rest = formatRest(ts["rest"]);
            var s_rest;
            if (rest[0]==0){
                s_rest = rest[1]+"s";
            }else if(rest[1]==0){
                s_rest = rest[0]+"min";
            }else {
                s_rest = rest[0]+"min "+rest[1]+"s";
            }
            //getExerciseList(function(data){formatExercises(ids, data)});
            s_ts +=('<div class="sets"><span class="number badge">{}</span>'
            +'&emsp;<span class="exercises dropdown" data-ids="{}" data-enumber="{}"></span>'
            +'<br>&emsp;{}~{} RM × {}组&emsp;休息: {}</div>')
            .format(ts["number"], ts["exercises"], ts["enumber"], ts["minreps"], ts["maxreps"], ts["sets"], s_rest);
        }
        result += '<div class="day"><div class="name">第 {} 天&emsp;{}</div>{}</div>'
        .format(td["number"], td["name"], s_ts);
    }
    $(".training").html(result);
    getExerciseList(initializeExercises);
}

//将秒数转为[分,秒]
function formatRest(second){
    return [parseInt(second/60), second%60];
}
//将(分,秒)转为秒
function toSecond(min, sec){
    return String(parseInt(min)*60+parseInt(sec))
}

//初始化动作回调函数，在获取了动作库数据以后调用
function initializeExercises(data){
    var all_exercises = data.exercise_list;
    $('.exercises').each(function(){
        var ids = $(this).attr("data-ids");
        var enumber = $(this).attr("data-enumber");
        $(this).append(formatExercises(ids, enumber, all_exercises));
    });
    selectDropdownItem();
}
//格式化动作
function formatExercises(ids, enumber, all_exercises){
    var s_exercises='';
    if (ids==''){return '<button type="button" class="btn btn-light">暂无</button>';}
    ids = ids.split(',');
    for (n in ids){
        var e;
        for (i in all_exercises){
            if (all_exercises[i].id == ids[n]){
                e = all_exercises[i];break;
            }
        }
        if (e==undefined){continue;}
        if (n==0){
            s_exercises += ('<button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown">{}</button>'
            +'<div class="dropdown-menu">').format(e.name);
        }
        s_exercises += '<div class="dropdown-item">{}</div>'
        .format(e.name);
    }
    s_exercises += '</div>';
    return s_exercises;
}

function selectDropdownItem(){
    $(".dropdown").each(function(){
        var dropdown = $(this);
        dropdown.find(".dropdown-item").click(function(){
            dropdown.children("button").text($(this).text());
        })
    })
}