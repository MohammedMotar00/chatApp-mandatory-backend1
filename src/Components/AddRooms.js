import React, { Component } from 'react'
import io from 'socket.io-client';

const socket = io('localhost:8000');

class AddRooms extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      removeText: '',
      text: '',
      rooms: []
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

  render() {
    const { text } = this.state;

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
      </div>
    )
  }
}

export default AddRooms
