$(function () {

    //代码高亮
    $('pre code').css({"background":"#f6f8fa"})
    .each(function(i, block) {
        hljs.highlightBlock(block);
    });

});