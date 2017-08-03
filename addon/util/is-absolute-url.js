const HTTP = /^(http|https):\/\//;

export default url => {
  if(!url) {
    return false;
  }
  return HTTP.test(url);
};
