$(function () {
    formatTraining();
    selectDropdownItem();
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
            var ts = training_sets[i];
            var rest = formatRest(ts["rest"]);
            var s_rest = rest[0]+"min "+rest[1]+"s";
            s_ts +=('<div class="sets">#{} <span class="exercises" data-id="{}" data-enumber="{}">动作占位</span>'
            +'&emsp;{}~{} RM × {}组&emsp;休息: {}</div>')
            .format(ts["number"], ts["exercises"], ts["enumber"], ts["minreps"], ts["maxreps"], ts["sets"], s_rest);
        }
        result += '<div class="day"><div class="name">第 {} 天&emsp;{}</div>{}</div>'
        .format(td["number"], td["name"], s_ts);
    }
    $(".training").html(result);
}

//将秒数转为[分,秒]
function formatRest(second){
    return [parseInt(second/60), second%60];
}
//将(分,秒)转为秒
function toSecond(min, sec){
    return String(parseInt(min)*60+parseInt(sec))
}

function selectDropdownItem(){
    $(".dropdown").each(function(){
        var dropdown = $(this);
        dropdown.find(".dropdown-item").click(function(){
            dropdown.children("button").text($(this).text());
        })
    })
}