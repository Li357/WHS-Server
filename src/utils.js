const dateTypes = {
  1: 'Assembly',
  2: 'No School',
  3: 'Late Start',
  4: 'Early Dismissal',
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) {
    return match[2] !== 'undefined' ? match[2] : null;
  };
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

// eslint-disable-next-line import/prefer-default-export
export { getCookie, dateTypes, deleteCookie };
