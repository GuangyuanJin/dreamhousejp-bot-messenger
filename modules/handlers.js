"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter'),
    fetchUrl = require('fetch').fetchUrl,
    pinterestAPI = require('pinterest-api'),
    request = require('request');

exports.searchHouse = (sender) => {
    messenger.send({text: `かしこまりました。現在売り出し中の物件を検索しています...`}, sender);
    salesforce.findProperties().then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_City = (sender, values) => {
    messenger.send({text: `かしこまりました。 場所:${values[1]} の物件を検索しています...`}, sender);
    salesforce.findProperties({city: values[1]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_NLP = (sender, values) => {
    messenger.send(formatter.formatNLP(values), sender);
};

exports.searchHouse_Bedrooms_City_Range = (sender, values) => {
    messenger.send({text: `かしこまりました。部屋数:${values[1]} 場所:${values[2]} 価格帯: ${values[3]} から ${values[4]} の物件を検索しています...`}, sender);
    var priceMin = values[3] <= 1000000 ? values[3] * 10000 : values[3];
    var priceMax = values[4] <= 1000000 ? values[4] * 10000 : values[4];
    salesforce.findProperties({bedrooms: values[1], city: values[2], priceMin: priceMin, priceMax: priceMax}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms_City = (sender, values) => {
    messenger.send({text: `かしこまりました。部屋数:${values[1]} 場所:${values[2]} の物件を検索しています...`}, sender);
    salesforce.findProperties({bedrooms: values[1], city: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms = (sender, values) => {
    messenger.send({text: `かしこまりました。部屋数:${values[1]}の物件を検索しています...`}, sender);
    salesforce.findProperties({bedrooms: values[1]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Range = (sender, values) => {
    messenger.send({text: `かしこまりました。価格帯:${values[1]}から${values[2]}の物件を検索しています`}, sender);
    var priceMin = values[1] <= 100000 ? values[1] * 10000 : values[1];
    var priceMax = values[1] <= 100000 ? values[2] * 10000 : values[2];
    salesforce.findProperties({priceMin: priceMin, priceMax: priceMax}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.priceChanges = (sender, values) => {
    messenger.send({text: `かしこまりました。直近の価格変更を検索しています...`}, sender);
    salesforce.findPriceChanges().then(priceChanges => {
        messenger.send(formatter.formatPriceChanges(priceChanges), sender);
    });
};

exports.notInterested = (sender) => {
    messenger.send({text: `申し訳ございません。どのようなお住まいをお探しでしょうか? もしお気に入りの住居を集めたPinterestのボードをお持ちでしたら、共有いただけないでしょうか？似たような物件をそこから探し出させていただきます。`}, sender);
}

exports.pinterest = (sender, values) => {

    const pinterest_api = 'https://staging.metamind.io/vision/classify';
    const pinterest_key = 'w2eiD3Hsg09oMQH3riBURXkXC1ybebn07uLYONsItq9Eeq4HZJ';
    const classifierId = 7377;

    // request.post({
    //     url: pinterest_api,
    //     headers: {
    //         Authorization: `Basic ${pinterest_key}`
    //     },
    //     timeout: 1500,
    //     body: JSON.stringify({image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Ellen_H._Swallow_Richards_House_Boston_MA_01.jpg', classifier_id: classifierId })
    // }, (err, res, body) => {
    //     console.log('>>>>>>>>>>>>>>>>>>');
    //     if(err) console.log(err);
    //     console.log(body);
    // })


    var finalUrl, pinterest_user, pinterest_board;
    fetchUrl(values.input, function(error, meta, body){
        console.log('>>>>>>>>>>>>>>>' + meta.finalUrl);
        finalUrl = meta.finalUrl;
        var ind = finalUrl.indexOf('pinterest.com');
        var pieces = finalUrl.substring(ind+13+1).split('/');
        pinterest_user = pieces[0];
        pinterest_board = pieces[1];

        console.log('>>>>> pinterest user: ' + pinterest_user);
        console.log('>>>>> pinterest board: ' + pinterest_board);

        // var pinterest = pinterestAPI(pinterest_user);
        var pinterest = pinterestAPI('juliana211');

        pinterest.getPinsFromBoard('my-dream-house', true, function (pins) {
            for (var i=0; i<pins.data.length; i++){
                console.log(pins.data[i].images['237x'].url);
            }

            messenger.send({text: `Pinterestボードの共有ありがとうございます。少々お待ちください...`}, sender);
            setTimeout(function(){
                messenger.send({text: '素晴らしいですね。画像を分析した結果、現代的な住居がお好みのようでした。以下の住居などはいかがでしょうか？'}, sender);
                salesforce.findProperties({style: '現代的'}).then(properties => {
                    messenger.send(formatter.formatProperties(properties), sender);
                });
            }, 6666);
        });
    });
};



exports.hi = (sender) => {
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `こんにちは。 ${response.last_name} 様!`}, sender);
    });
};

exports.help = (sender) => {
    messenger.send({text: `ようこそドリームハウスへ。\n物件はメッセージから検索することもできます。 "場所:品川", "部屋数:3 場所:品川", "部屋数:3 場所:品川 価格:5000から7500の間", "価格変更" などのように、さまざまなキーワードを使って条件を指定できます`}, sender);
};

exports.unknown = (sender) => {
    messenger.send({text: `申し訳ございません。リクエストの内容を認識できません。 \nヘルプ とメッセージを頂ければ物件の検索方法をお送りいたします`}, sender);
};
