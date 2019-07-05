/*
 * Reduces all IM-Chats and IM-Messages
 */

function imChat (state = {}, action) {
  switch (action.type) {
    case 'CreateNewIMChat':
    case 'IMChatInfosLoaded':
      return {
        ...state,
        _id: '_id' in state ? state._id : action._id,
        didSaveChatInfo: action.type === 'IMChatInfosLoaded',
        chatUUID: action.chatUUID,
        saveId: action.saveId,
        type: action.chatType,
        withId: action.target,
        name: action.name,
        didLoadHistory: state.didLoadHistory || false,
        isLoadingHistory: state.isLoadingHistory || false,
        active: state.active || false,
        hasUnsavedMSG: state.hasUnsavedMSG || false,
        areTyping: new Set(),
        messages: 'messages' in state ? state.messages : []
      }

    case 'startSavingIMChatInfo':
    case 'didSaveIMChatInfo':
      if (action.chatUUIDs.includes(state.chatUUID)) {
        return {
          ...state,
          didSaveChatInfo: action.type === 'startSavingIMChatInfo'
        }
      } else {
        return state
      }

    case 'ActivateIMChat':
      return {
        ...state,
        active: true
      }

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
    case 'PERSONAL_IM_RECEIVED':
    case 'GROUP_IM_RECEIVED':
    case 'CONFERENCE_IM_RECEIVED':
      const msg = {
        ...action.msg,
        didSave: false
      }
      const messages = 'messages' in state ? state.messages : []
      const nextMessages = messages.concat([msg])
      return {
        ...state,
        messages: nextMessages,
        active: true,
        hasUnsavedMSG: true
      }

    case 'IMHistoryStartLoading':
      return {
        ...state,
        isLoadingHistory: true
      }

    case 'IM_START_TYPING':
      return state.set('areTyping', state.get('areTyping').add(action.agentId))

    case 'IM_STOP_TYPING':
      return state.set('areTyping', state.get('areTyping').delete(action.agentId))

    case 'IMHistoryLoaded':
      const historyMsg = action.messages.map(msg => ({
        ...msg,
        didSave: true
      }))
      return {
        ...state,
        messages: historyMsg.concat(state.messages),
        isLoadingHistory: false,
        didLoadHistory: action.didLoadAll
      }

    case 'StartSavingIMMessages':
      let stillHasUnsaved = false
      const thisChat = action.chats[state.chatUUID]

      return {
        ...state,
        messages: state.messages.map(msg => {
          if (!thisChat.includes(msg._id)) {
            if (!msg.didSave) {
              stillHasUnsaved = true // side effect
            }
            return msg
          }

          return {
            ...msg,
            didSave: true
          }
        }),
        hasUnsavedMSG: stillHasUnsaved
      }

    case 'didSaveIMMessages':
      const thisChatDidSave = action.chats[state.chatUUID]
      let stillHasUnsavedAfterSave = false
      const didSave = thisChatDidSave.saved.reduce((all, msg) => {
        all[msg._id] = msg
        return all
      }, {})

      const newMessages = state.messages.map(msg => {
        // if it did error
        if (thisChatDidSave.didError.includes(msg._id)) {
          stillHasUnsavedAfterSave = true // side effect
          return {
            ...msg,
            didSave: false
          }
        }

        // did save
        if (didSave[msg._id] != null) {
          return {
            ...msg,
            ...didSave[msg._id]
          }
        }

        // didn't save yet.
        if (!msg.didSave) {
          stillHasUnsaved = true // side effect
        }

        return msg
      })

      return {
        ...state,
        messages: newMessages,
        hasUnsavedMSG: stillHasUnsavedAfterSave
      }

    default:
      return state
  }
}

export default function IMReducer (state = {}, action) {
  switch (action.type) {
    case 'CreateNewIMChat':
    case 'ActivateIMChat':
      return {
        ...state,
        [action.chatUUID]: imChat(state[action.chatUUID], action)
      }

    case 'IMChatInfosLoaded':
      return action.chats.reduce((state, chat) => {
        const innerAction = Object.assign({}, chat, {
          type: action.type
        })

        const updatedChat = imChat(state[chat.chatUUID], innerAction)
        state[chat.chatUUID] = updatedChat

        return state
      }, { ...state })

    case 'startSavingIMChatInfo':
      return action.chatUUIDs.reduce((state, id) => {
        const updatedChat = imChat(state[id], action)
        state[id] = updatedChat
        return state
      }, { ...state })

    case 'didSaveIMChatInfo':
      return action.didError.length === 0
        ? state
        : action.didError.reduce((state, id) => {
          const updatedChat = imChat(state[id], action)
          state[id] = updatedChat
          return state
        }, { ...state })

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
    case 'PERSONAL_IM_RECEIVED':
      // filter start/end typing
      if (action.msg.dialog === 41 || action.msg.dialog === 42) return state

      const oldChat = state[action.msg.chatUUID]
      const updatedChat = imChat(oldChat, action)

      return oldChat === updatedChat
        ? state
        : {
          ...state,
          [action.msg.chatUUID]: updatedChat
        }

    case 'GROUP_IM_RECEIVED':
    case 'CONFERENCE_IM_RECEIVED':
      const id = action.type === 'GROUP_IM_RECEIVED'
        ? action.groupId
        : action.conferenceId

      const oldChatData = state[id]
      const updatedChatData = imChat(oldChatData, action)

      return oldChatData === updatedChatData
        ? state
        : {
          ...state,
          [id]: updatedChat
        }

    case 'IM_START_TYPING':
    case 'IM_STOP_TYPING':
      const oldIMChatData = state[action.chatUUID]
      if (oldIMChatData == null) return state

      const newIMChatData = imChat(oldIMChatData, action)
      return newIMChatData === oldIMChatData
        ? state
        : {
          ...state,
          [action.chatUUID]: newIMChatData
        }

    case 'StartSavingIMMessages':
    case 'didSaveIMMessages':
      return Object.keys(action.chats).reduce((state, key) => {
        const newChatData = imChat(state[key], action)
        state[key] = newChatData
        return state
      }, { ...state })

    case 'IMHistoryStartLoading':
    case 'IMHistoryLoaded':
      return {
        ...state,
        [action.chatUUID]: imChat(state[action.chatUUID], action)
      }

    case 'DidLogout':
    case 'UserWasKicked':
      return {}

    default:
      return state
  }
}
