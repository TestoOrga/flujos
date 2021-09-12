sap.ui.define([
  "bafar/flujos/flujos/controller/BaseController"
], function (BaseController) {
  "use strict";

  return BaseController.extend(
    "bafar.flujos.flujos.controller.Comunes.ArchivosExtra", {
      /**
       * @override
       */
      onInit: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.subscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
      },
      /**
       * @override
       */
      onExit: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.unsubscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
      }
    }
  );
});