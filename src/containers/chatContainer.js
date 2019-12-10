import { connect } from 'react-redux'

import {
  changeTab,
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import { getActiveTab, getLocalChat, getActiveIMChats } from '../selectors/chat'
import { selectShouldDisplayNotifications } from '../reducers/notifications'
import { selectNames } from '../reducers/names'
import { getFriends } from '../selectors/people'
import { getGroups } from '../selectors/groups'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    activeTab: getActiveTab(state),
    localChat: getLocalChat(state),
    IMs: getActiveIMChats(state),
    shouldDisplayNotifications: selectShouldDisplayNotifications(state),
    groups: getGroups(state),
    names: selectNames(state),
    friends: getFriends(state)
  }
}

const mapDispatchToProps = {
  changeTab,
  sendLocalChatMessage: text => sendLocalChatMessage(text, 1, 0),
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  updateRights
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
