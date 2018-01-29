$(function () {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    if ($('#id_content').length > 0) {
        $('#id_content').attr("data-autosave-confirm", "是否读取上次退出时未保存的草稿？");
        var editor = new Simditor({
            textarea: $('#id_content'),
            placeholder: "在此编辑你的文章",
            autosave: 'editor-content',
            upload: {
                url: '/article/upload/image/',
                params: {'csrftoken': csrftoken,},
                fileKey: 'upload_image',
                connectionCount: 3,
                leaveConfirm: 'Uploading is in progress, are you sure to leave this page?',
            },
            toolbar: [
                'title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color',
                '|', 'code', 'link', 'image', 'blockquote',
                '|', 'hr', 'ul', 'ol', 'alignment', 'table',
                '|', 'html', 'markdown'
            ],
            codeLanguages: [
                { name: 'Python', value: 'python' },
                { name: 'Django', value: 'django' },
                { name: 'Shell', value: 'shell' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'c++' },
                { name: 'C#', value: 'cs' },
                { name: 'CSS', value: 'css' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'HTML,XML', value: 'html' },
                { name: 'JSON', value: 'json' },
                { name: 'Markdown', value: 'markdown' },
                { name: 'SQL', value: 'sql' },
                { name: 'Diff', value: 'diff' },
                { name: 'Bash', value: 'bash' },
                { name: 'Erlang', value: 'erlang' },
                { name: 'Less', value: 'less' },
                { name: 'Sass', value: 'sass' },
                { name: 'CoffeeScript', value: 'coffeescript' },
                { name: 'Objective C', value: 'oc' },
                { name: 'PHP', value: 'php' },
                { name: 'Perl', value: 'parl' },
                { name: 'Ruby', value: 'ruby' },
            ]
        });
        $(".simditor").css({ "max-width": "1200px" });
        $(".simditor-body, .simditor textarea").css({ "max-height": "400px", "overflow": "auto" });
    }
});
