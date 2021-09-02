sap.ui.define(["sap/m/Label"], function (Label) {
  "use strict";
  return Label.extend("godrej.pedidoscrea.control.EventLabel", {
    metadata: {
      events: {
        click: {},
        change: {},
      },
    },

    // the  event handlers:
    onclick: function (evt) {
      this.fireClick();
      this.fireChange();
    },

    renderer: {},
  });
});
