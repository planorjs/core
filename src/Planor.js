import {createMimeMessage} from 'mimetext'
import createDOMPurify from 'dompurify'
import {JSDOM} from 'jsdom'
import PlanorService from './PlanorService.js'
import PlanorTemplate from './PlanorTemplate.js'

export default class Planor {
  #domPurifier = createDOMPurify(new JSDOM('').window)
  #services = []
  #templates = []
  #templateLiterals = []
  // this is a temporary error chain that keeps errors thrown by services.
  // resets itself to its initial state after sendEmail method has done.
  #errors = []

  constructor() {

  }

  async addService(s) {
    if (s instanceof PlanorService) {
      this.#services.unshift(s)

      await this.#services[0].getClient()
    }

    return this
  }

  getServices() {
    return this.#services
  }

  addTemplate(t) {
    if (t instanceof PlanorTemplate) {
      this.#templates.unshift(t)
    }

    return this
  }

  getTemplates() {
    return this.#templates
  }

  async sendEmail(template, msgopts, oneTimeTemplateLiterals={}) {
    const matchedTemplates = this.#templates.filter(
      _t => _t.channel == 'email' && _t.id == template
    )

    if (!matchedTemplates) {
      throw new Error('MISSING_TEMPLATE')
    }

    const t = matchedTemplates[0]
    const templateLiterals = Object.assign({}, this.#templateLiterals, oneTimeTemplateLiterals)

    t.parse(templateLiterals)

    const msg = createMimeMessage()
    if (msgopts.sender) msg.setSender(msgopts.sender)
    msg.setTo(msgopts.to)
    if (msgopts.cc) msg.setCc(msgopts.cc)
    if (msgopts.bcc) msg.setBcc(msgopts.bcc)
    if (msgopts.headers) msg.setHeaders(msgopts.headers)
    if (msgopts.attachment) {
      const [filename, type, base64Data, attachmentHeaders] = msgopts.attachment
      msg.setAttachment(filename, type, base64Data, attachmentHeaders || {})
    }
    msg.setSubject(t.getSubject())
    if (t.getPlainText()) {
      msg.setMessage('text/plain', t.getPlainText())
    }
    if (t.getHtml()) {
      msg.setMessage('text/html', t.getHtml())
      msg.setMessage('text/plain', this.#generatePlainTextVersion(t.getHtml()))
    }

    return await this.#_sendEmail(msg, msgopts)
  }

  async #_sendEmail(mimemsg, msgopts, _ind=0) {
    if (_ind === 0) this.#reset()

    if (!this.#services[_ind]) {
      this.#errors.push( new Error('NO_SERVICE_TO_TRY') )
      return undefined;
    }

    const s = this.#services[_ind]

    if (s.channel != 'email') {
      return await this.#_sendEmail(mimemsg, msgopts, _ind+1)
    }

    try {
      return await s.send(mimemsg, msgopts)
    } catch (e) {
      this.#errors.push(e)
      return await this.#_sendEmail(mimemsg, msgopts, _ind+1)
    }
  }

  updateTemplateLiterals(obj) {
    this.#templateLiterals = Object.assign({}, this.#templateLiterals, obj)
    return this
  }

  getTemplateLiterals() {
    return this.#templateLiterals
  }

  getErrors() {
    return this.#errors
  }

  #generatePlainTextVersion(html) {
    return this.#domPurifier
      .sanitize(html, {ALLOWED_TAGS: []})
      .replace(/[\r\n]{2,}/gm, "\r\n")
      .replace(/[ ]{2,}/gm, ' ')
      .trim()
      .split(/[\r\n]/)
      .map(line => line.trim())
      .join("\r\n")
  }

  #reset() {
    this.#errors = []
  }
}
