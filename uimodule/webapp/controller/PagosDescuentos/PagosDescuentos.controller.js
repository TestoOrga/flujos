/* global xlsx:true */
/* global filesaver:true */
sap.ui.define(
  ["bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox", "bafar/flujos/flujos/libs/filesaver", "bafar/flujos/flujos/libs/xlsx.full.min"
  ],
  function (BaseController,
    JSONModel,
    MessageToast,
    MessageBox) {
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
          this.headerData = {
            sociedad: "",
            division: "",
            tipo: ""
          };
          this.setModel(new JSONModel({
            release: false
          }), "viewGeneral");
          this.initTab();
          this._tabModel = this.getModel(this.viewConfig.tabModelName);
          this._oTab = this.byId(this.viewConfig.tabControlId);
          console.log("finInit");

          var oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("flowRequest", "valFlow", this.getValInputs, this);
          oEventBus.subscribe("flowRequest", "flowData", this.getData, this);

        },
        onBeforeRendering() {
          var oPayload = {
            P1: "CAT",
            P2: "BUKRS",
            to_pesal: []
          };
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
            this.setModel(new JSONModel(res), "sociedad");
          });
          oPayload = {
            P1: "CAT",
            P2: "PAGOS",
            to_pesal: []
          };
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
            this.setModel(new JSONModel(res), "tipo");
          })
        },
        onExit: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
          oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
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
        onInputChange: function (oEvent, param) {
          switch (param) {
            case "in1":
              this.getPernr(oEvent);
              break;
            case "in2":
              this.getCC(oEvent);
              break;
            case "in5":
              this.getPeriodo(oEvent);
              break;
            default:
              break;
          }
        },

        getPernr: function (oEvent) {
          var oPayload = {
            P1: "CAT",
            P2: "PERNR",
            P3: oEvent.getParameter("value"),
            P4: this.headerData.sociedad,
            P5: this.headerData.division,
            to_pesal: [],
          };
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then((res) => {
            var pernrData = res[0];
            lineData.vis2 = pernrData.C2;
            lineData.vis3 = pernrData.C12;
            lineData.vis4 = pernrData.C19;
            this._tabModel.setProperty(sPath, lineData);
            console.log("PERNR Loaded");
            this.loadPopOver(oEvent);
          });
        },
        loadPopOver: function (oEvent) {
          this.addpopover(oEvent.getSource().getParent().getAggregation("cells").find(x => x.sId.includes("attachPopover")));
          // oEvent.getSource().getParent().removeStyleClass("lineItemSucc");
          // oEvent.getSource().getParent().setHighlight("Error");
          // oEvent.getSource().getParent().addStyleClass("lineItemError");
          // console.log();			
        },
        getCC: function (oEvent) {
          var oPayload = {
            P1: "CAT",
            P2: "CCNOM",
            P3: this.headerData.tipo,
            to_pesal: [],
          };
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then((res) => {
            var ccData = res[0];
            lineData.vis5 = ccData.C2;
            this._tabModel.setProperty(sPath, lineData);
            console.log("CC Loaded");
          });
        },
        getPeriodo: function (oEvent) {
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var oPayload = {
            P1: "CAT",
            P2: "PERIODO",
            P3: lineContext.getObject().vis3,
            to_pesal: [],
          };
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then((res) => {
            var periodoData = res[0];
            lineData.vis2 = periodoData.C2;
            this._tabModel.setProperty(sPath, lineData);
            console.log("CC Loaded");
          });
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
              fileData: fileData,
              size: readerEvt.total
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
        },
        getFlowData: function (oEvent) {
          return this._tabModel.getData();
        },
        getData: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          var result = this.getFlowData();
          oEventBus.publish("flowResults", "flowData", {
            res: result
          });
        },

        getValInputs: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          var errorMsg = this.valInputs();
          if (errorMsg !== "") {
            MessageBox.error(errorMsg);
            oEventBus.publish("flowResults", "flowValid", {
              res: false
            });
          } else {
            oEventBus.publish("flowResults", "flowValid", {
              res: true
            });
          }
        },
        onDownloadAsExcel: function () {
          // Test Data
          var data = [{
            IN1: "dato1",
            IN2: "dato2",
            IN3: "dato3",
            IN4: "dato4",
          }, ];

          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = {
            Sheets: {
              data: worksheet,
            },
            SheetNames: ["data"],
          };
          const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
          });
          console.log(excelBuffer);
          this.onSaveAsExcel(excelBuffer, "myFile");
        },
        onSaveAsExcel: function (buffer, filename) {
          const EXCEL_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
          const EXCEL_EXTENSION = ".xlsx";
          const data = new Blob([buffer], {
            type: EXCEL_TYPE
          });
          saveAs(
            data,
            filename + "_export_" + new Date().getTime() + EXCEL_EXTENSION
          );
        },
        onDownTemplate: function (oEvent) {
          this.onDownloadAsExcel();
        },

        onSelect: function (oEvent, param) {
          const afterSelect = () => {
            if (this.headerData.sociedad !== "" &&
              this.headerData.division !== "" &&
              this.headerData.tipo !== "") {
              this.getModel("viewGeneral").setProperty("/release", true);
            } else {
              this.getModel("viewGeneral").setProperty("/release", false);
            }
          };
          var selKey = oEvent.oSource.getSelectedKey();
          switch (param) {
            case "sociedad":
              this.headerData.sociedad = selKey;
              var oPayload = {
                P1: "CAT",
                P2: "WERKS",
                P3: selKey,
                to_pesal: []
              };
              this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
                if (this.getModel("division")) {
                  this.getModel("division").setProperty("/", []);
                }
                if (res.length > 0) {
                  this.setModel(new JSONModel(res), "division");
                  this.byId("titleSelDivision").setEnabled(true);
                  this.headerData.division = this.byId("titleSelDivision").getSelectedKey();
                } else {
                  this.headerData.division = "";
                }
                afterSelect();
              });
              break;
            case "division":
              this.headerData.division = selKey;
              break;
            default:
              this.headerData.tipo = selKey;
              break;
          }
          afterSelect();
        },
        formatCurrency: function (oEvent) {
          var options = {
            style: "currency",
            currency: "USD"
          };
          var formatter = new Intl.NumberFormat("en-us", options);
          var currencyT = oEvent.oSource.getValue();
          var currency = isNaN(Number(currencyT)) ? 0 : currencyT;
          var currencyFormated = formatter.format(currency);
          // this.getView().byId("descuentoCurr").setValue(currencyFormated);
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var lineData = lineContext.getObject();
          lineData.in4 = currencyFormated;
          lineData.in4Num = currency;
          this._tabModel.setProperty(sPath, lineData);
        }
      }
    );
  }
);