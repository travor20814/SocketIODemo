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

  componentWillReceiveProps(nextProps) {
    if (nextProps.messages && nextProps.messages !== '') {
      const msgBindName = `[ Server ]: ${nextProps.messages}`;

      this.setState({
        receive: [
          ...this.state.receive,
          msgBindName,
        ],
      });
    }
  }

  sending() {
    const {
      input,
    } = this.refs;

    const {
      sendMessage,
    } = this.props;

    sendMessage(socket, input.value);
  }

  render() {
    const {
      messages,
    } = this.props;

    const {
      receive,
      clients,
    } = this.state;

    return (
      <div style={styles.wrapper}>
        <div style={styles.sendWrapper}>
          You can send message: <input ref="input" type="text" />
          <button style={styles.sendBtn} onClick={this.sending.bind(this)}>send!</button>
        </div>
        <div style={styles.infoWrapper}>
          <div style={styles.listWrapper}>
            {clients.map((client, idx) => (
              <li key={idx} style={styles.list}>{client}</li>
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
  messages: T.string,
};

export default connect(
  (state) => ({
    messages: state.Socket.message,
  }),
  dispatch => bindActionCreators({
    ...SocketActions,
  }, dispatch),
)(MainBoard);
