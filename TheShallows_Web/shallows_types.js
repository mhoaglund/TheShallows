var moment = require('moment'), uuidV4 = require('uuid/v4');
class ChangeOrder {
    constructor(payload, timestamp){
        this.data = payload;
        this.created = timestamp;
        this.id = uuidV4();
        //TODO: workflow for extracting rules from payload
    }
}