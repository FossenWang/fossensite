import React, { Component } from 'react';
import './header.css';

class Header extends Component {
  render() {
    return (
      <header>
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <nav class="navbar navbar-expand">
                <i class="fa fa-bars fa-lg menu-toggle"></i>
                <a class="logo" href="/">FOSSEN</a>
                <ul class="navbar-nav" id="menu">
                  <li>
                    <a href="/">首页</a>
                  </li>
                  <li>
                    <a href="#">文章</a>
                  </li>
                  <li>
                    <a href="#"></a>
                  </li>
                </ul>
                <div class="tools">
                  <i class="fa fa-search fa-lg"></i>
                  <form method="get" action="/article/search/" id="search">
                    <input name="q" type="text" maxlength='88' required placeholder="Search..." />
                  </form>
                  <i class="fa fa-user fa-lg"></i>
                  <div id="userbar">
                    <a href="#">
                      <i class="fa fa-circle notice"></i>
                    </a>
                    <a href="#">注销</a>
                    <a href="#">登录</a>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
