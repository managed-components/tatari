import { MCEvent } from '@managed-components/types'
import { sendEvent } from '.'

const isRecentTs = (value: string) => {
  const now = new Date().valueOf()
  const ts = parseInt(value)
  return ts <= now && ts > now - 10000
}

const dummyClient = {
  title: 'Zaraz "Test" /t Page',
  timestamp: 1670502437,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  language: 'en-GB',
  referer: '',
  ip: '127.0.0.1',
  emitter: 'browser',
  url: new URL('http://127.0.0.1:1337'),
  fetch: () => undefined,
  set: () => undefined,
  execute: () => undefined,
  return: () => undefined,
  get: () => undefined,
  attachEvent: () => undefined,
  detachEvent: () => undefined,
}

const settings = { key: '12345' }

const cookieName = 'session-cookie'

describe('Tatari MC identify event handler works correctly', () => {
  let fetchedRequest: any
  let setCookie: any

  const fakeEvent = new Event('identify', {}) as MCEvent
  fakeEvent.payload = {
    identify: 'identifyEmail@email.com',
  }
  fakeEvent.client = {
    ...dummyClient,
    fetch: (url, opts) => {
      fetchedRequest = { url, opts }
      return undefined
    },
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  sendEvent(settings.key)(fakeEvent)

  it('creates the identify request correctly', async () => {
    expect(fetchedRequest).toBeTruthy()
    expect(fetchedRequest?.opts?.mode).toEqual('no-cors')
    expect(fetchedRequest?.opts?.keepalive).toEqual(true)
    expect(fetchedRequest?.opts?.credentials).toEqual('include')

    const url = new URL(fetchedRequest.url)

    expect(url.protocol).toEqual('https:')
    expect(url.hostname).toEqual('d1lu3pmaz2ilpx.cloudfront.net')
    expect(url.pathname).toEqual('/5a28e627')
    expect(url.searchParams.get('date')).toSatisfy(isRecentTs)

    const data = new URLSearchParams(atob(url.searchParams.get('data') || ''))

    expect(data.get('version')).toEqual('1.2.9')
    expect(data.get('cookieSupport')).toEqual('PERSIST')
    expect(data.get('token')).toEqual(settings.key)
    expect(data.get('event')).toEqual('identify')
    expect(data.get('$os')).toBeTypeOf('string')
    expect(data.get('$referrer')).toEqual(fakeEvent.client.referer)
    expect(data.get('userId')).toEqual(fakeEvent.payload.identify)
  })

  it('sets the cookies correctly', () => {
    expect(setCookie).toBeTruthy()
    expect(setCookie.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
    expect(setCookie.key).toEqual(cookieName)
  })
})

describe('Tatari MC track event handler works correctly', () => {
  let fetchedRequest: any
  let setCookie: any

  const fakeEvent = new Event('track', {}) as MCEvent
  fakeEvent.payload = {
    somedata: 'somevalue',
  }
  fakeEvent.client = {
    ...dummyClient,
    fetch: (url, opts) => {
      fetchedRequest = { url, opts }
      return undefined
    },
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  sendEvent(settings.key)(fakeEvent)

  it('creates the track request correctly', async () => {
    expect(fetchedRequest).toBeTruthy()
    expect(fetchedRequest?.opts?.mode).toEqual('no-cors')
    expect(fetchedRequest?.opts?.keepalive).toEqual(true)
    expect(fetchedRequest?.opts?.credentials).toEqual('include')

    const url = new URL(fetchedRequest.url)

    expect(url.protocol).toEqual('https:')
    expect(url.hostname).toEqual('d1lu3pmaz2ilpx.cloudfront.net')
    expect(url.pathname).toEqual('/5a28e627')
    expect(url.searchParams.get('date')).toSatisfy(isRecentTs)

    const data = new URLSearchParams(atob(url.searchParams.get('data') || ''))

    expect(data.get('version')).toEqual('1.2.9')
    expect(data.get('cookieSupport')).toEqual('PERSIST')
    expect(data.get('token')).toEqual(settings.key)
    expect(data.get('event')).toEqual('track')
    expect(data.get('$os')).toBeTypeOf('string')
    expect(data.get('$referrer')).toEqual(fakeEvent.client.referer)

    const argData = JSON.parse(data.get('arg') || '')

    expect(argData).toBeTruthy()
    expect(argData.somedata).toEqual(fakeEvent.payload.somedata)
  })

  it('sets the cookies correctly', () => {
    expect(setCookie).toBeTruthy()
    expect(setCookie.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
    expect(setCookie.key).toEqual(cookieName)
  })
})
