import React from 'react';

import Nexus from 'react-nexus';
const { deps, Store } = Nexus;

import User from './User';
import UserPetitFils from './UserPetitFils';

export default deps(() => ({
  actions: {
    createUser: `/users/create`,
  },
  stores: {
    usersState: '/users',
  },
}))(class Users extends React.Component {
  static displayName = 'Users';

  static propTypes = {
    usersState: Store.State.propType(React.PropTypes.objectOf(React.PropTypes.string)),
  };

  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      initPost: 1,
    };
  }

  updateInputNickname(ev) {
    const nickname = ev.target.value;
    this.setState({ nickname });
  }

  shuffleProps() {
    const { initPost } = this.state;
    this.setState({ initPost: (initPost + 5) });
  }

  render() {
    const { usersState } = this.props;
    const { nickname, initPost } = this.state;
    if(usersState.isPending()) {
      return <div className='Users pending'>
        {'Loading...'}
      </div>;
    }
    if(usersState.isRejected()) {
      return <div className='Users rejected'>
        {'Error: '}{usersState.reason}
      </div>;
    }
    const postIdRefresh = 23;
    const newUserId = Object.keys(usersState.value).length + 1;
    return <div>
      <ul className='Users'>{Object.keys(usersState.value).map((userId) =>
        <li key={userId}>
          <User postId={parseInt(userId) + parseInt(initPost)} userId={userId} />
        </li>
      )}</ul>
      <input onChange={(ev) => this.updateInputNickname(ev)} />
      <button onClick={() => this.props.createUser({ userId: newUserId.toString(), nickname })}>{'+'}</button>
      <button onClick={() => this.shuffleProps()}>{'Shuffle !'}</button>
    </div>;
  }
});

/*
<User postId={postIdRefresh} userId={2} />
<UserPetitFils postId={postIdRefresh} />
<UserPetitFils postId={postIdRefresh} />
<UserPetitFils postId={postIdRefresh} />
<UserPetitFils postId={postIdRefresh} />
<UserPetitFils postId={postIdRefresh} />
*/
