import React, {
  PropTypes as T,
  Component,
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as SocketActions from '../actions/Socket.js';
import io from 'socket.io-client';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
  },
  sendBtn: {
    padding: 10,
    margin: '0 0 0 20px',
  },
  sendWrapper: {
    width: '100%',
    height: 70,
    borderBottom: '1px solid #9b9b9b',
    padding: 20,
  },
  infoWrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  listWrapper: {
    flex: 0.3,
    flexWrap: 'wrap',
    height: '100vh',
    padding: '20px 0 0 0',
    borderRight: '1px solid #9b9b9b',
    marginRight: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  list: {
    letterSpacing: 1.5,
    fontSize: 17,
    padding: 10,
    display: 'flex',
    alignItems: 'center',
  },
  msgWrapper: {
    flex: 1,
    flexWrap: 'wrap',
    padding: '20px 0 0 0',
  },
  msgBox: {
    width: '100%',
  },
  msgs: {
    fontSize: 15,
    letterSpacing: 1.5,
    marginTop: 10,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    margin: '0 0 0 10px',
  },
};

const socket = io.connect('http://localhost:1733', {
  query: 'name=Server',
});

class MainBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      receive: [],
      clients: [],
    };
  }

  componentWillMount() {
    socket.on('connected', (data) => {
      this.setState({
        receive: [
          ...this.state.receive,
          data.content,
        ],
      });
    });
    socket.on('checkUser', (data) => {
      this.setState({
        clients: data.list,
      });
    });
    socket.on('receive', (data) => {
      this.setState({
        receive: [
          ...this.state.receive,
          data.content,
        ],
      });
    });
    socket.on('disconnection', (data) => {
      this.setState({
        receive: [
          ...this.state.receive,
          data.content,
        ],
        clients: data.list,
      });
    });
  }

  sending() {
    const {
      sendMessage,
    } = this.props;

    sendMessage(socket);
  }

  render() {
    const {
      receive,
      clients,
    } = this.state;

    console.log(clients);
    return (
      <div style={styles.wrapper}>
        <div style={styles.sendWrapper}>
          Server Monitor
        </div>
        <div style={styles.infoWrapper}>
          <div style={styles.listWrapper}>
            {clients.map((client, idx) => (
              <li key={idx} style={styles.list}>
                {`► ${client.payloads && client.payloads.name}`}
                <img alt="pic" style={styles.photo} src={client.payloads && client.payloads.avatar} />
              </li>
            ))}
          </div>
          <div style={styles.msgWrapper}>
            {receive.length && receive.map((message, idx) => (
              <div style={styles.msgBox} key={idx}>
                <span style={styles.msgs}>{message || '- Lost message -'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

MainBoard.propTypes = {
  getConnection: T.func,
  sendMessage: T.func,
};

export default connect(
  (state) => ({
    messages: state.Socket.message,
  }),
  dispatch => bindActionCreators({
    ...SocketActions,
  }, dispatch),
)(MainBoard);
