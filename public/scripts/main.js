
let backendURL = "https://bikers-app.herokuapp.com/";
let checkinURL = backendURL + "checkin";
let loginURL = backendURL + "login"
let registerURL = backendURL + "register"

let handleBarSource = document.getElementById("my-template").innerHTML;
let checkinForm = document.getElementById("popup").innerHTML;
let handleBarRegisterSource = document.getElementById("reg-template").innerHTML;
let mainDiv = document.getElementById("mainDiv").innerHTML;

const checkinBtn = document.getElementById("checkinBtn");
let registerBtn;
let regSubmitBtn;
let loginSubmitBtn;

const mainDivDefault = mainDiv;
const logoutBtnHTML = '<button id="logoutBtn">Logout</button>'
const registerBtnHTML = '<button id="registerBtn">Login / Register</button>'
let handleBarContext = {
  placeName: "empty"
}

let isLoggedIn = false;
let loggedInEmail = "";


// var clearForm = function(){dressForm.reset();}

let isUpdate = false;


let checkingBtnAjaxHandler = () => {
  console.log("CHECKING AJAX: Done");
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

let regsiterAjaxHandler = (responseObj) => {
  //let registerObj = JSON.parse(responseObj)
  let registerObj = responseObj;
  console.log("regsiterAjaxHandler: ");
  console.log(registerObj);
}

let loginAjaxHandler = (responseObj) => {
  //let registerObj = JSON.parse(responseObj)
  let loginObj = responseObj;
  console.log("loginAjaxHandler: ");
  console.log(loginObj);
}


checkinBtn.addEventListener('click', function (e) {
  let checkinData = {
    locationId: placeID,
    locationName: place.name
  };
  ajaxCall("POST", checkinURL, checkingBtnAjaxHandler, checkinData)
});

let setIsLoggedInAjaxCall = () => {
  ajaxCall("GET", loginURL, loginCheckAjaxHandler);
}

let registerAjaxCall = (regRequestObj) => {
  ajaxCall("POST", registerURL, regsiterAjaxHandler, regRequestObj);
}

let loginAjaxCall = (loginRequestObj) => {
  ajaxCall("POST", loginURL, loginAjaxHandler, loginRequestObj);
}

let updateLoginRegSection = () => {
  console.log("isLoggedIn: " + isLoggedIn);
  if (isLoggedIn){
    const logoutHTML = "<span>" + loggedInEmail + "</span>" + logoutBtnHTML;
    $("#login-reg").html(logoutHTML);
  }
  else {
    $("#login-reg").html(registerBtnHTML);
    registerBtn = document.getElementById("registerBtn");
    registerBtn.addEventListener('click', function (e) {
      showRegisterScreen();
    });
  }
}

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
    console.log()
    $("#mainDiv").html(mainDivDefault);
    initMap(defaultZoom, locationEngland);
    setIsLoggedInAjaxCall();
    searchMapsBtnAddListener();
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
    console.log()
    $("#mainDiv").html(mainDivDefault);
    initMap(defaultZoom, locationEngland);
    searchMapsBtnAddListener();
    setIsLoggedInAjaxCall();
  });
}


var ajaxCall = function(ajaxMethod, ajaxURL, ajaxHandlerFunction, ajaxData){
  var xmlhttp = new XMLHttpRequest();

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

setIsLoggedInAjaxCall();
