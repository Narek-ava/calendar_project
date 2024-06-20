@extends('kiosk.layout')

@section('css')
<style>
    .body {
        padding: 50px 0;
    }
    :root {
        --primary: #0A3A5B;
        --sjs-general-dim-forecolor: var(--primary);
        --foreground: var(--primary);
        --sjs-general-dim-forecolor: var(--primary);
    }
    .content {
        border-radius: 0;
        width: 80%;
        padding: 0;
    }
    .sd-header__text, .sd-question__title {
        text-align: start;
    }
    .sd-container-modern__title {
        padding: 50px !important;
        gap: 0
    }
    .sv-components-row {
        padding: 50px !important;
        background-color: var(--background-dim, #f3f3f3);
    }
    .sd-container-modern {
        margin: 0;
    }
    .sd-btn{
        transition: 0.4s linear;
    }
    .sd-btn:hover{
        background-color: #fff;
        color: var(--primary);
        transition: 0.4s linear;
    }
    .cameraIconBlock {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        font-size: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .displayedPhoto {
        max-width: 100%;
    }
    .captureButton {
        color: #afaeb1;
        transition: "0.3s linear";
        cursor: "pointer",
    }
    .cameraIconBlock:hover .captureButton {
        opacity: 1 !important;
        transition: 0.3s linear;
    }
    .sd-page__row {
        text-align: start;
    }
    img {
        max-width: 100%;
        margin-top: 50px;
    }
    @media (max-width: 560px) { 
        form {
            padding: 0 !important;
            min-height: 100vh;
        }
        .body {
            padding: 0;
        }
        body {
            width: 100%;
        }
        
        .content {
            width: 100%;
            height: 100vh;
        }
        .sv-components-row {
            padding: 5px !important;
        }
    
        .sd-footer>div {
            flex-grow: 1;
            flex-basis: 0;
        }
    }   

    @media (max-width: 425px) { 
        form {
            padding: 0 !important;
            min-height: 100vh;
        }

        .sv-components-row,
        .sd-container-modern__title {
            padding: 15px !important;
        }
        
        .body {
            padding: 0;
        }
        .sd-body__page {
            min-width: 100% !important;
            padding: 0 !important;
        }
        .content {
            width: 100%;
            height: 100vh;
        }
    
        .sd-footer {
            padding-inline: 0 !important;
            width: calc(100vw - 30px);
        }
        .sd-footer>div {
            flex-grow: 1;
            flex-basis: 0;
        }
        body {
            width: 100%;
        }
    }


</style>
@endsection

@section('content')
    <input type="hidden" value="{{URL::signedRoute('kiosk.save-survey-data', [$location, $appointment])}}" id="signed_route">
    <div id="surveyContainer"></div>
@endsection

@section('javascripts')
<script >
    const captureDetails = {};
    const cameraBlockImages = [];

    function getMimeTypeFromDataUrl(dataUrl) {
        const matches = dataUrl.match(/^data:(.*?);/);
        if (matches && matches.length === 2) {
            return matches[1];
        } else {
            throw new Error('Invalid Data URL');
        }
    }

    function hasCamera() {
        const screenWidth = window.innerWidth;
        const isTablet = screenWidth <= 1024;
        return isTablet;
    }

    function handlePhotoSelect(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        const _this = $(this);
        reader.onload = function(e) {
            const displayedPhoto = _this.parent().find('.displayedPhoto');
            const captureButton = _this.parent().find('.captureButton');

            displayedPhoto.attr("src", e.target.result);
            displayedPhoto.css('display','block');
            displayedPhoto.on('load', function() {
                cameraBlockImages[_this.attr('id')] = e.target.result;

                const imageWidth = displayedPhoto.width();
                const imageHeight = displayedPhoto.height();
                captureDetails[_this.attr('id')] = {
                    width: imageWidth,
                    height: imageHeight,
                    name: file.name
                }

                captureButton.css('opacity',0);
                captureButton.css('transition', '0.3s linear');
                captureButton.parent().parent().css('border', 'none');
            });
        };

        reader.readAsDataURL(file);
    }

    $(document).on('click', '.captureButton', function(){
        const photoInput = $(this).parent().parent().find('.photoInput');
        photoInput.click();
        photoInput.on('change', handlePhotoSelect);
    })

    const surveyJson = {!! $appointment->company->waiver_data !!};
    const signedRoute = document.getElementById('signed_route').value;

    const editorsContent = {};
    const richEditorsName = [];
    const cameraBlockName = [];

    surveyJson.pages.forEach(page => {
        page.elements?.forEach(element => {
            if (element.type === "richedit") {
                element.type = "html";
                // element.inputType = "textarea";
                richEditorsName.push(element.name);
            } else if (element.type === "camerablock") {
                element.type = "text";
                cameraBlockName.push(element.name);
            } else if (element.type === "file") {
                element.storeDataAsText = false;
            }
        });
    });

    const survey = new Survey.Model(surveyJson);

    $(function() {
        $("#surveyContainer").Survey({ model: survey });
    });

    survey.showPrevButton = false;
    survey.onAfterRenderQuestion.add(function (survey, options) {
        if (options.question.getType() === 'text' && cameraBlockName.includes(options.question.name)) {
            if (hasCamera()) {
                const updatedHtmlString = `
                    <div style="width:100%;min-height:150px;border:1px dashed #d6d6d6;position:relative">
                        <input type="file" accept="image/*" capture="user" class="photoInput" style="display: none;" id="${options.question.name}">
                        <div class="cameraIconBlock">
                            <i class="fas fa-camera captureButton"></i>
                        </div>
                        <img class="displayedPhoto" src="#" alt="Selected Photo" style="display:none">
                    </div>
                `;
                const container = document.createElement('div');
                container.innerHTML = updatedHtmlString;
                const inputFile = container.querySelector('.photoInput');
                inputFile.addEventListener('change', function () {
                    myFunction(survey, options);
                });
                $("#" + options.htmlElement.id + "i").replaceWith(container);
            } else {
                $("#" + options.htmlElement.id + "i").closest('.sd-page__row').remove();
            }
        }
    });

    function myFunction(survey, options) {
        if(options.question.isRequired == true){
            options.question.isRequired = false
            const requiredText = '<span class="required" style="color: #DC3545;"> *</span>';
            const questionTitleElement = $("#" + options.htmlElement.id ).find(".sv-string-viewer");
            if (!questionTitleElement.find('span[class="required"]').length) {
                questionTitleElement.append(requiredText);
            }
        }
    }

    function getElementByName(name) {

        return surveyJson.pages.flatMap(page => page.elements).find(element => element?.name === name);
    }

    survey.onUploadFiles.add((_, options) => {
        let formData = new FormData();
        options.files.forEach(file => {
            formData.append(file.name, file);
        });

        fetch("https://api.surveyjs.io/private/Surveys/uploadTempFiles", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            options.callback("success", options.files.map(file => {
                console.log(data[file.name]);
                return {
                    file: file,
                    content: "https://api.surveyjs.io/private/Surveys/getTempFile?name=" + data[file.name]
                };
            }));
        })
        .catch(error => {
            console.error("Error: ", error);
        });
    })

    survey.onComplete.add((sender) => {
        const data = { ...sender.data };
        surveyJson.pages.forEach(page => {
            page.elements?.forEach(element => {
                if (element.type === "html") {
                    element.renderAs = "auto";
                    element.html = `<div style="line-height: 20px;">${element.html || ''}</div>`;
                }
                if(element.type === "text" && cameraBlockName.includes(element.name) && captureDetails[element.name]){
                    element.type = 'file'
                    element.imageWidth = captureDetails[element.name].width +'px'
                    element.imageHeight = captureDetails[element.name].height+'px'
                    data[element.name] = [{
                        content: cameraBlockImages[element.name],
                        name: captureDetails[element.name].name,
                        type: getMimeTypeFromDataUrl(cameraBlockImages[element.name]),
                    }];
                } else if (element.type === "text" && cameraBlockName.includes(element.name) && !captureDetails[element.name]) {
                    element.type = 'camerablock'
                }
            });
        });

        const surveyPDF = new SurveyPDF.SurveyPDF(surveyJson, {compress: true});
        surveyPDF.mode = 'display';
        surveyPDF.data = data;
        surveyPDF
            .raw("dataurlstring")
            .then(function (dataurl) {
                let base64Data = dataurl.split(",")[1];

                const xhr = new XMLHttpRequest();
                xhr.open("POST", signedRoute); 
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("X-CSRF-TOKEN", "{!! csrf_token() !!}");

                xhr.onload = function () {
                    var response = JSON.parse(xhr.responseText);
                    if (response.redirect) {
                        window.location.href = response.redirect;
                    }
                };

                xhr.onerror = function () {
                    console.error("Error saving survey data to the database:", xhr.statusText);
                };

                xhr.send(JSON.stringify({ dataurl: base64Data, data }));
            });
    });
</script>
@endsection
