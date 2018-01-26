$(function() {
    var editor = new Simditor({
        textarea: $('#id_content'),
        placeholder: "在此编辑你的文章",
        autosave: 'editor-content',
        toolbar: [
            'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color',
            '|', 'code', 'link', 'image', 'blockquote', 
            '|', 'ol', 'ul', 'hr', 'alignment', 'table','|', 'html'
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
    $(".simditor").css({"max-width":"1200px"});
    $(".simditor-body").css({"max-height":"400px", "overflow":"auto"});
});
