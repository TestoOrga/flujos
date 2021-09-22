sap.ui.define([], function () {
  "use strict";
  return {
    getIconMaster: function(val){      
      return val === "NOM" ? "sap-icon://batch-payments" : "sap-icon://approvals";
    },
    fooErdat1:function(e){if(e){var r=e.split("");var t=r[6]+r[7]+" "+"/"+" "+r[4]+r[5]+" "+"/"+" "+r[0]+r[1]+r[2]+r[3];return t}},
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