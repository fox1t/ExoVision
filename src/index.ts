import axios, { AxiosRequestConfig } from 'axios'
import isUrl from 'is-url'
import urlJoin from 'url-join'

import ProtoVisionError from './error'

export declare type ExovisionTransmit = (service: string, path: string, data?: any, options?: ITransmissionOptions) => Promise<any>
export declare type ExovisionBoundTransmit = (path: string, data?: any, options?: ITransmissionOptions) => Promise<any>

export interface IExovision {
  get: ExovisionBoundTransmit,
  post: ExovisionBoundTransmit,
  put: ExovisionBoundTransmit,
  del: ExovisionBoundTransmit,
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

const transmit = async (callOutpost: any, method: string, service: string, path: string, data: any = {}, options: ITransmissionOptions = {}) => {
  try {
    const {
      contentType = 'application/json',
      responseType = 'json',
      echoCall = false,
      transcodeResponse,
      token,
    } = options

    if (transcodeResponse && typeof transcodeResponse !== 'function') {
      throw ProtoVisionError('transcodeResponse must be a function')
    }

    const baseConfig = buildConfig(`${urlJoin(service, path)}`, method, token, contentType, responseType)

    const config = ['POST', 'PUT', 'PATCH'].includes(method) ?
      { ...baseConfig, data } :
      { ...baseConfig, params: data }

    if (echoCall) {
      return transcodeResponse ? transcodeResponse(config.data) : config.data
    }

    const response = await callOutpost(config)

    return transcodeResponse ?
      transcodeResponse(response.data) :
      response.data
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data)
      // console.log(error.response.status)
      // console.log(error.response.headers)
      throw ProtoVisionError(`Calling ${service} on ${path} url returns ${error.response.status} code.`, error.response.status, error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request)
      throw ProtoVisionError(`There is no answer from ${service} at ${path} url: ${error.message}`, 'REMOTE_UNREACHABLE', error.config)
    } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message)
      if (error.config) {
        console.log('Communicator config: ', error.config)
      }
      throw ProtoVisionError(`Unhandled error calling ${service} at ${path} url: ${error.message}`, 'GENERIC_ERROR', error.config)
    }
  }
}

export const get: ExovisionTransmit = transmit.bind(null, axios, 'GET')
export const post: ExovisionTransmit = transmit.bind(null, axios, 'POST')
export const put: ExovisionTransmit = transmit.bind(null, axios, 'PUT')
export const del: ExovisionTransmit = transmit.bind(null, axios, 'DELETE')

// constructor function that returns Exovision with service bound
export default (service: string): IExovision => {
  service = isUrl(process.env[service]) ?
    process.env[service] as string :
    service
  if (!isUrl(service)) {
    throw ProtoVisionError(`Provide valid URL, either from ENV vars or by string: [protocol]://[domain]`)
  }

  return {
    get: get.bind(null, service),
    post: post.bind(null, service),
    put: put.bind(null, service),
    del: del.bind(null, service),
  }
}
