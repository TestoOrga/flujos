sap.ui.define([], function () {
  "use strict";
  return {
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