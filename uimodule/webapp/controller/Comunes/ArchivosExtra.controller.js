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
      },
      receiveFilesLoaded: function (sChannel, oEvent, data) {
        var newFile = {
          archivo: data.fileName,
          ext: data.fileExt,
          itemId: data.itemId.toString(),
          state: "Warning",
          status: this.get18().getText("archivosMultipleController.pendienteDeGrabar")
        };
        var tabData = this._tabModel.getData();
        tabData.push(newFile);
        this._tabModel.setData(tabData);
      },
      sendFilesFinal: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("flowRes", "filesLoaded", {
          filesTab: this._tabModel.getData()
        });
      },

      onSearch: function (oEvent) {
        // this.byId("lineItemsList").filter()
        var sQuery = oEvent.getParameter("newValue");
        var aFilter = [];
        if (sQuery) {
          aFilter = [new Filter("itemId", FilterOperator.Contains, sQuery)];
        }
        this._oTab.getBinding("items").filter(aFilter, "Application");
      },

      onItemDelete: function (oEvent) {
        var oItemContextPath = oEvent.oSource.getBindingContext("files").sPath;
        var idx = oItemContextPath.split("/")[1];
        var oTempData = this._tabModel.getData();
        // Now get the selected index and split it.
        oTempData.splice(idx, 1);
        this._tabModel.setData(oTempData);
      },
      deleteItemFiles: function (sChannel, oEvent, data) {
        var currFiles = this._tabModel.getData();
        var newFiles = currFiles.filter(element => {
          return element.itemId !== data.itemId.toString();
        });
        this._tabModel.setData(newFiles);
      }
    }
  );
});