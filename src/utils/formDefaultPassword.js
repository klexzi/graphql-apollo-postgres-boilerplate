import { capitalize } from 'lodash';

/**
 * generate default password for users who are created through social auth,
 * this should never be used to login but just to fill the password column and require user to change password when they
 * want to use a password to login.
 * @param {string} firstName the first name of the user to form the password with
 */
const formDefaultPassword = (firstName) => `${capitalize(firstName)}123`;

export default formDefaultPassword;
