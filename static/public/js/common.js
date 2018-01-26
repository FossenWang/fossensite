$(function () {

    //设置移动端的菜单按钮
    $(".menu-toggle").click(function(e){
        e.stopPropagation();
        $("#menu").toggleClass("menu-show");
    });
    //设置移动端的搜索按钮
    $(".fa-search").click(function (e) {
        e.stopPropagation();
        $("#search input").toggleClass("search-show");
        setTimeout(function(){ $("#search input").focus(); }, 100)
    });
    $("#search input").click(function (e){
        e.stopPropagation();
    });
    //设置移动端的用户按钮
    $(".fa-user").click(function (e) {
        e.stopPropagation();
        $("#userbar").toggleClass("userbar-show");
        setTimeout(function(){ $("#userbar").focus(); }, 100)
    });
    $("#userbar").click(function (e){
        e.stopPropagation();
    });

    //点击页面其他地方隐藏部件
    $(document).click(function(){
        $('#menu').removeClass("menu-show");
        $("#search input").removeClass("search-show");
        $("#userbar").removeClass("userbar-show")
    });

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
