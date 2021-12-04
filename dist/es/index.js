import { createMimeMessage } from 'mimetext';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import mjml2html from 'mjml';

class PlanorService {
  #credentials = {}

  constructor(name, channel) {
    this.name = name;
    this.channel = channel;
    this.client = null;
    this.opts = {};
  }

  setCredentials(credentials) {
    this.#credentials = credentials;
  }

  getCredentials() {
    return this.#credentials
  }

  setOpts(opts) {
    this.opts = opts;
  }
}

class PlanorTemplate {
  #reParser = /({{)[^{}]+(}})/gm
  #supportedContentTypes = ['text/plain', 'text/html', 'text/mjml']
  #subject = null
  #plaintext = null
  #html = null

  constructor(channel, id, locale, template) {
    this.id = id;
    this.channel = channel;
    this.locale = locale;
    this.template = Array.isArray(template) ? template : [template];

    this.#verifyTemplate();
  }

  parse(templateLiterals={}) {
    // title or sms text
    const parsed0 = this.#_parse(this.template[0].template, templateLiterals);

    if (this.channel == 'email') this.#subject = parsed0;
    if (this.channel == 'sms') this.#plaintext = parsed0;

    // email content
    if (this.template.length > 1) {
      const parsed1 = this.#_parse(this.template[1].template, templateLiterals);

      if (this.template[1].type == 'text/mjml') {
        this.#html = mjml2html(parsed1, {keepComments: false}).html;
      }

      if (this.template[1].type == 'text/html') {
        this.#html = parsed1;
      }

      if (this.template[1].type == 'text/plain') {
        this.#plaintext = parsed1;
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

    const matches = str.match(this.#reParser);

    if (!matches) {
      return str
    }

    return matches.reduce((memo, exp) => {
      const prop = exp.slice(2, -2);

      if (props.hasOwnProperty(prop)) {
        memo = memo.replace(exp, props[prop]);
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
        this.template[i] = {type: 'text/plain', template: this.template[i]};
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

class Planor {
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
      this.#services.unshift(s);

      await this.#services[0].getClient();
    }

    return this
  }

  getServices() {
    return this.#services
  }

  addTemplate(t) {
    if (t instanceof PlanorTemplate) {
      this.#templates.unshift(t);
    }

    return this
  }

  getTemplates() {
    return this.#templates
  }

  async sendEmail(template, msgopts, oneTimeTemplateLiterals={}) {
    const matchedTemplates = this.#templates.filter(
      _t => _t.channel == 'email' && _t.id == template
    );

    if (!matchedTemplates) {
      throw new Error('MISSING_TEMPLATE')
    }

    const t = matchedTemplates[0];
    const templateLiterals = Object.assign({}, this.#templateLiterals, oneTimeTemplateLiterals);

    t.parse(templateLiterals);

    const msg = createMimeMessage();
    if (msgopts.sender) msg.setSender(msgopts.sender);
    msg.setTo(msgopts.to);
    if (msgopts.cc) msg.setCc(msgopts.cc);
    if (msgopts.bcc) msg.setBcc(msgopts.bcc);
    if (msgopts.headers) msg.setHeaders(msgopts.headers);
    if (msgopts.attachment) {
      const [filename, type, base64Data, attachmentHeaders] = msgopts.attachment;
      msg.setAttachment(filename, type, base64Data, attachmentHeaders || {});
    }
    msg.setSubject(t.getSubject());
    if (t.getPlainText()) {
      msg.setMessage('text/plain', t.getPlainText());
    }
    if (t.getHtml()) {
      msg.setMessage('text/html', t.getHtml());
      msg.setMessage('text/plain', this.#generatePlainTextVersion(t.getHtml()));
    }

    return await this.#_sendEmail(msg, msgopts)
  }

  async #_sendEmail(mimemsg, msgopts, _ind=0) {
    if (_ind === 0) this.#reset();

    if (!this.#services[_ind]) {
      this.#errors.push( new Error('NO_SERVICE_TO_TRY') );
      return undefined;
    }

    const s = this.#services[_ind];

    if (s.channel != 'email') {
      return await this.#_sendEmail(mimemsg, msgopts, _ind+1)
    }

    try {
      return await s.send(mimemsg, msgopts)
    } catch (e) {
      this.#errors.push(e);
      return await this.#_sendEmail(mimemsg, msgopts, _ind+1)
    }
  }

  updateTemplateLiterals(obj) {
    this.#templateLiterals = Object.assign({}, this.#templateLiterals, obj);
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
    this.#errors = [];
  }
}

export { Planor, PlanorService, PlanorTemplate };
//# sourceMappingURL=index.js.map
