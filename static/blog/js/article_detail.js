$(function () {
    //代码高亮
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

    var bodyHeight = $("body").height();
    var windowHeight = $(this).height();
    if ((bodyHeight - windowHeight) < 100) {
        //页面高度比浏览器高度小100时加载一次评论
        loadCommentWhenScollToBottom();
    }
    $(window).scroll(loadCommentWhenScollToBottom);
});

//滚动到页面底部时加载评论
function loadCommentWhenScollToBottom() {
    var docHeight = $(document).height();
    var scrollBottom = $(this).scrollTop() + $(this).height();
    if (docHeight - scrollBottom < 100) {
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

//获取评论列表
function getCommentList(page) {
    var url = $("#comment").attr("data-url");
    if (page) {
        url += "?page=" + page;
    }
    $.get(url, function (data, status) {
        //$.get()是异步请求，在得到服务器响应后才能操作相应DOM
        if (status == "success") {
            $("#comment").append(data);
            var reply_this = $(".reply-this");
            reply_this.unbind("click");
            reply_this.click(reply);
            reply_this.each(function(){
                var user_id = $("#comment-form").attr("data-login-user");
                var comment_user_id = $(this).attr("data-user-id");
                if ( user_id==comment_user_id && $(this).siblings(".delete-this").length==0){
                    $(this).after('<span class="delete-this"><i class="fa fa-trash""></i> 删除</span>');
                    $(this).siblings(".delete-this").click(openDeleteDialog);
                }
            });
            $("#comment .loading").remove();
        } else {
            $("#comment .loading").html("无法加载评论");
        }
    });
}

//打开删除对话框窗口
function openDeleteDialog() {
    var url;
    var reply_this = $(this).siblings(".reply-this");
    var comment_id = reply_this.attr("data-comment-id");
    if (comment_id) {
        url = "/article/comment/delete/" + comment_id +"/";
    }else{
        url = "/article/comment/reply/delete/" + reply_this.attr("data-reply-id") +"/";
    }
    $("#delete-comment-dialog form").attr("action", url);
    $("#delete-comment-dialog form p").last().text("评论内容：" + $(this).siblings(".content").text());
    $("#delete-comment-dialog").dialog("open");
}

//创建回复对话框
function reply() {
    var reply_id = $(this).attr("data-reply-id");
    var reply_user = $(this).siblings(".username").first().text();
    var reply_list, comment_id, reply_form;
    if (reply_id) {
        reply_list = $(this).parent().parent();
        comment_id = reply_list.siblings(".reply-this").attr("data-comment-id");
    } else {
        reply_list = $(this).siblings(".reply-list");
        comment_id = $(this).attr("data-comment-id");
    }
    if ($("#comment-form").length == 0) {
        //没有#comment-form意味着未登录
        $("body").animate({scrollTop: $("#comment .login").offset().top-100}, 500);
    } else {
        if (reply_list.siblings(".reply-form").length == 0) {
            reply_list.after('<form class="reply-form" action="/article/comment/reply/create/" method="post">'
                + '<input type="hidden" name="reply" value>'
                + '<input type="hidden" name="comment" value></form>');
            reply_form = reply_list.siblings(".reply-form");
            reply_form.append($("#comment-form").html());
            reply_form.find("input[name=comment]").val(comment_id);
            reply_form.find(".submit").prepend('<span></span><span class="cancel">取消</span>');
            reply_form.find(".cancel").click(cancelReply);
        } else {
            reply_form = reply_list.siblings(".reply-form");
        }
        reply_form.find("input[name=reply]").val(reply_id);
        reply_form.find(".submit span").first().html('<i class="fa fa-reply"></i> 回复 ' + reply_user);
        $("body").animate({ scrollTop: reply_form.offset().top - 100 }, 500);
    }
}
function cancelReply() {
    $(this).parent().parent().remove();
}