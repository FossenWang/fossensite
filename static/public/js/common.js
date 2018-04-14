//定义全局变量
var exercise_list;//存储动作列表

$(function () {
    //判断有无touchend事件
    if(typeof(document.ontouchend)!="undefined"){
        FastClick.attach(document.body);
    }

    //查询当前窗口大小
    mediaQuery();
    $(window).resize(mediaQuery);

    /*/ 设置浮动内容
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
    });*/
    //$('.dropdown-toggle').dropdown();
});

//字符串格式化
String.prototype.format = function() {
    var array = this.split("{}");
    var n = array.length;
    var result = [];
    for (var i=0;i<n-1;i++){
        result.push(array[i]);
        result.push(arguments[i]);
    }
    result.push(array[n-1])
    return result.join("");
}

//查询当前窗口大小
function mediaQuery(){
    if (window.innerWidth > 992){
        largeDevice();
    }else{
        smallDevice();
    }
}

//桌面端设置
function largeDevice(){
    //清空事件
    $(document).unbind("click", hideUnits);
    $(".menu-toggle, #search input, .fa-user, #userbar").unbind("click");
    //设置桌面端的搜索按钮
    $(".fa-search").on("click",function (e) {
        e.stopPropagation();
        $("#search input").focus();
    });
}

//移动端设置
function smallDevice(){
    //清空事件
    $(document).unbind("click", hideUnits);
    $(".menu-toggle, .fa-search, #search input, .fa-user, #userbar").unbind("click");

    //设置移动端的菜单按钮
    $(".menu-toggle").on("click", function(e){
        e.stopPropagation();
        $("#menu").toggleClass("menu-show");
    });

    //设置移动端的搜索按钮
    $(".fa-search").on("click",function (e) {
        e.stopPropagation();
        $("#search input").toggleClass("search-show");
        setTimeout(function(){ $("#search input").focus(); }, 100)
    });
    $("#search input").on("click",function (e){
        e.stopPropagation();
    });

    //设置移动端的用户按钮
    $(".fa-user").on("click",function (e) {
        e.stopPropagation();
        $("#userbar").toggleClass("userbar-show");
    });
    $("#userbar").on("click",function (e){
        e.stopPropagation();
    });

    //点击页面其他地方隐藏部件
    $(document).on("click", hideUnits);
}

//隐藏部件
function hideUnits(){
    $('#menu').removeClass("menu-show");
    $("#search input").removeClass("search-show");
    $("#userbar").removeClass("userbar-show")
}

//获取动作列表
function getExerciseList(afterGetData){
    //console.log(JSON.parse(localStorage.exercise_list_data));
    localStorage.removeItem('exercise_list_data');
    if (exercise_list!=undefined){
        afterGetData(exercise_list);
    }else if(typeof(Storage)!=undefined){
        if (localStorage.exercise_list_data!=undefined){
            exercise_list = JSON.parse(localStorage.exercise_list_data);
            var now = new Date();
            var save_date = new Date(exercise_list.save_date);
            //判断是否过期
            if ((now-save_date)/1000/60/60 < 24){
                afterGetData(exercise_list);
                return;
            }
        }
        $.getJSON('/fitness/exercise-list/json/',function(data){
            data.save_date = new Date();
            localStorage.exercise_list_data = JSON.stringify(data);
            exercise_list = data;
            afterGetData(data);
        });
    }else {
        $.getJSON('/fitness/exercise-list/json/', function(data){
            exercise_list = data;
            afterGetData(data);
        });
    }
}