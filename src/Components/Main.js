import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';

import './Style.css'

class Main extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      username: '',
      joinChat: false
    }
  }

  setUsername = (e) => {
    this.setState({ username: e.target.value });
  };

  joinChat = () => {
    this.setState({ joinChat: true });
  };

  render() {
    const { username, joinChat } = this.state;

    if (joinChat) return <Redirect to={`/chat?name=${username}&room=default`} />

    return (
      <div className="join__container">
        <header className="join__header">
          <h1>Motar ChatApp</h1>
        </header>
        <main className="join__main">
          <form>
            <div className="form__control">
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
            <button onClick={this.joinChat} type="submit" className="btn">Join Chat</button>
          </form>
        </main>
		</div>
    )
  }
}

export default Main
