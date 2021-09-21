sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/GroupHeaderListItem",
  "sap/m/MessageBox"
], function (BaseController,
  JSONModel,
  Filter,
  FilterOperator,
  GroupHeaderListItem,
  MessageBox) {
  "use strict";

  return BaseController.extend(
    "bafar.flujos.flujos.controller.Comunes.ArchivosMultiple", {
      /**
       * @override
       */
      onInit: function () {
        // var testo = this.getOwnerComponent().oOneDrive.testo();
        // console.log(testo);
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
        oEventBus.subscribe("flowCreated", "fileReleaseStart", this.releaseFilesFinal, this);
        oEventBus.subscribe("flowReq", "delItem", this.deleteItemFiles, this);

        oEventBus.subscribe("driveAnswer", "fileUploaded", this.fileUpladed, this);
        oEventBus.subscribe("driveAnswer", "fileUploadError", this.fileUpladedError, this);
      },
      /**
       * @override
       */
      onExit: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.unsubscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
        oEventBus.subscribe("flowCreated", "fileReleaseStart", this.releaseFilesFinal, this);
        oEventBus.unsubscribe("flowReq", "delItem", this.deleteItemFiles, this);

        oEventBus.unsubscribe("driveAnswer", "fileUploaded", this.fileUpladed, this);
        oEventBus.unsubscribe("driveAnswer", "fileUploadError", this.fileUpladedError, this);
      },

      receiveFilesLoaded: function (sChannel, oEvent, data) {
        var newFile = {
          archivo: data.fileName,
          ext: data.fileExt,
          itemId: data.itemId.toString(),
          itemOwner: data.itemOwner,
          fileid: data.fileId,
          state: "Warning",
          status: this.get18().getText("archivosMultipleController.pendienteDeGrabar")
        };
        var tabData = this._tabModel.getData();
        tabData.push(newFile);
        this._tabModel.setData(tabData);
      },
      releaseFilesFinal: function () {
        this._oTab.setBusy(true);        
        var items = this._tabModel.getData();
        this.itemsLoading = items.length;
        if (this.itemsLoading === 0) {
          this.endUpload(true);
        } else {
          var oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.publish("flowCreated", "finalFiles", {
            filesTab: items
          });
          // this.getOwnerComponent().oOneDrive.UploadFiles(items);
        }
      },
      fileUpladed: function (sChannel, oEvent, data) {
        this.itemsLoading--;
        var lineObject = this._oTab.getItems().find(element => {
          var lineData = element.getBindingContext("files");
          if (lineData) {
            if (lineData.getObject().fileId === data.fileId) return element;
          }
        }, this);
        var oLine = lineObject.getAggregation("cells").find(x => x.sId.includes("fileStatus"));
        oLine.setState("Success");
        oLine.setText(this.get18().getText("ArchivosExtraController.ArchivoGrabadoEnOneDrive"));
        this.endUpload();
      },
      fileUpladedError: function (sChannel, oEvent, data) {
        this.itemsLoading--;
        var lineObject = this._oTab.getItems().find(element => {
          var lineData = element.getBindingContext("files");
          if (lineData) {
            if (lineData.getObject().fileId === data.fileId) return element;
          }
        }, this);
        var oLine = lineObject.getAggregation("cells").find(x => x.sId.includes("fileStatus"));
        oLine.setState("Error");
        oLine.setText(this.get18().getText("ArchivosExtraController.NoSePudoGrabarElArchivo"));
        this.endUpload();
      },
      endUpload: function (nofile) {
        if (this.itemsLoading === 0) {
          this._oTab.setBusy(false);
        }
        var oEventBus = sap.ui.getCore().getEventBus();
        if (nofile) {
          oEventBus.publish("flowCreated", "releaseFilesEnded");
        } else {
          MessageBox.warning("Todos los archivos fueron procesados");
          setTimeout(() => {
            oEventBus.publish("flowCreated", "releaseFilesEnded");
          }, 2000);
        }
      },
      onSearch: function (oEvent) {
        // this.byId("lineItemsList").filter()
        var sQuery = oEvent.getParameter("newValue");
        var aFilter = [];
        if (sQuery) {
          aFilter = [new Filter("itemId", FilterOperator.Contains, sQuery)];
          aFilter = [new Filter("itemOwner", FilterOperator.Contains, sQuery)];
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
      },
      getGroup: function (oContext) {
        var sKey = this.getModel("files").getProperty(oContext.sPath);
        return {
          key: sKey.itemId,
          title: sKey.itemId + " - " + sKey.itemOwner
        };
      },
      getGroupHeader: function (oGroup) {
        return new GroupHeaderListItem({
          title: oGroup.title
        });
      }
    }
  );
});