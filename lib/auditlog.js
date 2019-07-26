const { auditLogToElastic } = require("../src/models/ESLogs");

module.exports = {
    async sendToAuditLog (user,action,message){
        let data = {}
        data.user = user
        data.action = action
        data.message = message
        auditLogToElastic({data})
    }
}
