import axios, { AxiosRequestConfig } from 'axios'
import isUrl from './is-url'
import urlJoin from 'url-join'

import Interference from 'interference'

export declare type ExovisionTransmit = (
  service: string,
  path: string,
  data?: any,
  options?: ITransmissionOptions,
) => Promise<any>
export declare type ExovisionBoundTransmit = (
  path: string,
  data?: any,
  options?: ITransmissionOptions,
) => Promise<any>

export interface Exovision {
  get: ExovisionBoundTransmit
  post: ExovisionBoundTransmit
  put: ExovisionBoundTransmit
  del: ExovisionBoundTransmit
}

export interface ITransmissionOptions {
  contentType?: string
  responseType?: AxiosRequestConfig['responseType']
  transcodeResponse?<O, T>(data: O): T | Promise<T>
  echoCall?: boolean
  token?: string
  headers?: any
}

const buildConfig = (
  url: string,
  method: AxiosRequestConfig['method'],
  token: string | undefined,
  contentType: string,
  responseType: AxiosRequestConfig['responseType'],
  headers: any = {},
): AxiosRequestConfig => {
  const config = {
    method,
    url,
    headers: {
      ...headers,
      'Content-Type': contentType,
    },
    responseType,
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}

const bodyMethods: AxiosRequestConfig['method'][] = ['POST', 'PUT', 'PATCH', 'DELETE']

const transmit = async (
  callOutpost: any,
  method: AxiosRequestConfig['method'],
  service: string,
  path: string,
  data: any = {},
  options: ITransmissionOptions = {},
) => {
  try {
    const {
      contentType = 'application/json',
      responseType = 'json',
      echoCall = false,
      transcodeResponse,
      token,
      headers,
    } = options

    if (transcodeResponse && typeof transcodeResponse !== 'function') {
      throw Interference({
        message: 'transcodeResponse must be a function',
        type: 'MISSING_MANDATORY_PRAMETER',
        statusCode: 400,
      })
    }

    const baseConfig = buildConfig(
      `${urlJoin(service, path)}`,
      method,
      token,
      contentType,
      responseType,
      headers,
    )

    const config = bodyMethods.includes(method)
      ? { ...baseConfig, data }
      : { ...baseConfig, params: data }

    if (echoCall) {
      return transcodeResponse ? transcodeResponse(config.data) : config.data
    }

    const response = await callOutpost(config)

    return transcodeResponse ? transcodeResponse(response.data) : response.data
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data)
      // console.log(error.response.status)
      // console.log(error.response.headers)
      throw Interference({
        message: `Calling ${service} on ${path} url returns ${error.response.status} code.`,
        type: 'REMOTE_API_ERROR',
        details: error.response.data,
        statusCode: error.response.status,
      })
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request)
      throw Interference({
        message: `There is no answer from ${service} at ${path} url: ${error.message}`,
        type: 'REMOTE_UNREACHABLE',
        details: error.config,
        statusCode: 503,
      })
    } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message)
      if (error.config) {
        console.log('Communicator config: ', error.config)
      }
      throw Interference({
        message: `Unhandled error calling ${service} at ${path} url: ${error.message}`,
        type: 'GENERIC_ERROR',
        details: error.config,
      })
    }
  }
}

export const get: ExovisionTransmit = transmit.bind(null, axios, 'GET')
export const post: ExovisionTransmit = transmit.bind(null, axios, 'POST')
export const put: ExovisionTransmit = transmit.bind(null, axios, 'PUT')
export const del: ExovisionTransmit = transmit.bind(null, axios, 'DELETE')

// constructor function that returns Exovision with service bound
export default (service: string): Exovision => {
  service =
    process.env[service] && isUrl(process.env[service]) ? (process.env[service] as string) : service
  if (!isUrl(service)) {
    throw Interference({
      message: `Provide valid URL for ${service}, either from ENV vars or by string: [protocol]://[domain]`,
      type: 'MISSING_MANDATORY_PRAMETER',
      statusCode: 400,
    })
  }

  return {
    get: get.bind(null, service),
    post: post.bind(null, service),
    put: put.bind(null, service),
    del: del.bind(null, service),
  }
}
