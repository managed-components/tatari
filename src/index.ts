import { ComponentSettings, Manager, MCEvent } from '@managed-components/types'
import UAParser from 'ua-parser-js'

export const sendEvent = (key: string) => (event: MCEvent) => {
  const { client, payload } = event
  const { identify, timestamp, ...customFields } = payload
  const { name: $os } = new UAParser(event.client.userAgent).getOS()

  const cookieName = 'session-cookie'
  const cookie = client.get(cookieName)
  const sessionId =
    cookie ||
    client.url.searchParams.get('tatari_session_id') ||
    crypto.randomUUID()
  client.set(cookieName, sessionId)

  const hasCustomFields = !!Object.keys(customFields).length

  const data = new URLSearchParams({
    version: '1.2.9',
    cookieSupport: 'PERSIST',
    token: key,
    sessionId,
    event: event.type,
    $os,
    $currentUrl: client.url.href,
    $referrer: client.referer,
    ...(identify && { userId: identify }),
    ...(hasCustomFields && { arg: JSON.stringify(customFields) }),
  })

  const requestBody = {
    data: btoa(data.toString()),
    date: Date.now().toString(),
  }

  const queryString = new URLSearchParams(requestBody).toString()

  client.fetch(
    'https://d1lu3pmaz2ilpx.cloudfront.net/5a28e627?' + queryString,
    {
      credentials: 'include',
      keepalive: true,
      mode: 'no-cors',
    }
  )
}

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('pageview', sendEvent(settings.key))
  manager.addEventListener('identify', sendEvent(settings.key))
  manager.addEventListener('track', sendEvent(settings.key))
}
