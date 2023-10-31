// This function returns an empty string if there was no errors.
export default function validateUserInput(username: string, password: string):string {
  // Check if the username is empty
  if (username.length === 0) {
    return 'Please enter a username';
  }

  // Check if the username starts with a space
  if (username[0] === ' ') {
    return 'Username cannot start with a space';
  }

  // Check if the password is empty
  if (password.length === 0) {
    return 'Please enter a password';
  }

  // Remove spaces from the username and password
  const pureName = username.replace(/ /g, '');
  const purePass = password.replace(/ /g, '');

  // Check if the username contains only spaces
  if (pureName.length === 0) {
    return 'Please enter a username that isn\'t filled with spaces';
  }

  // Check if the password contains only spaces
  if (purePass.length === 0) {
    return 'Please enter a password that isn\'t filled with spaces';
  }

  // Input validation passed
  return '';
}