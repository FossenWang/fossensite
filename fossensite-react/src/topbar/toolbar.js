import React, { Component } from 'react';

import { withStyles, Toolbar, InputBase, InputAdornment } from '@material-ui/core';
import { CenterGrid } from '../common/components';


const search_style = theme => ({
  root: {
    borderRadius: 16,
    padding: '0 8px',
    marginRight: 16,
    transition: 'all 0.2s ease-in-out',
    borderStyle: 'solid',
    borderWidth: 1.25,
    borderColor: theme.palette.text.disabled,
    width: '5rem',

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
    width: '12rem',
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
    this.setState({focused: true})
  }
  blurInput() {
    this.setState({focused: false})
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

Search = withStyles(search_style)(Search)


class TopToolbar extends Component {
  render() {
    return (
      <CenterGrid container justify={'flex-end'}>
        <Toolbar>
          <Search />
          <i className="fa fa-user fa-lg"></i>
        </Toolbar>
      </CenterGrid>
    )
  }
}


export default TopToolbar
