import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Card } from '@material-ui/core';

import { topicManager, linkManager } from '../resource/manager'


const cardStyle = theme => ({
  card: {
    padding: 10,
    marginBottom: 8,
    width: 'inherit',
    '& P': {
      padding: 10,
      margin: 0,
    }
  },
  title: {
    borderBottom: '1px solid lightgray',
    padding: 10,
    marginBottom: 0,
  },
})


class TitleCard extends Component {
  render() {
    let { classes, title, children } = this.props
    return (
      <Card className={classes.card}>
        {title ? <p className={classes.title}>{title}</p> : null}
        {children}
      </Card>
    )
  }
}

TitleCard = withStyles(cardStyle)(TitleCard)


const profileStyle = theme => ({
  social: {
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid lightgray',
    paddingBottom: 0,
    '& li': {
      marginRight: 10,
    }
  }
})


class Profile extends Component {
  render() {
    let { classes } = this.props
    return (
      <TitleCard title={'Fossen'}>
        <p><img src="https://avatars2.githubusercontent.com/u/31503932?v=4" alt='fossen' /></p>
        <p>红尘炼心</p>
        <ul className={classes.social}>
          <li><a target={'_blank'} href="https://github.com/FossenWang">
            <i className="fa fa-github fa-2x"></i>
          </a></li>
          <li><a target={'_blank'} href="https://www.zhihu.com/people/all-ming-yun/activities">
            <span className="fa-stack" style={{ marginTop: 0 }}>
              <i className="fa fa-circle fa-stack-2x"></i>
              <i className="fa fa-stack-1x" style={{ fontWeight: 'bold', color: 'white' }}>知</i>
            </span></a></li>
        </ul>
      </TitleCard>
    )
  }
}

Profile = withStyles(profileStyle)(Profile)


const linkChipsStyle = theme => ({
  root: {
    padding: 10,
    '& a': {
      display: 'inline-block',
      margin: '0 5px 5px 0',
      padding: '2px 10px',
      border: '1px solid #ccc',
      borderRadius: '1rem',
      lineHeight: 1.5,
    }
  }
})


class LinkChips extends Component {
  render() {
    let { classes } = this.props
    let chips = this.props.list.map((item, index) => {
      return (
        <Link key={index} to={item.url}
          target={this.props.target ? this.props.target : null}>
          {item.value}
        </Link>
      )
    })
    return (<div className={classes.root}>{chips}</div>)
  }
}

LinkChips = withStyles(linkChipsStyle)(LinkChips)


class TopicCard extends Component {
  constructor(props) {
    super(props)
    this.state = { topicList: [] }
    this.setTopicList()
  }

  async setTopicList() {
    let topicList = await topicManager.getList()
    topicList = topicList.map((item) => {
      item.url = `/article/topic/${item.id}/`
      item.value = item.name
      return item
    })
    this.setState({ topicList: topicList })
  }

  render() {
    return (
      <TitleCard title={'话题'}>
        <LinkChips list={this.state.topicList}></LinkChips>
      </TitleCard>
    )
  }
}


class FriendLinkCard extends Component {
  constructor(props) {
    super(props)
    this.state = { list: [] }
    this.getList()
  }

  async getList() {
    let list = await linkManager.getList()
    list = list.map((item) => {
      item.value = item.name
      item.url = { pathname: item.url }
      return item
    })
    this.setState({ list: list })
  }

  render() {
    return (
      <TitleCard title={'友情链接'}>
        <LinkChips list={this.state.list} target={'_blank'}></LinkChips>
      </TitleCard>
    )
  }
}


class SideBar extends Component {
  render() {
    return (
      <Fragment>
        <Profile />
        <TopicCard />
        <FriendLinkCard />
      </Fragment>
    )
  }
}


export { TitleCard, TopicCard, FriendLinkCard }
export default SideBar
