sap.ui.define([
  "bafar/flujos/flujos/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator", "sap/m/GroupHeaderListItem", "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, MessageBox) {
  "use strict";

  return BaseController.extend(
    "bafar.flujos.flujos.controller.Comunes.ArchivosExtra", {
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

        this.viewConfig = {
          tabModelName: "files",
          tabControlId: "lineItemsList",
        };
        this.setModel(new JSONModel([]), "files");
        this._tabModel = this.getModel("files");
        this._oTab = this.byId("lineItemsList");
        this.filesLoading = 0;
        this.loadedFiles = [];
        this.fileId = 0;

        this.oEventBus = this.getOwnerComponent().getEventBus();
        this.oEventBus.subscribe("flowReq", "filesFinal", this.sendFilesFinal, this);
        this.oEventBus.subscribe("driveAnswer", "fileUploaded", this.fileUpladed, this);
        this.oEventBus.subscribe("driveAnswer", "fileUploadError", this.fileUpladedError, this);

        this.oEventBus.subscribe("flowCreated", "fileReleaseStart", this.fileReleaseStart, this);

        // Aprobacion
        this.oEventBus.subscribe("flowApproval", "loadFlowFiles", this.loadFlowFiles, this);
        this.oEventBus.subscribe("flowApproval", "editMode", this.editMode, this);
      },
      /**
       * @override
       */
      onExit: function () {

        this.oEventBus.unsubscribe("flowReq", "filesFinal", this.sendFilesFinal, this);
        this.oEventBus.unsubscribe("driveAnswer", "fileUploaded", this.fileUpladed, this);
        this.oEventBus.unsubscribe("driveAnswer", "fileUploadError", this.fileUpladedError, this);
        this.oEventBus.unsubscribe("flowCreated", "fileReleaseStart", this.fileReleaseStart, this);
        this.oEventBus.unsubscribe("flowApproval", "editMode", this.editMode, this);
        this.oEventBus.unsubscribe("flowApproval", "loadFlowFiles", this.loadFlowFiles, this);
      },

      getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
        const currentHash = router.getHashChanger().getHash();
        return this.getOwnerComponent().getMode(currentHash); // since 1.75
      },

      // receiveFilesLoaded: function (sChannel, oEvent, data) {
      //   var newFile = {
      //     archivo: data.fileName,
      //     ext: data.fileExt,
      //     itemId: data.itemId.toString(),
      //     itemOwner: data.itemOwner,
      //     state: "Warning",
      //     status: this.get18().getText("archivosMultipleController.pendienteDeGrabar")
      //   };
      //   var tabData = this._tabModel.getData();
      //   tabData.push(newFile);
      //   this._tabModel.setData(tabData);
      // },
      sendFilesFinal: function () {
        this._oTab.setBusy(true);
        var items = this._tabModel.getData();
        this.itemsLoading = items.length;
        return items;
      },

      onSearch: function (oEvent) {
        // this.byId("lineItemsList").filter()
        var sQuery = oEvent.getParameter("newValue");
        var aFilter = [];
        if (sQuery) {
          aFilter = [new Filter("fileName", FilterOperator.Contains, sQuery)];
          // aFilter = [new Filter("fileExt", FilterOperator.Contains, sQuery)];
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
      // deleteItemFiles: function (sChannel, oEvent, data) {
      //   var currFiles = this._tabModel.getData();
      //   var newFiles = currFiles.filter(element => {
      //     return element.itemId !== data.itemId.toString();
      //   });
      //   this._tabModel.setData(newFiles);
      // },
      getGroup: function (oContext) {
        var sKey = this.getModel("files").getProperty(oContext.sPath);
        return {
          key: sKey.fileExt,
          title: sKey.fileExt || "Sin extension"
        };
      },
      getGroupHeader: function (oGroup) {
        return new GroupHeaderListItem({
          title: oGroup.title
        });
      },

      handleUploadComplete: function (oEvent, a, d) {
        console.log("Event Handler: onHandleUploadComplete");
        var oFileUploader = oEvent.oSource;
        var inFile = oFileUploader.getFocusDomRef().files[0];
        var lineItem = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
        var reader = new FileReader();
        reader.onload = function (readerEvt) {
          this.filesLoading--;
          console.log("processFile");
          var byteCharacters = atob(readerEvt.target.result.split(",")[1]);
          // Each character's code point (charCode) will be the value of the byte. We can create an array of byte values by applying this using the .charCodeAt method for each character in the string.
          var byteNumbers = new Array(byteCharacters.length);
          for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          // convert this array of byte values into a real typed byte array by passing it to the Uint8Array constructor.
          if (sap.ui.Device.browser.name === "ie") {
            var byteArray = Uint8Array(byteNumbers);
          } else {
            byteArray = new Uint8Array(byteNumbers);
          }
          // This in turn can be converted to a BLOB by wrapping it in an array and passing it to the Blob constructor.
          var fileData = new Blob([byteArray], {
            type: inFile.type,
          });
          var name = inFile.name.substr(0, inFile.name.lastIndexOf("."));
          var ext = inFile.name.substr(inFile.name.lastIndexOf(".") + 1);

          // this._tabModel.setProperty(lineItem.sPath + "/atta", false);
          this.fileId++;
          this.loadedFiles.push({
            fileId: this.fileId.toString(),
            itemId: "000001",
            fileName: name,
            fileExt: ext,
            oFile: inFile,
            fileData: fileData,
            size: readerEvt.total,
            state: "Warning",
            status: this.get18().getText("archivosMultipleController.pendienteDeGrabar")
          });
          this._tabModel.setProperty("/", this.loadedFiles);
          if (this.filesLoading === 0) this.getView().byId("cargaXLSX").setVisible(false);
        }.bind(this);
        reader.onerror = function (err) {
          this.filesLoading--;
          if (this.filesLoading === 0) this.getView().byId("cargaXLSX").setVisible(false);
          this._tabModel.setProperty(sPath + "/atta", false);
        }.bind(this);
        reader.readAsDataURL(inFile);
      },

      onHandleUploadStart: function (oEvent) {
        if (oEvent.getParameter("newValue") !== "") {
          this.filesLoading++;
          console.log("Event Handler: onHandleUploadStart");
          this.getView().byId("cargaXLSX").setVisible(true);
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
      fileReleaseStart: function () {
        var files = this.sendFilesFinal();
        if (files.length === 0) {
          this.endUpload(true);
        } else {
          this.getOwnerComponent().oOneDrive.UploadFiles(this.sendFilesFinal());
        }
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
          }
        }


      },
      editMode: function (sChannel, oEvent, res) {
        this.getView().getModel("afterCreation").setProperty("/enabled", res.edit);
      },
      loadFlowFiles: function (sChannel, oEvent, res) {
        res.res.forEach(element => {
          this.loadedFiles.push({
            fileId: element.C1,
            itemId: element.C2,
            fileName: element.C5,
            fileExt: element.C6,
            fileODiD: element.C7,
            size: element.C10,
            state: "Success",
            status: this.get18().getText("archivosMultipleController.Grabado")
          });
        });
        this._tabModel.setProperty("/", this.loadedFiles);
      }
      // testo: function () {
      //   this.getOwnerComponent().oOneDrive.UploadFiles(this.sendFilesFinal());
      // }
    }
  );
});