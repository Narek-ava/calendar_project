const company = document.currentScript.getAttribute('company')
const url = document.currentScript.getAttribute('url')
document.body.insertAdjacentHTML('beforeend', '' +
  '<button id="cb-widget-btn" title="Book an appointment">\n' +
  '  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">\n' +
  '    <path d="M170.666667 640l341.333333-341.333333 341.333333 341.333333-85.333333 85.333333-256-256-256 256z" fill="currentColor"/>\n' +
  '  </svg>\n' +
  '</button>\n' +
  '<div id="widget"><iframe src="'+url+'/cal/embed/'+company+'" allowtransparency="true"></iframe></div>\n' +
  '<style>\n' +
  '    #cb-widget-btn {\n' +
  '        position: fixed;\n' +
  '        bottom: 10px;\n' +
  '        left: 10px;\n' +
  '        background: #0fe494;\n' +
  '        border: none;\n' +
  '        color: #fff;\n' +
  '        width: 55px;\n' +
  '        height: 55px;\n' +
  '        padding: 0;\n' +
  '        border-radius: 50%;\n' +
  '        transition: background-color 0.3s linear;\n' +
  '        display: flex;\n' +
  '        align-items: center;\n' +
  '        justify-content: center;\n' +
  '        z-index: 999999;\n' +
  '    }\n' +
  '    #cb-widget-btn:hover, #cb-widget-btn.active  {\n' +
  '        background: #1ed18e;\n' +
  '    }\n' +
  '    #cb-widget-btn svg {\n' +
  '        height: 30px;\n' +
  '        transition: transform 0.5s linear;\n' +
  '    }\n' +
  '    #cb-widget-btn.active svg {\n' +
  '        transform: rotate(180deg);\n' +
  '    }\n' +
  '    #widget {\n' +
  '        visibility: hidden;\n' +
  '        opacity: 0;\n' +
  '        transition: visibility 0.5s, opacity 0.5s linear;\n' +
  '        width: 400px;\n' +
  '        max-width: calc(100% - 20px);\n' +
  '        height: calc(100% - 80px);\n' +
  '        position: fixed;\n' +
  '        left: 10px;\n' +
  '        bottom: 75px;\n' +
  '        border-radius: 5px;\n' +
  '        overflow: auto;\n' +
  '        box-shadow: 6px 6px 8px 0px rgba(47, 47, 47, 0.2);\n' +
  '        z-index: 999999;\n' +
  '    }\n' +
  '    #widget.active {\n' +
  '        opacity: 1;\n' +
  '        visibility: visible;\n' +
  '    }\n' +
  '    #widget iframe {\n' +
  '        width: 100%;\n' +
  '        height: 100%;\n' +
  '        border: none;\n' +
  '        position: absolute;\n' +
  '        left: 0;\n' +
  '        top: 0;\n' +
  '    }\n' +
  '</style>');

document.getElementById("cb-widget-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("cb-widget-btn").classList.toggle('active')
  document.getElementById("widget").classList.toggle('active')
});
document.addEventListener("click", () => {
  document.getElementById("widget").classList.remove('active')
  document.getElementById("cb-widget-btn").classList.remove('active')
});
