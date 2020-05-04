import React, { Component } from 'react'
import io from 'socket.io-client';
import qs from 'query-string';
import { Redirect } from 'react-router-dom';

const socket = io('localhost:8000');

class AddRooms extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      removeText: '',
      text: '',
      rooms: [],
      joinRoom: false
    }
  }

  onChange = (e) => {
    this.setState({ text: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();

    // emit rooms to server!
    socket.emit('createdRoom', this.state.text);

    this.setState({ removeText: this.state.text, text: '' });
  };

  componentDidMount() {
    const { name, room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    console.log('updated room: ', room);

    // Listening for rooms from server!
    socket.on('getRooms', rooms => {
      let newRoom = {room: rooms};

      let myRooms = this.state.rooms;
      myRooms.push(newRoom);

      this.setState({ rooms: myRooms });
    });
  }

  componentDidUpdate() {
    console.log('rooms', this.state.rooms);
  };

  joinRoom = () => {
    this.setState({ joinRoom: true });
  };

  render() {
    const { text, rooms, joinRoom } = this.state;

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
          {rooms.map(room => {
            if (joinRoom) return <Redirect to={`/chat?name=${this.props.currentUsername}&room=${room.room}`} />
            return (
              // <Link to={`/chat?name=${this.props.currentUsername}&room=${room.room}`}>
              //   <li>{room.room}</li>
              // </Link>
              <li onClick={this.joinRoom}>{room.room}</li>
            );
          })}
        </ul>
      </div>
    )
  }
}

export default AddRooms
