const company = document.currentScript.getAttribute('company')
const url = document.currentScript.getAttribute('url')
const btnClass = document.currentScript.getAttribute('trigger-button-class')

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML('beforeend', '' +
    '<div id="cb-widget"><div id="cb-widget-close"><span>x</span></div><iframe src="'+url+'/cal/embed/'+company+'" allowtransparency="true"></iframe></div>\n' +
    '<style>\n' +
    '    #cb-widget {\n' +
    '        visibility: hidden;\n' +
    '        opacity: 0;\n' +
    '        transition: visibility 0.5s, opacity 0.5s linear;\n' +
    '        width: 400px;\n' +
    '        max-width: 100%;\n' +
    '        height: 100%;\n' +
    '        position: fixed;\n' +
    '        left: 0;\n' +
    '        top: 0;\n' +
    '        overflow: auto;\n' +
    '        box-shadow: 6px 6px 8px 0px rgba(47, 47, 47, 0.2);\n' +
    '        z-index: 999999;\n' +
    '    }\n' +
    '    #cb-widget.active {\n' +
    '        opacity: 1;\n' +
    '        visibility: visible;\n' +
    '    }\n' +
    '    #cb-widget iframe {\n' +
    '        width: 100%;\n' +
    '        height: 100%;\n' +
    '        border: none;\n' +
    '        position: absolute;\n' +
    '        left: 0;\n' +
    '        top: 0;\n' +
    '    }\n' +
    '    #cb-widget-close {\n' +
    '        width: 30px;\n' +
    '        height: 30px;\n' +
    '        position: absolute;\n' +
    '        right: 10px;\n' +
    '        top: 10px;\n' +
    '        z-index: 2;\n' +
    '        border-radius: 50%;\n' +
    '        background: rgba(0,0,0,0.35);\n' +
    '        display: flex;\n' +
    '        align-items: center;\n' +
    '        justify-content: center;\n' +
    '        color: #fff;\n' +
    '        cursor: pointer;\n' +
    '        transition: background-color 0.3s;\n' +
    '    }\n' +
    '    #cb-widget-close:hover {\n' +
    '        background: rgba(0,0,0,0.5);\n' +
    '    }\n' +
    '</style>');


  const handleButtonClick = (e) => {
    e.stopPropagation();
    document.getElementById("cb-widget").classList.toggle('active')
  };

  const buttons = document.getElementsByClassName(btnClass);
  Array.from(buttons).forEach(function(button) {
    button.addEventListener('click', handleButtonClick);
  });

  const closeWidget = () => {
    document.getElementById("cb-widget").classList.remove('active')
  }

  document.getElementById("cb-widget").addEventListener("click", closeWidget);
  document.addEventListener("click", closeWidget);
});
