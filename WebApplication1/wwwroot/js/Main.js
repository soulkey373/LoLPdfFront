let dataset;
window.onload = function () {
    document.getElementById('button-next').addEventListener('click', searchFunction)
    document.getElementById("demo").click();
    const url = "https://getlolinformation1.fly.dev/GetLoLname";
    fetch(url).then(response => response.json())
        .then(data => {
            localStorage.setItem('myObj', JSON.stringify(data));
            input.addEventListener('input', searchFunction());
            dataset = JSON.parse(localStorage.getItem('myObj'));
/*            if (dataset[0].lolbusses.length == 162) { console.log('get資料已存入localstorage'); }*/
            document.querySelector(".spinner-border").style.display = 'none'
        }).catch(error => {
            console.log(error);
        });
    searchFunction();
    document.getElementsByClassName('downloadpdf')[0].disabled = true
}
const input = document.getElementById('search');
const ul = document.getElementById('myUL');

const nextBtn = document.getElementById('button-next');
const preBtn = document.getElementById('button-pre');
const questionElement = document.querySelector('.question');
const questions = ['第一題:入坑英雄', '第二題:最喜歡', '第三題:最多造型', '第四題:最多禁用', '第五題:最佳背景故事', '第六題:上下限最大', '第七題:最佳動作', '第八題:最佳被擊殺配音', '第九題:最常Penta KILL', '第十題:最帥英雄', '第十一題:最中二', '第十二題:最常被Nerf', '第十三題:最嘲諷', '第十四題:最專精', '第十五題:最討厭'];
const regex1 = /^[a-zA-Z\u4e00-\u9fa5\s]{1,10}$/;
let answer = [{
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}, {
    name: ''
}];
function confirmpdflimit() {
    for (let result of answer) {
        if (result.name === '') {
            document.getElementsByClassName('downloadpdf')[0].disabled = true;
            return;
        }
        else {
            document.getElementsByClassName('downloadpdf')[0].disabled = false;
        }
    }
}

function searchFunction() {

    const searchValue = input.value.toLowerCase();
    ul.innerHTML = '';
    if (!regex1.test(searchValue) || searchValue == '') { return; }
    if (searchValue.length < 2) { return; }
    for (const lolbus of dataset[0].lolbusses) {
        const chineseName = lolbus.chinesename;
        const englishName = lolbus.engishname;
        const regex = new RegExp(searchValue, 'i');
        if (regex.test(chineseName) || regex.test(englishName)) {
            const li = document.createElement('li');
            li.textContent = chineseName;
            li.classList = 'text-danger bg-Secondary text-center border border-primary border-3 m-2';
            ul.appendChild(li);
            li.addEventListener('click', () => {
                input.value = li.textContent;
            });
        }
    }

}
let currentQuestionIndex = 0;
showCurrentQuestion();

function showCurrentQuestion() {
    questionElement.innerText = questions[currentQuestionIndex];
    preBtn.disabled = (currentQuestionIndex === 0);
    nextBtn.disabled = (currentQuestionIndex === questions.length - 1);
}

function nextQuestion() {
    currentQuestionIndex++;
    input.value = answer[currentQuestionIndex].name;
    showCurrentQuestion();
}

function previousQuestion() {
    currentQuestionIndex--;
    input.value = answer[currentQuestionIndex].name;
    showCurrentQuestion();
}

function confirmAnswer() {

    const inputValue = input.value.trim();
    if (inputValue === '') {
        console.log('進入空值判斷區塊');
        alertwarn('請輸入正確的名稱', 'danger');
        return;
    }
    let isAnswerFound = false;
    for (const lolbus of dataset[0].lolbusses) {
        const chineseName = lolbus.chinesename;
        const englishName = lolbus.engishname;
        const regex = new RegExp(inputValue, 'i');
        if (regex.test(chineseName) || regex.test(englishName)) {
            answer[currentQuestionIndex].name = englishName;
            isAnswerFound = true;
            break;
        }
    }
    if (isAnswerFound) {
        alertwarn('鎖定成功', 'success');
        confirmpdflimit();
    } else {
        alertwarn('請輸入正確的名稱', 'danger');
    }
}


function downloadPDF() {
    document.querySelector(".spinner-border").style.display = 'inline-block'
    let requestdata = answer;
    // 設定POST請求的選項
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 設定傳送資料的格式
            "Accept": "application/json"
        },
        body: JSON.stringify(requestdata) // 將資料轉成JSON格式並傳送
    };
    // 發送POST請求
    fetch('https://getlolinformation1.fly.dev/GetLoLname', options).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log(data)
        getbase64token(data);
        alertwarn('以下載至本地端', 'success');
        document.querySelector(".spinner-border").style.display = 'none'
    }).catch(error => {
        console.log('There was a problem with the fetch operation:', error);
    });
}
function alertwarn(message, type) {
    let alertPlaceholder = document.getElementsByClassName('glow-effect1')[0]
    alertPlaceholder.innerText = message;
    alertPlaceholder.classList += ` btn-${type}` + ' text-light '
    setTimeout(() => {
        alertPlaceholder.innerText = '';
        alertPlaceholder.setAttribute("class", " alert-warn text-center glow-effect1")
    }, 1000)
}

function getbase64token(token) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
    const pdfData = `data:application/pdf;base64,${token}`;
    pdfjsLib.getDocument({ data: atob(pdfData.split(',')[1]) }).promise.then(function (pdf) {
        // 取得第一頁的 Canvas
        pdf.getPage(1).then(function (page) {
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // 將 PDF 頁面渲染到 Canvas 上
            page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
                // 取得圖像的 base64 格式
                const imageData = canvas.toDataURL("image/png");
                const img = document.createElement('img');
                img.src = imageData;
                img.style = 'display:none';
                document.body.appendChild(img);
                const a = document.createElement('a');
                a.href = document.querySelector('img').src
                a.download = "outputlolpdf.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        });
    });
}