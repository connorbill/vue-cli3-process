import types from './types';
const randomInt = (min, max) => {
  console.log(1);
};
const generate = ({ commit, state }, options = {}) => {
  const { min = 0, max = 100 } = options;
  // async mock
  setTimeout(() => {
    commit(types.SUCCESS, {
      items: randomInt(min, max)
    });
  }, 5000);
};

export default {
  generate
};
