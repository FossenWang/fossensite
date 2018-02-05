$(function () {

    //选择导航栏中当前浏览的分类
    var category_id = $(".category-nav").attr("data-category-id");
    $(".category-nav").find("a").each(function () {
        var id = $(this).attr("href").split("/")[3];
        if (id == category_id) {
            $(this).addClass("on");
        }
    });

    //选择导航栏中当前浏览的话题
    var topic_id = $(".topics-nav").attr("data-topic-id");
    $(".topics-nav").children("a").each(function () {
        var id = $(this).attr("href").split("/")[3];
        if (id == topic_id) {
            $(this).addClass("on");
        }
    });
});