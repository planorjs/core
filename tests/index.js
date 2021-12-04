import assert from 'assert'
import {Planor, PlanorService, PlanorTemplate} from '../src/index.js'

const planor = new Planor()

const payload = {abc: 'Abc', ok: 'Okey'}
planor.updateTemplateLiterals(payload)
assert.deepStrictEqual(planor.getTemplateLiterals(), payload)
planor.updateTemplateLiterals({ok: 'OK!'})
assert.strictEqual(planor.getTemplateLiterals().ok, 'OK!')

const emailTemplate = new PlanorTemplate('email', 'VERIFY_SIGNIN', 'en_US', [
  'Your {{project}} Verification Code',
  'You have requested to signin to {{project}} and your verification code is "{{code}}"'
])
const html2 = 'Hi, Someone signed in to your <strong>{{project}}</strong> account from a new location.'
const emailTemplate2 = new PlanorTemplate('email', 'NEW_SIGNIN', 'en_US', [
  'Signin From A New Location',
  {type: 'text/html', template: html2}
])
planor.addTemplate(emailTemplate)
planor.addTemplate(emailTemplate2)

class PlanorServiceTest extends PlanorService {
  constructor(credentials, opts={}) {
    super('test', 'email')

    this.setCredentials(credentials)
    this.setOpts(opts)
  }

  async getClient() {
    const creds = super.getCredentials()

    process.env.TEST_API_KEY = creds.apiKey

    this.client = 'Test Client'
  }

  async send(mimemsg) {
    return {
      apiKey: process.env.TEST_API_KEY,
      secret: super.getCredentials().secret
    }
  }
}

const fakeCreds = {apiKey: 'abc123', secret: 'lkjhgfdsa'}
await planor.addService(new PlanorServiceTest(fakeCreds))
planor.updateTemplateLiterals({project: 'SomeApp'})
const result = await planor.sendEmail('VERIFY_SIGNIN', {to: 'test@test.com'}, {code: '918273'})
assert.deepStrictEqual(result, fakeCreds)
