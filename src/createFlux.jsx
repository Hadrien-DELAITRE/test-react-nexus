import _ from 'lodash';
import should from 'should/as-function';

import Nexus from 'react-nexus';
const { Flux, Memory, HTTP } = Nexus;

const action = (...args) => Memory.Action.create(...args);
const storeMemory = (...args) => Memory.Store.create(...args);
const storeHTTP = (...args) => HTTP.Store.create(...args);

function createFlux() {
  const flux = Flux.create({
    actions: [
      action('/users/create', async function createUser(query, { userId, nickname }) {
        should(userId).be.a.String();
        should(nickname).be.a.String();
        const users = (await flux.store('/users').fetch({})).value;
        should(users).not.have.ownProperty(userId);
        flux.store('/users/:userId').set({ userId }, { nickname });
        flux.store('/users').set({}, _.assign({}, users, { [userId]: `/users/${userId}` }));
      }),
      action('/users/:userId/delete', async function deleteUser({ userId }) {
        should(userId).be.a.String();
        const users = (await flux.store('/users').fetch({})).value;
        should(users).have.ownProperty(userId);
        flux.store('/users/:userId').delete({ userId });
        flux.store('/users').set({}, _.omit(users, userId));
      }),
      action('/users/:userId/update', async function updateUser({ userId }, { nickname }) {
        should(userId).be.a.String();
        const users = (await flux.store('/users').fetch({})).value;
        should(users).have.ownProperty(userId);
        flux.store('/users/:userId').set({ userId }, { nickname });
      }),
    ],
    stores: [
      storeMemory('/users')
        .set({}, {
          '1': '/users/1',
          '2': '/users/2',
        }),
      storeMemory('/users/:userId')
        .set({ userId: '1' }, { nickname: 'Alice' })
        .set({ userId: '2' }, { nickname: 'Bob' }),
      storeHTTP('/posts/:postId', {
        host: 'jsonplaceholder.typicode.com',
        protocol: 'http',
      }),
    ],
  });

  return flux;
}

export default createFlux;
