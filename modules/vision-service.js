"use strict";
let request = require('request'),
    EINSTEIN_VISION_URL = process.env.EINSTEIN_VISION_URL,
    EINSTEIN_VISION_TOKEN = process.env.EINSTEIN_VISION_TOKEN,
    EINSTEIN_VISION_MODEL_ID = process.env.EINSTEIN_VISION_MODEL_ID;



    process.on('unhandledRejection', (err, p) => {
        // 開発中はログに出力する
        console.error('Error : ', err);
        console.error('Promise : ', p);
        // もしも気づくのを早めたかったら落とすとか
        // throw err;
      });

exports.classify = (imageURL) => new Promise((resolve, reject) => {
  request({
      url: EINSTEIN_VISION_URL + "v1/vision/predict",
      headers: {
        "Authorization": "Bearer " + EINSTEIN_VISION_TOKEN,
        "Cache-Control": "no-cache",
        "Content-Type": "multipart/form-data"
      },
      method: 'POST',
      formData: {
        "sampleLocation" : imageURL,
        "modelId" : EINSTEIN_VISION_MODEL_ID
      }
  }, (error, response) => {
    console.log(error);
    console.log(response);

      if (error) {
          console.log('メッセージ送信でエラー: ', error);
          reject("エラー");
      } else if (response.body.error) {
          console.log('エラー: ', response.body.error);
          reject("エラー");
      }else{
        console.log(response.body);
        var label;
        var probability =0;
        var bodyObj = JSON.parse(response.body);
        bodyObj.probabilities.forEach(probab => {
          if(probability <= probab.probability){
            label = probab.label.toLowerCase();
          }
        });
        var resultLabel ='開放的';
        switch (label){
          case "open":
            resultLabel = '開放的';
            break;
          case "modern":
            resultLabel = '現代的';
            break;
          case "luxury":
            resultLabel = 'ラグジュアリー';
            break;
          case "victorian":
            //resultLabel = 'ヴィクトリアン';
            resultLabel = 'ラグジュアリー';
            break;
          case "natural":
            resultLabel = 'ナチュラル';
            break;
          case "colonial":
            //resultLabel = 'コロニアル';
            resultLabel = 'ナチュラル';
            break;
          case "quiet":
            resultLabel = '閑静';
            break;
          case "contemporary":
            //resultLabel = 'コンテンポラリー';
            resultLabel = '閑静';
            break;
        }
        console.log(resultLabel);
        resolve(resultLabel);
      }
  });
});
