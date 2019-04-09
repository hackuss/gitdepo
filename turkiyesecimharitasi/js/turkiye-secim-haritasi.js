function turkiyesecimharitasi() {
    const element = document.querySelector('#svg-turkiye-haritasi');
    const info = document.querySelector('.il-isimleri');
    const odds = document.querySelector('#odds');//Farkını Göster butonu
    const normalColor = document.querySelector('#normalColar');//Normal Renkler butonu
    const jsonDatas = JSON.parse(secim);//index.html içinde script tagi ile çekilen secim.json dosyası
    const winners = getWinners(jsonDatas); //Sehirlerde 1. ve 2. partileri belirler

    //Partilerin renkleri
    const colors = {
        1: "#647c72",  //Saadet Partisi
        2: "#b03841",  //BTP
        3: "#1db54a",  //DKP
        4: "#a4d4ff",  //Vatan Partisi
        5: "#7b47bf",  //BBP
        6: "#70ec84",  //Not Found
        7: "#ea001f",  //CHP
        8: "#ea7000",  //AKP
        9: "#42002a",  //DP
        10:"#ff0084",  //MHP
        11:"#ffa07a",  //İyi parti
        12:"#563412",  //HDP
        13:"#b03841",  //DSP
        14:"#00b4d2",  //Bağımsız Adaylar
    };

    /*getWinner() Fonksiyonundan dönen değerler ile
    şehirleri seçilen partilerin renk ataması yapar ve
    setAttribute tanımlamalarını yapar*/
    winners.forEach(function(element) {
        var cityId = element['0'];
        var cityName = element['1'];
        var firstWinner = element['2'][0];
        var secondWinner = element['3'][0];
        var firstWinnerColor = setColor(firstWinner['id'], colors);
        var secondWinnerColor = setColor(secondWinner['id'], colors); //Termal için
        var currentCity = document.getElementById(cityId);
        var currentCityPaths = document.getElementById(cityId).children;
        var oddsColor = convertColor(firstWinnerColor,element);

        currentCity.setAttribute("data-first-winner",firstWinner['name']);
        currentCity.setAttribute("data-second-winner",secondWinner['name']);
        currentCity.setAttribute("data-city-name",cityName);
        currentCity.setAttribute("data-odd-color",oddsColor);
        currentCity.setAttribute("data-color",firstWinnerColor);
        currentCityPaths[0].setAttribute("style", "fill:"+firstWinnerColor+";");
    });
    //Sehirlerin üzerine gezinirken şehir ve kazananın kim olduğunu gösterir
    element.addEventListener(
        'mouseover',
        function (event) {
            if (event.target.tagName === 'path') {
                info.innerHTML = [
                    '<div>',
                    event.target.parentNode.getAttribute('data-city-name'),
                    '<br>',
                    event.target.parentNode.getAttribute('data-first-winner'),
                    '</div>'
                ].join('');
            }
        }
    );
    //Fare hareketlerini takip etmesi için
    element.addEventListener(
        'mousemove',
        function (event) {
            info.style.top = event.pageY + 25 + 'px';
            info.style.left = event.pageX + 'px';
        }
    );
    //Fare sehir üzerinde değilse tooltipi kaldırır
    element.addEventListener(
        'mouseout',
        function (event) {
            info.innerHTML = '';
        }
    );
    //Renkleri farkın %sine göre değiştirir çevirir
    odds.addEventListener(
        'click',
        function (event) {

                var cities = document.querySelectorAll("#turkiye g");
                cities.forEach(function(element) {
                    var oddsColor = element.getAttribute('data-odd-color');
                    var currentCityPaths = element.children;
                    currentCityPaths[0].setAttribute("style", "fill:" + oddsColor + ";");
                });

        }
    );
    //Renkleri normale çevirir
    normalColor.addEventListener(
        'click',
        function (event) {
                var cities = document.querySelectorAll("#turkiye g");
                cities.forEach(function(element) {
                    var oddsColor = element.getAttribute('data-color');
                    var currentCityPaths = element.children;
                    currentCityPaths[0].setAttribute("style", "fill:" + oddsColor + ";");
                });

        }
    );
    //Sehire tıklanınca açılan modelde partileri sıralar
    element.addEventListener(
        'click',
        function (event) {
            if (event.target.tagName === 'path') {
                const parent = event.target.parentNode;
                const targetId = parent.getAttribute('id')-1; //jsonDatas array count 0'dan başladığı için -1 veriyorum.
                const target = jsonDatas[targetId];
                const encyclicTarget = maxTomin(target);
                document.getElementById("cityName").innerText = target['name'];
                document.getElementById("tbody").innerHTML = ''; //Modal'a eklenecek yeni verileri sildirmek için boş değer.
                const tbody = document.getElementById("tbody");
                encyclicTarget.forEach(function(element, key) {
                    var key = key+1;
                    tbody.innerHTML += `
                       <tr id="counts">
                          <td width="20%">`+key+`</td>
                          <td width="40%">`+element['name']+`</td>
                          <td width="40%">`+element['voteCount']+`</td>
                        </tr>
                    `; +tbody;
                });
                toggleModal();
            }
        }
    );
}


