import nock from 'nock'
import responseJSON from './response-json'

export default (function initiateNock() {
  const scope = nock('http://outposts.com')
    .get('/api/v1/outposts')
    .reply(200, responseJSON)
  scope.get('/api/v1/outposts/noanswer').replyWithError('There is no anwser from remote dads.')
  scope.get('/api/v1/outposts/5b22ef3881af6d53c4adcec4').reply(200, {
    _id: '5b22ef3881af6d53c4adcec4',
    name: 'kapa',
  })
  scope.post('/api/v1/outposts').reply(201, {
    _id: '5b22ef3881af6d53c4adcec4',
  })
  scope.put('/api/v1/outposts/5b22ef3881af6d53c4adcec4').reply(200, {
    _id: '5b22ef3881af6d53c4adcec4',
    name: 'kapa2',
  })
  scope.get('/api/v1/outposts/5b22ef3881af6d53c4adnoResource').reply(404, {})
  scope.delete('/api/v1/outposts/5b22ef3881af6d53c4adcec4').reply(200, {})
})()
