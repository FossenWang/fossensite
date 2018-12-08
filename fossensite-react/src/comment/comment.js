import React, { Component } from 'react';
// import { Link } from "react-router-dom";
import { withStyles, Button } from '@material-ui/core';
import { commentManager } from '../resource/manager';

const commentStyle = theme => ({
  comment: {
    padding: '8px 24px',
  },
  title: {
    padding: '16px 0',
    fontSize: '1.2rem',
    borderTop: '1px solid lightgray',
  },
  input: {
    display: 'none',
  },
  submit: {
    textAlign: 'right',
    marginBottom: 16,
  },
  button: {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
    // fontSize: '0.9rem',
    minWidth: 48
  },
  textarea: {
    boxSizing: 'border-box',
    overflow: 'auto',
    resize: 'vertical',
    marginBottom: 10,
    padding: 10,
    width: '100%',
    height: '10rem',
    borderRadius: 4,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
  }
})


class CommentList extends Component {
  constructor(props) {
    super(props)
    this.state = { commentList: [] }
    this.setComments(1, 1)
  }
  setComments = async (aid, page) => {
    let key = commentManager.makeListKey(aid, page)
    let list = await commentManager.getList(key)
    console.log(list)
  }
  render() {
    let { classes } = this.props
    // let { commentList } = this.state
    return (
      <div className={classes.comment}>
        <div className={classes.title}>评论</div>
        <form id="comment_form" action="/article/comment/create/" method="get">
          <textarea name="content" rows="6" maxLength="500"
            required id="id_content" placeholder="写下你的评论..."
            className={classes.textarea} />
          <div className={classes.submit}>
            <input id='comment_submit' type="submit" className={classes.input} />
            <label htmlFor="comment_submit">
              <Button component="span" size="small" variant="outlined"
                className={classes.button}>评论</Button>
            </label>
          </div>
        </form>
      </div>
    )
  }
}
CommentList = withStyles(commentStyle)(CommentList)


export { CommentList }
