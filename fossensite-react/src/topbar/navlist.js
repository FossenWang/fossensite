import React, { Component } from 'react';
import { List, ListItem, Hidden } from '@material-ui/core';


var cates = ['技术', '随笔']


class NavItem extends Component {
  static defaultProps = {}
  render() {
    return (
      <ListItem {...this.props} style={{ whiteSpace: 'nowrap' }}>
        <a href='/'>{this.props.children}</a>
      </ListItem>
    )
  }
}


class NavList extends Component {
  render() {
    cates = ['首页', '文章'].concat(cates)
    let items = cates.map(
      (value, index) => {
        return <NavItem key={index}>{value}</NavItem>
      })
    return (
      <Hidden smDown implementation={'css'}>
        <List style={{ display: 'flex', flexDirection: 'row' }}>
          {items}
        </List>
      </Hidden>
    )
  }
}


export default NavList
