import axios, { AxiosRequestConfig } from 'axios'
import isUrl from './is-url'
import urlJoin from 'url-join'

import Interference, { InjectCodes } from 'interference'

InjectCodes({
  MISSING_MANDATORY_PRAMETER: 400,
  REMOTE_UNREACHABLE: 503,
  GENERIC_ERROR: 500,
})

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
  responseType?: string
  transcodeResponse?<O, T>(data: O): T | Promise<T>
  echoCall?: boolean
  rootXml?: string
  token?: string
}

const buildConfig = (url, method, token, contentType, responseType): AxiosRequestConfig => {
  const config = {
    method,
    url,
    headers: {
      'Content-Type': contentType,
    },
    responseType,
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}

const transmit = async (
  callOutpost: any,
  method: string,
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
    } = options

    if (transcodeResponse && typeof transcodeResponse !== 'function') {
      throw Interference('transcodeResponse must be a function', 'MISSING_MANDATORY_PRAMETER')
    }

    const baseConfig = buildConfig(
      `${urlJoin(service, path)}`,
      method,
      token,
      contentType,
      responseType,
    )

    const config = ['POST', 'PUT', 'PATCH'].includes(method)
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
      throw Interference(
        `Calling ${service} on ${path} url returns ${error.response.status} code.`,
        'REMOTE_API_ERROR',
        error.response.data,
        error.response.status,
      )
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request)
      throw Interference(
        `There is no answer from ${service} at ${path} url: ${error.message}`,
        'REMOTE_UNREACHABLE',
        error.config,
      )
    } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message)
      if (error.config) {
        console.log('Communicator config: ', error.config)
      }
      throw Interference(
        `Unhandled error calling ${service} at ${path} url: ${error.message}`,
        'GENERIC_ERROR',
        error.config,
      )
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
  console.log(`${service} ${isUrl(service)}`)
  if (!isUrl(service)) {
    throw Interference(
      `Provide valid URL for ${service}, either from ENV vars or by string: [protocol]://[domain]`,
      'MISSING_MANDATORY_PRAMETER',
    )
  }

  return {
    get: get.bind(null, service),
    post: post.bind(null, service),
    put: put.bind(null, service),
    del: del.bind(null, service),
  }
}
