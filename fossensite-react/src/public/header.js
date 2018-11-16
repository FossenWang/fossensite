import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';


const header_style = {
  root: {
    display: 'block',
    // '& p': {
    //   background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
    // },
  },
}


const grid_style = {
  container: {
    // 始终上下居中
    alignItems: 'center',
    // 左右居中
    // justifyContent: 'center',
    padding: '0px 16px',
    margin: '0px auto',
    '@media (min-width: 1280px)': {
      maxWidth: 1140,
    },
  },
}


class LgUpHidden extends Component{
  render() {
    let props = Object.assign({}, this.props)
    props.implementation = 'css'
    props.initialWidth = 'lg'
    props.lgUp = true
    return Hidden(props)
  }
}


const CenterGrid = withStyles(grid_style)(Grid)


class Header extends Component {
  render() {
    return (
      <AppBar classes={this.props.classes}>
        <CenterGrid container lg>
          <LgUpHidden><i className="fa fa-bars fa-lg"></i></LgUpHidden>
          <Typography>Fossen</Typography>
        </CenterGrid>
      </AppBar>
      // <div class="container">
      //   <div class="row">
      //     <div class="col-lg-12">
      //       <nav class="navbar navbar-expand">
      //         <i class="fa fa-bars fa-lg menu-toggle"></i>
      //         <a class="logo" href="/">FOSSEN</a>
      //         <ul class="navbar-nav" id="menu">
      //           <li>
      //             <a href="/">首页</a>
      //           </li>
      //           <li>
      //             <a href="/">文章</a>
      //           </li>
      //           <li>
      //             <a href="/">技术</a>
      //           </li>
      //         </ul>
      //         <div class="tools">
      //           <i class="fa fa-search fa-lg"></i>
      //           <form method="get" action="/article/search/" id="search">
      //             <input name="q" type="text" maxlength='88' required placeholder="Search..." />
      //           </form>
      //           <i class="fa fa-user fa-lg"></i>
      //           <div id="userbar">
      //             <a href="/">
      //               <i class="fa fa-circle notice"></i>
      //             </a>
      //             <a href="/">注销</a>
      //             <a href="/">登录</a>
      //           </div>
      //         </div>
      //       </nav>
      //     </div>
      //   </div>
      // </div>
    );
  }
}

export default withStyles(header_style)(Header);
