import moment from 'moment'


function formatDate(date) {
  if (typeof (date) == 'string') {
    date = new Date(date)
  }
  return moment(date).format('YYYY年M月D日 HH:mm')
}


function parseUrlParams(url) {
  let match = url.match('\\?.*$')
  let search
  if (match) {
    search = match[0]
  } else {
    return ''
  }
  let list = search.replace('?', '').split('&')
  let dict = {}
  for (let i in list) {
    let s = list[i].split('=')
    if (s.length !== 2) {
      continue
    }
    dict[s[0]] = s[1]
  }
  return dict
}


var defaultHeaders = {
  'Accept': 'application/json',
}


async function fetchPost(url, body, csrftoken, headers = {}, json = true) {
  headers = Object.assign(defaultHeaders, headers)
  if (csrftoken) { headers['X-CSRFToken'] = csrftoken }
  if (json) {
    body = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }
  let rsp = await fetch(url, {
    method: 'post',
    body: body,
    credentials: 'include',
    headers: headers,
  })
  return rsp
}


async function fetchDelete(url, csrftoken, headers = {}) {
  headers = Object.assign(defaultHeaders, headers)
  if (csrftoken) { headers['X-CSRFToken'] = csrftoken }
  let rsp = await fetch(url, {
    method: 'delete',
    credentials: 'include',
    headers: headers,
  })
  return rsp
}


export { formatDate, parseUrlParams, fetchPost, fetchDelete }
