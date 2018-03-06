$(function () {
    formatTraining();
});

function formatTraining(){
    var training_days = JSON.parse($(".training").html());
    var result = "";
    for (i in training_days){
        var td = training_days[i];
        var training_sets = td["sets"];
        var s_ts = "";
        for (j in training_sets){
            var ts = training_sets[i]
            s_ts +='<div class="sets">#{} {} 动作占位 {}~{} RM × {}组 休息:{}s</div>'
            .format(ts["number"], ts["type"], ts["minreps"], ts["maxreps"], ts["sets"], ts["rest"]);
        }
        result += '<div class="day"><div class="name">Day {} {}</div>{}</div>'
        .format(td["number"], td["name"], s_ts);
    }
    $(".training").html(result);
}