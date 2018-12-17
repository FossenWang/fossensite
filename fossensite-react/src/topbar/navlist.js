import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { List, ListItem, Hidden } from '@material-ui/core';

import { categoryManager } from '../resource/manager'


class NavItem extends Component {
  render() {
    return (
      <ListItem style={{ whiteSpace: 'nowrap' }}>
        <Link to={this.props.url}>{this.props.children}</Link>
      </ListItem>
    )
  }
}


class NavList extends Component {
  constructor(props) {
    super(props)
    this.state = { cates: [] }
    this.setCates()
  }

  async setCates() {
    let cates = await categoryManager.getList()
    this.setState({ cates: cates })
  }

  render() {
    let cates = [{ id: 1, url: '/article/', name: '文章' }].concat(this.state.cates)
    let items = cates.map(
      (cate) => {
        let url = cate.url ? cate.url : `/article/category/${cate.id}/`
        return <NavItem key={cate.id} url={url}>{cate.name}</NavItem>
      })
    return (
      <Hidden smDown>
        <List style={{ display: 'flex', flexDirection: 'row' }}>
          {items}
        </List>
      </Hidden>
    )
  }
}


export default NavList
