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
    height: '100vh',
    width: '100%',
  },
  sendBtn: {
    padding: 10,
    margin: '0 0 0 20px',
  },
  infoWrapper: {
    width: '100%',
    height: 50,
  },
  msgWrapper: {
    flex: 1,
    flexWrap: 'wrap',
  },
  msgBox: {
    width: '100%',
  },
};

const socket = io.connect('http://localhost:1733');

class MainBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      receive: [],
    };
  }

  componentWillMount() {
    socket.on('receive', (data) => {
      this.setState({
        receive: [
          ...this.state.receive,
          data.content,
        ],
      });
    });
  }

  sending() {
    const {
      sendMessage,
    } = this.props;

    sendMessage();
  }

  render() {
    const {
      receive,
    } = this.state;

    return (
      <div style={styles.wrapper}>
        <div style={styles.infoWrapper}>
          You can send message:
          <button style={styles.sendBtn} onClick={this.sending.bind(this)}>send!</button>
        </div>
        <div style={styles.msgWrapper}>
          {receive.length && receive.map((message, idx) => (
            <div style={styles.msgBox} key={idx}>
              <span>{message || '-Lost message-'}</span>
            </div>
          ))}
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
