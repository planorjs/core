'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classPrivateFieldSet = require('@babel/runtime-corejs3/helpers/classPrivateFieldSet');
var _classPrivateFieldGet = require('@babel/runtime-corejs3/helpers/classPrivateFieldGet');
require('core-js/modules/esnext.weak-map.delete-all.js');
require('core-js/modules/esnext.weak-set.add-all.js');
require('core-js/modules/esnext.weak-set.delete-all.js');
var mimetext = require('mimetext');
var createDOMPurify = require('dompurify');
var jsdom = require('jsdom');
var mjml2html = require('mjml');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var createDOMPurify__default = /*#__PURE__*/_interopDefaultLegacy(createDOMPurify);
var mjml2html__default = /*#__PURE__*/_interopDefaultLegacy(mjml2html);

function _classPrivateFieldInitSpec$2(obj, privateMap, value) { _checkPrivateRedeclaration$2(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration$2(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

var _credentials = /*#__PURE__*/new WeakMap();

class PlanorService {
  constructor(name, channel) {
    _classPrivateFieldInitSpec$2(this, _credentials, {
      writable: true,
      value: {}
    });

    this.name = name;
    this.channel = channel;
    this.client = null;
    this.opts = {};
  }

  setCredentials(credentials) {
    _classPrivateFieldSet__default["default"](this, _credentials, credentials);
  }

  getCredentials() {
    return _classPrivateFieldGet__default["default"](this, _credentials);
  }

  setOpts(opts) {
    this.opts = opts;
  }

}

function _classPrivateMethodInitSpec$1(obj, privateSet) { _checkPrivateRedeclaration$1(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec$1(obj, privateMap, value) { _checkPrivateRedeclaration$1(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration$1(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet$1(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _reParser = /*#__PURE__*/new WeakMap();

var _supportedContentTypes = /*#__PURE__*/new WeakMap();

var _subject = /*#__PURE__*/new WeakMap();

var _plaintext = /*#__PURE__*/new WeakMap();

var _html = /*#__PURE__*/new WeakMap();

var _parse = /*#__PURE__*/new WeakSet();

var _verifyTemplate = /*#__PURE__*/new WeakSet();

class PlanorTemplate {
  constructor(channel, id, locale, template) {
    _classPrivateMethodInitSpec$1(this, _verifyTemplate);

    _classPrivateMethodInitSpec$1(this, _parse);

    _classPrivateFieldInitSpec$1(this, _reParser, {
      writable: true,
      value: /({{)[^{}]+(}})/gm
    });

    _classPrivateFieldInitSpec$1(this, _supportedContentTypes, {
      writable: true,
      value: ['text/plain', 'text/html', 'text/mjml']
    });

    _classPrivateFieldInitSpec$1(this, _subject, {
      writable: true,
      value: null
    });

    _classPrivateFieldInitSpec$1(this, _plaintext, {
      writable: true,
      value: null
    });

    _classPrivateFieldInitSpec$1(this, _html, {
      writable: true,
      value: null
    });

    this.id = id;
    this.channel = channel;
    this.locale = locale;
    this.template = Array.isArray(template) ? template : [template];

    _classPrivateMethodGet$1(this, _verifyTemplate, _verifyTemplate2).call(this);
  }

  parse(templateLiterals = {}) {
    // title or sms text
    const parsed0 = _classPrivateMethodGet$1(this, _parse, _parse2).call(this, this.template[0].template, templateLiterals);

    if (this.channel == 'email') _classPrivateFieldSet__default["default"](this, _subject, parsed0);
    if (this.channel == 'sms') _classPrivateFieldSet__default["default"](this, _plaintext, parsed0); // email content

    if (this.template.length > 1) {
      const parsed1 = _classPrivateMethodGet$1(this, _parse, _parse2).call(this, this.template[1].template, templateLiterals);

      if (this.template[1].type == 'text/mjml') {
        _classPrivateFieldSet__default["default"](this, _html, mjml2html__default["default"](parsed1, {
          keepComments: false
        }).html);
      }

      if (this.template[1].type == 'text/html') {
        _classPrivateFieldSet__default["default"](this, _html, parsed1);
      }

      if (this.template[1].type == 'text/plain') {
        _classPrivateFieldSet__default["default"](this, _plaintext, parsed1);
      }
    }

    return this;
  }

  getSubject() {
    return _classPrivateFieldGet__default["default"](this, _subject);
  }

  getPlainText() {
    return _classPrivateFieldGet__default["default"](this, _plaintext);
  }

  getHtml() {
    return _classPrivateFieldGet__default["default"](this, _html);
  }

}

function _parse2(str, props = {}) {
  if (!props || Object.keys(props).length === 0) {
    return str;
  }

  const matches = str.match(_classPrivateFieldGet__default["default"](this, _reParser));

  if (!matches) {
    return str;
  }

  return matches.reduce((memo, exp) => {
    const prop = exp.slice(2, -2);

    if (props.hasOwnProperty(prop)) {
      memo = memo.replace(exp, props[prop]);
    }

    return memo;
  }, str);
}

function _verifyTemplate2() {
  if (this.channel == 'email' && this.template.length !== 2) {
    throw new Error('INVALID_TEMPLATE');
  }

  if (this.channel == 'sms' && this.template.length !== 1) {
    throw new Error('INVALID_TEMPLATE');
  }

  for (var i = 0; i < this.template.length; i++) {
    if (typeof this.template[i] == 'string') {
      this.template[i] = {
        type: 'text/plain',
        template: this.template[i]
      };
    }

    if (Object.prototype.toString.call(this.template[i]) != '[object Object]') {
      throw new Error('INVALID_TEMPLATE');
    }

    if (this.channel == 'sms' && this.template[i].type != 'text/plain') {
      throw new Error('INVALID_TEMPLATE');
    }

    if (_classPrivateFieldGet__default["default"](this, _supportedContentTypes).indexOf(this.template[i].type) === -1) {
      throw new Error('INVALID_TEMPLATE');
    }

    if (!this.template[i].template) {
      throw new Error('INVALID_TEMPLATE');
    }
  }
}

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _domPurifier = /*#__PURE__*/new WeakMap();

var _services = /*#__PURE__*/new WeakMap();

var _templates = /*#__PURE__*/new WeakMap();

var _templateLiterals = /*#__PURE__*/new WeakMap();

var _errors = /*#__PURE__*/new WeakMap();

var _sendSms = /*#__PURE__*/new WeakSet();

var _sendEmail = /*#__PURE__*/new WeakSet();

var _generatePlainTextVersion = /*#__PURE__*/new WeakSet();

var _reset = /*#__PURE__*/new WeakSet();

class Planor {
  // this is a temporary error chain that keeps errors thrown by services.
  // resets itself to its initial state after sendEmail method has done.
  constructor() {
    _classPrivateMethodInitSpec(this, _reset);

    _classPrivateMethodInitSpec(this, _generatePlainTextVersion);

    _classPrivateMethodInitSpec(this, _sendEmail);

    _classPrivateMethodInitSpec(this, _sendSms);

    _classPrivateFieldInitSpec(this, _domPurifier, {
      writable: true,
      value: createDOMPurify__default["default"](new jsdom.JSDOM('').window)
    });

    _classPrivateFieldInitSpec(this, _services, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _templates, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _templateLiterals, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _errors, {
      writable: true,
      value: []
    });
  }

  async addService(s) {
    if (s instanceof PlanorService) {
      _classPrivateFieldGet__default["default"](this, _services).unshift(s);

      await _classPrivateFieldGet__default["default"](this, _services)[0].getClient();
    }

    return this;
  }

  getServices() {
    return _classPrivateFieldGet__default["default"](this, _services);
  }

  addTemplate(t) {
    if (t instanceof PlanorTemplate) {
      _classPrivateFieldGet__default["default"](this, _templates).unshift(t);
    }

    return this;
  }

  getTemplates() {
    return _classPrivateFieldGet__default["default"](this, _templates);
  }

  async sendSms(template, msgopts, oneTimeTemplateLiterals = {}) {
    const matchedTemplates = _classPrivateFieldGet__default["default"](this, _templates).filter(_t => _t.channel == 'sms' && _t.id == template);

    if (!matchedTemplates) {
      throw new Error('MISSING_TEMPLATE');
    }

    const t = matchedTemplates[0];
    const templateLiterals = Object.assign({}, _classPrivateFieldGet__default["default"](this, _templateLiterals), oneTimeTemplateLiterals);
    t.parse(templateLiterals);
    const msg = t.getPlainText();
    return await _classPrivateMethodGet(this, _sendSms, _sendSms2).call(this, msg, msgopts);
  }

  async sendEmail(template, msgopts, oneTimeTemplateLiterals = {}) {
    const matchedTemplates = _classPrivateFieldGet__default["default"](this, _templates).filter(_t => _t.channel == 'email' && _t.id == template);

    if (!matchedTemplates) {
      throw new Error('MISSING_TEMPLATE');
    }

    const t = matchedTemplates[0];
    const templateLiterals = Object.assign({}, _classPrivateFieldGet__default["default"](this, _templateLiterals), oneTimeTemplateLiterals);
    t.parse(templateLiterals);
    const msg = mimetext.createMimeMessage();
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
      msg.setMessage('text/plain', _classPrivateMethodGet(this, _generatePlainTextVersion, _generatePlainTextVersion2).call(this, t.getHtml()));
    }

    return await _classPrivateMethodGet(this, _sendEmail, _sendEmail2).call(this, msg, msgopts);
  }

  updateTemplateLiterals(obj) {
    _classPrivateFieldSet__default["default"](this, _templateLiterals, Object.assign({}, _classPrivateFieldGet__default["default"](this, _templateLiterals), obj));

    return this;
  }

  getTemplateLiterals() {
    return _classPrivateFieldGet__default["default"](this, _templateLiterals);
  }

  getErrors() {
    return _classPrivateFieldGet__default["default"](this, _errors);
  }

}

async function _sendSms2(msg, msgopts, _ind = 0) {
  if (_ind === 0) _classPrivateMethodGet(this, _reset, _reset2).call(this);

  if (!_classPrivateFieldGet__default["default"](this, _services)[_ind]) {
    _classPrivateFieldGet__default["default"](this, _errors).push(new Error('NO_SERVICE_TO_TRY'));

    return undefined;
  }

  const s = _classPrivateFieldGet__default["default"](this, _services)[_ind];

  if (s.channel != 'sms') {
    return await _classPrivateMethodGet(this, _sendSms, _sendSms2).call(this, msg, msgopts, _ind + 1);
  }

  try {
    return await s.send(msg, msgopts);
  } catch (e) {
    _classPrivateFieldGet__default["default"](this, _errors).push(e);

    return await _classPrivateMethodGet(this, _sendSms, _sendSms2).call(this, msg, msgopts, _ind + 1);
  }
}

async function _sendEmail2(mimemsg, msgopts, _ind = 0) {
  if (_ind === 0) _classPrivateMethodGet(this, _reset, _reset2).call(this);

  if (!_classPrivateFieldGet__default["default"](this, _services)[_ind]) {
    _classPrivateFieldGet__default["default"](this, _errors).push(new Error('NO_SERVICE_TO_TRY'));

    return undefined;
  }

  const s = _classPrivateFieldGet__default["default"](this, _services)[_ind];

  if (s.channel != 'email') {
    return await _classPrivateMethodGet(this, _sendEmail, _sendEmail2).call(this, mimemsg, msgopts, _ind + 1);
  }

  try {
    return await s.send(mimemsg, msgopts);
  } catch (e) {
    _classPrivateFieldGet__default["default"](this, _errors).push(e);

    return await _classPrivateMethodGet(this, _sendEmail, _sendEmail2).call(this, mimemsg, msgopts, _ind + 1);
  }
}

function _generatePlainTextVersion2(html) {
  return _classPrivateFieldGet__default["default"](this, _domPurifier).sanitize(html, {
    ALLOWED_TAGS: []
  }).replace(/[\r\n]{2,}/gm, "\r\n").replace(/[ ]{2,}/gm, ' ').trim().split(/[\r\n]/).map(line => line.trim()).join("\r\n");
}

function _reset2() {
  _classPrivateFieldSet__default["default"](this, _errors, []);
}

exports.Planor = Planor;
exports.PlanorService = PlanorService;
exports.PlanorTemplate = PlanorTemplate;
//# sourceMappingURL=index.js.map
