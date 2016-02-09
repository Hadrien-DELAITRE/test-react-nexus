import React from 'react';

import Nexus from 'react-nexus';

import UserPetitFils from './UserPetitFils';

export default class UserFils extends React.Component {
  static displayName = 'UserFils';

  static propTypes = {
  };

  render() {
    const { postId } = this.props;

    return <div className='User'>
      &nbsp;&nbsp;{`Fils ${postId}`}
      <UserPetitFils postId={postId} />
    </div>;
  }
}
