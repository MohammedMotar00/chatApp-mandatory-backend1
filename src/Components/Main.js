import React, { Component } from 'react'
import { Link } from 'react-router-dom';

import './Style.css'

class Main extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      username: ''
    }
  }

  setUsername = (e) => {
    this.setState({ username: e.target.value });
  };

  render() {
    const { username } = this.state;

    return (
      <div className="join-container">
        <header className="join-header">
          <h1><i className="fas fa-smile"></i> Motar ChatApp</h1>
        </header>
        <main className="join-main">
          <form>
            <div className="form-control">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                value={username}
                name="username"
                id="username"
                placeholder="Enter username..."
                onChange={this.setUsername.bind(this)}
                required
              />
            </div>
            <Link to={`/chat?name=${username}&room=ec`}>
              <button type="submit" class="btn">Join Chat</button>
            </Link>
          </form>
        </main>
		</div>
    )
  }
}

export default Main
