import React, { Component } from 'react';

import { withStyles, Toolbar, InputBase, InputAdornment, Grid } from '@material-ui/core';


const searchStyle = theme => ({
  root: {
    borderRadius: 16,
    padding: '0 8px',
    marginRight: '1rem',
    transition: 'all 0.2s ease-in-out',
    borderStyle: 'solid',
    borderWidth: 1.25,
    borderColor: theme.palette.text.disabled,
    maxWidth: '5rem',

    '&:hover': {
      borderColor: theme.palette.text.secondary,
    },
    '& input': {
      fontSize: '0.8rem',
      padding: '6px 0',
      transition: 'all 0.2s ease-in-out',
    }
  },
  inputOnFocus: {
    maxWidth: '12rem',
    borderColor: theme.palette.text.primary,
    '& input': {
      fontSize: '1rem',
      padding: '6px 0',
    }
  }
})


class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      focused: false,
    }
    this.focusInput = this.focusInput.bind(this)
    this.blurInput = this.blurInput.bind(this)
  }
  focusInput() {
    this.setState({ focused: true })
  }
  blurInput() {
    this.setState({ focused: false })
  }
  render() {
    let classNames = this.props.classes.root
    if (this.state.focused) {
      classNames += ' ' + this.props.classes.inputOnFocus
    }
    return (
      <InputBase
        id={'search'}
        placeholder={'Search...'}
        inputProps={{
          onFocus: this.focusInput,
          onBlur: this.blurInput,
        }}
        disableunderline='true'
        className={classNames}
        startAdornment={(
          <InputAdornment position="start">
            <i className="fa fa-search fa-lg"></i>
          </InputAdornment>
        )}
      />
    )
  }
}

Search = withStyles(searchStyle)(Search)


const userBarStyle = theme => ({
  root: {
    '& i, a': {
      marginRight: '1rem',
    },
  }
})

class UserBar extends Component {
  get_user() {
    return {
      name: 'Fossen',
      githubUrl: 'https://github.com/FossenWang',
    }
  }

  render() {
    let user = this.get_user()
    let user_link, login;
    if (user.name !== undefined) {
      user_link = <a href={user.githubUrl} target={'_blank'} >{user.name}</a>
      login = <a href="/">注销</a>
    } else {
      user_link = null
      login = <a href="/">登录</a>
    }
    return (
      <div className={this.props.classes.root}>
      <i className="fa fa-user fa-lg"></i>
      {user_link}
      {login}
      </div>
    )
  }
}

UserBar = withStyles(userBarStyle)(UserBar)


class TopToolbar extends Component {
  render() {
    return (
      <Grid container alignItems={'center'} justify={'flex-end'}>
        <Toolbar>
          <Search />
          <UserBar />
        </Toolbar>
      </Grid>
    )
  }
}


export default TopToolbar
