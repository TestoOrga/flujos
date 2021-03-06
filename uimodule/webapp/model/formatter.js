sap.ui.define([], function () {
  "use strict";
  return {
    fooErdat1: function (e) {
      if (e) {
        var r = e.split("");
        var t = r[6] + r[7] + " " + "/" + " " + r[4] + r[5] + " " + "/" + " " + r[0] + r[1] + r[2] + r[3];
        return t
      }
    },
    dateToAbap: function (date, char) {
      if (date && char) {
        var arrDate = date.split(char);
        return arrDate[2] + arrDate[1] + arrDate[0];
      }
    },
    getIconMaster: function(val){      
      var icon = this.getOwnerComponent().flowDescMap.find(x=>x[val]);
      return icon ? icon[val].icon : "sap-icon://approvals";
    },
    getSwitchVisible: function(val){
      var noTabFLow = this.getOwnerComponent().noTabFlows;
      return noTabFLow.includes(val);
    },
    toCurr: function(val){
      var testo = accounting.formatMoney(val);
      return testo;
    },
    date: function (dat) {
      if (dat) {
        return new Date(dat.substr(0, 4), dat.substr(4, 2), dat.substr(6, 2)).toLocaleDateString('es-US', {
          weekday: "short", // long, short, narrow
          day: "numeric", // numeric, 2-digit
          year: "numeric", // numeric, 2-digit
          month: "long"
        });
      }
    },
  };
});