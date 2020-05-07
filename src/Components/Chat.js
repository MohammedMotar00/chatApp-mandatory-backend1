import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
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
      users: [],
      currentUsername: '',
      currentRoom: '',

      roomLeaved: false,
      messagesDB: [],
      msgDB: [],
      path: '',

      welcomeToChat: {}
    }
  }

  updateValue = (e) => {
    this.setState({ value: e.target.value });
    console.log('ecc', e.target.value)
  };

  submitForm = (e) => {
    e.preventDefault();
    this.setState({ removeValue: this.state.value, value: '' });

    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    console.log('vilket rum: ', room)
    console.log('vilket rum: ', window.location.href)
    this.setState({ path: window.location.href });

    // Emit message to server
    socket.emit('chatMessage', this.state.value, room);
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    console.log('updated room: ', room)

    this.setState({ currentUsername: name });
    this.setState({ currentRoom: room });
    this.setState({ room: room });

    console.log('current room: ', this.state.room)
    console.log('current room: ', room)

    socket.emit('joinRoom', { name, room });

    // Get room  and users
    socket.on('roomUsers', ({ room, users }) => {
      this.setState({ room: room });
      this.setState({ users: users });
    });

    socket.on('welcomeMsg', msg => {
      console.log('welcome: ', msg);
      this.setState({ welcomeToChat: msg });
    });

    socket.on('message', message => {
      console.log('msg: ', message);

      let myMessages = this.state.messages;
      myMessages.push(message);

      this.setState({ messages: myMessages });
    });


    socket.on('oldMsg', data => {
      console.log('old messages: ', data)
      this.setState({ messagesDB: data });
    });
  }

  leaveRoom = () => {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    this.setState({ roomLeaved: true });

    socket.emit('userLeftRoom', {name, room});
    socket.removeAllListeners('joinRoom')
  };

  componentDidUpdate(prevProps, prevState) {
      if (prevState.room !== this.state.room) {
      const { name, room } = qs.parse(window.location.search, {
        ignoreQueryPrefix: true
      });
      
      // if (room)
      console.log('room name: ',room)
      this.setState({ currentRoom: room });
    }

    console.log('this room: ', this.state.DB);
    console.log('welcome: ', this.state.welcomeToChat);
  }

  componentWillUnmount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    // socket.emit('leaveRoom')
    socket.off();
    console.log('updated room: ', 'room leaved')
  }

  DB = (msg) => {
    console.log('DB msg: ', msg);
    this.setState({ msgDB: msg });
    this.setState({ messagesDB: [] });
    this.setState({ messages: [] });
  };

  render() {
    const { value, messages, room, users, currentUsername, roomLeaved, messagesDB, msgDB, welcomeToChat } = this.state;

    if (roomLeaved) return <Redirect to="/" />

    return (
      <div class="chat-container">
        <header class="chat-header">
          <h1><i class="fas fa-smile"></i> Motar ChatApp</h1>
          {/* <Link to="/">
            <p class="btn">Leave Room</p>
          </Link> */}
          <p onClick={this.leaveRoom} class="btn">Leave Room</p>
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

            {/* <h3>Available rooms:</h3> */}
            <p>+</p>
            <AddRooms currentUsername={currentUsername} DB={this.DB} />
          </div>

          <div class="chat-messages">
            {/* Welcome to chat app */}
            <div className="message">
              <p className="meta"> {welcomeToChat.username} <span>{welcomeToChat.time}</span> </p>
            </div>

            {/* när jag klickar på rummet */}
            {msgDB.map(message => {
              console.log('kung: ', message);
              return (
                <div className="message">
                  <p className="meta"> {message.username} <span>{message.time}</span></p>
                  <p className="text">{message.msg}</p>
                </div>
              );
            })}

            {/* funkar när sidan refreshar! */}
            {messagesDB.map(message => {
              console.log('kung: ', message);
              return (
                <div className="message">
                  <p className="meta"> {message.username} <span>{message.time}</span></p>
                  <p className="text">{message.msg}</p>
                </div>
              );
            })}

            {messages.map(message => {
              console.log('kung: ', message);
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
