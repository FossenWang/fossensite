$(function () {
  var csrftoken = getCookie('csrftoken');
  if ($('#id_content').length > 0) {
    $('#id_content').attr("data-autosave-confirm", "是否读取上次退出时未保存的草稿？");
    var editor = new Simditor({
      textarea: $('#id_content'),
      placeholder: "在此编辑你的文章",
      autosave: 'editor-content',
      upload: {
        url: '/api/article/upload/image/',
        params: { csrfmiddlewaretoken: csrftoken, },
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
        { name: 'Apache', value: 'apache' },
        { name: 'Java', value: 'java' },
        { name: 'CSS', value: 'css' },
        { name: 'JavaScript', value: 'javascript' },
        { name: 'HTML,XML', value: 'html' },
        { name: 'No Highlight', value: 'nohighlight' },
        { name: 'Diff', value: 'diff' },
        { name: 'SQL', value: 'sql' },
        { name: 'C++', value: 'c++' },
        { name: 'C#', value: 'cs' },
        { name: 'JSON', value: 'json' },
        { name: 'Markdown', value: 'markdown' },
      ]
    });
    $(".simditor").css({ "max-width": "730px", "overflow": "auto" });
  }
});

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
