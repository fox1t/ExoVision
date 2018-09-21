// TODO: test reseponse decode with xml parsers
import './prepare-nock'
import ExovisionFactory, { Exovision } from '..'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

describe(`Exovision Instantiation`, () => {
  it(`Instantiate Exovision on 'http://example.com'`, () => {
    const exampleOutpost = ExovisionFactory('http://example.com')
    expect(typeof exampleOutpost).to.equal('object')
  })

  it(`Instantiate Exovision on 'OUTPOSTS_API' env var.`, () => {
    const exampleOutpost = ExovisionFactory('OUTPOSTS_API')
    expect(typeof exampleOutpost).to.equal('object')
  })

  it(`Instantiate Exovision on invalid url: 'example.com'.`, () => {
    expect(() => ExovisionFactory('example.com')).to.throw()
  })

  it(`Instantiate Exovision on missing env var: 'WRONG_API'.`, () => {
    expect(() => ExovisionFactory('WRONG_API')).to.throw()
  })
})

describe(`Test 'OUTPOSTS_API' service.`, () => {
  let outpostsVision: Exovision
  before(() => {
    outpostsVision = ExovisionFactory('OUTPOSTS_API')
  })
  it(`GET outposts list`, async () => {
    const outposts = await outpostsVision.get('/api/v1/outposts')
    expect(outposts).to.deep.equal({ data: { outposts: [], totalCount: 0 } })
  })

  it(`POST to outposts (create)`, async () => {
    const outpost = await outpostsVision.post('/api/v1/outposts', { name: 'kapa' })
    expect(outpost).to.deep.equal({
      _id: '5b22ef3881af6d53c4adcec4',
    })
  })

  it(`GET single outpost`, async () => {
    const outpost = await outpostsVision.get('/api/v1/outposts/5b22ef3881af6d53c4adcec4')
    expect(outpost).to.deep.equal({
      _id: '5b22ef3881af6d53c4adcec4',
      name: 'kapa',
    })
  })

  it(`PUT single outpost (modify)`, async () => {
    const outpost = await outpostsVision.put('/api/v1/outposts/5b22ef3881af6d53c4adcec4', {
      name: 'kapa2',
    })
    expect(outpost).to.deep.equal({
      _id: '5b22ef3881af6d53c4adcec4',
      name: 'kapa2',
    })
  })

  it(`DELETE single outpost`, async () => {
    const outpost = await outpostsVision.del('/api/v1/outposts/5b22ef3881af6d53c4adcec4')
    expect(outpost).to.deep.equal({})
  })

  it(`GET no answer on /outposts`, async () => {
    try {
      await outpostsVision.get('/api/v1/outposts/noanswer')
    } catch (err) {
      expect(err.type).to.equals('REMOTE_UNREACHABLE')
      expect(err.statusCode).to.equals(503)
    }
  })

  it(`GET no resource on /outposts`, async () => {
    try {
      await outpostsVision.get('/api/v1/outposts/5b22ef3881af6d53c4adnoResource')
    } catch (err) {
      expect(err.type).to.equals('REMOTE_API_ERROR')
      expect(err.statusCode).to.equals(404)
    }
  })
})
