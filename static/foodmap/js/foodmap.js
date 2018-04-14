// 定义全局变量
var foodmap, center, marker_list = [], bottom_sheet;


// 初始化
$(init)
function init() {
    center = new qq.maps.LatLng(30.518498, 114.400291);
    bottom_sheet = $('.bottom-sheet');
    foodmap = new qq.maps.Map(
        document.getElementById("foodmap"),
        {
            center: center,
            zoom: 12,
            setScrollWheel: true,
        }
    );
    marker_list.push(newMarker(center, {detail:'我的位置', img:''}))
    setMarkers();
    // 监听地图点击事件
    qq.maps.event.addListener(foodmap, 'click', function() {
        bottom_sheet.removeClass('sheet-show');
        bottom_sheet.find('div pre').text('');
        bottom_sheet.find('div img').attr('src', '')
        bottom_sheet.find('div a').attr('href', '')
    });
}

// 新建标记
function newMarker(postition = center, restaurant, map = foodmap) {
    var marker = new qq.maps.Marker({
        position: postition,
        map: foodmap,
    });

    // 监听标记的点击事件
    qq.maps.event.addListener(marker, 'click', function() {
        function change(){
            bottom_sheet.addClass('sheet-show');
            bottom_sheet.find('div pre').text(restaurant.detail);
            bottom_sheet.find('div img').attr('src', restaurant.img);
            bottom_sheet.find('div a').attr('href', restaurant.url);
        }
        if (bottom_sheet.hasClass('sheet-show')){
            bottom_sheet.removeClass('sheet-show');
            setTimeout(change, 150);
        }else{
            change();
        }
    });
    return marker
}

// 设置标记
function setMarkers() {
    var res = getRestaurants();
    for (i in res) {
        pos = new qq.maps.LatLng(res[i].latitude, res[i].longitude);
        marker_list.push(newMarker(postition=pos, res[i]));
    }
}

// 获取美食信息
function getRestaurants() {
    return restaurants;
}

var restaurants = [
    {
        latitude: 30.539460,
        longitude: 114.318610,
        name: "幽灵烧烤",
        detail: "这是豆皮king之前去台湾吃东西吃到的一家\n幽灵香肠\n据说是因为躲避城管\n所以阿伯都是半夜不定时\n也没有固定的位置出摊\n因此而得名幽灵香肠\n只要出摊一定会被爱吃的台湾人找到\n一排队就是四五十人的节奏",
        url: "https://mp.weixin.qq.com/s?__biz=MzU1NDY0NDU0Mw==&mid=2247486125&amp;idx=1&amp;sn=430b1489e1c67c250988f33c067ff909&source=41#wechat_redirect",
        img: "http://mmbiz.qpic.cn/mmbiz_jpg/kGLbOrqrNXlgfiaOgiakaQpVs0AUNy0EFs0icj86bKdicWH1WLSuW6pJ5zpIJ0BfVOPP2Fqg3Qa2iaTTEDurd6zZKMw/0?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1",
    },
    {
        latitude: 30.550150,
        longitude: 114.350260,
        name: "密码局餐厅",
        detail: "可能你无数次经过这里\n就算你走到门口\n也不会想到这里还能隐藏一个好吃的馆子\n省密码管理局内部食堂\n馆子有十来年了\n曾经一直作为省XXX一些单位的内部食堂\n后处于正常对外营业状态\n看上去很不起眼\n却蕴藏着好味道\n首先招牌铜锅牛尾\n老式北京涮羊肉的碳炉\n配上精心熬制过的牛尾\n口感真的惊艳到小编了",
        url: "https://mp.weixin.qq.com/s?__biz=MzU1NDY0NDU0Mw==&mid=2247486129&amp;idx=1&amp;sn=aac32a04f70ded1263f36bc801deb0c5&source=41#wechat_redirect",
        img: "http://mmbiz.qpic.cn/mmbiz_jpg/kGLbOrqrNXk6KMX0glJicSdKpXqGpZ8UPtzibpSVndrhItErmV5hhnh4ibazlwPabiaYXdia954sQoxwfuf5mRHN6kA/0?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1",
    },
    {
        latitude: 30.525314,
        longitude: 114.341294,
        name: "恩施电网汉办餐厅",
        detail: "这间隐藏版恩施菜馆\n其实是恩施电网汉办的餐厅\n在武汉也有十几年了\n我们在友人的指引下\n在石牌岭巴厘龙虾旁的小路里面找到了\n强烈推荐沫沫鸭\n炕土豆\n腊猪蹄火锅\n豆瓣鲫鱼\n腊肉炸广椒\n苞谷饭\n然后还有恩施最具代表性的\n张关合渣\n虽然我们这次因为失误\n没有点到合渣\n但是根据小编的几位朋友评价\n这个合渣比各位去恩施旅游\n吃的那家最有名的合渣要好吃太多\n所以这个一定一定要点\n话不多说\n直接上菜",
        url: "https://mp.weixin.qq.com/s?__biz=MzU1NDY0NDU0Mw==&mid=2247486118&amp;idx=1&amp;sn=bf7fd9dcdd730195b9aae0e59e799daf&source=41#wechat_redirect",
        img: "http://mmbiz.qpic.cn/mmbiz_jpg/kGLbOrqrNXldYoiaDYWBxWwQRRgq02q6khuu35HrnlfBowen2zk3WdHdaI0NyvB8YFOicGRFGD7k8LqJBSCcibyGQ/0?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1",
    },
]
