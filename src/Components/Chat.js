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
      users: [],
      currentUsername: '',
      currentRoom: '',

      roomLeaved: false,
      messagesDB: [],
      msgDB: [],

      welcomeToChat: {}
    }
  }

  updateValue = (e) => {
    this.setState({ value: e.target.value });
  };

  submitForm = (e) => {
    e.preventDefault();
    this.setState({ removeValue: this.state.value, value: '' });

    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    // Emit message to server
    socket.emit('chatMessage', this.state.value, room);
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    this.setState({ currentUsername: name });
    this.setState({ currentRoom: room });

    socket.emit('joinRoom', { name, room });

    // Hämtar rum och användar info från socket
    socket.on('roomUsers', ({ room, users }) => {
      this.setState({ users: users });
    });

    socket.on('welcomeMsg', msg => {
      this.setState({ welcomeToChat: msg });
    });

    socket.on('message', message => {
      let myMessages = this.state.messages;
      myMessages.push(message);

      this.setState({ messages: myMessages });
    });

    socket.on('oldMsg', data => {
      this.setState({ messagesDB: data });
    });
  }

  leaveRoom = () => {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    this.setState({ roomLeaved: true });

    socket.emit('userLeftRoom', {name, room});
    socket.removeAllListeners('joinRoom');
  };

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

  updatedRoomName = (roomName) => {
    this.setState({ currentRoom: roomName });
  };

  render() {
    const { value, messages, users, currentUsername, roomLeaved, messagesDB, msgDB, welcomeToChat, currentRoom } = this.state;

    if (roomLeaved) return <Redirect to="/" />

    return (
      <div className="chatApp__container">
        <header className="chatApp__header">
          <h1>Motar ChatApp</h1>
          <p onClick={this.leaveRoom} className="btn">Leave Room</p>
        </header>

        <main className="chatApp__main">
          <div className="chatApp__sidebar">
            <h3>Room Name:</h3>
            <h2 id="room__name">{currentRoom}</h2>

            <h3>Users:</h3>
            <ul id="users">
              {users.map(user => {
                return (
                  <li>{user.username}</li>
                );
              })}
            </ul>

            {/* <h3>Available rooms:</h3> */}
            <p>+</p>
            <AddRooms currentUsername={currentUsername} DB={this.DB} updatedRoomName={this.updatedRoomName} />
          </div>

          <div className="chatApp__messages">
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

        <div className="chatApp__form__container">
          <form onSubmit={this.submitForm.bind(this)} className="chatApp__form">
            <input
              id="msg"
              value={value}
              type="text"
              placeholder="Enter Message"
              onChange={this.updateValue.bind(this)}
              required
              autocomplete="off"
            />
            <button>Send</button>
          </form>
        </div>
      </div>
    )
  }
}

export default Chat
