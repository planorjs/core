import mjml2html from 'mjml'

export default class PlanorTemplate {
  #reParser = /({{)[^{}]+(}})/gm
  #supportedContentTypes = ['text/plain', 'text/html', 'text/mjml']
  #subject = null
  #plaintext = null
  #html = null

  constructor(channel, id, locale, template) {
    this.id = id
    this.channel = channel
    this.locale = locale
    this.template = Array.isArray(template) ? template : [template]

    this.#verifyTemplate()
  }

  parse(templateLiterals={}) {
    // title or sms text
    const parsed0 = this.#_parse(this.template[0].template, templateLiterals)

    if (this.channel == 'email') this.#subject = parsed0
    if (this.channel == 'sms') this.#plaintext = parsed0

    // email content
    if (this.template.length > 1) {
      const parsed1 = this.#_parse(this.template[1].template, templateLiterals)

      if (this.template[1].type == 'text/mjml') {
        this.#html = mjml2html(parsed1, {keepComments: false}).html
      }

      if (this.template[1].type == 'text/html') {
        this.#html = parsed1
      }

      if (this.template[1].type == 'text/plain') {
        this.#plaintext = parsed1
      }
    }

    return this
  }

  getSubject() {
    return this.#subject
  }

  getPlainText() {
    return this.#plaintext
  }

  getHtml() {
    return this.#html
  }

  #_parse(str, props={}) {
    if (!props || Object.keys(props).length === 0) {
      return str
    }

    const matches = str.match(this.#reParser)

    if (!matches) {
      return str
    }

    return matches.reduce((memo, exp) => {
      const prop = exp.slice(2, -2)

      if (props.hasOwnProperty(prop)) {
        memo = memo.replace(exp, props[prop])
      }

      return memo
    }, str)
  }

  #verifyTemplate() {
    if (this.channel == 'email' && this.template.length !== 2) {
      throw new Error('INVALID_TEMPLATE')
    }

    if (this.channel == 'sms' && this.template.length !== 1) {
      throw new Error('INVALID_TEMPLATE')
    }

    for (var i = 0; i < this.template.length; i++) {
      if (typeof this.template[i] == 'string') {
        this.template[i] = {type: 'text/plain', template: this.template[i]}
      }

      if (Object.prototype.toString.call(this.template[i]) != '[object Object]') {
        throw new Error('INVALID_TEMPLATE')
      }

      if (this.channel == 'sms' && this.template[i].type != 'text/plain') {
        throw new Error('INVALID_TEMPLATE')
      }

      if (this.#supportedContentTypes.indexOf(this.template[i].type) === -1) {
        throw new Error('INVALID_TEMPLATE')
      }

      if (!this.template[i].template) {
        throw new Error('INVALID_TEMPLATE')
      }
    }
  }
}
