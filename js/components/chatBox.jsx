'use strict';

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

var React = require('react');

var localChatStore = require('../stores/localChatStore.js');
var ChatDialog = require('./chatDialog.jsx');
var chatMessageActions = require('../actions/chatMessageActions.js');

function getChat () {
  return {
    messages: localChatStore.getMessages()
  };
}

var ChatBox = React.createClass({
  displayName: 'ChatBox',

  getInitialState: function () {
    return getChat();
  },

  componentDidMount: function () {
    this.__removeToken = localChatStore.addListener(this._onChange);
  },

  componentWillUnmount: function () {
    this.__removeToken.remove();
  },

  _onChange: function () {
    this.setState(getChat());
  },

  render: function () {
    return (
      <div className='ChatBox'>Chats
        <ChatDialog data={this.state.messages} sendTo={function (text) {
          chatMessageActions.sendLocalChatMessage(text, 1, 0);
        }}/>
      </div>
    );
  }
});

module.exports = ChatBox;
