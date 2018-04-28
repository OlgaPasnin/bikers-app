const submitBtn = document.getElementById("submit-btn");
const formData= document.getElementById("login-form");

submitBtn.addEventListener("click", function(e){
  e.preventDefault();

  let jsonObject = {};

  for (const [key, value]  of formData.entries()) {
      jsonObject[key] = value;
  }

  fetch('http://example.com/cats.json', {
      body: JSON.stringify(formData), // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, same-origin, *omit
      headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'login', // no-cors, cors, *same-origin
      redirect: 'follow', // *manual, follow, error
      referrer: 'no-referrer', // *client, no-referrer
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
});
