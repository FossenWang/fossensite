class Exception {
  constructor(msg = 'Error') {
    this.msg = msg
  }
}


class NotImplementedError extends Exception {
  constructor(msg = 'Not Implemented') {
    super(msg)
  }
}


class HttpError extends Exception {
  constructor(msg = 'Page Not Found', code) {
    super(msg)
    this.code = code
  }
}


class Http404 extends HttpError {
  constructor(msg = 'Page Not Found', code=404) {
    super(msg, code)
  }
}


class HttpForbidden extends HttpError {
  constructor(msg = 'Forbidden', code=403) {
    super(msg, code)
  }
}


export { Exception, NotImplementedError, HttpError, Http404, HttpForbidden }
