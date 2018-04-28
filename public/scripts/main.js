var userList = document.getElementById('dress-list');
var source   = document.getElementById("my-template").innerHTML;

//Gets template markup from inside the script tag
var template = Handlebars.compile(source); //Returns a function we'll use to create HTML chunks
var submitBtn = document.getElementsByClassName("submit-button")[0];
var deleteBtns = document.getElementsByClassName("delete-button");
var editBtns = document.getElementsByClassName("edit-button");
var backendURL = "http://localhost:3000/dress/";
var dressForm = document.getElementById("dress-form")
var clearForm = function(){dressForm.reset();}

var isUpdate = false;


submitBtn.addEventListener('click', function (e) {
  e.preventDefault();
  var formData = new FormData(document.querySelector("form"));

  let jsonObject = {};

  for (const [key, value]  of formData.entries()) {
      jsonObject[key] = value;
  }

  //console.log(jsonObject);

  if(isUpdate){
    console.log(e)
    var editID = e.srcElement.form.classList[0];
    ajaxCall(
      "PUT",
      backendURL+editID,
      function(){
        console.log("UPDATE successful!")
        getAndShowDressesList();
      },
      JSON.stringify(jsonObject)
    )
  }else {
    ajaxCall(
      "POST",
      backendURL,
      function(){
        console.log("POST successful!")
        getAndShowDressesList();
      },
      JSON.stringify(jsonObject)
    )
  }


});


var showDressesList = function(ajaxResponseObject){
  var dress = JSON.parse(ajaxResponseObject);

  userList.innerHTML = ''

  dress.forEach(function(dress){
    var html = template(dress);
    //console.log('html', html);
    userList.innerHTML += html;
  });

  for(var i = 0; i < deleteBtns.length; i++){
    //console.log(deleteBtns[i])
    deleteBtns[i].addEventListener('click', function(e){
      var deleteID = this.className.split(" ").splice(-1)[0];
      ajaxCall("DELETE", backendURL+deleteID,
          function(){
            console.log("DELETE successful!")
            getAndShowDressesList();
          },
      )
    });
  };

  for(var i = 0; i < editBtns.length; i++){
    editBtns[i].addEventListener('click', function(e){
      console.log(e.srcElement.classList[4])
      var editID = e.srcElement.classList[4]

      console.log("Dress ID is " + editID)

      ajaxCall("GET", backendURL+editID, function(dressObject){
        var dress = JSON.parse(dressObject)[0];
        console.log("Obtained dress " + dress._id)
        updateFormToggle(dress);
      })

    });
  };

}

var updateFormToggle = function(dressObj){
    var changeWord = document.getElementById("formHeader");
    if (changeWord.innerHTML == "Add"){
      console.log("Entering into edit mode for " + dressObj._id)
      clearForm();
      isUpdate = true;
      changeWord.innerHTML = "Update";
      document.getElementById("style").value = dressObj.style
      document.getElementById("size").value = dressObj.size
      document.getElementById("color").value = dressObj.color
      dressForm.className = dressObj._id
    }else{
      console.log("Exiting Edit mode for " + dressObj._id)
      clearForm();
      isUpdate = false;
      changeWord.innerHTML = "Add"
    }
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
            alert('The resource was not found');
         }
         else {
             alert('Error: Call to server failed with code: ' + xmlhttp.status);
         }
      }
  };

  xmlhttp.open(ajaxMethod, ajaxURL, true);

  if (ajaxMethod == "POST" || ajaxMethod == "PUT" ){
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(ajaxData);
  }
  else {
    xmlhttp.send();
  }
}

var getAndShowDressesList = function(){ajaxCall("GET", backendURL, showDressesList);}

getAndShowDressesList();
