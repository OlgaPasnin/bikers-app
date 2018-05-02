let backendURL = "https://bikers-app.herokuapp.com/";
// let backendURL = "localhost:3000/"
let checkinURL = backendURL + "checkin";
let loginURL = backendURL + "login"
let logoutURL = backendURL + "logout"
let registerURL = backendURL + "register"

let handleBarSource = document.getElementById("my-template").innerHTML;
let checkinForm = document.getElementById("popup").innerHTML;
let handleBarRegisterSource = document.getElementById("reg-template").innerHTML;
let mainDiv = document.getElementById("mainDiv").innerHTML;

let checkinBtn;
let registerBtn;
let regSubmitBtn;
let loginSubmitBtn;
let logoutBtn;

const mainDivDefault = mainDiv;
const logoutBtnHTML = '<button id="logoutBtn" class="btn">Logout</button>'
const registerBtnHTML = '<button class="btn" id="registerBtn">Login / Register</button>'
let handleBarContext = {
  placeName: "empty"
}

let isLoggedIn = false;
let loggedInEmail = "";

addCheckinListener();

setIsLoggedInAjaxCall();

let setIsLoggedInAjaxCall = () => {
  ajaxCall("GET", loginURL, loginCheckAjaxHandler);
}

let loginCheckAjaxHandler = (responseObj) => {
  let loginObj = JSON.parse(responseObj)
  console.log("loginCheckAjaxHandler: ");
  console.log(loginObj);
  if(loginObj){
    if (loginObj.email){
      loggedInEmail = loginObj.email
      isLoggedIn = true;
    }
    updateLoginRegSection();
  }
}

let updateLoginRegSection = () => {
  console.log("isLoggedIn: " + isLoggedIn);
  if (isLoggedIn){
    const logoutHTML = "<span class='username' >" + loggedInEmail + "</span>" + logoutBtnHTML;
    $("#login-reg").html(logoutHTML);
    addLogoutListener();
  }
  else {
    $("#login-reg").html(registerBtnHTML);
    registerBtn = document.getElementById("registerBtn");
    registerBtn.addEventListener('click', function (e) {
      showRegisterScreen();
    });
  }
}

/// SHOW REGISTER AND LOGIN FORMS
let showRegisterScreen = () => {
  let handleBarsRegisterTemplate = Handlebars.compile(handleBarRegisterSource);
  let handleBarRegisterHtml = handleBarsRegisterTemplate(handleBarsRegisterTemplate);
  $("#mainDiv").html(handleBarRegisterHtml);
  regSubmitBtn = document.getElementById("regSubmitBtn");
  loginSubmitBtn = document.getElementById("loginSubmitBtn");

  regSubmitBtn.addEventListener('click', function (e) {
    let registerRequestObj = {}
    let regInput = document.getElementsByClassName("regInput");
    console.log("Input elemnts are: ");
    console.log(regInput);
    [].forEach.call(regInput, function(item){
      registerRequestObj[item.name] = item.value;
    });
    console.log("User registration object is: ");
    console.log(registerRequestObj);
    registerAjaxCall(registerRequestObj);
    reinitializeMainPage();
  });

  loginSubmitBtn.addEventListener('click', function (e) {
    let loginRequestObj = {}

    let loginInput = document.getElementsByClassName("loginInput");
    console.log("Input elemnts are: ");
    console.log(loginInput);
    [].forEach.call(loginInput, function(item){
      loginRequestObj[item.name] = item.value;
    });
    console.log("User login object is: ");
    console.log(loginRequestObj);
    loginAjaxCall(loginRequestObj);
    reinitializeMainPage();
    setIsLoggedInAjaxCall();
  });

}

let registerAjaxCall = (regRequestObj) => {
  ajaxCall("POST", registerURL, regsiterAjaxHandler, regRequestObj);
}

let regsiterAjaxHandler = (responseObj) => {
  //let registerObj = JSON.parse(responseObj)
  let registerObj = responseObj;
  console.log("regsiterAjaxHandler: ");
  console.log(registerObj);
  location.reload();
}


let loginAjaxCall = (loginRequestObj) => {
  ajaxCall("POST", loginURL, loginAjaxHandler, loginRequestObj);
}

let loginAjaxHandler = (responseObj) => {
  //let registerObj = JSON.parse(responseObj)
  let loginObj = responseObj;
  console.log("loginAjaxHandler: ");
  console.log(loginObj);
  location.reload();
}

let addCheckinListener = () => {
  checkinBtn = document.getElementById("checkinBtn");
  checkinBtn.addEventListener('click', function (e) {
    let checkinData = {
      locationId: placeID,
      locationName: place.name
    };
    console.log("Location to checkin:");
    console.log(checkinData);
    ajaxCall("POST", checkinURL, checkingBtnAjaxHandler, checkinData)
  });
}

let checkingBtnAjaxHandler = () => {
  console.log("CHECKIN AJAX: Done");
}

let addLogoutListener = () => {
  logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener('click', function (e) {
    ajaxCall("GET", logoutURL, logoutAjaxHandler)
  });
}

let logoutAjaxHandler = (responseObj) => {
  //let registerObj = JSON.parse(responseObj)
  let logoutObj = responseObj;
  console.log("logoutAjaxHandler: ");
  console.log(logoutObj);
  location.reload();
}

/// SHOW MAIN PAGE WITH MAP
let reinitializeMainPage = () => {
  $("#mainDiv").html(mainDivDefault);
  initMap(defaultZoom, locationEngland);
  addCheckinListener();
  searchMapsBtnRemoveListener();
  searchMapsBtnAddListener();
  setIsLoggedInAjaxCall();
}

// This function allows to send AJAX calls to servers
let ajaxCall = function(ajaxMethod, ajaxURL, ajaxHandlerFunction, ajaxData){
  let xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    //console.log('state changed', xmlhttp.readyState);
      if (xmlhttp.readyState === XMLHttpRequest.DONE ) {
         if (xmlhttp.status >= 200 || xmlhttp.status <= 299 ) {
            ajaxHandlerFunction(xmlhttp.responseText);
         }
         else if (xmlhttp.status === 404) {
            // alert('The resource was not found');
            $("#errorPanel").html("The resource was not found");
         }
         else {
             //alert('Error: Call to server failed with code: ' + xmlhttp.status);
             $("#errorPanel").html("Error: Call to server failed with code: " + xmlhttp.status);
         }
      }
  };

  xmlhttp.open(ajaxMethod, ajaxURL, true);

  if (ajaxMethod == "POST" || ajaxMethod == "PUT" ){
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(ajaxData));
  }
  else {
    xmlhttp.send();
  }
}
