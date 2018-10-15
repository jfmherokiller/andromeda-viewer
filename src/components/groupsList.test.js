import React from 'react'
import { mount } from 'enzyme'
import { List, Map } from 'immutable'
import { v4 as uuid } from 'uuid'

import GroupsList from './groupsList'

test('renders without crashing', () => {
  const groups = List([
    Map({
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    })
  ])

  mount(<GroupsList groups={groups} startNewIMChat={() => {}} />)
})

test('rendering', () => {
  const groups = List([
    Map({
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    }),
    Map({
      id: uuid(),
      name: 'The other Group',
      insigniaID: uuid(),
      title: 'Just another group',
      acceptNotices: true,
      powers: [2048, 134283266]
    })
  ])

  const rendered = mount(<GroupsList groups={groups} startNewIMChat={() => {}} />)

  const liElements = rendered.find('li')
  expect(liElements.length).toBe(2)

  liElements.forEach((row, index) => {
    const isFirst = index === 0

    expect(row.find('img[src="chat_bubble.svg"]').prop('alt'))
      .toBe('Start new chat with ' + (isFirst ? 'Test Group' : 'The other Group'))

    expect(row.first().text()).toBe(isFirst ? 'Test Group' : 'The other Group')
  })
})

test('start chat', () => {
  const groups = List([
    Map({
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    })
  ])

  const actions = []

  const rendered = mount(<GroupsList
    groups={groups}
    startNewIMChat={(dialog, targetId, name, activate) => {
      actions.push({ dialog, targetId, name, activate })
      return Promise.resolve(targetId)
    }}
  />)

  const newChatLink = rendered.find('a')
  newChatLink.simulate('click', {
    preventDefault: () => {}
  })

  expect(actions.length).toBe(1)
  expect(actions[0]).toEqual({
    dialog: 15,
    targetId: groups.getIn([0, 'id']),
    name: 'Test Group',
    activate: true
  })
})