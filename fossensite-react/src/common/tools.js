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
    if ( s.length !== 2 ) {
      continue
    }
    dict[s[0]] = s[1]
  }
  return dict
}


export { formatDate, parseUrlParams }
