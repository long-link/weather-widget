function clock(){
    let date = new Date();
    document.getElementById('current-date').innerText = date.toLocaleDateString();
    document.getElementById('current-time').innerHTML = date.toLocaleTimeString();
}
setInterval(clock, 1000);


//установлен Ярославль по дефелту
findCity();


// переименовать
function findCity(){
    let requestURL,
        requestURL3,
        key = 'fa428ab88e8a03c076f573dbc522bdd5',
        lang = 'lang=ru',
        units = 'units=metric',
        city = document.getElementById('cityName');
    city = city.value;

    requestURL = `http://api.openweathermap.org/data/2.5/weather?appid=${key}&q=${city}&${lang}&${units}`;
    requestURL3 = `http://api.openweathermap.org/data/2.5/forecast?appid=${key}&q=${city}&${lang}&${units}&cnt=30`;
    sendRequest(requestURL)
        .then(data => {
            console.log(parseInt(data['cod']));
            if (data['cod'] <= 201){
                let processedData = getData1day(data);
                dataOutput1day(processedData);
            }
            else alert(data['message']);
        })
        .catch(err => console.log(err));
    sendRequest(requestURL3)
        .then(data => {
            console.log(data);
            if (data['cod'] <= 201) {
                let processedData = getData3days(data);
                dataOutput3days(processedData);
            }
        })
        .catch(err => console.log(err));
}



// TODO создать класс и использовать его на периодны (текущий, три дня, итп)
function getData1day(data) {
    let dataList = {};  // тут заменять на массив и будет класс
    dataList['description'] = data['weather'][0]['description'];
    dataList['icon'] = data['weather'][0]['icon'];
    dataList['pressure'] = Math.round(data['main']['pressure'] / 1.333);
    dataList['humidity'] = data['main']['humidity'];
    dataList['temp'] = Math.round(data['main']['temp']);
    dataList['feels_like'] = Math.round(data['main']['feels_like']);
    dataList['speed'] = data['wind']['speed'];
    return dataList
}


function dataOutput1day(dataList) {
    for (let key in dataList){
        let currentData = document.getElementById(key);
        if (key === 'icon'){
            currentData.setAttribute('src', `images/${dataList[key]}.png`)
        }
        else {
            currentData.innerText = dataList[key];
        }
    }
}


function changePeriod(state) {
    let rightBtn = document.getElementsByClassName('current-state__period__right')[0],
        leftBtn = document.getElementsByClassName('current-state__period__left')[0];
    if(rightBtn.classList.contains("selected") && state === 'right'){
        return;
    } else if (leftBtn.classList.contains("selected") && state === 'left'){
        return;
    }
    let showOneDay = document.getElementsByClassName('show-weather')[0],
        showThreeDays = document.getElementsByClassName('show-weather')[1];
    rightBtn.classList.toggle("selected");
    leftBtn.classList.toggle("selected");
    showOneDay.classList.toggle("none");
    showThreeDays.classList.toggle("none");
}


function sendRequest(url) {
    return fetch(url).then(response => {
        return response.json()
    })
}


// main (переименовать)
function getData3days(data) {
    let dateTomorrow = determineDay(data['list'][0]['dt_txt']),
        idTomorrow,
        dataList = [];
    dateTomorrow = dateTomorrow.toLocaleDateString().substring(0,2);
    for (let i = 0; i < data['list'].length; i++){
        idTomorrow = i;
        if(data['list'][i]['dt_txt'].substring(8, 10) === dateTomorrow)
            break;
    }
    for (let i = idTomorrow + 1, j = 0; j < 12; i += 2, j++){
        dataList[j] = {};
        dataList[j]['timeDay'] = data['list'][i]['dt_txt'].substring(0, 10);     //.substring(0, 10)
        dataList[j]['temp'] = Math.round(data['list'][i]['main']['temp']);  //Math.round(data['main']['pressure'] / 1.333);
        dataList[j]['feels_like'] = Math.round(data['list'][i]['main']['feels_like']);
        dataList[j]['icon'] = data['list'][i]['weather'][0]['icon'];
        dataList[j]['status'] = data['list'][i]['weather'][0]['description'];
        dataList[j]['pressure'] = Math.round(data['list'][i]['main']['pressure'] / 1.333);
        dataList[j]['humidity'] = data['list'][i]['main']['humidity'];
        dataList[j]['wind'] = data['list'][i]['wind']['speed'];
    }
    // console.log(dataList);
    return dataList;
}


function dataOutput3days(dataList) {
    for(let i = 1; i <= 3; i++) {
        let currentSlide,
            timeDay = 1,//изменить
            parent = document.getElementsByClassName(`s${i}`)[0],
            nextDay = parent.getElementsByClassName('next-day');
        nextDay[0].innerText = dataList[(i - 1) * 4]['timeDay'].substring(8, 10);
        nextDay[1].innerText = getWeekDay(new Date(dataList[(i - 1) * 4]['timeDay']));
        let buttonText = getWeekDay(new Date(dataList[(i - 1) * 4]['timeDay']));
        buttonText += ` ${dataList[(i - 1) * 4]['timeDay'].substring(8, 10)}`;
        buttonText += ` ${getMonth(new Date(dataList[(i - 1) * 4]['timeDay']))}`;
        currentSlide = document.getElementsByClassName('item-day')[i - 1];
        currentSlide.innerText = buttonText;
        currentSlide = parent.getElementsByClassName('column')[0];
        for(let j = (i - 1) * 4; j < 4 * i; j++){
            delete dataList[j]['timeDay'];
            for (let elem in dataList[j]){
                let currentData = currentSlide.getElementsByClassName(`column__${elem}`)[0];
                currentData = currentData.children[timeDay];
                if (elem === 'icon'){
                    currentData.setAttribute('src', `images/${dataList[elem]}.png`)
                }
                else{
                    currentData.innerText = dataList[j][elem];
                }
            }
            timeDay++;
        }
    }
}


function determineDay(today) {
    let dateTomorrow;
    dateTomorrow = new Date(today.substring(0,10));
    dateTomorrow.setDate(dateTomorrow.getDate() + 1);
    return dateTomorrow;
}


function getWeekDay(date) {
    let days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    return days[date.getDay()];
}


function getMonth(date) {
    let days = ['ЯНВАРЯ', 'ФЕВРАЛЯ', 'МАРТА', 'АПРЕЛЯ', 'МАЯ', 'ИЮНЯ',
        'ИЮЛЯ', 'АВГУСТА', 'СЕНТЯБРЯ', 'ОКТЯБРЯ', 'НОЯБРЯ', 'ДЕКАБРЯ'];
    return days[date.getMonth()];
}