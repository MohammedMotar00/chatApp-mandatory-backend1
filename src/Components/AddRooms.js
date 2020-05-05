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
      createdRooms: []
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
      room: text
    }

    let myRooms = this.state.rooms;
    myRooms.push(roomObj);

    this.setState({ rooms: myRooms });

    console.log('cRoom: ', roomObj);

    this.setState({ removeText: this.state.text, text: '' });
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    console.log('updated room: ', room);

    console.log('room name: ',this.state.currentRoom)

    this.setState({ currentRoom: room });

    // Listening for rooms from server!
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
  //   const { name, room } = qs.parse(window.location.search, {
  //     ignoreQueryPrefix: true
  //   });

  //   if (room !== this.state.currentRoom) {
  //   console.log('room name: ',room)
  //   this.setState({ currentRoom: room });
  // }

  console.log('createdRooms: ', this.state.createdRooms);
}

  joinRoom = () => {
    this.setState({ joinRoom: true });
  };

  joinRoomDB = (room) => {
    this.setState({ joinRoomDB: true });
    // console.log('rum namn: ', room);

    console.log('rum namn qs: ', room)
    let name = this.props.currentUsername
    socket.emit('joinRoom', { name, room });
  };

  deleteRoom = (id) => {
    console.log('delete room: ', id);
    socket.emit('deleteRoom', id);
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
          {createdRooms.map(rooms => {
            // if (joinRoomDB) return <Redirect to={`/chat?name=${this.props.currentUsername}&room=${rooms.createdRoom}`} />
            return (
              <div>
                <Link to={`/chat?name=${this.props.currentUsername}&room=${rooms.createdRoom}`}>
                  <li onClick={() => this.joinRoomDB(rooms.createdRoom)} id={rooms._id}>{rooms.createdRoom}</li>
                </Link>
                <button onClick={() => this.deleteRoom(rooms._id)}>Delete room</button>
              </div>
            );
          })}

          {rooms.map(room => {
            // if (joinRoom) return <Redirect to={`/chat?name=${this.props.currentUsername}&room=${room.room}`} />
            console.log('checkroom: ', room);
            return (
              <div>
                <Link to={`/chat?name=${this.props.currentUsername}&room=${room.room}`}>
                  <li onClick={this.joinRoom}>{room.room}</li>
                </Link>
                {/* <button onClick={() => this.deleteRoom(rooms._id)}>Delete room</button> */}
              </div>
            );
          })}
        </ul>
      </div>
    )
  }
}

export default AddRooms
