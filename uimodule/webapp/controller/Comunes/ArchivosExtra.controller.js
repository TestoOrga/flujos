sap.ui.define([
  "bafar/flujos/flujos/controller/BaseController", "sap/ui/model/json/JSONModel",   "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator", "sap/m/GroupHeaderListItem"
], function (BaseController, JSONModel, Filter, FilterOperator,  GroupHeaderListItem) {
  "use strict";

  return BaseController.extend(
    "bafar.flujos.flujos.controller.Comunes.ArchivosExtra", {
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
        this.filesLoading = 0;
        this.loadedFiles = [];
        this.fileId = 0;

        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.subscribe("flowReq", "filesFinal", this.sendFilesFinal, this);
        // oEventBus.subscribe("flowReq", "delItem", this.deleteItemFiles, this);
      },
      /**
       * @override
       */
      onExit: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.unsubscribe("flowReq", "filesFinal", this.sendFilesFinal, this);
        // oEventBus.unsubscribe("flowReq", "delItem", this.deleteItemFiles, this);
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
      }
    }
  );
});