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
      joinRoom: false,
      joinRoomDB: false,

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

    console.log('cRoom: ', this.state.text);

    let roomObj = {
      id: Math.random().toString(36).substr(2, 9),
      room: text
    }

    let myRooms = this.state.rooms;
    myRooms.push(roomObj);

    this.setState({ rooms: myRooms });

    console.log('cRoom: ', roomObj);

    this.setState({ removeText: this.state.text, text: '' });

    // socket.on('getRooms', rooms => {
    //   console.log('createdRooms: ', rooms);
    //   // this.setState({ createdRooms: rooms });
    // });
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    console.log('updated room: ', room);

    this.setState({ currentRoom: room });

    socket.on('oldMsg', data => {
      console.log('old messages: ', data)
    });

    // // Listening for rooms from server!
    // socket.on('getRooms', rooms => {
    //   let newRoom = {room: rooms};

    //   console.log('rooms: ', rooms);

    //   let myRooms = this.state.rooms;
    //   myRooms.push(newRoom);

    //   this.setState({ rooms: myRooms });
    // });

    socket.on('alreadyCreatedRooms', rooms => {
      console.log('createdRooms: ', rooms);
      this.setState({ createdRooms: rooms });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentRoom !== this.state.currentRoom) {

    }
}

  joinRoom = (room) => {
    console.log('rum namn qs: ', room)
    let name = this.props.currentUsername
    socket.emit('joinRoom', { name, room });

    socket.on('oldMsg', data => {
      console.log('this room msg: ', data)
      this.setState({ msgDB: data });
      this.props.DB(data)
    });
  };

  joinRoomDB = (room) => {
    this.setState({ joinRoomDB: true });
    // console.log('rum namn: ', room);

    this.setState({ currentRoom: room });

    console.log('rum namn qs: ', room)
    let name = this.props.currentUsername
    socket.emit('joinRoom', { name, room });

    socket.on('oldMsg', data => {
      console.log('this room msg: ', data)
      this.setState({ msgDB: data });
      this.props.DB(data)
    });
  };

  defaultRoom = () => {
    // this.setState({ currentRoom: room });
    let name = this.props.currentUsername
    let room = 'default';

    console.log('defauult ', room);

    socket.emit('joinRoom', { name, room });

    socket.on('oldMsg', data => {
      console.log('this room msg: ', data)
      this.setState({ msgDB: data });
      this.props.DB(data)
    });
  };

  deleteRoomDB = (id, room) => {
    console.log('delete room: ', id);
    socket.emit('deleteRoomDB', id, room);

    const myRoom = [...this.state.createdRooms];
    const removeRoom = myRoom.filter(x => x._id !== id);

    this.setState({ createdRooms: removeRoom });
  };

  deleteRoom = (id, room) => {
    console.log('delete room: ', id, room);
    socket.emit('deleteRoom', room);

    const myRoom = [...this.state.rooms];
    const removeRoom = myRoom.filter(x => x.id !== id);

    this.setState({ rooms: removeRoom });
  };

  render() {
    const { text, rooms, joinRoom, joinRoomDB, createdRooms } = this.state;

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
            <Link to={`/chat?name=${this.props.currentUsername}&room=default`}>
              <li onClick={this.defaultRoom}>Default Room</li>
            </Link>
          </div>
          {createdRooms.map(rooms => {
            console.log('rooooms: ', rooms.createdRoom)
            return (
              <div>
                <Link to={`/chat?name=${this.props.currentUsername}&room=${rooms.createdRoom}`}>
                  <li onClick={() => this.joinRoomDB(rooms.createdRoom)} id={rooms._id}>{rooms.createdRoom}</li>
                </Link>
                <button onClick={() => this.deleteRoomDB(rooms._id, rooms.createdRoom)}>Delete room</button>
              </div>
            );
          })}

          {rooms.map(room => {
            // if (joinRoom) return <Redirect to={`/chat?name=${this.props.currentUsername}&room=${room.room}`} />
            console.log('checkroom: ', room);
            return (
              <div>
                <Link to={`/chat?name=${this.props.currentUsername}&room=${room.room}`}>
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
