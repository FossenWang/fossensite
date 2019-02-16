# fossensite
该项目为[Fossen的个人博客](https://www.fossen.cn/)源码，采用前后端分离的架构

* 后端基于[django](https://www.djangoproject.com/)框架开发，
使用[gunicorn](http://docs.gunicorn.org/en/stable/)做wsgi服务器，
数据库使用[PostgreSQL](https://www.postgresql.org/),
运行于[docker](https://www.docker.com/)容器中，
由[nginx](http://nginx.org/en/docs/)代理

* 前端基于[react](https://reactjs.org/)开发，
[material-ui](https://material-ui.com/)作为ui库，
使用了[jsx](https://reactjs.org/docs/introducing-jsx.html)和[jss](https://github.com/cssinjs/jss)技术，html与css统一用js编写，
页面路由通过[react-router](https://reacttraining.com/react-router/web/guides/quick-start)实现

* 网站后台集成了[simditor](https://simditor.tower.im/)（富文本编辑器）用以编辑文章，文章详情页集成了[highlight.js](https://highlightjs.org/)实现代码高亮

* 其他功能：GitHub的第三方登录，多级评论等
