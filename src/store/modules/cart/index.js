import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state = {
  items: 0
};

const namespaced = true;

export default {
  namespaced,
  state,
  actions,
  getters,
  mutations
};
