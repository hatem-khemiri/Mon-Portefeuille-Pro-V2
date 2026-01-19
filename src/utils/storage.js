export const loadUserData = (username) => {
  try {
    const dataStr = localStorage.getItem(`user_data_${username}`);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
    return null;
  } catch (error) {
    console.error('Erreur chargement données:', error);
    return null;
  }
};

export const saveUserData = (username, data) => {
  try {
    localStorage.setItem(`user_data_${username}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    return false;
  }
};

export const checkUserExists = (username) => {
  return localStorage.getItem(`user_${username}`) !== null;
};

export const saveUserCredentials = (username, password) => {
  localStorage.setItem(`user_${username}`, password);
};

export const saveSecurityQuestion = (username, question, answer) => {
  localStorage.setItem(`security_${username}`, JSON.stringify({
    question,
    answer: answer.toLowerCase().trim()
  }));
};

export const getSecurityQuestion = (username) => {
  const data = localStorage.getItem(`security_${username}`);
  return data ? JSON.parse(data) : null;
};

export const getCurrentUser = () => {
  return localStorage.getItem('current_user');
};

export const setCurrentUser = (username) => {
  localStorage.setItem('current_user', username);
};

export const clearCurrentUser = () => {
  localStorage.removeItem('current_user');
};

export const deleteUserAccount = (username) => {
  localStorage.removeItem(`user_data_${username}`);
  localStorage.removeItem(`user_${username}`);
  localStorage.removeItem(`security_${username}`);
  clearCurrentUser();
};