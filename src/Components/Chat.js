import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client';
import qs from 'query-string';

import './Style.css'

import AddRooms from './AddRooms';

const socket = io('localhost:8000');

class Chat extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      value: '',
      removeValue: '',
      messages: [],
      room: '',
      users: []
    }
  }

  updateValue = (e) => {
    this.setState({ value: e.target.value });
  };

  submitForm = (e) => {
    e.preventDefault();
    this.setState({ removeValue: this.state.value, value: '' });

    // Emit message to server
    socket.emit('chatMessage', this.state.value);
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    socket.emit('joinRoom', { name, room });

    // Get room  and users
    socket.on('roomUsers', ({ room, users }) => {
      this.setState({ room: room });
      this.setState({ users: users });
    });

    socket.on('message', message => {
      console.log(message);

      let myMessages = this.state.messages;
      myMessages.push(message);

      this.setState({ messages: myMessages });
    });
  }

  componentDidUpdate() {
    console.log(this.state.messages)
  }

  componentWillUnmount() {
    socket.off();
  }

  render() {
    const { value, messages, room, users } = this.state;

    return (
      <div class="chat-container">
        <header class="chat-header">
          <h1><i class="fas fa-smile"></i> Motar ChatApp</h1>
          <Link to="/">
            <p class="btn">Leave Room</p>
          </Link>
        </header>

        <main class="chat-main">
          <div class="chat-sidebar">
            <h3><i class="fas fa-comments"></i> Room Name:</h3>
            <h2 id="room-name">{room}</h2>

            <h3><i class="fas fa-users"></i> Users:</h3>
            <ul id="users">
              {users.map(user => {
                return (
                  <li>{user.username}</li>
                );
              })}
            </ul>

            <h3>Available rooms:</h3>
            <p>+</p>
            <AddRooms />
          </div>

          <div class="chat-messages">
            {messages.map(message => {
              return (
                <div className="message">
                  <p className="meta"> {message.username} <span>{message.time}</span></p>
                  <p className="text">{message.message}</p>
                </div>
              )
            })}
          </div>
        </main>

        <div class="chat-form-container">
          <form onSubmit={this.submitForm.bind(this)} id="chat-form">
            <input
              id="msg"
              value={value}
              type="text"
              placeholder="Enter Message"
              onChange={this.updateValue.bind(this)}
              required
              autocomplete="off"
            />
            <button class="btn"><i class="fas fa-paper-plane"></i> Send</button>
          </form>
        </div>
      </div>
    )
  }
}

export default Chat
