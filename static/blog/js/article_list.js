$(function () {

    //选择导航栏中当前浏览的分类
    var category_pk = $(".category-nav").attr("data-category-pk");
    $(".category-nav").find("a").each(function () {
        var pk = $(this).attr("href").split("/")[3];
        if (pk == category_pk) {
            $(this).addClass("on");
        }
    });

    //选择导航栏中当前浏览的话题
    var topic_pk = $(".topics-nav").attr("data-topic-pk");
    $(".topics-nav").children("a").each(function () {
        var pk = $(this).attr("href").split("/")[3];
        if (pk == topic_pk) {
            $(this).addClass("on");
        }
    });
});