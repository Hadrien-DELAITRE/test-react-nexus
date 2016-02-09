import React from 'react';

import Nexus from 'react-nexus';
const { deps, Store } = Nexus;

import UserFils from './UserFils';

export default deps(({ userId, postId }) => ({
  actions: {
    deleteUser: `/users/${userId}/delete`,
  },
  stores: {
    userState: `/users/${userId}`,
    postUser: `/posts/${postId}`,
  },
}))(class User extends React.Component {
  static displayName = 'User';

  static propTypes = {
    deleteUser: React.PropTypes.func,
    userState: Store.State.propType(React.PropTypes.shape({
      userId: React.PropTypes.string,
      nickname: React.PropTypes.string,
    })),
  };

  render() {
    const { userState } = this.props;
    const { postUser, postId } = this.props;
    if(userState.isPending()) {
      return <div className='User pending'>
        {'Loading...'}
      </div>;
    }
    if(userState.isRejected()) {
      return <div className='User rejected'>
        {'Error: '}{userState.reason}
      </div>;
    }
    if(postUser.isPending()) {
      return <div className='User pending'>
        {'Loading...'}
      </div>;
    }
    if(postUser.isRejected()) {
      return <div className='User rejected'>
        {'Error: '}{postUser.reason}
      </div>;
    }

    return <div className='User'>
      {userState.value.nickname}
      <button onClick={() => this.props.deleteUser()}>{'X'}</button>
      <div>{postUser.isPending() ? 'Loading...' : postUser.value.body}</div>
      <UserFils postId={postId} />
    </div>;
  }
});
