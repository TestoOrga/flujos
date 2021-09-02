sap.ui.define(["sap/ui/layout/BlockLayoutCell"], function (BlockLayoutCell) {
  "use strict";

  return BlockLayoutCell.extend("bafar.flujos.flujos.control.BlockLayoutCellEvent", {
    metadata: {
      events: {
        press: {},
      }
    },

    // the  event handlers:
    onclick: function (evt) {
      this.firePress();
    },

    renderer: {},
  });
});
