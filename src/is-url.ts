// based on https://github.com/kevva/url-regex with optional tld

import ipRegex from 'ip-regex'

const protocol = `(?:(?:[a-z]+:)?//)`
const auth = '(?:\\S+(?::\\S*)?@)?'
const ip = ipRegex.v4().source
const host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)'
const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*'
const tld = `(?:(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)?`
const port = '(?::\\d{2,5})?'
const path = '(?:[/?#][^\\s"]*)?'
const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`

const regexp = new RegExp(`(?:^${regex}$)`, 'i')

export default (uri: string = '') => regexp.test(uri)
