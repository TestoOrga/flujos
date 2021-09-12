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
        var tabData = this.getModel("files").getData();
        tabData.push(newFile);
        this.getModel("files").setData(tabData);
      },
      sendFilesFinal: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("flowRes", "filesLoaded", {
          filesTab: this.getModel("files").getData()
        });
      },

      onSearch: function (oEvent) {
        // this.byId("lineItemsList").filter()
        var sQuery = oEvent.getParameter("newValue");
        var aFilter = [];
        if (sQuery) {
          aFilter = [new Filter("itemId", FilterOperator.Contains, sQuery)];
        }
        this.byId("lineItemsList").getBinding("items").filter(aFilter, "Application");
      },

      onItemDelete: function (oEvent) {
        var oItemContextPath = oEvent.oSource.getBindingContext("files").sPath;
        var idx = oItemContextPath.split("/")[1];
        var oTempData = this.getModel("files").getData();
        // Now get the selected index and split it.
        oTempData.splice(idx, 1);
        this.getModel("files").setData(oTempData);
      },
      deleteItemFiles: function (sChannel, oEvent, data) {
        var currFiles = this.getModel("files").getData();
        var newFiles = currFiles.filter(element => {
          return element.itemId !== data.itemId.toString();
        });
        this.getModel("files").setData(newFiles);
      }
    }
  );
});