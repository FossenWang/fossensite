import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import {
  withStyles, InputBase, InputAdornment, TextField
} from '@material-ui/core';


const searchStyle = theme => ({
  root: {
    borderRadius: 16,
    padding: '0 8px',
    marginRight: '8px',
    transition: 'all 0.2s ease-in-out',
    borderStyle: 'solid',
    borderWidth: 1.25,
    borderColor: theme.palette.text.hint,
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
  },
  underline: {
    '&:after': {
      borderBottomColor: theme.palette.text.secondary,
    }
  }
})


class Search extends Component {
  constructor(props) {
    super(props)
    this.state = { focused: false }
  }
  submit = (e) => {
    e.preventDefault()
    let target = e.target
    let url = `/article/search/?q=${target.elements.q.value}`
    this.props.history.push(url)
  }
  focusInput = () => {
    this.setState({ focused: true })
  }
  blurInput = () => {
    this.setState({ focused: false })
  }
  textFieldSearch() {
    return (
      <form method='get' action={'/article/search/'} onSubmit={this.submit}>
        <TextField
          id={'search'} name={'q'} required placeholder={'Search...'}
          InputProps={{
            maxLength: 88,
            classes: {focused: this.props.classes.underline},
            startAdornment: (
              <InputAdornment position="start">
                <i className="fa fa-search fa-lg"></i>
              </InputAdornment>
            ),
          }}
        />
      </form>
    )
  }
  render() {
    if (this.props.useTextField) {
      return this.textFieldSearch()
    }
    let classNames = this.props.classes.root
    if (this.state.focused) {
      classNames += ' ' + this.props.classes.inputOnFocus
    }
    return (
      <form method='get' action={'/article/search/'} onSubmit={this.submit}>
        <InputBase
          id={'search'} name={'q'} required placeholder={'Search...'}
          disableunderline='true' className={classNames}
          inputProps={{
            maxLength: 88,
            onFocus: this.focusInput,
            onBlur: this.blurInput,
          }}
          startAdornment={(
            <InputAdornment position="start">
              <i className="fa fa-search fa-lg"></i>
            </InputAdornment>
          )}
        />
      </form>
    )
  }
}
Search = withRouter(withStyles(searchStyle)(Search))


export default Search
