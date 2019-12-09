var editor = ace.edit("editor");
editor.setTheme("ace/theme/clouds");
editor.getSession().setMode("ace/mode/less");
editor.setShowFoldWidgets(false);

var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}