/*En çok oy toplayan 1. ve 2. partiyi seçer
  json dosyasındaki illeri ayrıştırır */
function getWinners(jsonDatas){
    var winners = [];
    /*Seçilen illerdeki adayların 1. ve 2. olanrını belirler*/
    jsonDatas.forEach(function(element) {
        var allVotesCount = [];
        element['results'].forEach(function(element)
        {
            allVotesCount.push(element['voteCount']);
        });
        var first=firstMax(allVotesCount);
        var second=secondMax(allVotesCount);
        var firstWinner = search(first, element['results']);
        var secondWinner = search(second, element['results']);
        winners.push([element['id'],element['name'],firstWinner,secondWinner]);
    });

    /*getWinner Fonksiyonuna bağlı fonksiyonlar*/
    //Geçerli sehir içerisinde  1. olanı seçer
    function firstMax(value) {
        return Math.max.apply(Math, value) // En yüksek sayıyı bul
    };

    //Geçerli sehir içerisinde 2. olanı seçer
    function secondMax(value){
        var max = Math.max.apply(Math, value); // En yüksek sayıyı bul
        value.splice(value.indexOf(max.toString()), 1); //Bulunan sayıyı array içerisinden çıkart
        return Math.max.apply(Math, value); // Tekrar en yüksek sayıyı bul
    };

    //Belirlenen 1. ve 2. hangi parti onu bulur
    function search(voteCount, array){
        var parti = array.filter(function (element) { return element.voteCount == voteCount });
        return parti
    }
    //Json dosyasındaki karışıklığı düzene sokur, her ilin 1. ve 2. seçilenleri
    return winners;
}
/*Partilerin renklerini belirler
 1-13 arası partilerin renkleri
 14. bağımsız adayların rengi*/

function setColor(partiId, colors){
    var color = "";
    if(partiId < 14)
        color = colors[partiId];
    else
        color = colors[14];

    return color
}

/*Parti sıralaması için büyükten güçüğe sıralar
  return değirndeki değerleri yer değiştirirseniz küçükten büyüğe sıralar.*/
function maxTomin(array){

    var result = array['results'].sort(function(max, min){
        return min['voteCount'] - max['voteCount']
    });

    return result
}


/*data-odd-color attribute eklenmesi için rgb color'a çevirir*/
function convertColor(color,winner) {
    if(color.substring(0,1) == '#') {
        color = color.substring(1);
    }

    var odds = Math.round((winner[2][0]['voteCount']-winner[3][0]['voteCount'])/winner[3][0]['voteCount']*100);  //Fark %sini hesaplar
    if(odds < 15) { //Eğer seçim farkı 15'den küçükse 15'e sabitler
        odds = 15;
    }else if (odds > 99) { //Eğer seçim farkı %99'u geçerse %99'a sabitler
        odds = 99;
    }
    var r,g,b;
    //data-color'dan aldığı hex değeri rgb ye çevrir
    r = parseInt(color.substring(0,2),16);
    g = parseInt(color.substring(2,4),16);
    b = parseInt(color.substring(4),16);
    var optimizedOddsColor = "rgb("+r+","+g+","+b+",0."+odds+");";

    return optimizedOddsColor;
}



/*Modal kontrolleri,
126. satır da sehir seçildiğinde sıralamayı açar*/
var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);


