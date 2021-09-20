sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (BaseController,
  JSONModel, Filter, FilterOperator) {
  "use strict";

  return BaseController.extend(
    "bafar.flujos.flujos.controller.Comunes.ArchivosMultiple", {
      /**
       * @override
       */
      onInit: function () {
        var testo = this.getOwnerComponent().oOneDrive.testo();
        console.log(testo);
        this.viewConfig = {
          tabModelName: "files",
          tabControlId: "lineItemsList",
        };
        this.setModel(new JSONModel([]
          //   [{
          //   archivo: "asdasd",
          //   ext: "sad",
          //   itemId: "23423423",
          //   state: "Warning",
          //   status: "pendiente"
          // }, {
          //   archivo: "asdasd",
          //   ext: "sad",
          //   itemId: "77777777",
          //   state: "Warning",
          //   status: "pendiente"
          // }, {
          //   archivo: "asdasd",
          //   ext: "sad",
          //   itemId: "67865785",
          //   state: "Warning",
          //   status: "pendiente"
          // }]
        ), "files");
        this._tabModel = this.getModel("files");
        this._oTab = this.byId("lineItemsList");

        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.subscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
        oEventBus.subscribe("flowReq", "filesFinal", this.sendFilesFinal, this);
        oEventBus.subscribe("flowReq", "delItem", this.deleteItemFiles, this);
      },
      /**
       * @override
       */
      onExit: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.unsubscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
        oEventBus.unsubscribe("flowReq", "filesFinal", this.sendFilesFinal, this);
        oEventBus.unsubscribe("flowReq", "delItem", this.deleteItemFiles, this);
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
        this._oTab.setBusy(true);
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