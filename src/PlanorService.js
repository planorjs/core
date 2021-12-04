export default class PlanorService {
  #credentials = {}

  constructor(name, channel) {
    this.name = name
    this.channel = channel
    this.client = null
    this.opts = {}
  }

  setCredentials(credentials) {
    this.#credentials = credentials
  }

  getCredentials() {
    return this.#credentials
  }

  setOpts(opts) {
    this.opts = opts
  }
}
