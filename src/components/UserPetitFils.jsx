import React from 'react';

import Nexus from 'react-nexus';
const { deps } = Nexus;

export default deps(({ postId }) => ({
  stores: {
    postUser: `/posts/${postId}`,
  },
}))(class UserPetitFils extends React.Component {
  static displayName = 'UserPetitFils';

  static propTypes = {
  };

  render() {
    const { postUser, postId } = this.props;
    console.log('refreshed !' + postId);
    if(postUser.isPending()) {
      return <div className='UserPetitFils pending'>
        &nbsp;&nbsp;&nbsp;&nbsp;{`Petit Fils ${postId}`}
        {'Loading...'}
      </div>;
    }
    if(postUser.isRejected()) {
      return <div className='UserPetitFils rejected'>
        &nbsp;&nbsp;&nbsp;&nbsp;{`Petit Fils ${postId}`}
        {'Error: '}{postUser.reason}
      </div>;
    }
    return <div className='User'>
      &nbsp;&nbsp;&nbsp;&nbsp;{`Petit Fils ${postId}`}
      <div>{postUser.value.body}</div>
    </div>;
  }
})
