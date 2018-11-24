import React, { Component, Fragment } from 'react';
import { withStyles, Card } from '@material-ui/core';



const cardStyle = theme => ({
  card: {
    padding: 10,
    marginBottom: 8,
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
        <p className={classes.title}>{title}</p>
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
      return <a key={index} href={item.url} target={this.props.target?this.props.target:null}>{item.value}</a>
    })
    return (<div className={classes.root}>{chips}</div>)
  }
}

LinkChips = withStyles(linkChipsStyle)(LinkChips)


class TopicCard extends Component {
  constructor(props) {
    super(props)
    this.state = {topicList: []}
    this.getTopicList()
  }
  render() {
    return (
      <TitleCard title={'话题'}>
        <LinkChips list={this.state.topicList}></LinkChips>
      </TitleCard>
    )
  }
  getTopicList = () => {
    let topicList = [
      {name: '想法', id: 1},
      {name: 'Python', id: 2},
      {name: 'Django', id: 3},
      {name: '数据库', id: 4},
    ]
    topicList.forEach((value) => {
      value.url = `/article/topic/${value.id}`
      value.value = value.name
    })
    setTimeout(() => (this.setState({topicList: topicList})), 100)
  }
}


class FriendLinkCard extends Component {
  constructor(props) {
    super(props)
    this.state = {list: []}
    this.getList()
  }
  render() {
    return (
      <TitleCard title={'友情链接'}>
        <LinkChips list={this.state.list} target={'_blank'}></LinkChips>
      </TitleCard>
    )
  }
  getList = () => {
    let list = [
      {name: '想法', id: 1},
      {name: 'Python', id: 2},
      {name: 'Django', id: 3},
      {name: '数据库', id: 4},
    ]
    list.forEach((value) => {
      value.url = `/article/topic/${value.id}`
      value.value = value.name
    })
    setTimeout(() => (this.setState({list: list})), 100)
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


export default SideBar
