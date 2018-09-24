# ExoVision

Call remote HTTP RESTful services in easy way, both in brwoser and Node.js.

```typescript
import exovision from 'exovision' // const exovision = require('exovision').default

// using process.ENV
const myRemoteService = exovision('MY_REMOTE_SERVICE') // process.env.MY_REMOTE_SERVICE === https://myremoteservice.com

// or using uri
const myRemoteService2 = exovision('https://myremoteservice.com')

// now we have 4 methods
myRemoteService.get()
myRemoteService.post()
myRemoteService.put()
myRemoteService.del()
```
All methods have same signature:

```typescript
type ExovisionBoundTransmit = (
  path: string, // path to add on baseurl, eg. /rabbids
  data?: any, // can be any POJO: if the method is get, it will be transformed to querystring otherwise to body
  options?: ITransmissionOptions, // see below
) => Promise<any>
```

This is `ITransmissionOptions` interface:
```typescript
interface ITransmissionOptions {
  contentType?: string // defaults to 'application/json'
  responseType?: string // defaults to 'json'
  transcodeResponse?<O, T>(data: O): T | Promise<T>
  echoCall?: boolean // simulates the call and returns request (for testing and debugging)
  token?: string // bearer login token, added to headers['Authorization'] = `Bearer ${token}`
}
```

`transcodeResponse`: custom transformation function. For example, if you need to convert xml to json you can pass a transform function that will be invoked after the remote call is done:
```typescript
import { parse } from 'fast-xml-parser'

const trasformXmlToJson = (data: any) =>
  parse(data, { ignoreAttributes: false, attributeNamePrefix: '' })

myRemoteService.get('/rabbids', {}, {
  contentType: 'text/xml',
  responseType: 'text',
  transcodeResponse: trasformXmlToJson
})
```

All methods return a promise with parsed content (content type is JSON) or whatever `transcodeResponse` custom function returns.

In case of error during remote call it will be rertuned a rejected promise with
[interference instance](https://www.npmjs.com/package/interference)
