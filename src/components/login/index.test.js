import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import Login from './index'

test('renders without crashing', () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'Second Life Beta',
      loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  shallow(<MemoryRouter>
    <Login
      avatars={[]}
      grids={grids}
    />
  </MemoryRouter>)
})

test('renders with avatars', () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'Second Life Beta',
      loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  const avatars = [
    {
      _id: 'avatar/testery',
      name: 'Testery MacTestface',
      grid: 'Second Life'
    }
  ]

  shallow(<MemoryRouter>
    <Login
      grids={grids}
      avatars={avatars}
    />
  </MemoryRouter>)
})

test('should pass aXe', async () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'Second Life Beta',
      loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  const avatars = [
    {
      _id: 'avatar/testery',
      name: 'Testery MacTestface',
      grid: 'Second Life'
    }
  ]

  const store = {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => () => {}
  }

  const rendered = mount(<Provider store={store}>
    <MemoryRouter>
      <Login
        grids={grids}
        avatars={avatars}
      />
    </MemoryRouter>
  </Provider>)

  const renderedNewUser = mount(<Provider store={store}>
    <MemoryRouter>
      <Login
        grids={grids}
        avatars={[]}
      />
    </MemoryRouter>
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()

  expect(await axe(renderedNewUser.html())).toHaveNoViolations()
})
