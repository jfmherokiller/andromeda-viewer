/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import { connect } from 'react-redux'
import Tabs, { TabPane } from 'rc-tabs'
import TabContent from 'rc-tabs/lib/TabContent'
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar'

import ChatDialog from './chatDialog'
import FriendsList from './friendsList'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import 'rc-tabs/assets/index.css'

function ChatBox (props) {
  const names = props.names.get('names')
  const imsIds = props.IMs.keySeq().toJSON()

  const panels = imsIds.map(id => {
    const chat = props.IMs.get(id)
    const target = chat.get('withId')
    const name = names.has(target)
      ? names.get(target).getName()
      : target

    return <TabPane tab={name} key={id}>
      <ChatDialog
        data={chat}
        isIM
        sendTo={text => props.sendInstantMessage(text, target, id)}
        names={names}
        loadHistory={props.getIMHistory}
        />
    </TabPane>
  })

  return <Tabs
    defaultActiveKey='local'
    renderTabBar={() => <ScrollableInkTabBar />}
    renderTabContent={() => <TabContent />}
    >
    <TabPane tab='Friends' key='friends'>
      <FriendsList
        names={names}
        friends={props.friends}
        startNewIMChat={props.startNewIMChat}
        updateRights={props.updateRights}
        />
    </TabPane>

    <TabPane tab='Local' key='local'>
      <ChatDialog
        data={props.localChat}
        names={names}
        sendTo={props.sendLocalChatMessage}
        />
    </TabPane>

    {panels}
  </Tabs>
}
ChatBox.displayName = 'ChatBox'

const mapStateToProps = state => {
  return {
    localChat: state.localChat,
    IMs: state.IMs,
    names: state.names,
    friends: state.friends
  }
}

const mapDispatchToProps = {
  sendLocalChatMessage: text => sendLocalChatMessage(text, 1, 0),
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  updateRights
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)