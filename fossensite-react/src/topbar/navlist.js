import React, { Component } from 'react';
import { List, ListItem } from '@material-ui/core';


var cates = ['技术', '随笔']


class NavList extends Component {
  render() {
    let items = cates.map(
      (value, index) => {
        return <ListItem key={index}>{value}</ListItem>
      })
    return (
      <List>
        <ListItem>首页</ListItem>
        <ListItem>文章</ListItem>
        {items}
      </List>)
  }
}


export default NavList
