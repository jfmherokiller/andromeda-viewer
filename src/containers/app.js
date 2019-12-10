/*
 * Entry-point into the app on the client side
 *
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'

import { viewerName } from '../viewerInfo'

import { AppContainer, LoadableChatComponent } from '../components/main'
import LoginForm from './loginForm'
import PopupRenderer from './popups'
import TopMenuBar from './topMenuBar'
import AccountDialog from '../components/accountDialog'

import { isSignedIn as doGetIsSignedIn } from '../actions/viewerAccount'

import { getIsSignedIn } from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'
import { selectOwnAvatarName } from '../reducers/names'

import 'normalize.css'

const Popups = React.memo(PopupRenderer)

export default function App () {
  const isSignedIn = useSelector(getIsSignedIn)

  const dispatch = useDispatch()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && isSignedIn) {
      return // component was hot reloaded
    }

    dispatch(doGetIsSignedIn())
    // it will only be called once!
    // eslint-disable-next-line
  }, [])

  useDocumentTitle()

  return <AppContainer>
    <Switch>
      <Route exact path='/'>
        <LoginForm isSignedIn={isSignedIn} />
      </Route>
      <Route path='/session'>
        <LoadableChatComponent />
      </Route>
      <Route path='/profile'>
        {isSignedIn
          ? <AccountDialog />
          : <Redirect to='/' />
        }
      </Route>
      <Route path='*'>
        <NoMatchRedirect />
      </Route>
    </Switch>
    <TopMenuBar />
    <Popups />
  </AppContainer>
}

function useDocumentTitle () {
  const selfName = useSelector(selectOwnAvatarName)
  const isLoggedIn = useSelector(getIsLoggedIn)

  useEffect(() => {
    document.title = isLoggedIn
      ? `${selfName.getName()} - ${viewerName}`
      : viewerName
  }, [isLoggedIn, selfName])
}

function NoMatchRedirect () {
  const isLoggedIn = useSelector(getIsLoggedIn)

  return <Redirect to={isLoggedIn ? '/session' : '/'} />
}
