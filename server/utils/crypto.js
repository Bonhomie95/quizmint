
const bcrypt = require('bcrypt');

exports.hashMnemonic = async (mnemonic) => {
  return await bcrypt.hash(mnemonic, 10);
};

exports.verifyMnemonic = async (mnemonic, hash) => {
  return await bcrypt.compare(mnemonic, hash);
};
