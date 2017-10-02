"use strict";

let messenger = require('./messenger'),
    formatter = require('./formatter'),
    salesforce = require('./salesforce'),
    util = require('util'),
    visionService = require('./vision-service');


exports.processUpload = (sender, attachments) => {
    if (attachments.length > 0) {
        let attachment = attachments[0];
        if (attachment.type === "image") {
            messenger.send({text: '添付いただいた画像を分析しています...'}, sender);
            console.log(util.inspect(attachment,false,null));
            visionService.classify(attachment.payload.url)
                .then(houseType => {
                    messenger.send({text: `画像の分析の結果、 "${houseType}" なカテゴリの住居とがイメージと近いです。以下がオススメのお部屋です`}, sender);
                    return salesforce.findPropertiesByCategory(houseType)
                })
                .then(properties => messenger.send(formatter.formatProperties(properties), sender))
        } else {
            messenger.send({text: 'このタイプの添付ファイルはサポートしていません。'}, sender);
        }
    }
};
