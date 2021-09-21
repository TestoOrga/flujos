/* global xlsx:true */
/* global filesaver:true */
sap.ui.define(
  ["bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bafar/flujos/flujos/libs/filesaver",
    "bafar/flujos/flujos/libs/xlsx.full.min"
  ],
  function (BaseController,
    JSONModel) {
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
          oEventBus.subscribe("flowResult", "dataError", this.showErrorTable, this);
        },
        onExit: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
          oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
          oEventBus.unsubscribe("flowResult", "dataError", this.showErrorTable, this);
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
        loadPopOver: function (oControl) {
          this.addpopover(oControl);
          // oEvent.getSource().getParent().removeStyleClass("lineItemSucc");
          // oEvent.getSource().getParent().setHighlight("Error");
          // oEvent.getSource().getParent().addStyleClass("lineItemError");
          // console.log();			
        },
        addpopover: function (oControl) {
          this._popoverDelegate = {
            onmouseover: function (oEvent) {
              this._showPopover(oEvent.srcControl, this.byId("popover"));
            },
            onmouseout: function (oEvent) {
              this._clearPopover(this.byId("popover"))
            }
          };
          oControl.addEventDelegate(this._popoverDelegate, this);
        },
        _showPopover: function (targetControl, popover) {
          var lineData = this.getModel("tablaFlujo").getProperty(targetControl.getBindingContext("tablaFlujo").sPath);
          this.byId("popover").setModel(new JSONModel(lineData.popUp), "popLine");
          this.byId("popover").setTitle(lineData.popUp.vis1);
          this._timeId = setTimeout(() => popover.openBy(targetControl), 500);
        },
        _clearPopover: function (popover) {
          clearTimeout(this._timeId) || popover.close();
        },

        onAddLine: function (oEvent) {
          console.log("Event Handler: onAddLine");
          var items = this._tabModel.getProperty("/");
          items.push({
            vis1: this.newItemId()
          });
          this._tabModel.setProperty("/", items);
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
              itemOwner: lineItem.getObject().vis2,
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
          };
          this.byId("listTitle").setText(this.get18().getText("totalPosiciones", [this._oTab.getItems().length]));
        },
        showErrorTable: function (sChannel, oEvent, res) {
          var fragRes = {
            "col1": true,
            "col2": true,
            "col3": true
          };
          this.getOwnerComponent().openErrorFrag(fragRes, res.res.to_pesal.results, this.getOwnerComponent().flowData.id + ": " + res.res.PeMsj);
        },
        /* =========================================================== */
        /* EXCEL                                                       */
        /* =========================================================== */
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
        /* =========================================================== */
        /* Peticiones externas                                         */
        /* =========================================================== */
        valInputs: function () {
          var valError = "";
          $(".valInput").each((i, e) => {
            var domRef = document.getElementById(e.id);
            var oControl = $(domRef).control()[0];
            try {
              var value = oControl.getValue();
            } catch (error) {
              var value = oControl.getSelectedKey();
            }
            if (value === "") {
              oControl.setValueState("Error");
              valError = this.get18().getText("flujoTabla.camposVaceos");
            }
          });
          return valError;
        },

        /* =========================================================== */
        /* Especifico de Flujo                                         */
        /* =========================================================== */
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
        onInputChange: function (oEvent, param) {
          switch (param) {
            case "in1":
              this.getPernr(oEvent);
              break;
            default:
              break;
          }
        },
        getPernr: function (oEvent) {
          this.resetPeriodos(oEvent.getSource().getParent().getAggregation("cells"));
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
          var controlForPopover = oEvent.getSource().getParent().getAggregation("cells").find(x => x.sId.includes("attachPopover"));
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel())
            .then((res) => {
              var pernrData = res[0];
              if (pernrData) {
                lineData.vis2 = pernrData.C2;
                lineData.vis3 = pernrData.C12;
                lineData.vis4 = pernrData.C19;
                lineData.popUp = {
                  visP1: pernrData.C13,
                  visP2: pernrData.C6,
                  visP3: pernrData.C31,
                  visP4: pernrData.C32,
                };
              } else {
                lineData.vis2 = "";
                lineData.vis3 = "";
                lineData.vis4 = "";
                lineData.popUp = {};
              }
              this._tabModel.setProperty(sPath, lineData);
              console.log("PERNR Loaded");
              this.loadPopOver(controlForPopover);
            })
            .then(
              () => {
                this.getPeriodo(lineContext);
              }
            );
        },
        getPeriodo: function (oContext) {
          var lineContext = oContext;
          var oPayload = {
            P1: "CAT",
            P2: "PERIODO",
            P3: lineContext.getObject().vis3,
            to_pesal: [],
          };
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then((res) => {
            if (this.getModel("in5")) {
              this.getModel("in5").setProperty("/", []);
            }
            if (res.length > 0) {
              this.setModel(new JSONModel(res), "in5");
              this.setModel(new JSONModel(res), "in6");
            }
          });
        },
        getFlowData: function () {
          return this._tabModel.getData();
        },
        getData: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          var result = this.getFlowData();
          result.forEach(element => {
            element.head1 = this.headerData.sociedad;
            element.head2 = this.headerData.division;
            element.head3 = this.headerData.tipo;
          })
          oEventBus.publish("flowResults", "flowData", {
            res: result,
            typeArr: true
          });
        },

        getValInputs: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          var errorMsg = this.valInputs();
          if (errorMsg !== "") {
            oEventBus.publish("flowResults", "flowValid", {
              res: false
            });
          } else {
            oEventBus.publish("flowResults", "flowValid", {
              res: true
            });
          }
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
            case "in2":
              this.setCC(oEvent);
              break;
            case "in5":
              this.setIniDate(oEvent);
              break;
            case "in6":
              this.setEndDate(oEvent);
              break;
            case "tipo":
              this.headerData.tipo = selKey;
              this.getCC(oEvent);
              break;
            default:
              break;
          }
          afterSelect();
        },
        setCC: function (oEvent) {
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          var selDate = oEvent.oSource.getSelectedItem().getBindingContext("in2").getObject();
          lineData.vis5 = selDate.C2;
          this._tabModel.setProperty(sPath, lineData);
        },
        setEndDate: function (oEvent) {
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          var selDate = oEvent.oSource.getSelectedItem().getBindingContext("in6").getObject();
          lineData.vis7 = selDate.C3;
          this._tabModel.setProperty(sPath, lineData);
        },
        setIniDate: function (oEvent) {
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          var selDate = oEvent.oSource.getSelectedItem().getBindingContext("in5").getObject();
          lineData.vis6 = selDate.C2;
          lineData.vis7 = selDate.C3;
          oEvent.oSource.getParent().getAggregation("cells").find(x => x.sId.includes("in6")).setSelectedKey(oEvent.oSource.getSelectedKey());
          this._tabModel.setProperty(sPath, lineData);
          this.restricEndDate(oEvent.oSource.getSelectedKey(), oEvent.oSource.getParent().getAggregation("cells").find(x => x.sId.includes("in6")));
        },
        restricEndDate: function (keyDate, oEndDateCell) {
          var tfilter = new sap.ui.model.Filter("C1", sap.ui.model.FilterOperator.GE, keyDate);
          oEndDateCell.getBinding("items").filter(tfilter);
        },
        getCC: function (oEvent) {
          var oPayload = {
            P1: "CAT",
            P2: "CCNOM",
            P3: this.headerData.tipo,
            to_pesal: [],
          };
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then((res) => {
            if (this.getModel("in2")) {
              this.getModel("in2").setProperty("/", []);
            }
            if (res.length > 0) {
              this.setModel(new JSONModel(res), "in2");
            }
            this.resetCC();
          });
        },
        resetCC: function () {
          $(".resSelect").each((i, e) => {
            var domRef = document.getElementById(e.id);
            var oControl = $(domRef).control()[0];
            if (oControl.sId.includes("in2")) {
              oControl.setSelectedKey("");
            }
          });
        },
        resetPeriodos: function (oCells) {
          oCells.find(x => x.sId.includes("in5")).setSelectedKey("");
          oCells.find(x => x.sId.includes("in6")).setSelectedKey("");
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