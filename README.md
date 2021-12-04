# planor
Email and sms sending library with parsable templates and plugins. ✈️

Planor is based on [MIMEText](https://github.com/muratgozel/MIMEText). It has a simple template engine and a wrapper class `PlanorService` to send emails and sms. Once you setup its very easy to use.
```js
await planor.sendEmail('VERIFY_SIGNIN', {to: 'test@test.com'}, {code: '918273'})
// check your email for verification code!
```

## Install
```sh
npm i @planorjs/core
```

## Install Plugins
Choose the services you would like to use to send email and/or sms and install its plugin:
```sh
npm i @planorjs/plugin-gmail
npm i @planorjs/plugin-smtp
npm i @planorjs/plugin-postmark
```

## Usage
### Importing
```js
import {Planor, PlanorService, PlanorTemplate} from 'planor'
```
or
```js
const {Planor, PlanorService, PlanorTemplate} = require('planor')
```
This library is compatible with all **node/lts** versions. If your node version is **< 14** then:
```js
import {Planor, PlanorService, PlanorTemplate} from 'planor/node/lts'
```

### Initiate Planor
```js
const planor = new Planor()
```

### Initiate Templates
Create a new `PlanorTemplate` instance with `channel`, `id`, `locale` and `template` in order.
```js
const emailTemplate = new PlanorTemplate('email', 'VERIFY_SIGNIN', 'en_US', [
  'Your {{project}} Verification Code', // email subject
  'You have requested to signin to {{project}} and your verification code is "{{code}}"' // email content
])
```
Channel is one of email and sms. Id is the name you chose to remember when sending emails. locale is currently experimental state but you still need to specify it.

Template is an array of subject and content. The example above creates a plaintext template. To create an html template:
```js
const emailTemplate = new PlanorTemplate('email', 'VERIFY_SIGNIN', 'en_US', [
  'Your {{project}} Verification Code', // email subject
  {type: 'text/html', template: 'You have requested to signin to {{project}} and your verification code is "{{code}}"'} // email content
])
```
Just wrapped it in an object with a type property. It also supports parsing **mjml** templates:
```js
const emailTemplate = new PlanorTemplate('email', 'VERIFY_SIGNIN', 'en_US', [
  'Your {{project}} Verification Code', // email subject
  {type: 'text/mjml', template: '<mjml>You have requested to signin to {{project}} and your verification code is "{{code}}"</mjml>'} // email content
])
```

### Configure Template Literals
PlanorTemplate supports template literal parsing but template literals kept inside Planor not PlanorTemplate.
```js
planor.updateTemplateLiterals({project: 'SomeApp'})
```

### Add Email Service
By default, there is no email service provider. You need to init one:
```js
import PlanorServiceGmail from 'planor-plugin-gmail'

await planor.addService(new PlanorServiceGmail(credentials.gmail))
```

### Send An Email
```js
const result = await planor.sendEmail('VERIFY_SIGNIN', {to: 'some@email.tld'}, {code: '918273'})
```
The first argument is the `id` of the template. The second argument is options for [MIMEText](https://github.com/muratgozel/MIMEText) and may contain service specific options. The third argument is one-time template literals.

As a result, you will get an object that contains a `result.id`.

You can add as many services as you like. Planor will try to send until it sends successfully.

You can collect errors with `planor.getErrors()`. `sendEmail` won't throw you anything.

## Creating Plugins
A template for the plugin:
```js
class PlanorServiceTest extends PlanorService {
  constructor() {
    super('nameOfTheService', 'email')

    this.credentialKeys = ['from', 'token']
  }

  // create client
  async getClient() {
    const creds = super.getCredentials()

    process.env.TEST_API_KEY = creds.apiKey

    this.client = 'Test Client'
  }

  // actually send the message
  async send(mimemsg, mimeopts) {
    return {
      apiKey: process.env.TEST_API_KEY,
      secret: super.getCredentials().secret
    }
  }
}
```
The mimemsg here is an instance of [MIMEText](https://github.com/muratgozel/MIMEText)

---

Version management of this repository done by [releaser](https://github.com/muratgozel/node-releaser) 🚀

---

Thanks for watching 🐬

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F1RFO7)
