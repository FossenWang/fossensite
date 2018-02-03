$(function () {
    //代码高亮
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

    var bodyHeight = $("body").height();
    var windowHeight = $(this).height();
    if ((bodyHeight-windowHeight)<0){
        //页面高度小于浏览器高度时加载一次评论
        loadCommentWhenScollToBottom();
    }
    $(window).scroll(loadCommentWhenScollToBottom);
});

//滚动到页面底部时加载评论
function loadCommentWhenScollToBottom() {
    var docHeight = $(document).height();
    var scrollBottom = $(this).scrollTop() + $(this).height();
    if (docHeight - scrollBottom == 0) {
        if ($("#comment .loading").length == 0) {
            //防止重复加载
            $("#comment").append('<div class="loading" style="text-align:center;"><i class="fa fa-spinner fa-spin fa-3x"></i></div>');
            var last_ul = $("#comment>ul").last();
            if (last_ul.length == 0) {
                getCommentList();
            } else if (last_ul.attr("data-next") == "True") {
                var page = parseInt(last_ul.attr("data-page"));
                getCommentList(page + 1);
            } else {
                //评论加载完毕，不再发送请求
                $(window).unbind("scroll");
                $("#comment .loading").remove()
            }
        }
    }
}

function getCommentList(page) {
    var url = $("#comment").attr("data-url");
    if (page) {
        url += "?page=" + page;
    }
    $.get(url, function (data, status) {
        if (status == "success") {
            $("#comment").append(data);
        } else {
            $("#comment").append("网络好像出问题了");
        }
        //$.get()是异步请求，在得到服务器响应后移除加载中div
        $("#comment .loading").remove();
    })
}
