import React, { Component } from 'react'
import io from 'socket.io-client';
import qs from 'query-string';
import { Link, Redirect } from 'react-router-dom';

const socket = io('localhost:8000');

class AddRooms extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      removeText: '',
      text: '',
      rooms: [],

      currentRoom: '',
      createdRooms: [],

      msgDB: [],
      path: ''
    }
  }

  onChange = (e) => {
    this.setState({ text: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();

    const {text} = this.state;

    // emit rooms to server!
    socket.emit('createdRoom', this.state.text);

    let roomObj = {
      id: Math.random().toString(36).substr(2, 9),
      room: text
    }

    let myRooms = this.state.rooms;
    myRooms.push(roomObj);

    this.setState({ rooms: myRooms });

    this.setState({ removeText: this.state.text, text: '' });
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    this.setState({ currentRoom: room });

    socket.on('oldMsg', data => {
    });

    socket.on('alreadyCreatedRooms', rooms => {
      this.setState({ createdRooms: rooms });
    });
  }

  joinRoom = (room) => {
    this.props.updatedRoomName(room);

    let name = this.props.currentUsername
    socket.emit('joinRoom', { name, room });

    socket.on('oldMsg', data => {
      this.setState({ msgDB: data });
      this.props.DB(data)
    });
  };

  joinRoomDB = (room) => {
    this.props.updatedRoomName(room);

    this.setState({ currentRoom: room });
    let name = this.props.currentUsername
    socket.emit('joinRoom', { name, room });

    socket.on('oldMsg', data => {
      this.setState({ msgDB: data });
      this.props.DB(data)
    });
  };

  defaultRoom = () => {
    let name = this.props.currentUsername
    let room = 'default';

    this.props.updatedRoomName(room);

    socket.emit('joinRoom', { name, room });

    socket.on('oldMsg', data => {
      this.setState({ msgDB: data });
      this.props.DB(data)
    });
  };

  deleteRoomDB = (id, room) => {
    socket.emit('deleteRoomDB', id, room);

    const myRoom = [...this.state.createdRooms];
    const removeRoom = myRoom.filter(x => x._id !== id);

    this.setState({ createdRooms: removeRoom });
  };

  deleteRoom = (id, room) => {
    socket.emit('deleteRoom', room);

    const myRoom = [...this.state.rooms];
    const removeRoom = myRoom.filter(x => x.id !== id);

    this.setState({ rooms: removeRoom });
  };

  render() {
    const { text, rooms, createdRooms } = this.state;

    return (
      <div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <input 
            type="text"
            value={text}
            onChange={this.onChange.bind(this)}
          />
          <button type="submit">Add room</button>
        </form>
        <ul>
          <h3>Available rooms:</h3>
          <div>
            <Link style={{ color: 'white' }} to={`/chat?name=${this.props.currentUsername}&room=default`}>
              <li onClick={this.defaultRoom}>Default Room</li>
            </Link>
          </div>
          {createdRooms.map(rooms => {
            return (
              <div>
                <Link style={{ color: 'white' }} to={`/chat?name=${this.props.currentUsername}&room=${rooms.createdRoom}`}>
                  <li onClick={() => this.joinRoomDB(rooms.createdRoom)} id={rooms._id}>{rooms.createdRoom}</li>
                </Link>
                <button onClick={() => this.deleteRoomDB(rooms._id, rooms.createdRoom)}>Delete room</button>
              </div>
            );
          })}

          {rooms.map(room => {
            return (
              <div>
                <Link style={{ color: 'white' }} to={`/chat?name=${this.props.currentUsername}&room=${room.room}`}>
                  <li onClick={() => this.joinRoom(room.room)}>{room.room}</li>
                </Link>
                <button onClick={() => this.deleteRoom(room.id, room.room)}>Delete room</button>
              </div>
            );
          })}
        </ul>
      </div>
    )
  }
}

export default AddRooms
