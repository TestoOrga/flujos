sap.ui.define(
  ["bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
  ],
  function (BaseController,
    JSONModel,
    MessageToast) {
    "use strict";

    return BaseController.extend(
      "bafar.flujos.flujos.controller.Tabla.FlujoTabla", {
        /**
         * @override
         */
        onInit: function () {
          this.loadedFiles = [];
          this.fileId = 0;
          this.itemId = 0;
          this.viewConfig = {
            tabModelName: "tablaFlujo",
            tabControlId: "mainTable",
          };
          this.initTab();
          this._tabModel = this.getModel(this.viewConfig.tabModelName);
          this._oTab = this.byId(this.viewConfig.tabControlId);
          console.log("finInit");
        },
        onExit: function () {
          this.destroyIds();
        },

        //destruir ids que causan conflicto duplicatedID
        destroyIds: function () {
          this.byId("attachPopover").destroy();
          this.byId("popover").destroy();
        },
        initTab: function () {
          this.getView().setModel(new JSONModel([{
            vis1: this.newItemId()
          }]), this.viewConfig.tabModelName);
        },
        newItemId: function () {
          this.itemId++;
          return this.itemId.toString().padStart(6, "0");
        },
        formatDate: function (oDate) {
          if (oDate) {
            function parse(t, a) {
              function format(m) {
                let f = new Intl.DateTimeFormat("en", m);
                return f.format(t).padStart(2, "0");
              }
              return a.map(format);
            }
            var a = [{
                year: "numeric"
              },
              {
                month: "short"
              },
              {
                day: "numeric"
              },
            ];
            let s = parse(oDate, a);
            return s[0] + " " + s[1] + " " + s[2];
          }
        },

        onInputChange: function (oEvent, param) {
          switch (param) {
            case "in1":
              this.getPernr(oEvent);
              break;

            default:
              break;
          }
          this.addpopover(oEvent.getSource().getParent().getAggregation("cells").find(x => x.sId.includes("attachPopover")));
          oEvent.getSource().getParent().removeStyleClass("lineItemSucc");
          oEvent.getSource().getParent().setHighlight("Error");
          oEvent.getSource().getParent().addStyleClass("lineItemError");
          console.log();
        },

        getPernr: function (oEvent) {
          var oEntityData = {
            P1: "CAT",
            P2: "PERNR",
            P3: oEvent.getParameter("value"),
            to_pesal: [],
          };
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          this.getCatData(oEntityData).then((res) => {
            var pernrData = res[0];
            lineData.vis2 = pernrData.C2;
            this._tabModel.setProperty(sPath, lineData);
            console.log("departamentoLoaded");
          });
        },
        getCatData: function (oPayload) {
          return new Promise((resolve, reject) => {
            this.getModel().create("/BaseSet", oPayload, {
              async: true,
              success: function (req, res) {
                resolve(res.data.to_pesal.results);
              },
              error: function (error) {
                reject(error);
              }
            });
          })
        },
        addpopover: function (oControl) {
          this._popoverDelegate = {
            onmouseover: function (oEvent) {
              // MessageToast.show("sadgfhsdfkgj");
              this.attachPopoverOnMouseover(oEvent.srcControl, this.byId("popover"));
            }
          };
          oControl.addEventDelegate(this._popoverDelegate, this);
        },
        attachPopoverOnMouseover: function (targetControl, popover) {
          targetControl.addEventDelegate({
            onmouseover: this._showPopover.bind(this, targetControl, popover),
            onmouseout: this._clearPopover.bind(this, popover),
          }, this);
        },
        _showPopover: function (targetControl, popover) {
          var testo = "asdfasdfasdf";
          this.byId("infoPopUpText").setText(testo);
          this.byId("popover").setTitle(testo);
          this._timeId = setTimeout(() => popover.openBy(targetControl), 500);
        },
        _clearPopover: function (popover) {
          clearTimeout(this._timeId) || popover.close();
        },

        onAddLine: function (oEvent) {
          console.log("Event Handler: onAddLine");
          // this._oTab.removeSelections(true)
          var items = this._tabModel.getProperty("/");
          items.push({
            vis1: this.newItemId()
          });
          this._tabModel.setProperty("/", items);
        },

        onItemPress: function (oEvent) {
          // this._showPopover(oEvent.getSource(), this.byId("popover"));
        },
        valInputs: function () {
          var valError;
          $(".valInput").each((i, e) => {
            var domRef = document.getElementById(e.id);
            var oControl = $(domRef).control()[0];
            if (oControl.getValue() === "") {
              oControl.setValueState("Error");
              valError = this.get18().getText("flujoTabla.camposVaceos");
            }
          });
          return valError;
        },

        validar: function (oEvent) {
          this.valInputs();
        },

        onRemoveLines: function (oEvent) {
          var itemTab = this._oTab.getItems();
          var oEventBus = sap.ui.getCore().getEventBus();
          this._oTab.getSelectedItems().forEach(element => {
            oEventBus.publish("flowReq", "delItem", {
              itemId: element.getBindingContext(this.viewConfig.tabModelName).getObject().vis1
            });
          }, this);
          var newTab = itemTab.filter(element => {
            return !element.getProperty("selected");
          }).map(element => {
            return element.getBindingContext(this.viewConfig.tabModelName).getObject();
          });
          this._tabModel.setData(newTab);
          this._oTab.removeSelections(true);
        },

        mainTabSelect: function (oEvent) {
          if (oEvent.getSource().getSelectedItems().length > 0) {
            this.byId("toolbarDel").setEnabled(true);
          } else {
            this.byId("toolbarDel").setEnabled(false);

          }
        },

        onInputLive: function (oEvent) {
          if (oEvent.getSource().getValue() !== "") {
            oEvent.getSource().setValueState("None");
          } else {
            oEvent.getSource().setValueState("Error");
          }
        },

        onHandleUploadComplete: function (oEvent) {
          console.log("Event Handler: onHandleUploadComplete");
          var oFileUploader = oEvent.oSource;
          var inFile = oFileUploader.getFocusDomRef().files[0];
          var lineItem = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          var reader = new FileReader();
          reader.onload = function (readerEvt) {

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

            this._tabModel.setProperty(lineItem.sPath + "/atta", false);
            this.fileId++;
            this.loadedFiles.push({
              itemId: lineItem.getObject().vis1,
              fileId: this.fileId,
              fileName: name,
              fileExt: ext,
              oFile: inFile,
              fileData: fileData
            });
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("flowRes", "filesLoaded", {
              itemId: lineItem.getObject().vis1,
              fileId: this.fileId,
              fileName: name,
              fileExt: ext
            });
          }.bind(this);
          reader.onerror = function (err) {
            this._tabModel.setProperty(sPath + "/atta", false);
          }.bind(this);
          reader.readAsDataURL(inFile);
        },

        onHandleUploadStart: function (oEvent) {
          this._tabModel.setProperty(oEvent.getSource().getBindingContext("tablaFlujo").sPath + "/atta", true);
        },

        onTableUpdateFinished: function (oEvent) {
          if (this._oTab.getSelectedItems().length === 0) {
            this.byId("toolbarDel").setEnabled(false);
          }
        }
      }
    );
  }
);