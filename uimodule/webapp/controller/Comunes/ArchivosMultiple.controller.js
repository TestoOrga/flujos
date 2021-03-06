sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/GroupHeaderListItem",
  "sap/m/MessageBox",
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
        //Aprobacion
        if (this.getOwnerComponent().currentMode === 3 || this.getCurrentRouteName() === 3) {
          this.getView().setModel(new JSONModel({
            noEditField: false,
            creation: false,
            enabled: false
          }), "afterCreation");
        } else {
          this.getView().setModel(new JSONModel({
            noEditField: true,
            creation: true
          }), "afterCreation");
        };


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
        this.backFiles = [];

        this.oEventBus = this.getOwnerComponent().getEventBus();
        this.oEventBus.subscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
        this.oEventBus.subscribe("flowCreated", "fileReleaseStart", this.releaseFilesFinal, this);
        this.oEventBus.subscribe("flowReq", "delItem", this.deleteItemFiles, this);

        this.oEventBus.subscribe("driveAnswer", "fileUploaded", this.fileUpladed, this);
        this.oEventBus.subscribe("driveAnswer", "fileUploadError", this.fileUpladedError, this);

        // Aprobacion
        this.oEventBus.subscribe("flowApproval", "loadFlowFiles", this.loadFlowFiles, this);
        this.oEventBus.subscribe("flowApproval", "editMode", this.editMode, this);
      },
      /**
       * @override
       */
      onExit: function () {

        this.oEventBus.unsubscribe("flowRes", "filesLoaded", this.receiveFilesLoaded, this);
        this.oEventBus.unsubscribe("flowCreated", "fileReleaseStart", this.releaseFilesFinal, this);
        this.oEventBus.unsubscribe("flowReq", "delItem", this.deleteItemFiles, this);

        this.oEventBus.unsubscribe("driveAnswer", "fileUploaded", this.fileUpladed, this);
        this.oEventBus.unsubscribe("driveAnswer", "fileUploadError", this.fileUpladedError, this);
        this.oEventBus.unsubscribe("flowApproval", "loadFlowFiles", this.loadFlowFiles, this);
        this.oEventBus.unsubscribe("flowApproval", "editMode", this.editMode, this);
      },

      getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
        const currentHash = router.getHashChanger().getHash();
        return this.getOwnerComponent().getMode(currentHash); // since 1.75
      },

      receiveFilesLoaded: function (sChannel, oEvent, data) {
        var newFile = {
          archivo: data.fileName,
          ext: data.fileExt,
          itemId: data.itemId.toString(),
          itemOwner: data.itemOwner,
          fileId: data.fileId,
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
        console.log("first " + this.itemsLoading)
        if (this.itemsLoading === 0) {
          this.endUpload(true);
        } else {

          this.oEventBus.publish("flowCreated", "finalFiles", {
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
        console.log("catch in onedrive..." + data.result);
        console.log(data.result);
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
        if (nofile) {
          this.oEventBus.publish("flowCreated", "releaseFilesEnded");
          console.log("noFile");
        } else {
          console.log(this.itemsLoading);
          if (this.itemsLoading === 0) {
            this._oTab.setBusy(false);
            var that = this;
            console.log("EndUpload");
            MessageBox.warning("Todos los archivos fueron procesados", {
              onClose: function (sAction) {
                that.oEventBus.publish("flowCreated", "releaseFilesEnded");
              }
            });
            // setTimeout(() => {
            // }, 2000);
          }
        }
      },
      onSearch: function (oEvent) {
        // this.byId("lineItemsList").filter()
        var sQuery = oEvent.getParameter("newValue");
        var aFilter = [];
        if (sQuery) {
          aFilter = [new Filter("itemId", FilterOperator.Contains, sQuery),
            new Filter("itemOwner", FilterOperator.Contains, sQuery)
          ];
          this._oTab.getBinding("items").filter(
            new Filter({
              filters: aFilter,
              and: false
            })
            // aFilter
            , "Application");
        } else {
          this._oTab.getBinding("items").filter(null);
        }
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
      },
      editMode: function (sChannel, oEvent, res) {
        this.getView().getModel("afterCreation").setProperty("/enabled", res.edit);
      },
      loadFlowFiles: function (sChannel, oEvent, res) {
        res.res.forEach(element => {
          this.backFiles.push({
            fileId: element.C2,
            itemId: element.C1,
            archivo: element.C5,
            ext: element.C6,
            fileODiD: element.C7,
            size: element.C10,
            state: "Success",
            itemOwner: element.itemOwner,
            status: this.get18().getText("archivosMultipleController.Grabado")
          });
        });
        this._tabModel.setProperty("/", this.backFiles);
      },
      onDownFile: function (oEvent) {
        var file = this._tabModel.getProperty(
          oEvent.getSource().getBindingContext(this.viewConfig.tabModelName).sPath
        );
        this.getOwnerComponent().oOneDrive.downloadFile(
          file.fileODiD
        );
      }
    }
  );
});