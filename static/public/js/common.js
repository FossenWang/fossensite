$(function () {

    //设置移动端的菜单按钮
    $(".menu-toggle").click(function () {
        $("#menu").toggleClass("menu-show");
    });

    //代码高亮
    SyntaxHighlighter.all()

    //选择导航栏中当前浏览的分类
    current_category()
    //选择导航栏中当前浏览的话题
    current_topic()

    // 设置浮动内容
    $(window).scroll(function () {
        var bodyTop = 0,
            sideTop = $('.top-header').eq(0).height() + 10;
        if (typeof window.pageYOffset != 'undefined') {
            bodyTop = window.pageYOffset;
        } else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
            bodyTop = document.documentElement.scrollTop;
        } else if (typeof document.body != 'undefined') {
            bodyTop = document.body.scrollTop;
        }
        if (bodyTop > sideTop) {
            $('.float-widget').css({
                'position': 'fixed',
                'top': '10px',
                'width': '374.6px'
            });
        } else {
            $('.float-widget').css({
                'position': 'relative',
                'top': '0px',
            });
        }
    });
});

//选择导航栏中当前浏览的分类
function current_category() {
    var category_pk = $(".category-nav").attr("data-category-pk");
    $(".category-nav").find("a").each(function () {
        var pk = $(this).attr("href").split("/")[3];
        if (pk == category_pk) {
            $(this).addClass("on");
        }
    });
}

//选择导航栏中当前浏览的话题
function current_topic() {
    var topic_pk = $(".topics-nav").attr("data-topic-pk");
    $(".topics-nav").children("a").each(function () {
        var pk = $(this).attr("href").split("/")[3];
        if (pk == topic_pk) {
            $(this).addClass("on");
        }
    });
}
