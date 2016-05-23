var buttons;
var sections;

run_when_document_ready(function () {

  buttons = [ document.querySelector("#button-portfolio"),
              document.querySelector("#button-blog"),
              document.querySelector("#button-contact") ];

  sections = [ document.querySelector("#section-portfolio"),
              document.querySelector("#section-blog"),
              document.querySelector("#section-contact") ];


  buttons.forEach(function(b, i) {
    b.addEventListener("click", function() {
      updateDisplayed(i);
    });
  });

  updateDisplayed(0);

});

function updateDisplayed(selection) {

  sections.forEach(function(s, i) {
    s.style.display = i === selection ? "block" : "none";
  });

  buttons.forEach(function(b, i) {
    if (b.classList) {
      if (i === selection) {
        b.classList.add("nav-selected");
      } else {
        if (b.classList.contains("nav-selected")) {
          b.classList.remove("nav-selected");
        }
      }
    }
  });

}

function run_when_document_ready(fn) {

  if (document.readyState !== "loading"){

    fn();

  } else {

    document.addEventListener("DOMContentLoaded", fn);
  }

}
