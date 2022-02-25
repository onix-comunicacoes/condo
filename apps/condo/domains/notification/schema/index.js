/**
 * This file is autogenerated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { Message } = require('./Message')
const { SendMessageService } = require('./SendMessageService')
const { Device } = require('./Device')
const { SyncDeviceService } = require('./SyncDeviceService')
const { DisconnectUserFromDeviceService } = require('./DisconnectUserFromDeviceService')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    Message,
    SendMessageService,
    Device,
    SyncDeviceService,
    DisconnectUserFromDeviceService,
/* AUTOGENERATE MARKER <EXPORTS> */
}
