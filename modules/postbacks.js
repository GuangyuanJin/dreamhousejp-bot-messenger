"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter');

exports.schedule_visit = (sender, values) => {
    salesforce.findProperties({id: values[1]}).then(properties => {
        messenger.send(formatter.formatAppointment(properties[0]), sender);
    });
};

exports.contact_broker = (sender, values) => {
    let propertyId;
    salesforce.findProperties({id: values[1]}).then(properties => {
      propertyId = properties[0].getId();
      return salesforce.getBroker(properties[0].get("broker__c"));
    }).then(broker => {
      messenger.send({text: "こちらが物件の担当者情報となります"}, sender);
      messenger.send(formatter.formatBroker(broker,propertyId), sender);
    });
};

exports.confirm_nlp = (sender, values) => {
  messenger.send({text: `かしこまりました。"${values[1]}" 近辺で "${values[2]}" の物件を探しています...`}, sender);
  salesforce.findProperties({city: values[1]}).then(properties => {
      messenger.send(formatter.formatProperties(properties), sender);
  });
};

exports.confirm_visit = (sender, values) => {
  messenger.getUserInfo(sender).then(response => {
      salesforce.createCase("内覧予約",values[1], response.last_name + " " + response.first_name,sender).then(() => {
        messenger.send({text: `かしこまりました。内覧のスケジュールを確定いたしました。 場所:${values[2]} 日時:${values[3]} 。`}, sender);
      });
  });
};

exports.contact_me = (sender, values) => {

    let propertyId = values[1];
    messenger.getUserInfo(sender).then(response => {
        salesforce.createCase("ご連絡を希望",propertyId, response.last_name + " " + response.first_name,null,sender).then(() => {
            messenger.send({text: `ありがとうございます。 ${response.last_name} 様に担当者からご連絡をさせて頂きます。 `}, sender);
        });
    });

};

exports.confirm_cancel = (sender, values) => {
  messenger.send({text: `大変失礼致しました。処理をキャンセルします。質問は単純にするほど理解しやすくなります。`}, sender);
};
