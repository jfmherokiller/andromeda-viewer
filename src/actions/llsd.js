import LLSD, { Binary, URI, UUID } from '../llsd'
import caps from './capabilities.json'

import { selectEventQueueGetUrl } from '../bundles/region'
import { selectAvatarIdentifier } from '../bundles/session'

async function parseLLSD (response) {
  const body = await response.text()
  return LLSD.parse(response.headers.get('content-type'), body)
}

export async function fetchLLSD (method, url, data = null, mimeType = LLSD.MIMETYPE_XML) {
  const response = await minimalFetchLLSD(method, url, data, mimeType)

  switch (response.headers.get('content-type')) {
    case 'application/llsd+binary':
    case 'application/llsd+json':
    case 'application/llsd+xml':
      return parseLLSD(response)

    default:
      throw new Error(await response.text())
  }
}

function minimalFetchLLSD (method, url, data = null, mimeType = LLSD.MIMETYPE_XML) {
  const headers = new window.Headers()
  headers.append('content-type', 'text/plain')
  headers.append('x-andromeda-fetch-url', url)
  headers.append('x-andromeda-fetch-method', method)
  headers.append('x-andromeda-fetch-type', mimeType)

  const body = data == null ? undefined : LLSD.format(mimeType, data)

  return window.fetch('/hoodie/andromeda-viewer/proxy', {
    method: 'POST',
    headers,
    body
  })
}

export function fetchSeedCapabilities (url) {
  return async dispatch => {
    try {
      const capabilities = await fetchLLSD('POST', url, caps)
      dispatch({
        type: 'SeedCapabilitiesLoaded',
        capabilities
      })
      dispatch(activateEventQueue())
    } catch (error) {
      console.error(error)
    }
  }
}

// http://wiki.secondlife.com/wiki/EventQueueGet
async function * eventQueueGet (getState) {
  const url = selectEventQueueGetUrl(getState())
  const avatarIdentifier = selectAvatarIdentifier(getState())
  let ack = 0

  do {
    let response
    try {
      response = await minimalFetchLLSD('POST', url, { done: false, ack })
    } catch (err) {
      // network error?
      console.error(err)
      continue
    }

    if (response.status >= 200 && response.status < 300) {
      const body = await parseLLSD(response)
      ack = body.id
      for (const event of body.events) {
        yield event
      }
    } else if (response.status === 404) { // Session did end
      return []
    } else if (response.status === 502 || response.status === 499) {
      // Request did Timeout. This is not an error! This is expected.
      // The EventQueue server is a proxy. If the server behind the proxy times out, than the
      // EventQueue server interprets this as a generic error and returns a 502.
      // 499 is from the dev-server.
      continue
    } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      // Some error did happen!
      console.error(
        new Error(`${response.status} - ${response.statusText}\n\n${await response.text()}`)
      )
      return
    } else {
      await new Promise(resolve => { setTimeout(resolve, 200) })
      continue
    }
  } while (selectAvatarIdentifier(getState()) === avatarIdentifier)

  minimalFetchLLSD('POST', url, { done: true, ack })
    .catch(() => {})
}

function activateEventQueue () {
  return async (dispatch, getState) => {
    for await (const event of eventQueueGet(getState)) {
      try {
        toJSON(event.body)
        dispatch({
          type: 'eventQueue/' + event.message,
          payload: event.body,
          meta: {
            message: event.message
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }
}

/**
 * This function checks all values of LLSD data for non JSON data modifies them.
 * @param {object|object[]} object A LLSD Object or Array.
 */
export function toJSON (object) {
  for (const [key, value] of Object.entries(object)) {
    if (value instanceof Date) {
      object[key] = value.getTime()
    } else if (value instanceof Binary) {
      object[key] = value.toArray()
    } else if (value instanceof URI || value instanceof UUID) {
      object[key] = value.toString()
    } else if (typeof object === 'object') { // Objects and Arrays
      toJSON(value)
    }
  }
}
